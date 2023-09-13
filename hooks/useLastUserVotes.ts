import { BigNumber } from 'ethers';
import { useContractReads } from 'wagmi';
import { Pop } from 'lib/types';

const DAYS = 24 * 60 * 60;

export function useLastUserVotes({ addresses, chainId, account }: { addresses: string[], chainId: number, account: string }): { data: boolean, status: string } {
    console.log("DING");
    const { data, status } = useContractReads({
        contracts: addresses.map((address) => {
            return {
                address: address,
                abi: abiController,
                functionName: "last_user_vote",
                chainId: chainId,
                args: [account, address]
            }
        }),
    }) as Pop.HookResult<BigNumber[]>

    const limitTimestamp = Math.floor(Date.now() / 1000) - (DAYS * 10);

    const alreadyVoted = data.some(voteTimestamp =>
        voteTimestamp.gt(BigNumber.from(limitTimestamp))
    );

    return { data: alreadyVoted, status: status };
}

const abiController = [
    {
        "stateMutability": "view",
        "type": "function",
        "name": "last_user_vote",
        "inputs": [{ "name": "arg0", "type": "address" }, { "name": "arg1", "type": "address" }],
        "outputs": [{ "name": "", "type": "uint256" }]
    }
]