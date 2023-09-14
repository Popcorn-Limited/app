import { Pop } from "lib/types";
import { useContractRead } from "wagmi";


export default function useOPopDiscount({ chainId, address }): Pop.HookResult<Number> {
  return useContractRead({
    address,
    chainId: Number(chainId),
    abi: ["function multiplier() view returns (uint16)"],
    functionName: "multiplier",
    args: [],
    scopeKey: `getOPopDiscount:${chainId}:${address}`,
    enabled: !!(chainId && address),
  }) as Pop.HookResult<Number>;
}