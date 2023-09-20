import { BigNumber } from 'ethers';
import { useContractRead } from 'wagmi';

export function useUserWethReward({ chainId, address, user, token, timestamp }: { address: `0x${string}`, chainId: number, user: `0x${string}`, token: `0x${string}`, timestamp: number }): { data: BigNumber } {
    console.log("user", user, timestamp);
    const { data: totalSupplyAtTimestamp } = useContractRead({
        address,
        abi: abiFeeDistributor,
        functionName: "getTotalSupplyAtTimestamp",
        chainId: chainId,
        args: [timestamp]
    }) as { data: BigNumber }

    const { data: userBalanceAtTimestamp } = useContractRead({
        address,
        abi: abiFeeDistributor,
        functionName: "getUserBalanceAtTimestamp",
        chainId: chainId,
        args: [user, timestamp]
    }) as { data: BigNumber }

    const { data: tokensDistributedInWeek } = useContractRead({
        address,
        abi: abiFeeDistributor,
        functionName: "getTokensDistributedInWeek",
        chainId: chainId,
        args: [token, timestamp]
    }) as { data: BigNumber }

    console.log("totalSupplyAtTimestamp", totalSupplyAtTimestamp)
    console.log("userBalanceAtTimestamp", userBalanceAtTimestamp)
    console.log("tokensDistributedInWeek", tokensDistributedInWeek)

    if (userBalanceAtTimestamp && tokensDistributedInWeek && totalSupplyAtTimestamp) {
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
]