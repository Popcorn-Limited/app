import { useContractRead } from "wagmi";
import { BigNumber, Contract } from 'ethers';
import { Pop } from "lib/types";
import { defi_llama } from "lib/utils/resolvers/price-resolvers/resolvers";
import { thisPeriodTimestamp } from "lib/Gauges/utils";
import { RPC_PROVIDERS } from "lib/utils";

interface ClaimableTokensArgs {
  address: `0x${string}`;
  token: `0x${string}`;
  chainId: number
}

export default async function getVeApy({ chainId, address, token }: ClaimableTokensArgs): Promise<number> {
  const popPriceUSD = await defi_llama("0x6F0fecBC276de8fC69257065fE47C5a03d986394", 10)
  const wethPriceUSD = await defi_llama("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 1)
  const timestamp = BigNumber.from(String(thisPeriodTimestamp() - 604800));


  const feeDistributor = new Contract(address, abiFeeDistributor, RPC_PROVIDERS[chainId])
  const totalSupplyAtTimestamp = await feeDistributor.getTotalSupplyAtTimestamp(timestamp)
  const tokensDistributedInWeek =  await feeDistributor.getTokensDistributedInWeek(token, timestamp)

  if (Number(tokensDistributedInWeek) > 0 && Number(totalSupplyAtTimestamp) > 0) {
    const rewardValue = Number(tokensDistributedInWeek) * (Number(wethPriceUSD.value) / 1e18)
    const supplyValue = Number(totalSupplyAtTimestamp) * (Number(popPriceUSD.value) / 1e18);
    const apy = (rewardValue / supplyValue) * 52;
    return apy;
  }

  return 0;
};


const abiFeeDistributor = [
  {
    "stateMutability": "view",
    "type": "function",
    "name": "getTokensDistributedInWeek",
    "inputs": [
      {
        "name": "token",
        "type": "address"
      },
      {
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ]
  },
  {
    "stateMutability": "view",
    "type": "function",
    "name": "getTotalSupplyAtTimestamp",
    "inputs": [
      {
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ]
  },
  {
    "stateMutability": "view",
    "type": "function",
    "name": "getUserBalanceAtTimestamp",
    "inputs": [
      {
        "name": "user",
        "type": "address"
      },
      {
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ]
  },
] as const