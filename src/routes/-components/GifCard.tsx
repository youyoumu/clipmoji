import { useGSAP } from "@gsap/react";
import {
  addToast,
  Card,
  CardBody,
  CardHeader,
  cn,
  Image,
  Input,
} from "@heroui/react";
import { Chip } from "@heroui/react";
import { Spinner } from "@heroui/react";
import { IconCopy, IconDownload, IconPhotoX } from "@tabler/icons-react";
import { useDebounceFn } from "ahooks";
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import ReactPlayer from "react-player";

import { useCachedBlob } from "#/hooks/useCachedBlobs";
import { useFavGifNote, useUpdateFavGifNote } from "#/hooks/useFavGifNotes";
import {
  useGifCardNodeCache,
  useUpdateGifCardNodeCache,
} from "#/hooks/useGifCardNodeCache";
import type { FavGif } from "#/lib/db";
import { horizontalLoop } from "#/lib/gsap/horizontalLoop";

function GifCard_({ favGif }: { favGif: FavGif }) {
  const { data: cachedBlob, isLoading: L1 } = useCachedBlob(favGif.src);
  const { data: cardNode, isLoading: L2 } = useGifCardNodeCache({
    id: favGif.id.toString(),
  });
  const [isLoading, startTransition] = useTransition();

  const onCopyClick = useCallback(() => {
    navigator.clipboard.writeText(favGif.key);
    addToast({
      title: "Copied to clipboard",
      description: (
        <ScrollingText text={favGif.key} classNames={{ text: "text-xs" }} />
      ),
      color: "primary",
      classNames: {
        content: "overflow-hidden",
      },
    });
  }, [favGif.key]);

  const onDownloadClick = useCallback(() => {
    if (!cachedBlob?.blob) return;
    const url = URL.createObjectURL(cachedBlob.blob);
    const a = document.createElement("a");
    a.href = url;
    let fileName = favGif.key;
    if (!fileName.endsWith(`.${favGif.type}`)) {
      fileName += "." + favGif.type;
    }
    a.download = fileName;
    a.click();
  }, [cachedBlob, favGif]);

  const { mutate: updateGifCardNodeCache } = useUpdateGifCardNodeCache();

  useEffect(() => {
    if (L1) return;

    startTransition(() => {
      const node = (
        <Card className="py-4" key={favGif.id}>
          <CardHeader className="pb-0 pt-0 flex-col items-start gap-2 overflow-hidden">
            <div className="flex justify-between w-full">
              <Chip size="sm">{favGif.type}</Chip>
              <div className="flex gap-1">
                {cachedBlob?.blob && (
                  <IconDownload
                    className="text-content4 cursor-pointer size-6"
                    onClick={onDownloadClick}
                  />
                )}
                <IconCopy
                  className="text-content4 cursor-pointer size-6"
                  onClick={onCopyClick}
                />
              </div>
            </div>
            <ScrollingText
              text={favGif.key}
              classNames={{
                text: "text-default-500 text-xs",
              }}
            />
            <NoteInput favGif={favGif} />
          </CardHeader>
          <CardBody className="py-2">
            {(() => {
              if (!cachedBlob?.blob)
                return (
                  <div
                    className="w-full flex flex-col items-center justify-center"
                    style={{
                      aspectRatio: `${favGif.width / favGif.height}`,
                    }}
                  >
                    <IconPhotoX className="size-12 text-content3" />
                  </div>
                );
              const blobUrl = URL.createObjectURL(cachedBlob.blob);
              if (cachedBlob.blob.type === "image/gif") {
                return (
                  <Image
                    alt="Card background"
                    className="object-cover rounded-xl"
                    src={blobUrl}
                    width="full"
                    classNames={{
                      img: "w-full",
                    }}
                    style={{
                      aspectRatio: `${favGif.width / favGif.height}`,
                    }}
                  />
                );
              }
              if (cachedBlob.blob.type === "video/mp4") {
                return (
                  <div
                    style={{
                      aspectRatio: `${favGif.width / favGif.height}`,
                    }}
                  >
                    <ReactPlayerDelayed url={blobUrl} />
                  </div>
                );
              }
            })()}
          </CardBody>
        </Card>
      );
      updateGifCardNodeCache({ id: favGif.id.toString(), node });
    });
  }, [cachedBlob, L1, favGif, onCopyClick, updateGifCardNodeCache]);

  if (!cardNode)
    return (
      <Card className="py-4">
        <CardHeader className="pb-0 pt-0 flex-col items-start gap-2 overflow-hidden">
          <div className="flex justify-between w-full">
            <Chip size="sm">{favGif.type}</Chip>
          </div>
          <ScrollingText
            text={favGif.key}
            key={Math.random()}
            classNames={{
              text: "text-default-500 text-xs",
            }}
          />
          <NoteInput favGif={favGif} />
        </CardHeader>
        <CardBody className="py-2">
          <div
            className="w-full flex flex-col items-center justify-center"
            style={{
              aspectRatio: `${favGif.width / favGif.height}`,
            }}
          >
            <Spinner size="lg" />
          </div>
        </CardBody>
      </Card>
    );

  return cardNode;
}

