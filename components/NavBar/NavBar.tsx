import React, { useEffect } from "react";
import DesktopMenu from "components/NavBar/DesktopMenu";
import { MobileMenu } from "components/NavBar/MobileMenu";
import { useDisconnect, useNetwork } from "wagmi";
import { useRouter } from "next/router";

export default function Navbar(): JSX.Element {
  const { chain } = useNetwork();
  const { disconnect } = useDisconnect();
  const { pathname } = useRouter();


  useEffect(() => {
    if (chain?.unsupported) {
      disconnect();
    }
  }, [chain]);

  return (
    <>
      <nav className={`hidden md:flex z-10 font-landing ${pathname === "/" ? "bg-[#ebe7d433]" : "bg-white"}`}>
        <DesktopMenu />
      </nav>
      <nav className="md:hidden w-screen h-full relative">
        <MobileMenu />
      </nav>
    </>
  );
}
