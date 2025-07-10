import { useVirtualizer } from "@tanstack/react-virtual";
import { sort } from "fast-sort";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";

import {
  useFavoriteGifs,
  useFavoriteGifsWithBlob,
} from "#/hooks/useFavoriteGifs";
import { useSettings } from "#/hooks/useSettings";
import { useTailwindBreakpoints } from "#/hooks/useTailwindBreakPoints";

import GifCard from "./GifCard";

export function RootPage() {
  const { settings } = useSettings();
  //remount the page when this settings change
  return <RootPage_ key={settings.showDeadLinks.toString()} />;
}

function RootPage_() {
  const { data: allFavoriteGifs = [] } = useFavoriteGifs();
  const { data: favoriteGifsWithBlob = [] } = useFavoriteGifsWithBlob();
  const { settings } = useSettings();

  const favoriteGifs = settings.showDeadLinks
    ? allFavoriteGifs
    : favoriteGifsWithBlob;

  const sortedFavoriteGifs = sort(favoriteGifs).desc((item) => item.order);
  const { current } = useTailwindBreakpoints();

  const parentRef = useRef<HTMLDivElement>(null);
  const lanes = (() => {
    if (current === "xs") return 1;
    else if (current === "sm") return 2;
    else if (current === "md") return 3;
    return 4;
  })();

  const rowVirtualizer = useVirtualizer({
    count: sortedFavoriteGifs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) => 200,
    gap: 12,
    overscan: 5,
    lanes: lanes,
    //NOTE: https://github.com/TanStack/virtual/issues/659
    measureElement: (element, _entry, instance) => {
      const direction = instance.scrollDirection;
      if (direction === "forward" || direction === null) {
        // Allow remeasuring when scrolling down or direction is null
        return element.getBoundingClientRect().height;
      } else {
        // When scrolling up, use cached measurement to prevent stuttering
        const indexKey = Number(element.getAttribute("data-index"));
        const cachedMeasurement = instance.measurementsCache[indexKey]?.size;
        return cachedMeasurement || element.getBoundingClientRect().height;
      }
    },
  });

  const pageHeight = rowVirtualizer.getTotalSize();

  const { scrollY } = useScroll({
    container: parentRef,
  }); // measures how many pixels user has scrolled vertically

  const transform = useTransform(scrollY, [0, pageHeight], [0, -pageHeight]);
  const spring = useSpring(transform, {
    damping: 9,
    mass: 0.3,
    stiffness: 50,
  }); // apply easing to the negative scroll value

  return (
    <div
      ref={parentRef}
      className="w-full grow flex flex-col overflow-auto items-center h-[calc(100vh-65px)] p-4 no-scrollbar"
    >
      <motion.div
        className="w-full relative max-w-7xl"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          y: spring, // translateY of scroll container using negative scroll value
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          return (
            <div
              key={virtualRow.index}
              data-index={virtualRow.index}
              style={{
                willChange: "transform",
                position: "absolute",
                top: 0,
                left: `calc(${(virtualRow.lane * 100) / lanes}% + 6px)`,
                width: `calc(${100 / lanes}% - 12px)`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              ref={rowVirtualizer.measureElement}
            >
              <GifCard
                key={sortedFavoriteGifs[virtualRow.index].id}
                favGif={sortedFavoriteGifs[virtualRow.index]}
              />
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
