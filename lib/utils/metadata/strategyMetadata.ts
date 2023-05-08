const StrategyBaseMetadata = {
  yearnUsdcStrategies: {
    name: "Yearn Compound Folding",
    description: `**Compound Folding** \- Supplies and borrows USDC on Compound Finance simultaneously to earn COMP. Flashmints are then used to mint DAI from MakerDAO to flashlend and fold the position to boost APY. Earned tokens are then harvested, sold for more USDC, and then deposited back into the strategy. 
      **Idle Finance Reinvest** \- Supplies USDC to Idle Finance to earn IDLE and COMP. Earned tokens are harvested, sold for more USDC, and then deposited back into the strategy.
      **Angle Reinvest** \- Provides USDC liquidity to Angle Protocol for sanTokens that are staked to earn ANGLE. Earned tokens are harvested, sold for more USDC, and deposited back into the strategy.
      **Maker Folding** \- Supplies USDC to MakerDAO Peg Stability Module for a USDC-DAI ratio that is then deposited int the Uniswap v2 DAI-USDC liquidity pool. Flashmints are used to mint DAI from MakerDAO to flashlend and fold the position, boosting the APY. Earned tokens are harvested, sold for more USDC, and then deposited back into the strategy.`
  },
  fluxLending: {
    name: "Flux Lending",
    description: "Supplies assets into Flux Finance to earn lending interest. These assets get borrowed by accredited investors which supply on-chain US Treasuries as collateral."
  },
  ousd: {
    name: "Ousd",
    description: `OUSD integrates with Aave and Compound to automate yield on over-collateralized loans.

    The OUSD protocol also routes USDT, USDC, and DAI to highly-performing liquidity pools as determined by trading volume and rewards tokens (e.g. Curve rewards CRV tokens to liquidity providers). Yields are then passed on to OUSD holders.
    
    In addition to collecting interest from lending and fees from market making, the protocol automatically claims and converts bonus incentives that are being distributed by DeFi protocols.`
  }
}

function addMetadata(key: string, symbol: string): string {
  switch (key) {
    case "lpCompounding":
      return `**${symbol} LP-Compounding** \- The vault stakes the user\'s LP Token in a ${symbol} gauge, earning the platform\'s governance token. Earned token is swapped for more LP Token. To complete the compounding cycle, the new LP Token is added to the farm, ready to go for the next earning event. The transaction cost required to do all this is socialized among the vault's users.`
    case "compoundFolding":
      return `**Compound Folding** \- The ${symbol} Sweet Vault supplies and borrows DAI on Compound Finance simultaneously to earn COMP. Flashmints are then used to mint ${symbol} from MakerDAO to flashlend and fold the position to boost APY. Earned tokens are then harvested, sold for more ${symbol}, and then deposited back into the strategy.`
  }
}


const StrategyMetadata = {
  beefyStargateCompounder: {
    name: "Beefy Stargate Compounding",
    description: addMetadata("lpCompounding", "Stargate")
  },
  beefyHopCompounder: {
    name: "Beefy Hop Compounder",
    description: addMetadata("lpCompounding", "Hop")
  },
  beefyVelodromeCompounder: {
    name: "Beefy Velodrome Compounder",
    description: addMetadata("lpCompounding", "Velodrome")
  },
  beefyBalancerCompounder: {
    name: "Beefy Aura Compounder",
    description: addMetadata("lpCompounding", "Aura")
  },
  beefyEllipsisCompounder: {
    name: "Beefy Ellipsis Compounder",
    description: addMetadata("lpCompounding", "Ellipsis")
  },
  ousd: StrategyBaseMetadata.ousd,
  fluxLending: StrategyBaseMetadata.fluxLending,
}

export default StrategyMetadata;