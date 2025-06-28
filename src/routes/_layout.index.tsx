import { createFileRoute } from "@tanstack/react-router";

import { RootPage } from "./-components/RootPage";

export const Route = createFileRoute("/_layout/")({
  component: RootPage,
});
