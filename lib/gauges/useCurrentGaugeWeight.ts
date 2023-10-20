import { useContractRead } from "wagmi";

export default function useCurrentGaugeWeight({ address, account, chainId }: { address: string, account: string, chainId: number }): Pop.HookResult<BigNumberWithFormatted> {
  return useContractRead({
    address,
    chainId: Number(chainId),
    abi: ["function gauge_relative_weight(address) view returns (uint256)"],
    functionName: "gauge_relative_weight",
    args: (!!account && [account]) || [],
    scopeKey: `current_gauge_relative_weight:${chainId}:${address}:${account}`,
    enabled: !!address && !!account && !!chainId,
    select: (data) => {
      return {
        value: (data as BigNumber) || BigNumber.from(0),
        formatted: formatAndRoundBigNumber(data as BigNumber, 18),
      };
    },
  }) as Pop.HookResult<BigNumberWithFormatted>;
}