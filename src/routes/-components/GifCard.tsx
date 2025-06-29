import { Card, CardBody, CardHeader, Image } from "@heroui/react";

import { useCachedBlob } from "#/hooks/useCachedBlob";
import type { FavGif } from "#/lib/db";

export default function GifCard({ favGif }: { favGif: FavGif }) {
  if (favGif.type === "mp4") return null;
  const { data: blob } = useCachedBlob(favGif.src);
  if (!blob) return null;
  const blobUrl = URL.createObjectURL(blob);
  return (
    <Card className="py-4">
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
        <p className="text-tiny uppercase font-bold">Daily Mix</p>
        <small className="text-default-500">12 Tracks</small>
        <h4 className="font-bold text-large">Frontend Radio</h4>
      </CardHeader>
      <CardBody className="overflow-visible py-2">
        <Image
          alt="Card background"
          className="object-cover rounded-xl"
          src={blobUrl}
          width="full"
          classNames={{
            img: "w-full",
          }}
        />
      </CardBody>
    </Card>
  );
}
