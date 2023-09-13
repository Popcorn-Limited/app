import { ethers, BigNumber } from 'ethers';
import { useContractReads } from 'wagmi';
import { getVeAddresses } from 'lib/utils/addresses';
import { Pop } from 'lib/types';

const DAYS = 24 * 60 * 60;

export default async function useLastUserVotes({ addresses, chainId, account }: { addresses: string[], chainId: number, account: string }): { data: boolean, status: string } {
    const { data, status } = useContractReads({
        contracts: Array(addresses).fill(undefined).map((contract) => {
            return {
                address,
                abi: abiController,
                functionName: "last_user_votes",
                chainId: chainId,
                args: [account, contract]
            }
        }),
    }) as Pop.HookResult<BigNumber[]>

    const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_API_KEY);
    const currentBlock = await provider.getBlock('latest');
    const limitTimestamp = currentBlock.timestamp - (DAYS * 10);

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