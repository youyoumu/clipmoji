import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";

export function gsapInit() {
  gsap.registerPlugin(Observer);
  gsap.registerPlugin(useGSAP);

  window.gsap = gsap;
  //@ts-expect-error
  window.Observer = Observer;
}

export default gsap;
