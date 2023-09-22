import { BigNumber } from 'ethers';
import { time } from 'highcharts';
import { getVotePeriodEndTime, thisPeriodTimestamp } from 'lib/Gauges/utils';
import { RPC_PROVIDERS } from 'lib/utils';
import { useEffect, useState } from 'react';
import { useContractRead } from 'wagmi';

async function getLatestTimestamp(chainId: number) {
  const latestBlockNumber = await RPC_PROVIDERS[chainId].getBlockNumber()
  const latestBlock = await RPC_PROVIDERS[chainId].getBlock(latestBlockNumber)
  return latestBlock.timestamp
}

export function useUserWethReward({ chainId, address, user, token }: { address: `0x${string}`, chainId: number, user: `0x${string}`, token: `0x${string}` }): { data: BigNumber } {
  const timestamp = BigNumber.from(String(thisPeriodTimestamp()));

  const { data: totalSupplyAtTimestamp } = useContractRead({
    address,
    abi: abiFeeDistributor,
    functionName: "getTotalSupplyAtTimestamp",
    chainId: chainId,
    args: [timestamp],
    enabled: !!timestamp && !!user && !!token
  }) as { data: BigNumber }

  const { data: userBalanceAtTimestamp } = useContractRead({
    address,
    abi: abiFeeDistributor,
    functionName: "getUserBalanceAtTimestamp",
    chainId: chainId,
    args: [user, timestamp],
    enabled: !!timestamp && !!user && !!token
  }) as { data: BigNumber }

  const { data: tokensDistributedInWeek } = useContractRead({
    address,
    abi: abiFeeDistributor,
    functionName: "getTokensDistributedInWeek",
    chainId: chainId,
    args: [token, timestamp],
    enabled: !!timestamp && !!user && !!token
  }) as { data: BigNumber }

  if (Number(userBalanceAtTimestamp) && Number(tokensDistributedInWeek) > 0 && Number(totalSupplyAtTimestamp) > 0) {
    const userReward = userBalanceAtTimestamp.mul(tokensDistributedInWeek).div(totalSupplyAtTimestamp);
    return { data: userReward };
  }

  return { data: BigNumber.from(0) };
}

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