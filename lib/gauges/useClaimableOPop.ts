import { useContractReads } from "wagmi";


export default function useClaimableOPop({ addresses, chainId, account }: { addresses: string[], chainId: number, account: string }): Pop.HookResult<{ total: BigNumber, amounts: { amount: BigNumber, address: string }[] }> {
  const { data, status } = useContractReads({
    enabled: addresses?.length > 0 && !!chainId && !!account,
    scopeKey: `useClaimableOPop:${chainId}:${account}`,
    contracts: addresses?.map((address) => ({
      address: (!!address && address) || "",
      chainId: Number(chainId),
      abi: ["function claimable_tokens(address) external view returns (uint256)"],
      functionName: "claimable_tokens",
      args: [account],
    })),
  }) as Pop.HookResult<BigNumber[]>;
  const total = data?.reduce((acc, curr) => acc.add(curr || constants.Zero), constants.Zero);
  const amounts = data?.map((amount, i) => { return { amount: amount, address: addresses[i] } });
  return { data: { total, amounts }, status: status }
}