
const baseMetadata = {
  usdc: {
    name: "USDC",
    description: "USDC is a centralized stablecoin that aims to maintain the value of one USD. USDC is backed by an equal amount USD in cash reserves and short-term U.S. Treasury bonds in various financial institutions. Each USDC can be redeemed for one USD. Centre consortium creates and manages USDC.",
  },
  usdt: {
    name: "USDT",
    description:
      "USDT is a centralized stablecoin that aims to maintain the value of one USD. USDT is backed by an equal amount USD in cash reserves, commercial paper, fiduciary deposits, reserve repo notes, and short-term U.S. Treasury bonds in various financial institutions. Each USDT can be redeemed for one USD. Hong Kong-based Tether creates and manages USDT.",
  },
  dai: {
    name: "DAI",
    description: "DAI is a decentralized stablecoin that aims to maintain the value of one USD. DAI is backed by a mix of multiple cryptocurrencies. Users of the Maker Protocol and MakerDAO can create new DAI by providing collateral to back the value of the newly minted DAI. Liquidations should ensure that the value of minted DAI doesn't fall below its backing. MakerDAO controls which assets can be used to mint DAI and other risk parameters.",
  },
  dola: {
    name: "DOLA",
    description: "DOLA is a decentralized stablecoin that pegs to the value of 1 USD. Inverse Finance is a decentralized autonomous organization that develops and manages a suite of permissionless and decentralized financial products using blockchain smart contract technology."
  },
  ousd: {
    name: "OUSD",
    description: "OUSD is a decentralized stablecoin backed 1:1 by other dollar based stablecoins. Currently these are DAI, USDC and USDT. OUSD can always be redeemed against one of these token. OUSD is managed by Origin Protocol who create and manage smart contracts to create yield on the underlying stablecoins. Each time new yield gets generated it gets distributed to OUSD holders by minting and distributing new OUSD."
  }
};

function addExoticMetadata(key: string, symbol: string): string {
  switch (key) {
    case "stargate":
      return `This ${symbol} LP is a Stargate LP token that is used to facilitate cross-chain bridging. Each ${symbol} LP is backed by ${symbol} in Stargate pools on various chains.`
    case "hop":
      return `This ${symbol} LP is a Hop LP token that is used to facilitate cross-chain bridging. Each ${symbol} LP is backed by ${symbol} in Hop pools on various chains.`
    case "stableLp":
      return `This is an Liquidity Pool Token for a stable pool on ${symbol}. It contains an equal amount of included stablecoins.`
  }
}

const TokenMetadata = {
  usdt: baseMetadata.usdt,
  usdc: baseMetadata.usdc,
  dai: baseMetadata.dai,
  dola: baseMetadata.dola,
  ousd: baseMetadata.ousd,
  stgUsdt: {
    name: "STG USDT",
    description: baseMetadata.usdt.description + addExoticMetadata("stargate", baseMetadata.usdt.name)
  },
  stgUsdc: {
    name: "STG USDC",
    description: baseMetadata.usdc.description + addExoticMetadata("stargate", baseMetadata.usdc.name)
  },
  stgDai: {
    name: "STG DAI",
    description: baseMetadata.dai.description + addExoticMetadata("stargate", baseMetadata.dai.name)
  },
  hopUsdt: {
    name: "HOP USDT",
    description: baseMetadata.usdt.description + addExoticMetadata("hop", baseMetadata.usdt.name)
  },
  hopUsdc: {
    name: "HOP USDC",
    description: baseMetadata.usdc.description + addExoticMetadata("hop", baseMetadata.usdc.name)
  },
  hopDai: {
    name: "HOP DAI",
    description: baseMetadata.dai.description + addExoticMetadata("hop", baseMetadata.dai.name)
  },
  dolaUsdcVeloLp: {
    name: "DOLA / USDC LP",
    description: baseMetadata.dola.description + baseMetadata.usdc.description + addExoticMetadata("stableLp", "Velodrome")
  }
}

export default TokenMetadata;