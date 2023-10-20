import { BigNumber } from 'ethers';
import { Pop } from 'lib/types';
import { getVeAddresses } from 'lib/utils/addresses';
import { Address, useContractReads } from 'wagmi';

const DAYS = 24 * 60 * 60;

const { GaugeController: GAUGE_CONTROLLER } = getVeAddresses()

export function useHasAlreadyVoted({ addresses, chainId, account }: { addresses: string[], chainId: number, account: string }): { data: boolean, status: string } {
    const { data, status } = useContractReads({
        contracts: addresses?.map((address) => {
            return {
                address: GAUGE_CONTROLLER as Address,
                abi: abiController,
                functionName: "last_user_vote",
                chainId: chainId,
                args: [account, address]
            }
        }),
        enabled: !!account && addresses?.length > 0,
    }) as Pop.HookResult<BigNumber[]>

    const limitTimestamp = Math.floor(Date.now() / 1000) - (DAYS * 10);

    const alreadyVoted = data?.some(voteTimestamp =>
        voteTimestamp?.gt(BigNumber.from(limitTimestamp))
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