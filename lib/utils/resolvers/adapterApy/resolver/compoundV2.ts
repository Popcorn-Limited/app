import { Contract } from "ethers";
import { RPC_PROVIDERS } from "lib/utils/connectors";
import { readContract } from "@wagmi/core";
import { readContracts } from "wagmi";
import { constants } from "ethers";

export async function compoundV2Apy({ chainId, address, resolver }: { chainId: number, address: string, resolver: string }): Promise<number> {
  const cTokenAddress = await getCTokenAddress({ chainId, address })
  const cToken = new Contract(
    // @ts-ignore
    cTokenAddress,
    ['function supplyRatePerBlock() public view returns (uint)'],
    // @ts-ignore
    RPC_PROVIDERS[chainId]
  );

  const supplyRate = await cToken.supplyRatePerBlock();

  return (((Math.pow((Number(supplyRate) / 1e18 * 7200) + 1, 365))) - 1) * 100
}

export async function compoundV2({ chainId, address }: { chainId: number, address: string }): Promise<number> {
  return compoundV2Apy({ chainId, address, resolver: "compoundV2" })
}

const COMPTROLLER_ADDRESS = "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B";

export async function getCTokenAddress({ chainId, address }: { chainId: number, address: string }) {
  const cTokens = await readContract({
    address: COMPTROLLER_ADDRESS,
    abi: abiComptroller,
    functionName: "getAllMarkets",
    chainId,
    args: []
  }) as `0x${string}`[];

  const underlying = (await readContracts({
    contracts: cTokens.map(item => {
      return {
        address: item,
        abi: abiMarket,
        functionName: "underlying",
        chainId,
        args: []
      }
    })
  }) as string[]).map(item => item ? item.toLowerCase() : item)

  return underlying.includes(address?.toLowerCase())
    ? cTokens[underlying.indexOf(address?.toLowerCase())]
    : constants.AddressZero
}

const abiComptroller = [
  {
    "constant": true,
    "inputs": [],
    "name": "getAllMarkets",
    "outputs": [
      {
        "internalType": "contract CToken[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
]
const abiMarket = [
  {
    "constant": true,
    "inputs": [],
    "name": "underlying",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
]