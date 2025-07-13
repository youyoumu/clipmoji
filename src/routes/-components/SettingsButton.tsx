import {
  Accordion,
  AccordionItem,
  addToast,
  Alert,
  Button,
  Checkbox,
  Input,
  Kbd,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { IconDevices, IconEye, IconEyeOff } from "@tabler/icons-react";
import { IconCopy } from "@tabler/icons-react";
import { useLocalStorage, useToggle } from "@uidotdev/usehooks";
import type { ReactNode } from "react";

import { env } from "#/env";
import { useUpdateCachedBlobs } from "#/hooks/useCachedBlobs";
import {
  useExportFavoriteGifs,
  useFavoriteGifs,
  useUpdateFavoriteGifs,
} from "#/hooks/useFavoriteGifs";
import { useSettings, useToken } from "#/hooks/useSettings";
import getApiKeyCode from "#/script/shiki/getApiKey.code.js?raw";
import getApiKeyHtml from "#/shiki-output/getApiKey.code.js.html?raw";

export default function SettingsButton({
  renderTrigger,
}: {
  renderTrigger?: (onOpen: () => void) => ReactNode;
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  function onTestClick() {
    addToast({
      title: "Test...",
      color: "default",
      timeout: 1000,
    });
  }

  return (
    <>
      {renderTrigger?.(onOpen) ?? (
        <Button color="primary" variant="flat" onPress={onOpen}>
          Settings
        </Button>
      )}
      <Modal
        isOpen={isOpen}
        placement="center"
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Settings
              </ModalHeader>
              <ModalBody>
                <APIKeyInput />
                <Accordion>
                  <AccordionItem
                    key="1"
                    aria-label="What is Discord User Token?"
                    title="What is Discord User Token?"
                  >
                    <p className="mb-4">
                      Your <strong>Discord User Token</strong> is a secret
                      identifier that lets this app temporarily access your
                      Discord account — specifically to read your favorite GIFs
                      and emojis.
                    </p>
                    <Alert
                      color="warning"
                      description={
                        <p>
                          Never share your Discord token with anyone. It gives
                          full access to your account. This app will only use it
                          locally to fetch your GIFs and will never store or
                          send your token anywhere else.
                        </p>
                      }
                    />
                  </AccordionItem>
                  <AccordionItem
                    key="2"
                    aria-label="How to get your Discord User Token?"
                    title="How to get your Discord User Token?"
                  >
                    <ol className="list-decimal ps-8 mb-4 space-y-0.5">
                      <li>
                        Open <strong>Discord in your browser</strong> (e.g.
                        Chrome).
                      </li>
                      <li>
                        Press <Kbd>F12</Kbd> to open DevTools.
                      </li>
                      <li>
                        Go to the <strong>Console</strong> tab.
                      </li>
                      <li>
                        Enable <strong>Device Emulation</strong>:
                        <ul className="list-disc pl-5 mt-1">
                          <li>
                            Click the small phone icon{" "}
                            <IconDevices className="inline size-5"></IconDevices>{" "}
                            at the top-left of DevTools.
                          </li>
                          <li>Make sure the page reloads in mobile view.</li>
                        </ul>
                      </li>
                      <li>
                        Paste the code below and press <Kbd>Enter</Kbd>.
                      </li>
                      <li>
                        Your Discord token will appear in the console — copy and
                        paste it above.
                      </li>
                    </ol>

                    <div className="relative">
                      <div
                        className="[&_.shiki]:overflow-auto [&_.shiki]:p-4 [&_.shiki]:text-sm rounded-md overflow-hidden"
                        dangerouslySetInnerHTML={{
                          __html: getApiKeyHtml,
                        }}
                      ></div>
                      <IconCopy
                        className="absolute top-4 right-4 cursor-pointer"
                        onClick={() => {
                          navigator.clipboard.writeText(getApiKeyCode);
                          addToast({
                            title: "Copied to clipboard",
                            description: (
                              <span className="text-xs">{getApiKeyCode}</span>
                            ),
                            color: "default",
                            classNames: {
                              content: "overflow-hidden",
                            },
                          });
                        }}
                      />
                    </div>
                  </AccordionItem>
                </Accordion>
                <div className="flex py-2 px-1 flex-col gap-4">
                  <CheckboxSetting
                    settingKey="overwriteFavoriteGifs"
                    text="Overwrite favorite GIFs"
                  />
                  <CheckboxSetting
                    settingKey="showDeadLinks"
                    text="Show dead links"
                  />
                  <CheckboxSetting
                    settingKey="smoothScroll"
                    text="Smooth scrolling"
                  />
                </div>

                {env.DEV && (
                  <Button variant="flat" onPress={onTestClick}>
                    Test
                  </Button>
                )}
              </ModalBody>
              <ModalFooter className="flex-wrap">
                <ExportButton />
                <ImportButton />
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

function CheckboxSetting({
  settingKey,
  text,
}: {
  settingKey: keyof ReturnType<typeof useSettings>[0];
  text: string;
}) {
  const [settings, setSettings] = useSettings();
  return (
    <Checkbox
      classNames={{
        label: "text-small",
      }}
      isSelected={settings[settingKey]}
      onValueChange={(value) => {
        if (typeof settings[settingKey] !== "boolean") return;
        setSettings({
          ...settings,
          [settingKey]: value,
        });
      }}
    >
      {text}
    </Checkbox>
  );
}

function APIKeyInput() {
  const [token, setToken] = useToken();
  const [visible, toggle] = useToggle(false);

  return (
    <Input
      endContent={
        visible ? (
          <IconEyeOff onClick={() => toggle()} className="cursor-pointer" />
        ) : (
          <IconEye onClick={() => toggle()} className="cursor-pointer" />
        )
      }
      value={token ?? ""}
      onChange={(e) => {
        setToken(e.target.value);
      }}
      label="Discord User Token"
      placeholder="Enter your Discord User Token"
      type={visible ? "text" : "password"}
      variant="bordered"
    />
  );
}

function ImportButton() {
  const [token] = useToken();
  const [{ overwriteFavoriteGifs }] = useSettings();
  const { mutateAsync: importGifs, isPending } = useUpdateFavoriteGifs();

  const { mutateAsync: updateCachedBlobs } = useUpdateCachedBlobs();

  function updateCachedBlobsWithToast() {
    addToast({
      title: "Fetching...",
      promise: updateCachedBlobs(undefined, {
        onSuccess({ addedCount, errorCount }) {
          addToast({
            title: "Fetch Complete",
            description: `${addedCount} favorite GIF${addedCount > 1 ? "s" : ""} has been cached locally. Failed to fetch ${errorCount} GIF${addedCount > 1 ? "s" : ""}.`,
            color: "warning",
          });
        },
      }),
      color: "default",
      timeout: 1000,
    });
  }

  const onImportClick = async () => {
    addToast({
      title: "Importing...",
      promise: importGifs(
        { overwrite: overwriteFavoriteGifs },
        {
          onSuccess({ addedCount, updatedCount, overwrite }) {
            addToast({
              title: "Import Complete",
              description: `${overwrite ? "Existing favorite GIFs have been overwritten." : ""} ${addedCount} added, ${updatedCount} updated.`,
              color: "success",
            });
            updateCachedBlobsWithToast();
          },
          onError() {
            addToast({
              title: "Import Failed",
              description:
                "Something when wrong while importing your favorite GIFs.",
              color: "danger",
            });
          },
        },
      ),
      timeout: 1,
    });
  };

  return (
    <Button
      color="primary"
      variant="solid"
      onPress={onImportClick}
      isLoading={isPending}
      isDisabled={(token?.length ?? 0) < 50}
    >
      Import Favorite GIFs
    </Button>
  );
}

function ExportButton() {
  const { data: favoriteGifs = [], isLoading: L1 } = useFavoriteGifs();
  const { mutateAsync: exportGifs, isPending } = useExportFavoriteGifs();

  function onExportClick() {
    addToast({
      title: "Exporting...",
      promise: exportGifs(undefined, {
        onSuccess() {
          addToast({
            title: "Export Complete",
            description: "Your favorite GIFs have been exported to a zip file.",
            color: "success",
          });
        },
        onError() {
          addToast({
            title: "Export Failed",
            description:
              "Something went wrong while exporting your favorite GIFs.",
            color: "danger",
          });
        },
      }),
      timeout: 1,
    });
  }

  return (
    <Button
      color="primary"
      variant="solid"
      onPress={onExportClick}
      isLoading={isPending}
      isDisabled={favoriteGifs.length === 0 || L1}
    >
      Export Favorite GIFs
    </Button>
  );
}
