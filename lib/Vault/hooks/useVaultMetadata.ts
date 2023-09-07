import { IpfsClient } from "lib/utils";
import { BigNumber } from "ethers";
import { useVaultRegistry } from "hooks/vaults";
import { useEffect, useState } from "react";
import { Address, useContractRead } from "wagmi";
import TokenMetadata, { addLpMetadata } from "lib/utils/metadata/tokenMetadata";
import ProtocolMetadata from "lib/utils/metadata/protocolMetadata";
import StrategyMetadata, { addGenericStrategyDescription } from "lib/utils/metadata/strategyMetadata";
import useAdapterToken from "hooks/useAdapter";
import useVaultToken from "hooks/useVaultToken";

function getLocalMetadata(address: string): IpfsMetadata {
  switch (address) {
    case "0xDFd505B54E15D5B20842e868E4c19D7b6F0a4a5d":
      return {
        token: TokenMetadata.stgUsdt,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyStargateCompounder,
        getTokenUrl: "https://stargate.finance/pool/usdt-matic/add",
        resolver: "beefy",
      }
    case "0xB38b9522005ffBb0e297c17A8e2a3f11C6433e8C":
      return {
        token: TokenMetadata.stgUsdc,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyStargateCompounder,
        getTokenUrl: "https://stargate.finance/pool/usdc-matic/add",
        resolver: "beefy",
      }
    case "0x5d344226578DC100b2001DA251A4b154df58194f":
      return {
        token: TokenMetadata.dai,
        protocol: ProtocolMetadata.flux,
        strategy: StrategyMetadata.fluxLending,
        resolver: "flux",
      }
    case "0xc1D4a319dD7C44e332Bd54c724433C6067FeDd0D":
      return {
        token: TokenMetadata.usdc,
        protocol: ProtocolMetadata.flux,
        strategy: StrategyMetadata.fluxLending,
        resolver: "flux",
      }
    case "0xC2241a5B22Af50b2bb4C4960C23Ed1c8DB7f4D6c":
      return {
        token: TokenMetadata.dolaUsdcVeloLp,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyVelodromeCompounder,
        getTokenUrl: "https://app.velodrome.finance/liquidity/manage?address=0x6c5019d345ec05004a7e7b0623a91a0d9b8d590d",
        resolver: "beefy",
      }
    case "0x2F1698D249782dbA192aF2Bab91E5eA621b7C6f7":
      return {
        token: TokenMetadata.hopDai,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyHopCompounder,
        getTokenUrl: "https://app.hop.exchange/#/pool/deposit?token=DAI&sourceNetwork=optimism",
        resolver: "beefy",
      }
    case "0x36EC2111A68350dBb722B872963F05992dd08E42":
      return {
        token: TokenMetadata.hopUsdc,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyHopCompounder,
        getTokenUrl: "https://app.hop.exchange/#/pool/deposit?token=USDC&sourceNetwork=arbitrum",
        resolver: "beefy",
      }
    case "0xfC2193ac4E8145E192bC3d9Db9407A4aE0Dc4DF8":
      return {
        token: TokenMetadata.hopDai,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyHopCompounder,
        getTokenUrl: "https://app.hop.exchange/#/pool/deposit?token=DAI&sourceNetwork=arbitrum",
        resolver: "beefy",
      }
    case "0xe64E5e2E58904366A6E24CF1e0aC7922AfCe4332":
      return {
        token: TokenMetadata.hopUsdt,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyHopCompounder,
        getTokenUrl: "https://app.hop.exchange/#/pool/deposit?token=USDT&sourceNetwork=optimism",
        resolver: "beefy",
      }
    case "0xc8C88fdF2802733f8c4cd7c0bE0557fdC5d2471c":
      return {
        token: TokenMetadata.ousd,
        protocol: ProtocolMetadata.origin,
        strategy: StrategyMetadata.ousd,
        getTokenUrl: "https://app.ousd.com/",
        resolver: "origin",
      }
    case "0x8f4446a0857ca6E1f53E7a19a63631F9367bA97D":
      return {
        token: TokenMetadata.ankrBnbBnbEllipsisLp,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyEllipsisCompounder,
        getTokenUrl: "https://ellipsis.finance/pool/0x440bA409d402e25b95aC852E386445aF12E802a0",
        resolver: "beefy",
      }
    case "0xBae30fBD558A35f147FDBaeDbFF011557d3C8bd2":
      return {
        token: TokenMetadata.ohmDaiBalancerLp,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyAuraCompounder,
        getTokenUrl: "https://app.balancer.fi/#/ethereum/pool/0x76fcf0e8c7ff37a47a799fa2cd4c13cde0d981c90002000000000000000003d2/add-liquidity",
        resolver: "beefy",
      }
    case "0xFd136eF035Cf18E8F2573CaEbb3c4554635DC4F5":
      return {
        token: TokenMetadata.lusdUsdcLp,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyVelodromeCompounder,
        getTokenUrl: "https://app.velodrome.finance/liquidity/manage?address=0x207addb05c548f262219f6bfc6e11c02d0f7fdbe",
        resolver: "beefy",
      }
    case "0x759281a408A48bfe2029D259c23D7E848A7EA1bC":
      return {
        token: TokenMetadata.yCrv,
        protocol: ProtocolMetadata.yearn,
        strategy: StrategyMetadata.stYCrv,
        getTokenUrl: "https://yearn.finance/ycrv",
        resolver: "yearn",
      }
    case "0x9E237F8A3319b47934468e0b74F0D5219a967aB8":
      return {
        token: TokenMetadata.bbAvUsd,
        protocol: ProtocolMetadata.yearn,
        strategy: StrategyMetadata.yearnAuraCompounder,
        getTokenUrl: "https://app.balancer.fi/#/ethereum/pool/0xfebb0bbf162e64fb9d0dfe186e517d84c395f016000000000000000000000502/add-liquidity",
        resolver: "yearn",
      }
    case "0xF1649eC625Aca15831237D29cd09F3c71a5cca63":
      return {
        token: TokenMetadata.crvStEthLp,
        protocol: ProtocolMetadata.yearn,
        strategy: StrategyMetadata.yearnConvexCompounder,
        getTokenUrl: "https://curve.fi/#/ethereum/pools/factory-v2-303/deposit",
        resolver: "yearn",
      }
    case "0xcBb5A4a829bC086d062e4af8Eba69138aa61d567":
      return {
        token: TokenMetadata.crvOhmFraxLp,
        protocol: ProtocolMetadata.yearn,
        strategy: StrategyMetadata.yearnConvexCompounder,
        getTokenUrl: "https://curve.fi/#/ethereum/pools/factory-crypto-158/deposit",
        resolver: "yearn",
      }
    case "0x30D6a7B8c985d5dd7B9823d3B6Ae2726c8FFf81F":
      return {
        token: TokenMetadata.dai,
        protocol: ProtocolMetadata.idle,
        strategy: {
          name: "Senior Tranche",
          description: `Idle is a decentralized yield automation protocol that aims to step up DeFi by reimagining how risk and yield are managed. This vault is connected to [Yield Tranches](https://docs.idle.finance/products/yield-tranches) (YTs): an innovative DeFi primitive that segments yields and risks to appeal to a diverse range of users, offering two risk-return profiles, Senior and Junior. Senior YTs withhold part of their yield in exchange for funds coverage, given by the Junior class’ liquidity. This way, Senior holders benefit from built-in protection on deposits. That yield is routed to the Junior side in exchange for first-loss liquidity to cover Senior funds.
 
          ---
          All Idle strategies feature automatically compounded interest and no lock-up periods. 
          ---
          STRATEGIES
          
          In this vault, USDC are deposited into Idle’s Senior YT based on [Clearpool](https://clearpool.finance/)%E2%80%99s USDC borrowing pool from [Portofino Technologies](https://www.portofino.tech/). 
          
          On Clearpool, institutional borrowers can create permissionless, single-borrower liquidity pools and compete for uncollateralized liquidity from the DeFi ecosystem. Portofino Technologies is a High Frequency Trading Market Maker that uses the borrowed funds as trading capital, providing superior returns thanks to its advanced machine learning & stochastic control techniques. 
          
          This strategy allows you to take advantage of Clearpool’s institutional on-chain capital market opportunities, with **built-in protection on deposits**.`
        },
        name: "DAI Senior Tranche",
        resolver: "idleSenior",
      }
    case "0x6cE9c05E159F8C4910490D8e8F7a63e95E6CEcAF":
      return {
        token: TokenMetadata.dai,
        protocol: ProtocolMetadata.idle,
        strategy: {
          name: "Junior Tranche",
          description: `Idle is a decentralized yield automation protocol that aims to step up DeFi by reimagining how risk and yield are managed. This vault is connected to [Yield Tranches](https://docs.idle.finance/products/yield-tranches) (YTs): an innovative DeFi primitive that segments yields and risks to appeal to a diverse range of users, offering two risk-return profiles, Senior and Junior. Senior YTs withhold part of their yield in exchange for funds coverage, given by the Junior class’ liquidity. That yield is routed to the Junior side in exchange for first-loss liquidity to cover Senior funds. This way, **Junior holders can benefit from boosted returns**.
          
          All Yield Tranches feature automatically compounded interest and no lock-up periods.
          ---
          STRATEGIES
          
          In this vault, USDC are deposited into Idle’s Junior YT based on [Clearpool](https://clearpool.finance/)%E2%80%99s USDC borrowing pool from [Portofino Technologies](https://www.portofino.tech/).
          
          On Clearpool, institutional borrowers can create permissionless, single-borrower liquidity pools and compete for uncollateralized liquidity from the DeFi ecosystem. Portofino Technologies is a High Frequency Trading Market Maker that uses the borrowed funds as trading capital, providing superior returns thanks to its advanced machine learning & stochastic control techniques. 
          ---
          This strategy allows you to take advantage of Clearpool’s institutional on-chain capital market opportunities, with **boosted returns**.`
        },
        name: "DAI Junior Tranche",
        resolver: "idleJunior",
      }
    case "0xcdc3CbF94114406a0b59aDA090807838369ced2b":
      return {
        token: TokenMetadata.usdc,
        protocol: ProtocolMetadata.idle,
        strategy: {
          name: "Senior Tranche",
          description: `In this vault, USDC is deposited into **Idle’s Senior YT based on [Clearpool](https://clearpool.finance/)’s USDC borrowing pool from [Portofino Technologies](https://www.portofino.tech/)**.
          ---
          On Clearpool, institutional borrowers can create permissionless, single-borrower liquidity pools and compete for uncollateralized liquidity from the DeFi ecosystem. Portofino Technologies is a High Frequency Trading Market Maker that uses the borrowed funds as trading capital, providing superior returns thanks to its advanced machine learning & stochastic control techniques.
          ---
          This strategy allows you to take advantage of Clearpool’s institutional on-chain capital market opportunities, with **built-in protection on deposits**.`
        },
        name: "USDC Senior Tranche",
        resolver: "idleSenior",
      }
    case "0x52Aef3ea0D3F93766D255A1bb0aA7F1C4885E622":
      return {
        token: TokenMetadata.usdc,
        protocol: ProtocolMetadata.idle,
        strategy: {
          name: "Junior Tranche",
          description: `In this vault, USDC is deposited into **Idle’s Junior YT based on [Clearpool](https://clearpool.finance/)’s USDC borrowing pool from [Portofino Technologies](https://www.portofino.tech/)**. 
          ---
          On Clearpool, institutional borrowers can create permissionless, single-borrower liquidity pools and compete for uncollateralized liquidity from the DeFi ecosystem. Portofino Technologies is a High Frequency Trading Market Maker that uses the borrowed funds as trading capital, providing superior returns thanks to its advanced machine learning & stochastic control techniques.
          ---
          This strategy allows you to take advantage of Clearpool’s institutional on-chain capital market opportunities, with **boosted returns**.`
        },
        name: "USDC Junior Tranche",
        resolver: "idleJunior",
      }
    case "0x11E10B12e8DbF7aE44EE50873c09e5C7c3e01385":
      return {
        token: TokenMetadata.usdt,
        protocol: ProtocolMetadata.idle,
        strategy: {
          name: "Senior Tranche",
          description: `In this vault, USDT are deposited into **Idle’s Senior YT based on [Clearpool](https://clearpool.finance/)’s borrowing pool from** [Fasanara Digital](https://www.fasanara.com/). 
          ---
          On Clearpool, institutional borrowers can create permissionless, single-borrower liquidity pools and compete for uncollateralized liquidity from the DeFi ecosystem. Fasanara Digital was started in 2019 as part of Fasanara Capital, a top-tier hedge fund specialized in alternative credit & fintech strategies, counting +$4b AUM across different funds. 
          ---
          This strategy allows you to take advantage of Clearpool’s institutional on-chain capital market opportunities, with **built-in protection on deposits**.`
        },
        name: "USDT Senior Tranche",
        resolver: "idleSenior",
      }
    case "0x3D04Aade5388962C9A4f83B636a3a8ED63ea5b4D":
      return {
        token: TokenMetadata.usdt,
        protocol: ProtocolMetadata.idle,
        strategy: {
          name: "Junior Tranche",
          description: `In this vault, USDT are deposited into **Idle’s Junior YT based on [Clearpool](https://clearpool.finance/)’s borrowing pool from** [Fasanara Digital](https://www.fasanara.com/). . 
          ---
          On Clearpool, institutional borrowers can create permissionless, single-borrower liquidity pools and compete for uncollateralized liquidity from the DeFi ecosystem. Fasanara Digital was started in 2019 as part of Fasanara Capital, a top-tier hedge fund specialized in alternative credit & fintech strategies, counting +$4b AUM across different funds. 
          ---
          This strategy allows you to take advantage of Clearpool’s institutional on-chain capital market opportunities, with **boosted returns**.`
        },
        name: "USDT Junior Tranche",
        resolver: "idleJunior",
      }
    case "0x95Ca391fB08F612Dc6b0CbDdcb6708C21d5A8295":
      return {
        token: TokenMetadata.oeth,
        protocol: ProtocolMetadata.origin,
        strategy: StrategyMetadata.oeth,
        getTokenUrl: "https://app.oeth.com/",
        resolver: "origin",
      }
    default:
      return {
        token: { name: "Token", description: "Not found" },
        protocol: { name: "Protocol", description: "Not found" },
        strategy: { name: "Strategy", description: "Not found" },
      }
  }
}


