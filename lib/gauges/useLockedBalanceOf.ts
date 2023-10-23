import { Address, useContractRead } from "wagmi";

export interface LockedBalance {
  amount: bigint;
  end: bigint;
}

export default function useLockedBalanceOf({ chainId, address, account }: { chainId: number, address: Address, account: Address }) {
  return useContractRead({
    address,
    chainId: Number(chainId),
    abi: ["function locked(address) view returns ((uint256,uint256))"],
    functionName: "locked",
    args: (!!account && [account]) || [],
    scopeKey: `lockedBalanceOf:${chainId}:${address}:${account}`,
    enabled: !!(chainId && address && account),
    select: (data: any) => { return { amount: data[0], end: data[1] } },
    watch: true,
    cacheTime: 2_000,
  })
}