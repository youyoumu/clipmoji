import { useQuery } from "@tanstack/react-query";
import wretch from "wretch";

import { db } from "#/lib/db";

export function useCachedBlob(src: string) {
  return useQuery({
    queryKey: ["cachedBlob", { src }],
    async queryFn() {
      const cachedBlob = await db.cachedBlob.where("src").equals(src).first();
      if (cachedBlob) return cachedBlob.blob;
      const blob = await wretch(src)
        .get()
        .blob()
        .catch((error) => {
          if (error instanceof wretch.WretchError) {
            return null;
          }
          if (error instanceof TypeError) {
            return null;
          }
          return null;
        });
      if (!blob) return null;
      const allowedBlobTypes = ["image/gif", "video/mp4"];
      if (allowedBlobTypes.includes(blob.type)) {
        await db.cachedBlob.add({
          src: src,
          blob: blob,
        });
        return blob;
      }
      return null;
    },
  });
}
