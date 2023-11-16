// @ts-ignore
import NoSSR from 'react-no-ssr';
import React from "react";
import Head from "next/head";
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import Page from "@/components/page/Page";
import "@rainbow-me/rainbowkit/styles.css";
import "../styles/globals.css";
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  injectedWallet,
  rainbowWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  coin98Wallet,
} from '@rainbow-me/rainbowkit/wallets';

const { chains, publicClient } = configureChains(SUPPORTED_NETWORKS, [
  alchemyProvider({
    apiKey: process.env.ALCHEMY_API_KEY as string,
  }),
  jsonRpcProvider({ rpc: (chain) => ({ http: chain.rpcUrls.default.http[0] }) })],
  {
    pollingInterval: 7_000,
    stallTimeout: 5_000, // time to change to another RPC if failed
  }
);

const connectors = connectorsForWallets([
  {
    groupName: 'Suggested',
    wallets: [
      injectedWallet({ chains }),
      rainbowWallet({ projectId: 'b2f883ab9ae2fbb812cb8e0d83efea7b', chains }),
      metaMaskWallet({ projectId: 'b2f883ab9ae2fbb812cb8e0d83efea7b', chains }),
    ],
  },
  {
    groupName: 'Others',
    wallets: [
      coinbaseWallet({ chains, appName: 'Popcorn' }),
      walletConnectWallet({ projectId: 'b2f883ab9ae2fbb812cb8e0d83efea7b', chains }),
      coin98Wallet({ projectId: 'b2f883ab9ae2fbb812cb8e0d83efea7b', chains })
    ]

  }
]);

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})


const { title, description, socialShareImage } = {
  title: "Popcorn - Yield That Counts",
  description: "Popcorn is a regenerative yield optimizing protocol.",
  socialShareImage: "https://www.popcorn.network/images/social_cover_image.png",
};

export default function MyApp(props: any) {
  const { Component, pageProps } = props;
  const getLayout =
    Component.getLayout ||
    (() => (
      <Page>
        <Component {...pageProps} />
      </Page>
    ));

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
      <WagmiConfig config={config}>
        <RainbowKitProvider chains={chains} modalSize="compact">
            <NoSSR>
              {getLayout(<Component {...pageProps} />)}
            </NoSSR>
        </RainbowKitProvider>
      </WagmiConfig >
    </React.Fragment>
  );
}
