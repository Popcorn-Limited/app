import { BigNumber } from "ethers";
import { BigNumberWithFormatted, Pop } from "lib/types";
import { formatAndRoundBigNumber } from "lib/utils";
import { useContractRead } from "wagmi";
import { getVotePeriodEndTime } from "./utils";

export default function useUpcomingGaugeWeight({ address, account, chainId }: { address: string, account: string, chainId: number }): Pop.HookResult<BigNumberWithFormatted> {
  return useContractRead({
    address,
    chainId: Number(chainId),
    abi: ["function gauge_relative_weight(address,uint256) view returns (uint256)"],
    functionName: "gauge_relative_weight",
    args: (!!account && [account, getVotePeriodEndTime()]) || [],
    scopeKey: `upcoming_gauge_relative_weight:${chainId}:${address}:${account}`,
    enabled: !!address && !!account && !!chainId,
    select: (data) => {
      return {
        value: (data as BigNumber) || BigNumber.from(0),
        formatted: formatAndRoundBigNumber(data as BigNumber, 18),
      };
    },
  }) as Pop.HookResult<BigNumberWithFormatted>;
}
