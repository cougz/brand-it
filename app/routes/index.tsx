import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    // Redirect to /library once auth + brand-kit land (Week 2).
    // For now, redirect to /_dev/components as the visual baseline.
    throw redirect({ to: "/_dev/components" });
  },
  component: () => null,
});
