import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import JSZip from "jszip";

import { useCachedBlobs } from "./useCachedBlob";
import { useFavoriteGifs } from "./useFavoriteGifs";

export function useExportFavGifs() {
  const { data: favoriteGifs = [] } = useFavoriteGifs();
  const { data: cachedBlobs = [] } = useCachedBlobs();

  return useMutation({
    async mutationFn() {
      const zip = new JSZip();
      const folder = zip.folder("favorite-gifs");
      if (!folder) return;
      for (const gif of favoriteGifs) {
        const blob =
          cachedBlobs.find((item) => item.src === gif.src)?.blob ?? null;
        const content = blob ? blob : JSON.stringify(gif);
        const filename = (() => {
          let filename = gif.key;
          filename = filename.replaceAll("https://", "");
          filename = filename.replaceAll("/", "__");
          filename = filename.replace(/[^a-zA-Z0-9._-]/g, ""); // allow a-z, A-Z, 0-9, underscore, dot, and dash
          filename = filename.slice(0, 256);
          let extension: string = gif.type;
          if (!blob) extension = "json";
          if (filename.endsWith(extension)) return filename;
          return filename + "." + extension;
        })();
        folder.file(filename, content);
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `discord-favorite-gifs-${format(Date.now(), "yyyyMMddHHmmss")}.zip`;
      a.click();
    },
  });
}