function getFactoryMetadata(adapter, token, ipfsMetadata): IpfsMetadata {
  if (adapter?.name?.includes("Stargate")) {
    ipfsMetadata.protocol = ProtocolMetadata.stargate;
    ipfsMetadata.token = { name: `STG-${token.symbol.slice(2)}`, description: addLpMetadata("stargate", token.symbol.slice(2)) }
    ipfsMetadata.strategy = { name: "Stargate Compounding", description: addGenericStrategyDescription("lpCompounding", "Stargate") }
    ipfsMetadata.getTokenUrl = `https://stargate.finance/pool/${token.symbol.slice(2)}-ETH/add`;
    ipfsMetadata.resolver = "stargate";
  } else if (adapter?.name?.includes("Convex")) {
    ipfsMetadata.protocol = ProtocolMetadata.convex;
    ipfsMetadata.token = { name: `STG-${token.symbol.slice(2)}`, description: addLpMetadata("stableLp", "curve") }
    ipfsMetadata.strategy = { name: "Convex Compounding", description: addGenericStrategyDescription("lpCompounding", "Convex") }
    ipfsMetadata.getTokenUrl = `https://curve.fi/#/ethereum/pools`;
    ipfsMetadata.resolver = "convex";
  } else if (adapter?.name?.includes("Aave")) {
    ipfsMetadata.protocol = ProtocolMetadata.aave;
    ipfsMetadata.token = { name: token.symbol, description: "None available" }
    ipfsMetadata.strategy = { name: "Aave Lending", description: addGenericStrategyDescription("lending", "Aave") }
    ipfsMetadata.resolver = "aaveV3";
  } else if (adapter?.name?.includes("Aura")) {
    ipfsMetadata.protocol = ProtocolMetadata.aura;
    ipfsMetadata.token = { name: token.symbol, description: "None available" }
    ipfsMetadata.strategy = { name: "Aura Compounding", description: addGenericStrategyDescription("lpCompounding", "Aura") }
    ipfsMetadata.resolver = "aura";
  } else if (adapter?.name?.includes("Compound")) {
    ipfsMetadata.protocol = ProtocolMetadata.compound;
    ipfsMetadata.token = { name: token.symbol, description: "None available" }
    ipfsMetadata.strategy = { name: "Compound Lending", description: addGenericStrategyDescription("lending", "Compound") }
    ipfsMetadata.resolver = "compoundV2";
  } else if (adapter?.name?.includes("Flux")) {
    ipfsMetadata.protocol = ProtocolMetadata.flux;
    ipfsMetadata.token = { name: token.symbol, description: "None available" }
    ipfsMetadata.strategy = StrategyMetadata.fluxLending;
    ipfsMetadata.resolver = "flux";
  } else if (adapter?.name?.includes("Beefy")) {
    ipfsMetadata.protocol = ProtocolMetadata.beefy;
    ipfsMetadata.token = { name: token.symbol, description: "None available" }
    ipfsMetadata.strategy = { name: "Beefy Vault", description: addGenericStrategyDescription("automatedAssetStrategy", "Beefy") }
    ipfsMetadata.resolver = "beefy";
  } else if (adapter?.name?.includes("Yearn")) {
    ipfsMetadata.protocol = ProtocolMetadata.yearn;
    ipfsMetadata.token = { name: token.symbol, description: "None available" }
    ipfsMetadata.strategy = { name: "Yearn Vault", description: addGenericStrategyDescription("automatedAssetStrategy", "Yearn") }
    ipfsMetadata.resolver = "yearn";
  } else if (adapter?.name?.includes("Idle")) {
    ipfsMetadata.protocol = ProtocolMetadata.idle;
    ipfsMetadata.token = { name: token.symbol, description: "None available" }
    ipfsMetadata.strategy = adapter?.name?.includes("Senior") ?
      { name: "Senior Tranche", description: addGenericStrategyDescription("seniorTranche", "Idle") } :
      { name: "Junior Tranche", description: addGenericStrategyDescription("juniorTranche", "Idle") }
    ipfsMetadata.resolver = adapter?.name?.includes("Senior") ? "idleSenior" : "idleJunior";
  } else if (adapter?.name?.includes("Origin")) {
    ipfsMetadata.protocol = ProtocolMetadata.origin;
    if (adapter?.name?.includes("Ether")) {
      ipfsMetadata.token = TokenMetadata.oeth
      ipfsMetadata.strategy = StrategyMetadata.oeth
    } else {
      ipfsMetadata.token = TokenMetadata.ousd
      ipfsMetadata.strategy = StrategyMetadata.ousd
    }
    ipfsMetadata.resolver = "origin";
  }

  return ipfsMetadata;
}


