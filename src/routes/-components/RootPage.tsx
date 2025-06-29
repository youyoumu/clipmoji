import { sort } from "fast-sort";

import { useFavoriteGifs } from "#/hooks/useFavoriteGifs";

import GifCard from "./GifCard";

export function RootPage() {
  const { data: favoriteGifs = [] } = useFavoriteGifs();
  console.log("DEBUG[105]: favoriteGifs=", favoriteGifs);
  return (
    <div className="max-w-7xl w-full p-4">
      <div className="columns-3xs gap-x-2 [&>div]:mb-2">
        {sort(favoriteGifs)
          .desc((item) => item.order)
          .map((favGif) => {
            return <GifCard key={favGif.id} favGif={favGif} />;
          })}
      </div>
    </div>
  );
}
