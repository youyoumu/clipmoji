import { useQuery } from "@tanstack/react-query";

import { db } from "#/lib/db";

export function useFavoriteGifs() {
  return useQuery({
    queryKey: ["favoriteGifs"],
    queryFn() {
      return db.favGif.toArray();
    },
  });
}
