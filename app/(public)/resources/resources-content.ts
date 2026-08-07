export const RESOURCES_METADATA = {
  title: "Resources",
  description:
    "The public routes and documentation that exist today, and what each one contains.",
};

export const RESOURCES_INTRODUCTION = {
  eyebrow: "Where to go next",
  title: "Resources",
  lead: "The public routes and the documentation that exist today. Each entry says what it contains, so you can choose one rather than read all of them.",
};

export type ResourceEntry = {
  title: string;
  href: string;
  description: string;
  kind: string;
};

export const PUBLIC_ROUTE_ENTRIES: readonly ResourceEntry[] = [
  {
    title: "Product",
    href: "/product",
    description: "What Lintel presents across a complete verification record.",
    kind: "Route",
  },
  {
    title: "How it works",
    href: "/how-it-works",
    description: "How a change becomes an accountable merge decision, step by step.",
    kind: "Route",
  },
  {
    title: "Trust",
    href: "/trust",
    description: "Verification boundaries, model provenance, data boundaries and availability.",
    kind: "Route",
  },
];

export const RESOURCES_CLOSING = {
  title: "Start with the sample",
  body: "The fixed sample review is the fastest way to see the verification model applied to a real case.",
  action: { label: "Open the sample review", href: "/workspace?source=fixture" },
};
