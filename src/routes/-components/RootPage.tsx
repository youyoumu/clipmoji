import { useVirtualizer } from "@tanstack/react-virtual";
import { sort } from "fast-sort";
import { useRef } from "react";

import { useFavoriteGifs } from "#/hooks/useFavoriteGifs";
import { useTailwindBreakpoints } from "#/hooks/useTailwindBreakPoints";

import GifCard from "./GifCard";

export function RootPage() {
  const { data: favoriteGifs = [] } = useFavoriteGifs();
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

  return (
    <div
      ref={parentRef}
      className="w-full grow flex flex-col overflow-auto items-center h-[calc(100vh-65px)] p-4"
    >
      <div
        className="w-full relative max-w-7xl"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
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
      </div>
    </div>
  );
}