async function getIpfsData(address, adapter, token, cid) {
  let newIpfsData = getLocalMetadata(address);
  if (newIpfsData?.protocol?.name === "Protocol") newIpfsData = getFactoryMetadata(adapter, token, newIpfsData);

  if (cid && cid !== "cid") {
    const res = await IpfsClient.get<IpfsMetadata>(cid);
    newIpfsData = { ...newIpfsData, name: res.name, tags: res.tags }
  }
  return newIpfsData;
}

function useGetIpfsMetadata(address: string, adapter, token, cid?: string): IpfsMetadata {
  const [ipfsData, setIpfsData] = useState<IpfsMetadata>();

  useEffect(() => {
    if (address) {
      getIpfsData(address, adapter, token, cid).then(res => setIpfsData(res))
    }
  },
    [address, cid]
  )

  return ipfsData;
}


export default function useVaultMetadata(vaultAddress, chainId): VaultMetadata {
  const { data: token } = useVaultToken(vaultAddress, chainId);
  const { data: adapter = undefined } = useAdapterToken(vaultAddress, chainId);

  const registry = useVaultRegistry(chainId);
  const { data } = useContractRead({
    address: registry?.address as Address,
    args: [vaultAddress],
    chainId,
    functionName: "getVault",
    enabled: !!vaultAddress,
    abi: [{
      "inputs": [
        {
          "internalType": "address",
          "name": "vault",
          "type": "address"
        }
      ],
      "name": "getVault",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "vault",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "staking",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "creator",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "metadataCID",
              "type": "string"
            },
            {
              "internalType": "address[8]",
              "name": "swapTokenAddresses",
              "type": "address[8]"
            },
            {
              "internalType": "address",
              "name": "swapAddress",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "exchange",
              "type": "uint256"
            }
          ],
          "internalType": "struct VaultMetadata",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }],
  });
  let ipfsMetadata = useGetIpfsMetadata(vaultAddress, adapter, token, data?.metadataCID);

  return { ...data, metadata: ipfsMetadata } as VaultMetadata;
}


