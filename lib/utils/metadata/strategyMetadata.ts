const StrategyMetadata = {
  beefyStargateCompounder: {
    name: "Beefy Stargate Compounding",
    description: "**Stargate Reinvest** \-  The vault deposits the user\'s LP Token in a Stargate farm, earning the platform\'s governance token. Earned token is swapped for more LP Token. To complete the compounding cycle, the new LP Token is added to the farm, ready to go for the next earning event. The transaction cost required to do all this is socialized among the vault's users.",
  },
  beefyVelodromeCompounder: {
    name: "Beefy Velodrome Compounding",
    description: `**Velodrome Compounding** \- The vault stakes the user\'s LP Token in a Velodrome gauge, earning the platform\'s governance token. Earned token is swapped for more LP Token. To complete the compounding cycle, the new LP Token is added to the farm, ready to go for the next earning event. The transaction cost required to do all this is socialized among the vault's users.`
  },
  beefyHopCompounder: {
    name: "Beefy Hop Compounding",
    description: `**Hop Compounding** \- The vault stakes the user\'s LP Token in a Hop gauge, earning the platform\'s governance token. Earned token is swapped for more LP Token. To complete the compounding cycle, the new LP Token is added to the farm, ready to go for the next earning event. The transaction cost required to do all this is socialized among the vault's users.`
  },
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
  }
}

export default StrategyMetadata;