import { Button } from "@heroui/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="bg-red-100">
      <Button>Test</Button>
    </div>
  );
}
