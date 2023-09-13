import { ethers, BigNumber } from 'ethers';
import { useContractReads } from 'wagmi';
import { Pop } from 'lib/types';

const DAYS = 24 * 60 * 60;

export async function getLastUserVotes({ addresses, chainId, account }: { addresses: string[], chainId: number, account: string }): Promise<{ data: boolean, status: string }> {
    const { data, status } = useContractReads({
        contracts: addresses.map((address) => {
            return {
                address,
                abi: abiController,
                functionName: "last_user_vote",
                chainId: chainId,
                args: [account, address]
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