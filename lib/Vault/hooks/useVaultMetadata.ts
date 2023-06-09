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
        protocol: ProtocolMetadata.flux,
        strategy: StrategyMetadata.fluxLending
      }
    case "0xc1D4a319dD7C44e332Bd54c724433C6067FeDd0D":
      return {
        token: TokenMetadata.usdc,
        protocol: ProtocolMetadata.flux,
        strategy: StrategyMetadata.fluxLending
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
        strategy: StrategyMetadata.ousd,
        getTokenUrl: "https://app.ousd.com/"
      }
    case "0x8f4446a0857ca6E1f53E7a19a63631F9367bA97D":
      return {
        token: TokenMetadata.ankrBnbBnbEllipsisLp,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyEllipsisCompounder,
        getTokenUrl: "https://ellipsis.finance/pool/0x440bA409d402e25b95aC852E386445aF12E802a0"
      }
    case "0xBae30fBD558A35f147FDBaeDbFF011557d3C8bd2":
      return {
        token: TokenMetadata.ohmDaiBalancerLp,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyAuraCompounder,
        getTokenUrl: "https://app.balancer.fi/#/ethereum/pool/0x76fcf0e8c7ff37a47a799fa2cd4c13cde0d981c90002000000000000000003d2/add-liquidity"
      }
    case "0xFd136eF035Cf18E8F2573CaEbb3c4554635DC4F5":
      return {
        token: TokenMetadata.lusdUsdcLp,
        protocol: ProtocolMetadata.beefy,
        strategy: StrategyMetadata.beefyVelodromeCompounder,
        getTokenUrl: "https://app.velodrome.finance/liquidity/manage?address=0x207addb05c548f262219f6bfc6e11c02d0f7fdbe"
      }
    case "0x759281a408A48bfe2029D259c23D7E848A7EA1bC":
      return {
        token: TokenMetadata.yCrv,
        protocol: ProtocolMetadata.yearn,
        strategy: StrategyMetadata.stYCrv,
        getTokenUrl: "https://yearn.finance/ycrv"
      }
    case "0x9E237F8A3319b47934468e0b74F0D5219a967aB8":
      return {
        token: TokenMetadata.bbAvUsd,
        protocol: ProtocolMetadata.yearn,
        strategy: StrategyMetadata.yearnAuraCompounder,
        getTokenUrl: "https://app.balancer.fi/#/ethereum/pool/0xfebb0bbf162e64fb9d0dfe186e517d84c395f016000000000000000000000502/add-liquidity"
      }
    case "0xF1649eC625Aca15831237D29cd09F3c71a5cca63":
      return {
        token: TokenMetadata.crvStEthLp,
        protocol: ProtocolMetadata.yearn,
        strategy: StrategyMetadata.yearnConvexCompounder,
        getTokenUrl: "https://curve.fi/#/ethereum/pools/factory-v2-303/deposit"
      }
    case "0xcBb5A4a829bC086d062e4af8Eba69138aa61d567":
      return {
        token: TokenMetadata.crvOhmFraxLp,
        protocol: ProtocolMetadata.yearn,
        strategy: StrategyMetadata.yearnConvexCompounder,
        getTokenUrl: "https://curve.fi/#/ethereum/pools/factory-crypto-158/deposit"
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
