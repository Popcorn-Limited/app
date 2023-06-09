import Page from "components/Page";
import { FeatureTogglePanel } from "components/FeatureTogglePanel";
import { DualActionModalContainer } from "components/Modal/DualActionModalContainer";
import { MultiChoiceActionModalContainer } from "components/Modal/MultiChoiceActionModalContainer";
import { SingleActionModalContainer } from "components/Modal/SingleActionModalContainer";
import { FeatureToggleProvider } from "context/FeatureToggleContext";
import Head from "next/head";
import Router from "next/router";
import React, { useEffect, useState } from "react";
import { GlobalLinearProgressAndLoading } from "components/GlobalLinearProgressAndLoading";
import { StateProvider } from "context/store";
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, goerli, localhost, bsc, fantom } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import "@rainbow-me/rainbowkit/styles.css";
import "../styles/globals.css";
import { NetworthContextProvider } from "context/Networth";
import OfacCheck from "components/OfacCheck";

const { chains, provider, webSocketProvider } = configureChains(
  [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    bsc,
    fantom,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [goerli, localhost] : []),
  ],
  [
    alchemyProvider({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    }),
    jsonRpcProvider({ rpc: (chain) => ({ http: chain.rpcUrls.default.http[0] }) }),
  ],
  {
    pollingInterval: 7_000,
    stallTimeout: 5_000, // time to change to another RPC if failed
  },
);

const { connectors } = getDefaultWallets({
  appName: "Popcorn",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

const { title, description, socialShareImage } = {
  title: "Popcorn - Yield That Counts",
  description: "Popcorn is a regenerative yield optimizing protocol.",
  socialShareImage: "https://www.popcorn.network/images/social_cover_image.png",
};

type WindowWithDataLayer = Window & {
  dataLayer: Record<string, any>[];
};

declare const window: WindowWithDataLayer;

export default function MyApp(props) {
  const { Component, pageProps } = props;
  const getLayout =
    Component.getLayout ||
    (() => (
      <Page>
        <Component {...pageProps} />
      </Page>
    ));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1890);
    Router.events.on("routeChangeStart", () => {
      setLoading(true);
    });
    Router.events.on("routeChangeComplete", () => {
      setLoading(false);
    });
    Router.events.on("routeChangeError", () => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <meta name="description" content={description} />

        {/*  Facebook Meta Tags */}
        <meta property="og:url" content="https://popcorn.network/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={socialShareImage} />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="popcorn.network" />
        <meta property="twitter:url" content="https://popcorn.network/" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={socialShareImage} />
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
      </Head>
      <StateProvider>
        <WagmiConfig client={wagmiClient}>
          <GlobalLinearProgressAndLoading loading={loading} setLoading={setLoading} />
          <FeatureToggleProvider>
            <RainbowKitProvider chains={chains}>
              <NetworthContextProvider>
                <OfacCheck />
                <SingleActionModalContainer />
                <MultiChoiceActionModalContainer />
                <DualActionModalContainer />
                {getLayout(<Component {...pageProps} />)}
                <FeatureTogglePanel />
              </NetworthContextProvider>
            </RainbowKitProvider>
          </FeatureToggleProvider>
        </WagmiConfig >
      </StateProvider>
    </React.Fragment>
  );
}
