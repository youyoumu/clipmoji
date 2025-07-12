import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import wretch from "wretch";

import { db } from "#/lib/db";

export function useCachedBlob(src: string) {
  return useQuery({
    queryKey: ["cachedBlobs", { src }],
    async queryFn() {
      return (await db.cachedBlob.get({ src })) ?? null;
    },
  });
}

export function useCachedBlobs() {
  return useQuery({
    queryKey: ["cachedBlobs"],
    async queryFn() {
      return await db.cachedBlob.toArray();
    },
  });
}

export function useUpdateCachedBlobs() {
  const queryClient = useQueryClient();
  return useMutation({
    async mutationFn() {
      const favGifs = await db.favGif.toArray();
      let addedCount = 0;
      let errorCount = 0;
      for (const favGif of favGifs) {
        const cachedBlob = await db.cachedBlob.get({ src: favGif.src });
        if (cachedBlob) continue;

        let error: unknown;
        const res = await wretch(favGif.src)
          .options({ mode: "cors" })
          .get()
          .res()
          .catch((e) => {
            error = e;
          });
        const blob = await res?.blob();

        if (error) errorCount++;
        if (error instanceof wretch.WretchError) {
          // if status is 404, add it to the database
          if (error.status === 404) {
            await db.cachedBlob.add({
              src: favGif.src,
              blob: null,
              httpStatus: error.status,
            });
          }
          continue;
        }
        if (error instanceof TypeError) {
          if (error.message === "Failed to fetch") {
            //TODO: fetch again with free cors proxy
          }
          continue;
        }

        if (!blob) continue;
        const allowedBlobTypes = ["image/gif", "video/mp4"];
        if (allowedBlobTypes.includes(blob.type)) {
          await db.cachedBlob.add({
            src: favGif.src,
            blob: blob,
            httpStatus: null,
          });
          addedCount++;
        }
      }

      return { addedCount, errorCount };
    },
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["cachedBlobs"],
      });
    },
  });
}
