import { IpfsClient } from "lib/utils";
import { BigNumber } from "ethers";
import { useVaultRegistry } from "hooks/vaults";
import { useEffect, useState } from "react";
import { Address, useContractRead } from "wagmi";
import TokenMetadata from "lib/utils/metadata/tokenMetadata";
import ProtocolMetadata from "lib/utils/metadata/protocolMetadata";
import StrategyMetadata from "lib/utils/metadata/strategyMetadata";

function getLocalMetadata(address: string): IpfsMetadata {
  switch (address) {
    case "0xDFd505B54E15D5B20842e868E4c19D7b6F0a4a5d":
      return {
        token: TokenMetadata.stgUsdt,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyStargateCompounder,
        getTokenUrl: "https://stargate.finance/pool/usdt-matic/add",
      }
    case "0xB38b9522005ffBb0e297c17A8e2a3f11C6433e8C":
      return {
        token: TokenMetadata.stgUsdc,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyStargateCompounder,
        getTokenUrl: "https://stargate.finance/pool/usdc-matic/add",
      }
    case "0x5d344226578DC100b2001DA251A4b154df58194f":
      return {
        token: TokenMetadata.dai,
        protocol: ProtocolMetadata.yearn,
        strategy: {
          name: "Yearn Strategies",
          description: `**Compound Folding** \- The DAI Sweet Vault supplies and borrows DAI on Compound Finance simultaneously to earn COMP. Flashmints are then used to mint DAI from MakerDAO to flashlend and fold the position to boost APY. Earned tokens are then harvested, sold for more DAI, and then deposited back into the strategy.`
        }
      }
    case "0xc1D4a319dD7C44e332Bd54c724433C6067FeDd0D":
      return {
        token: TokenMetadata.usdc,
        protocol: ProtocolMetadata.yearn,
        strategy: {
          name: "Yearn Compound Folding",
          description: `**Compound Folding** \- Supplies and borrows USDC on Compound Finance simultaneously to earn COMP. Flashmints are then used to mint DAI from MakerDAO to flashlend and fold the position to boost APY. Earned tokens are then harvested, sold for more USDC, and then deposited back into the strategy. 
          **Idle Finance Reinvest** \- Supplies USDC to Idle Finance to earn IDLE and COMP. Earned tokens are harvested, sold for more USDC, and then deposited back into the strategy.
          **Angle Reinvest** \- Provides USDC liquidity to Angle Protocol for sanTokens that are staked to earn ANGLE. Earned tokens are harvested, sold for more USDC, and deposited back into the strategy.
          **Maker Folding** \- Supplies USDC to MakerDAO Peg Stability Module for a USDC-DAI ratio that is then deposited int the Uniswap v2 DAI-USDC liquidity pool. Flashmints are used to mint DAI from MakerDAO to flashlend and fold the position, boosting the APY. Earned tokens are harvested, sold for more USDC, and then deposited back into the strategy.`
        }
      }
    case "0xC2241a5B22Af50b2bb4C4960C23Ed1c8DB7f4D6c":
      return {
        token: TokenMetadata.dolaUsdcVeloLp,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyVelodromeCompounder,
        getTokenUrl: "https://app.velodrome.finance/liquidity/manage?address=0x6c5019d345ec05004a7e7b0623a91a0d9b8d590d"
      }
    case "0x2F1698D249782dbA192aF2Bab91E5eA621b7C6f7":
      return {
        token: TokenMetadata.hopDai,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyHopCompounder,
        getTokenUrl: "https://app.hop.exchange/#/pool/deposit?token=DAI&sourceNetwork=optimism"
      }
    case "0x36EC2111A68350dBb722B872963F05992dd08E42":
      return {
        token: TokenMetadata.hopUsdc,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyHopCompounder,
        getTokenUrl: "https://app.hop.exchange/#/pool/deposit?token=USDC&sourceNetwork=arbitrum"
      }
    case "0xfC2193ac4E8145E192bC3d9Db9407A4aE0Dc4DF8":
      return {
        token: TokenMetadata.hopDai,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyHopCompounder,
        getTokenUrl: "https://app.hop.exchange/#/pool/deposit?token=DAI&sourceNetwork=arbitrum"
      }
    case "0xe64E5e2E58904366A6E24CF1e0aC7922AfCe4332":
      return {
        token: TokenMetadata.hopUsdt,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyHopCompounder,
        getTokenUrl: "https://app.hop.exchange/#/pool/deposit?token=USDT&sourceNetwork=optimism"
      }
    case "0xc8C88fdF2802733f8c4cd7c0bE0557fdC5d2471c":
      return {
        token: TokenMetadata.ousd,
        protocol: ProtocolMetadata.ousd,
        strategy: {
          name: "Yearn Compound Folding",
          description: `**Morpho Lending** \- Morpho adds a peer-to-peer layer on top of Compound and Aave allowing lenders and borrowers to be matched more efficiently with better interest rates. When no matching opportunity exists, funds flow directly through to the underlying protocol. OUSD supplies stablecoins to three of Morpho’s Compound markets to earn interest. Additional yield is generated from protocol token incentives, including both COMP (regularly sold for USDT) and MORPHO (currently locked).
          **Convex Compounding** \- Convex allows liquidity providers and stakers to earn greater rewards from Curve, a stablecoin-centric automated market maker (AMM). OUSD earns trading fees and protocol token incentives (both CRV and CVX). This strategy employs base pools and metapools, including the Origin Dollar factory pool, which enables OUSD to safely leverage its own deposits to multiply returns and maintain the pool’s balance.`
        }
      }
  }
}



function useGetIpfsMetadata(address: string, cid?: string): IpfsMetadata {
  const [ipfsData, setIpfsData] = useState<IpfsMetadata>();

  useEffect(() => {
    if (address) {
      if (cid) {
        IpfsClient.get<IpfsMetadata>(cid).then(res => setIpfsData(res))
      } else {
        setIpfsData(getLocalMetadata(address))
      }
    }
  },
    [address, cid]
  )

  return ipfsData;
}

export default function useVaultMetadata(vaultAddress, chainId): VaultMetadata {
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
  const ipfsMetadata = useGetIpfsMetadata(vaultAddress, data?.metadataCID);

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
  }
  getTokenUrl?: string;
}
