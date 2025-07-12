import { useGSAP } from "@gsap/react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createPortal } from "react-dom";

import { useSettings } from "#/hooks/useSettings";

export const Route = createRootRoute({
  component: Component,
});

function Component() {
  const [{ smoothScroll }] = useSettings();
  useGSAP(() => {
    if (smoothScroll) {
      // create the scrollSmoother before your scrollTriggers
      ScrollSmoother.create({
        smooth: 1, // how long (in seconds) it takes to "catch up" to the native scroll position
        // effects: true, // looks for data-speed and data-lag attributes on elements
        smoothTouch: 0.1, // much shorter smoothing time on touch devices (default is NO smoothing on touch devices)
        content: "#app",
      });
      document.documentElement.classList.add("scrollbar-hide");
    } else {
      ScrollSmoother.get()?.kill();
      document.documentElement.classList.remove("scrollbar-hide");
    }
  }, [smoothScroll]);

  return (
    <>
      <Outlet />
      {createPortal(
        <TanStackRouterDevtools />,
        document.querySelector("body")!,
      )}
    </>
  );
}
