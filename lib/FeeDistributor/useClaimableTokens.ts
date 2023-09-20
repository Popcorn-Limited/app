import { useContractRead } from "wagmi";
import { BigNumber } from 'ethers';
import { Pop } from "lib/types";

interface ClaimableTokensArgs {
  address: `0x${string}`;
  user: `0x${string}`;
  timestamp: number;
  chainId?: number;
}

export default function useClaimableTokens({ chainId, address, user, timestamp }: ClaimableTokensArgs): Pop.HookResult<BigNumber> {
  return useContractRead({
    abi: ["function getUserBalanceAtTimestamp(address user, uint256 timestamp) external view returns (uint256)"],
    address,
    functionName: "getUserBalanceAtTimestamp",
    chainId: chainId,
    args: [user, timestamp],
  }) as Pop.HookResult<BigNumber>;
};