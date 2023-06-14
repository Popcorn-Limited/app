

const ProtocolMetadata: { [key: string]: { name: string, description: string } } = {
  beefy: {
    name: "Beefy",
    description: "Beefy is a decentralized Yield Aggregator. Beefy offers vaults that allow anyone to deposit assets and earn yield on them. These vaults earn rewards and sell them for the asset of the vault. Thus compounding additional rewards and earning more assets. These Strategies are created by various independent developers and executed by the vault users. Governance decisions are handled by BIFI holders."
  },
  yearn: {
    name: "Yearn",
    description: "Yearn is a decentralized Yield Aggregator. Their main product offering is vaults that allow anyone to deposit assets and earn yield on them. Yearn deploys a variety of Strategies to earn yield. These Strategies are created and managed by various independent developers. Governance decisions are handled by YFI holders."
  },
  origin: {
    name: "Origin",
    description: "Origin Protocol creates so called meta tokens of popular assets. These meta tokens are backed by the underlying asset and earn yield on them. Origin deploys a variety of Strategies to earn yield. These Strategies are created and managed by Origin Protocol."
  },
  flux: {
    name: "Flux",
    description: "Flux Finance is a decentralized lending protocol built by the Ondo Finance team. The protocol is a fork of Compound V2 which allows accredited investors to borrow against on-chain US Treasuries."
  },
  stargate: {
    name: "Stargate",
    description: "Stargate is a bridging protocol that allows users to bridge assets between various chains. Stargate pools are used to facilitate cross-chain bridging. Each Stargate LP is backed by assets in Stargate pools on various chains."
  },
  aave: {
    name: "Aave",
    description: "Aave is a decentralized lending protocol that allows users to lend and borrow a variety of assets. Governance decisions are handled by AAVE holders."
  },
  compound: {
    name: "Compound",
    description: "Compound is a decentralized lending protocol that allows users to lend and borrow a variety of assets. Governance decisions are handled by COMP holders."
  },
  convex: {
    name: "Convex",
    description: "Convex simplifies your Curve-boosting experience to maximize your yields."
  },
  idle: {
    name: "Idle",
    description: "Idle provides yield tranches for various products. These allow you to split your yield source into Senior tranches for stable returns with built-in coverage, and Junior tranches for higher returns while minimizing the risk of loss to the Senior class."
  }
}

export default ProtocolMetadata;