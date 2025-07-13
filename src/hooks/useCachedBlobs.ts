import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import wretch from "wretch";

import { db } from "#/lib/db";

const defaultCachedBlobsProgress = {
  total: 0,
  bytes: 0,
  cacheHit: 0,
  addedCount: 0,
  errorCount: 0,
};
export const updateCachedBlobsProgressAtom = atom(defaultCachedBlobsProgress);

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
  const [, setUpdateCachedBlobsProgress] = useAtom(
    updateCachedBlobsProgressAtom,
  );

  return useMutation({
    async mutationFn() {
      const favGifs = await db.favGif.toArray();
      setUpdateCachedBlobsProgress((prev) => ({
        ...prev,
        total: favGifs.length,
      }));
      let addedCount = 0;
      let errorCount = 0;
      for (const favGif of favGifs) {
        const cachedBlob = await db.cachedBlob.get({ src: favGif.src });
        if (cachedBlob) {
          setUpdateCachedBlobsProgress((prev) => ({
            ...prev,
            bytes: prev.bytes + (cachedBlob.blob?.size ?? 0),
            cacheHit: prev.cacheHit + 1,
          }));
          continue;
        }

        let error: unknown;
        const res = await wretch(favGif.src)
          .options({ mode: "cors" })
          .get()
          .res()
          .catch((e) => {
            error = e;
          });
        const blob = await res?.blob();

        if (error) {
          errorCount++;
          setUpdateCachedBlobsProgress((prev) => ({
            ...prev,
            errorCount: prev.errorCount + 1,
          }));
        }
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
          setUpdateCachedBlobsProgress((prev) => ({
            ...prev,
            bytes: prev.bytes + (blob.size ?? 0),
            addedCount: prev.addedCount + 1,
          }));
        }
      }

      return { addedCount, errorCount };
    },
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["cachedBlobs"],
      });

      queryClient.invalidateQueries({
        queryKey: ["gifCardNodeCache"],
      });
    },
    onSettled() {
      setUpdateCachedBlobsProgress(defaultCachedBlobsProgress);
    },
  });
}
