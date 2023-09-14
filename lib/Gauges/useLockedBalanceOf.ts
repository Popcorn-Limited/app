import { BigNumber } from "ethers";
import { Pop } from "lib/types";
import { useConsistentRepolling } from "lib/utils";
import { useContractRead } from "wagmi";

export interface LockedBalance {
  amount: BigNumber;
  end: BigNumber;
}

export default function useLockedBalanceOf({ chainId, address, account }): Pop.HookResult<LockedBalance> {
  return useConsistentRepolling(
    useContractRead({
      address,
      chainId: Number(chainId),
      abi: ["function locked(address) view returns ((uint256,uint256))"],
      functionName: "locked",
      args: (!!account && [account]) || [],
      scopeKey: `lockedBalanceOf:${chainId}:${address}:${account}`,
      enabled: !!(chainId && address && account),
      select: (data) => { return { amount: data[0], end: data[1] } }
    })) as Pop.HookResult<LockedBalance>;
}