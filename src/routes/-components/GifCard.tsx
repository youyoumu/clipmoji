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
import { IconCopy, IconPhotoX } from "@tabler/icons-react";
import { useDebounceFn } from "ahooks";
import {
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import ReactPlayer from "react-player";

import { useCachedBlob } from "#/hooks/useCachedBlob";
import { useFavGifNote, useUpdateFavGifNote } from "#/hooks/useFavGifNote";
import type { FavGif } from "#/lib/db";
import { horizontalLoop } from "#/lib/gsap/horizontalLoop";

const reactNodeCache = new Map<string, ReactNode>();

function GifCard_({ favGif }: { favGif: FavGif }) {
  const { data: cachedBlob, isLoading: L1 } = useCachedBlob(favGif.src);
  const [isLoading, startTransition] = useTransition();

  const onCopyClick = useCallback(() => {
    navigator.clipboard.writeText(favGif.key);
    addToast({
      title: "Copied to clipboard",
      description: favGif.key,
      color: "primary",
    });
  }, []);

  const [cardNode, setCardNode] = useState<ReactNode>();

  useEffect(() => {
    if (L1) return;
    const cacheNode = reactNodeCache.get(favGif.id.toString());

    startTransition(() => {
      if (cacheNode) {
        setCardNode(cacheNode);
        return;
      }

      const node = (
        <Card className="py-4">
          <CardHeader className="pb-0 pt-0 flex-col items-start gap-2 overflow-hidden">
            <div className="flex justify-between w-full">
              <Chip size="sm">{favGif.type}</Chip>
              <IconCopy
                className="text-content4 cursor-pointer size-6"
                onClick={onCopyClick}
              />
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
      reactNodeCache.set(favGif.id.toString(), node);
      setCardNode(node);
    });
  }, [cachedBlob, L1]);

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
          onSuccess({ updated, note }) {
            if (updated) {
              addToast({
                title: "Note Updated",
                description: `Your note has been updated: ${note}`,
                color: "secondary",
                timeout: 2000,
              });
            }
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
