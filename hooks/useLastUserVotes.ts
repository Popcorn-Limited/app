import { ethers, BigNumber } from 'ethers';
import { useContractReads, useAccount } from 'wagmi';
import { getVeAddresses } from 'lib/utils/addresses';
import useGauges from "lib/Gauges/useGauges";
import { Pop } from 'lib/types';

const DAYS = 24 * 60 * 60;

const { GaugeController: GAUGE_CONTROLLER,
} = getVeAddresses()

// const GaugeControllerContract = {
//     address: GAUGE_CONTROLLER,
//     abi: 'last_user_vote(address,address)(uint256)',
// }

function useLastUserVotes() {
    const user = useAccount();
    const { data: gauges = [] } = useGauges({ address: GAUGE_CONTROLLER, chainId: 5 })

    const { data: lastUserVotes } = useContractReads({
        contracts: Array(gauges).fill(undefined).map((contract) => {
            return {
                address,
                abi: abiController,
                functionName: "last_user_votes",
                chainId: 5,
                args: [user, contract]
            }
        }),
    }) as Pop.HookResult<BigNumber[]>

    const checkTimestampsExceedLimit = async () => {
        const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_API_KEY);
        const currentBlock = await provider.getBlock('latest');
        const limitTimestamp = currentBlock.timestamp - (DAYS * 10);

        return lastUserVotes.some(voteTimestamp =>
            voteTimestamp.gt(BigNumber.from(limitTimestamp))
        );
    };

    return checkTimestampsExceedLimit;
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