import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { sort } from "fast-sort";

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

  const lanes = (() => {
    if (current === "xs") return 1;
    else if (current === "sm") return 2;
    else if (current === "md") return 3;
    return 4;
  })();

  const rowVirtualizer = useWindowVirtualizer({
    count: sortedFavoriteGifs.length,
    estimateSize: (i) => 200,
    gap: 12,
    overscan: 0,
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
    <div className="w-full items-center p-4 min-h-[calc(100svh-65px)]">
      <div
        className="w-full relative max-w-7xl mx-auto"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          // y: spring, // translateY of scroll container using negative scroll value
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