function NoteInput({ favGif }: { favGif: FavGif }) {
  const [note, setNote] = useState("");
  const { data: favGifNote } = useFavGifNote({ key: favGif.key });

  useEffect(() => {
    if (favGifNote) {
      setNote(favGifNote.note);
    }
  }, [favGifNote]);

  const { mutate: updateFavGifNote } = useUpdateFavGifNote();

  const { run: debouncedUpdateFavGifNote } = useDebounceFn(
    (note) => {
      updateFavGifNote(
        {
          key: favGif.key,
          note: note,
        },
        {
          onSuccess({ note }) {
            addToast({
              title: "Note Updated",
              description: `Your note has been updated: ${note}`,
              color: "secondary",
              timeout: 2000,
            });
          },
        },
      );
    },
    {
      wait: 1000,
    },
  );

  return (
    <Input
      size="sm"
      variant="underlined"
      label="Note"
      classNames={{
        label: "text-xs",
      }}
      value={note}
      onValueChange={(value) => {
        setNote(value);
        debouncedUpdateFavGifNote(value);
      }}
      maxLength={50}
    />
  );
}

const ReactPlayerDelayed = memo(ReactPlayerDelayed_);
function ReactPlayerDelayed_({ url }: { url: string }) {
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

const ScrollingText = memo(ScrollingText_);
export function ScrollingText_({
  text,
  classNames = {
    text: "",
  },
}: {
  text: string;
  classNames?: {
    text: string;
  };
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    const clones: HTMLDivElement[] = [];
    for (let i = 0; i < 5; i++) {
      const clone = textEl.cloneNode(true) as HTMLDivElement;
      container.appendChild(clone);
      clones.push(clone);
    }

    const tl = horizontalLoop([textEl, ...clones], {
      repeat: -1,
      speed: 0.3,
    });

    Observer.create({
      onChangeY(self) {
        let factor = 1.5;
        if (self.deltaY < 0) {
          factor *= -1;
        }
        gsap
          .timeline({
            defaults: {
              ease: "expo.out",
            },
          })
          .to(tl, { timeScale: factor * 2.5, duration: 0.2 })
          .to(tl, { timeScale: factor / 2.5, duration: 1 });
      },
    });

    return () => {
      // Cleanup the clone and timeline
      tl.kill();
      for (const clone of clones) {
        if (clone.parentElement === container) {
          container.removeChild(clone);
        }
      }
    };
  });

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden whitespace-nowrap max-w-full w-full"
    >
      <div ref={textRef} className={cn("inline-block pe-2", classNames.text)}>
        {text}
      </div>
    </div>
  );
}
