import {
  Button,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { useLocalStorage } from "@uidotdev/usehooks";
import protobuf from "protobufjs";
import { FaKey } from "react-icons/fa";
import wretch from "wretch";
/*
const iframe = document.createElement("iframe");
console.log(
  "Token: %c%s",
  "font-size:16px;",
  JSON.parse(
    document.body.appendChild(iframe).contentWindow.localStorage.token,
  ),
);
iframe.remove();
*/

export default function SettingsButton() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [token, setToken] = useLocalStorage<string>("token");

  const onTestClick = async () => {
    wretch("https://discord.com/api/v9/users/@me/settings-proto/2", {
      headers: {
        Authorization: token,
      },
    })
      .get()
      .json(async (json) => {
        const protobufBinary = Uint8Array.from(atob(json.settings), (c) =>
          c.charCodeAt(0),
        );

        const decodedUTF8 = new TextDecoder("utf-8", { fatal: false }).decode(
          protobufBinary,
        );

        const protoSchemaUrl =
          "https://raw.githubusercontent.com/discord-userdoccers/discord-protos/768905de3b7e7b00847cd242d9b7584976017b92/discord_protos/discord_users/v1/FrecencyUserSettings.proto";
        const protoSchema = await wretch(protoSchemaUrl).get().text();
        const root = protobuf.parse(protoSchema).root;

        const Message = root.lookupType(
          "discord_protos.discord_users.v1.FrecencyUserSettings",
        );
        const decoded = Message.decode(protobufBinary);
        //@ts-expect-error unknown type
        const favoriteGifs = decoded.favoriteGifs.gifs;
        console.log("DEBUG[102]: decoded=", favoriteGifs);
      });
  };

  return (
    <>
      <Button color="primary" variant="flat" onPress={onOpen}>
        Settings
      </Button>
      <Modal isOpen={isOpen} placement="top-center" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Settings
              </ModalHeader>
              <ModalBody>
                <Input
                  endContent={
                    <FaKey className="text-xl text-default-400 flex-shrink-0" />
                  }
                  value={token ?? ""}
                  onChange={(e) => {
                    setToken(e.target.value);
                  }}
                  label="API Key"
                  placeholder="Enter your API key"
                  type="password"
                  variant="bordered"
                />

                <div className="flex py-2 px-1 justify-between">
                  <Checkbox
                    classNames={{
                      label: "text-small",
                    }}
                  >
                    Overwrite favorite GIF
                  </Checkbox>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button onPress={onTestClick} variant="flat">
                  Test
                </Button>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" variant="solid" onPress={onClose}>
                  Import Favorite GIF
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
