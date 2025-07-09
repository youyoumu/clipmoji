import {
  addToast,
  Card,
  CardBody,
  CardHeader,
  Image,
  Input,
} from "@heroui/react";
import { Chip } from "@heroui/react";
import { IconCopy, IconPhotoX } from "@tabler/icons-react";
import { memo, useEffect, useState } from "react";
import ReactPlayer from "react-player";

import { useCachedBlob } from "#/hooks/useCachedBlob";
import type { FavGif } from "#/lib/db";

function GifCard_({ favGif }: { favGif: FavGif }) {
  const { data: blob } = useCachedBlob(favGif.src);
  const onCopyClick = () => {
    navigator.clipboard.writeText(favGif.key);
    addToast({
      title: "Copied to clipboard",
      description: favGif.key,
      color: "primary",
    });
  };

  return (
    <Card className="py-4">
      <CardHeader className="pb-0 pt-0 flex-col items-start gap-2 overflow-hidden">
        <div className="flex justify-between w-full">
          <Chip size="sm">{favGif.type}</Chip>
          <IconCopy
            className="text-content4 cursor-pointer size-6"
            onClick={onCopyClick}
          />
        </div>
        <div className="text-default-500 text-xs truncate max-w-full">
          {favGif.key}
        </div>
        <Input
          size="sm"
          variant="underlined"
          label="Note"
          classNames={{
            label: "text-xs",
          }}
        />
      </CardHeader>
      <CardBody className="overflow-visible py-2">
        {(() => {
          if (!blob)
            return (
              <div className="w-full h-32 flex flex-col items-center justify-center">
                <IconPhotoX className="size-12 text-content3" />
              </div>
            );
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
            return <ReactPlayerDelayed url={blobUrl} />;
          }
        })()}
      </CardBody>
    </Card>
  );
}

function ReactPlayerDelayed({ url }: { url: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        setReady(true);
      }, 250);
    });
  }, []);

  return (
    <ReactPlayer
      className="rounded-xl"
      src={url}
      playing={ready}
      loop
      playsInline
      muted
      controls={false}
      width="100%"
      height="100%"
    />
  );
}

const GifCard = memo(GifCard_);
export default GifCard;
