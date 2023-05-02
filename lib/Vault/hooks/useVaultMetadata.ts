import { IpfsClient } from "lib/utils";
import { BigNumber } from "ethers";
import { useVaultRegistry } from "hooks/vaults";
import { useEffect, useState } from "react";
import { Address, useContractRead } from "wagmi";

const Beefy = {
  name: "Beefy",
  description: "Beefy is a decentralized Yield Aggregator. Beefy offers vaults that allow anyone to deposit assets and earn yield on them. These vaults earn rewards and sell them for the asset of the vault. Thus compounding additional rewards and earning more assets. These Strategies are created by various independent developers and executed by the vault users. Governance decisions are handled by BIFI holders."
}

const Yearn = {
  name: "Yearn",
  description: "Yearn is a decentralized Yield Aggregator. Their main product offering is vaults that allow anyone to deposit assets and earn yield on them. Yearn deploys a variety of Strategies to earn yield. These Strategies are created and managed by various independent developers. Governance decisions are handled by YFI holders."
}

const BeefyStargateCompounder = {
  name: "Beefy Stargate Compounding",
  description: "**Stargate Reinvest** \-  The vault deposits the user\'s Lp Token in a Stargate farm, earning the platform\'s governance token. Earned token is swapped for more Lp Token. To complete the compounding cycle, the new Lp Token is added to the farm, ready to go for the next earning event. The transaction cost required to do all this is socialized among the vault's users.",
}

const BeefyVelodromeCompounder = {
  name: "Beefy Velodrome Compounding",
  description: `**Velodrome Compounding** \- The vault stakes the user\'s Lp Token in a Velodrome gauge, earning the platform\'s governance token. Earned token is swapped for more Lp Token. To complete the compounding cycle, the new Lp Token is added to the farm, ready to go for the next earning event. The transaction cost required to do all this is socialized among the vault's users.`
}

const BeefyHopCompounder = {
  name: "Beefy Hop Compounding",
  description: `**Hop Compounding** \- The vault stakes the user\'s Lp Token in a Hop gauge, earning the platform\'s governance token. Earned token is swapped for more Lp Token. To complete the compounding cycle, the new Lp Token is added to the farm, ready to go for the next earning event. The transaction cost required to do all this is socialized among the vault's users.`
}

const hopDai = {
  name: "DAI LP",
  description: "DAI is a decentralized stablecoin that aims to maintain the value of one USD. DAI is backed by a mix of multiple cryptocurrencies. Users of the Maker Protocol and MakerDAO can create new DAI by providing collateral to back the value of the newly minted DAI. Liquidations should ensure that the value of minted DAI doesn't fall below its backing. MakerDAO controls which assets can be used to mint DAI and other risk parameters. This DAI LP is a Hop Protocol LP token that is used to facilitate cross-chain bridging. Each DAI LP is backed by DAI in Hop pools on various chains. "
}


