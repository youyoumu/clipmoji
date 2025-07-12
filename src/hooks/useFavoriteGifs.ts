import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useLocalStorage } from "@uidotdev/usehooks";
import { format } from "date-fns";
import JSZip from "jszip";
import protobuf from "protobufjs";
import wretch from "wretch";

import { db } from "#/lib/db";

import { useCachedBlobs } from "./useCachedBlobs";
import { useFavGifNotes } from "./useFavGifNotes";

type FrecentyUserSettings = {
  favoriteGifs: {
    gifs: Record<
      string,
      {
        format: 1 | 2;
        height: number;
        width: number;
        order: number;
        src: string;
      }
    >;
  };
};

export const favGifsQueryOptions = queryOptions({
  queryKey: ["favoriteGifs"],
  async queryFn() {
    return await db.favGif.toArray();
  },
});

export function useFavoriteGifs({
  withCacheBlob,
}: {
  withCacheBlob?: boolean;
} = {}) {
  const { data: favGifNotes = [], isLoading: L1 } = useFavGifNotes();
  const { data: cachedBlobs = [] } = useCachedBlobs();

  return useQuery({
    ...favGifsQueryOptions,

    select(favGifs) {
      const favGifsWithNote = favGifs.map((favGif) => {
        const favGifNote = favGifNotes.find((item) => item.key === favGif.key);
        return Object.assign(favGif, {
          note: favGifNote?.note ?? "",
        });
      });
      if (!withCacheBlob) return favGifsWithNote;
      return favGifsWithNote.filter((favGif) => {
        const cachedBlob = cachedBlobs.find(
          (item) => item.src === favGif.src,
        )?.blob;
        return !!cachedBlob;
      });
    },
    enabled: !L1,
  });
}

export function useUpdateFavoriteGifs() {
  const queryClient = useQueryClient();
  const [token] = useLocalStorage<string>("token");

  return useMutation({
    mutationFn: async ({ overwrite }: { overwrite?: boolean }) => {
      const json = (await wretch(
        "https://discord.com/api/v9/users/@me/settings-proto/2",
        {
          headers: {
            Authorization: token,
          },
        },
      )
        .get()
        .json()) as { settings: string };

      const protobufBinary = Uint8Array.from(atob(json.settings), (c) =>
        c.charCodeAt(0),
      );

      const protoSchemaUrl =
        "https://raw.githubusercontent.com/discord-userdoccers/discord-protos/768905de3b7e7b00847cd242d9b7584976017b92/discord_protos/discord_users/v1/FrecencyUserSettings.proto";
      const protoSchema = await wretch(protoSchemaUrl).get().text();
      const root = protobuf.parse(protoSchema).root;

      const Message = root.lookupType(
        "discord_protos.discord_users.v1.FrecencyUserSettings",
      );
      const decoded = Message.decode(
        protobufBinary,
      ) as unknown as FrecentyUserSettings;
      const favoriteGifs = Object.entries(decoded.favoriteGifs.gifs);

      if (overwrite) await db.favGif.clear();
      const currentFavGifs = await db.favGif.toArray();

      let addedCount = 0;
      let updatedCount = 0;
      for (const [key, value] of favoriteGifs) {
        const payload = {
          key: key,
          src: value.src,
          order: value.order,
          type: value.format === 1 ? "gif" : "mp4",
          height: value.height,
          width: value.width,
        } as const;

        const currentFavGif = currentFavGifs.find((item) => item.key === key);
        if (currentFavGif) {
          await db.favGif.update(currentFavGif.id, payload);
          updatedCount++;
        } else {
          await db.favGif.add(payload);
          addedCount++;
        }
      }

      return {
        addedCount,
        updatedCount,
        overwrite: overwrite,
      };
    },
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["favoriteGifs"],
      });
    },
  });
}

export function useExportFavoriteGifs() {
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