export type VaultMetadata = {
  /** @notice Vault address*/
  vault: Address;
  /** @notice Staking contract for the vault*/
  staking: Address;
  /** @notice Owner and Vault creator*/
  creator: Address;
  /** @notice IPFS CID of vault metadata*/
  metadataCID: string;
  /** @notice Metadata pulled from IPFS*/
  metadata?: IpfsMetadata;
  /** @notice OPTIONAL - If the asset is an LP Token these are its underlying assets*/
  swapTokenAddresses: [Address, Address, Address, Address, Address, Address, Address, Address];
  /** @notice OPTIONAL - If the asset is an LP Token its the pool address*/
  swapAddress: Address;
  /** @notice OPTIONAL - If the asset is an LP Token this is the identifier of the exchange (1 = curve)*/
  exchange: BigNumber;
};

export type IpfsMetadata = {
  token: {
    name: string;
    description: string;
  };
  protocol: {
    name: string;
    description: string;
  }
  strategy: {
    name: string;
    description: string;
  },
  name?: string;
  getTokenUrl?: string;
  tags?: VaultTag[];
  resolver?: string;
}

export enum VaultTag {
  deltaNeutral = "Delta Neutral",
  lsd = "LSD",
  degen = "Full Degen",
  decentralized = "Decentralization Maxi",
  wildcard = "Wildcard",
}
