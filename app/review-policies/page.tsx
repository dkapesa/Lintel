import { redirect } from "next/navigation";

export default async function ReviewPoliciesCompatibilityRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const requested = await searchParams;
  const preserved = new URLSearchParams();
  for (const [key, value] of Object.entries(requested)) {
    if (Array.isArray(value)) value.forEach((item) => preserved.append(key, item));
    else if (value !== undefined) preserved.set(key, value);
  }
  const query = preserved.toString();
  redirect(query ? `/policies?${query}` : "/policies");
}
