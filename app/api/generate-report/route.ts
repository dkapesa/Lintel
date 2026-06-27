import { generateReport, type ReportInput } from "../../../lib/report-generator";
import { normaliseReport, REPORT_JSON_SCHEMA } from "../../../lib/report-normalizer";

export const runtime = "nodejs";

const MAX_DIFF_CHARACTERS = 200_000;
const MAX_REQUEST_BYTES = 225_000;
const OPENAI_TIMEOUT_MS = 20_000;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return null;
  return trimmed;
}

function responseWithReport(report: ReturnType<typeof generateReport>, source: "ai" | "deterministic") {
  return Response.json(
    { report, source },
    { headers: { "Cache-Control": "no-store" } },
  );
}

function extractOutputText(value: unknown) {
  if (!isRecord(value)) return null;
  if (typeof value.output_text === "string" && value.output_text.trim()) return value.output_text;
  if (!Array.isArray(value.output)) return null;

  for (const outputItem of value.output) {
    if (!isRecord(outputItem) || !Array.isArray(outputItem.content)) continue;
    for (const contentItem of outputItem.content) {
      if (isRecord(contentItem) && contentItem.type === "output_text" && typeof contentItem.text === "string") {
        return contentItem.text;
      }
    }
  }

  return null;
}

function buildPrompt(input: ReportInput) {
  return [
    `PR title: ${input.title}`,
    `Repository: ${input.repository}`,
    `Language / framework: ${input.technology}`,
    "",
    "Pull request diff:",
    input.diff,
  ].join("\n");
}

async function generateWithOpenAI(input: ReportInput, apiKey: string, model: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        store: false,
        max_output_tokens: 8_000,
        input: [
          {
            role: "system",
            content: [
              "You are Lintel, a pull request merge-readiness reviewer.",
              "Analyse only the supplied PR metadata and diff.",
              "Return evidence tied to actual changed code or files and do not invent files.",
              "Use TESTS_REQUIRED when required tests are missing.",
              "Use REVIEW_REQUIRED when findings, conditions or attention signals remain and tests are present.",
              "Use APPROVE only when the report is clear. Do not use BLOCK.",
              "Do not include the raw diff in any output field.",
            ].join(" "),
          },
          { role: "user", content: buildPrompt(input) },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "lintel_report",
            strict: true,
            schema: REPORT_JSON_SCHEMA,
          },
        },
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) return null;
    const payload: unknown = await response.json();
    const outputText = extractOutputText(payload);
    if (!outputText) return null;

    try {
      return JSON.parse(outputText) as unknown;
    } catch {
      return null;
    }
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return Response.json({ error: "The submitted diff is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  if (!isRecord(body)) return Response.json({ error: "Invalid request body." }, { status: 400 });

  const title = requiredString(body.title, 500);
  const repository = requiredString(body.repository, 300);
  const technology = requiredString(body.technology, 200);
  const diff = typeof body.diff === "string" ? body.diff : null;

  if (!title || !repository || !technology || !diff?.trim()) {
    return Response.json({ error: "Title, repository, technology and diff are required." }, { status: 400 });
  }
  if (diff.length > MAX_DIFF_CHARACTERS) {
    return Response.json({ error: "The submitted diff is too large." }, { status: 413 });
  }

  const input: ReportInput = { title, repository, technology, diff };
  const baseline = generateReport(input);
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim();

  if (!apiKey || !model) return responseWithReport(baseline, "deterministic");

  const generated = await generateWithOpenAI(input, apiKey, model);
  if (!generated) return responseWithReport(baseline, "deterministic");

  const report = normaliseReport(generated, baseline);
  return report ? responseWithReport(report, "ai") : responseWithReport(baseline, "deterministic");
}
