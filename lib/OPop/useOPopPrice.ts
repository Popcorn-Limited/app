import { BigNumber } from "ethers";
import { BigNumberWithFormatted, Pop } from "lib/types";
import { formatAndRoundBigNumber, useConsistentRepolling } from "lib/utils";
import { useContractRead } from "wagmi";


export default function useOPopPrice({ chainId, address }): Pop.HookResult<BigNumberWithFormatted> {
  return useConsistentRepolling(
    useContractRead({
      address,
      chainId: Number(chainId),
      abi: ["function getPrice(address) view returns (uint256)"],
      functionName: "getPrice",
      args: [],
      scopeKey: `getOPrice:${chainId}:${address}`,
      enabled: !!(chainId && address),
      select: (data) => {
        return {
          value: (data as BigNumber) || BigNumber.from(0),
          formatted: formatAndRoundBigNumber(data as BigNumber, 18),
        };
      },
    })) as Pop.HookResult<BigNumberWithFormatted>;
}