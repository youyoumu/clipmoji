import { Card, CardBody, CardHeader, Image } from "@heroui/react";
import { memo } from "react";
import ReactPlayer from "react-player";

import { useCachedBlob } from "#/hooks/useCachedBlob";
import type { FavGif } from "#/lib/db";

function GifCard_({ favGif }: { favGif: FavGif }) {
  const { data: blob } = useCachedBlob(favGif.src);
  return (
    <Card className="py-4">
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
        <p className="text-tiny uppercase font-bold">Daily Mix</p>
        <small className="text-default-500">12 Tracks</small>
        <h4 className="font-bold text-large">Frontend Radio</h4>
      </CardHeader>
      <CardBody className="overflow-visible py-2">
        {(() => {
          if (!blob) return null;
          const blobUrl = URL.createObjectURL(blob);
          if (blob.type === "image/gif") {
            return (
              <Image
                alt="Card background"
                className="object-cover rounded-xl"
                src={blobUrl}
                width="full"
                classNames={{
                  img: "w-full",
                }}
              />
            );
          }
          if (blob.type === "video/mp4") {
            return (
              <ReactPlayer
                className="rounded-xl"
                src={blobUrl}
                playing
                loop
                playsInline
                muted
                controls={false}
                width="100%"
                height="100%"
              />
            );
          }
        })()}
      </CardBody>
    </Card>
  );
}

const GifCard = memo(GifCard_);
export default GifCard;