function getLocalMetadata(address: string): IpfsMetadata {
  switch (address) {
    case "0xDFd505B54E15D5B20842e868E4c19D7b6F0a4a5d":
      return {
        token: {
          name: "Tether LP",
          description: "USDT is a centralized stablecoin that aims to maintain the value of one USD. USDT is backed by an equal amount USD in cash reserves, commercial paper, fiduciary deposits, reserve repo notes, and short-term U.S. Treasury bonds in various financial institutions. Each USDT can be redeemed for one USD. Hong Kong-based Tether creates and manages USDT. This USDT LP is a Stargate LP token that is used to facilitate cross-chain bridging. Each USDT LP is backed by USDT in Stargate pool on various chains.",
        },
        protocol: Beefy,
        strategy: BeefyStargateCompounder,
        getTokenUrl: "https://stargate.finance/pool/usdt-matic/add",
      }
    case "0xB38b9522005ffBb0e297c17A8e2a3f11C6433e8C":
      return {
        token: {
          name: "Usdc LP",
          description: "USDC is a centralized stablecoin that aims to maintain the value of one USD. USDC is backed by an equal amount USD in cash reserves and short-term U.S. Treasury bonds in various financial institutions. Each USDC can be redeemed for one USD. Centre consortium creates and manages USDC. This USDC LP is a Stargate LP token that is used to facilitate cross-chain bridging. Each USDC LP is backed by USDC in Stargate pool on various chains.",
        },
        protocol: Beefy,
        strategy: BeefyStargateCompounder,
        getTokenUrl: "https://stargate.finance/pool/usdc-matic/add",
      }
    case "0x5d344226578DC100b2001DA251A4b154df58194f":
      return {
        token: {
          name: "DAI",
          description: "DAI is a decentralized stablecoin that aims to maintain the value of one USD. DAI is backed by a mix of multiple cryptocurrencies. Users of the Maker Protocol and MakerDAO can create new DAI by providing collateral to back the value of the newly minted DAI. Liquidations should ensure that the value of minted DAI doesn't fall below its backing. MakerDAO controls which assets can be used to mint DAI and other risk parameters."
        },
        protocol: Yearn,
        strategy: {
          name: "Yearn Strategies",
          description: `**Compound Folding** \- The DAI Sweet Vault supplies and borrows DAI on Compound Finance simultaneously to earn COMP. Flashmints are then used to mint DAI from MakerDAO to flashlend and fold the position to boost APY. Earned tokens are then harvested, sold for more DAI, and then deposited back into the strategy.`
        }
      }
    case "0xc1D4a319dD7C44e332Bd54c724433C6067FeDd0D":
      return {
        token: {
          name: "USDC",
          description: "USDC is a centralized stablecoin that aims to maintain the value of one USD. USDC is backed by an equal amount USD in cash reserves and short-term U.S. Treasury bonds in various financial institutions. Each USDC can be redeemed for one USD. Centre consortium creates and manages USDC."
        },
        protocol: Yearn,
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
        token: {
          name: "DOLA / USDC LP",
          description: "This is an Liquidity Pool Token for a stable pool on Velodrome. DOLA is a decentralized stablecoin that pegs to the value of 1 USD. Inverse Finance is a decentralized autonomous organization that develops and manages a suite of permissionless and decentralized financial products using blockchain smart contract technology. USDC is a centralized stablecoin that aims to maintain the value of one USD. USDC is backed by an equal amount USD in cash reserves and short-term U.S. Treasury bonds in various financial institutions. Each USDC can be redeemed for one USD. Centre consortium creates and manages USDC."
        },
        protocol: Beefy,
        strategy: BeefyVelodromeCompounder,
        getTokenUrl: "https://app.velodrome.finance/liquidity/manage?address=0x6c5019d345ec05004a7e7b0623a91a0d9b8d590d"
      }
    case "0x2F1698D249782dbA192aF2Bab91E5eA621b7C6f7":
      return {
        token: hopDai,
        protocol: Beefy,
        strategy: BeefyHopCompounder,
        getTokenUrl: "https://app.hop.exchange/#/pool/deposit?token=DAI&sourceNetwork=optimism"
      }
    case "0x36EC2111A68350dBb722B872963F05992dd08E42":
      return {
        token: {
          name: "USDC LP",
          description: "USDC is a centralized stablecoin that aims to maintain the value of one USD. USDC is backed by an equal amount USD in cash reserves and short-term U.S. Treasury bonds in various financial institutions. Each USDC can be redeemed for one USD. Centre consortium creates and manages USDC. This USDC LP is a Hop Protocol LP token that is used to facilitate cross-chain bridging. Each USDC LP is backed by USDC in Hop pools on various chains "
        },
        protocol: Beefy,
        strategy: BeefyHopCompounder,
        getTokenUrl: "https://app.hop.exchange/#/pool/deposit?token=USDC&sourceNetwork=arbitrum"
      }
    case "0xfC2193ac4E8145E192bC3d9Db9407A4aE0Dc4DF8":
      return {
        token: hopDai,
        protocol: Beefy,
        strategy: BeefyHopCompounder,
        getTokenUrl: "https://app.hop.exchange/#/pool/deposit?token=DAI&sourceNetwork=arbitrum"
      }
    case "0xe64E5e2E58904366A6E24CF1e0aC7922AfCe4332":
      return {
        token: {
          name: "USDT LP",
          description: "USDT is a centralized stablecoin that aims to maintain the value of one USD. USDT is backed by an equal amount USD in cash reserves, commercial paper, fiduciary deposits, reserve repo notes, and short-term U.S. Treasury bonds in various financial institutions. Each USDT can be redeemed for one USD. Hong Kong-based Tether creates and manages USDT. This USDT LP is a Hop Protocol LP token that is used to facilitate cross-chain bridging. Each USDT LP is backed by USDT in Hop pools on various chains."
        },
        protocol: Beefy,
        strategy: BeefyHopCompounder,
        getTokenUrl: "https://app.hop.exchange/#/pool/deposit?token=USDT&sourceNetwork=optimism"
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
  /** @notice OPTIONAL - If the asset is an Lp Token these are its underlying assets*/
  swapTokenAddresses: [Address, Address, Address, Address, Address, Address, Address, Address];
  /** @notice OPTIONAL - If the asset is an Lp Token its the pool address*/
  swapAddress: Address;
  /** @notice OPTIONAL - If the asset is an Lp Token this is the identifier of the exchange (1 = curve)*/
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
