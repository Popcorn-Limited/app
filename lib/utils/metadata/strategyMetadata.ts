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
  }
}

export default StrategyMetadata;