import {
  Button,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@heroui/react";
import { type ReactNode, useState } from "react";

import SettingsButton from "./SettingsButton";

export default function Layout({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <Navbar onMenuOpenChange={setIsMenuOpen} isBordered>
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden"
          />
          <NavbarBrand>
            <div className="text-2xl font-leckerli-one">Clipmoji</div>
          </NavbarBrand>
        </NavbarContent>
        <NavbarMenu>
          <NavbarMenuItem>
            <SettingsButton
              renderTrigger={(onOpen) => {
                return (
                  <Button onPress={onOpen} variant="light" color="primary">
                    Settings
                  </Button>
                );
              }}
            />
          </NavbarMenuItem>
        </NavbarMenu>

        <NavbarContent
          className="hidden sm:flex gap-4"
          justify="center"
        ></NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem className="hidden sm:block">
            <SettingsButton />
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      {children}
    </>
  );
}

const AcmeLogo = () => {
  return (
    <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
      <path
        clipRule="evenodd"
        d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};
