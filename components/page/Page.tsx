//@ts-ignore
import NoSSR from "react-no-ssr";
import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import TermsCheck from "@/components/page/TermsCheck";
import Footer from "@/components/page/Footer";
import Navbar from "@/components/navbar/NavBar";
import { useAtom } from "jotai";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import { CachedProvider, YieldOptions } from "vaultcraft-sdk";

async function setUpYieldOptions() {
  const ttl = 360_000;
  const provider = new CachedProvider();
  await provider.initialize("https://raw.githubusercontent.com/Popcorn-Limited/apy-data/main/apy-data.json");

  return new YieldOptions(provider, ttl);
}

export default function Page({ children }: { children: JSX.Element }): JSX.Element {
  const { pathname } = useRouter();

  const [yieldOptions, setYieldOptions] = useAtom(yieldOptionsAtom)

  useEffect(() => {
    if (!yieldOptions) {
      setUpYieldOptions().then((res: any) => setYieldOptions(res))
    }
  }, [])

  return (
    <>
      <TermsCheck />
      <div className="w-full  mx-auto min-h-screen h-full font-khTeka flex flex-col justify-between">
        <NoSSR>
          <Navbar />
        </NoSSR>
        <Toaster position="top-right" />
        <div className={pathname === "/" ? "" : "mx-8"}>
          {children}
        </div>
        <Footer />
      </div >
    </>
  );
}
