import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function gsapInit() {
  gsap.registerPlugin(useGSAP);
  gsap.registerPlugin(Observer);
  gsap.registerPlugin(ScrollSmoother);
  gsap.registerPlugin(ScrollTrigger);

  window.gsap = gsap;
  //@ts-expect-error
  window.Observer = Observer;
  //@ts-expect-error
  window.ScrollSmoother = ScrollSmoother;
  //@ts-expect-error
  window.ScrollTrigger = ScrollTrigger;
}

export default gsap;
