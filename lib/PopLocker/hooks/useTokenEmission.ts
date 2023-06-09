import { BigNumber } from "ethers";
import { useContractRead } from "wagmi";
import { formatAndRoundBigNumber } from "lib/utils";
import { useNamedAccounts } from "lib/utils";
import { BigNumberWithFormatted, Pop } from "lib/types";

export const useTokenEmission: Pop.Hook<BigNumberWithFormatted> = ({ chainId, address }) => {
  const enabled = true;
  const disabled = false;

  const [pop] = useNamedAccounts(chainId.toString() as any, ["pop"]);

  return useContractRead({
    address,
    chainId: Number(chainId),
    abi: ["function getRewardForDuration(address token) view returns (uint256)"],
    functionName: "getRewardForDuration",
    args: [pop.address],
    scopeKey: `getRewardForDuration:${chainId}:${address}`,
    enabled: !disabled && enabled,
    select: (data) => {
      const value = (data as BigNumber).isZero() ? BigNumber.from(0) : (data as BigNumber).div(7);
      return {
        value: value,
        formatted: formatAndRoundBigNumber(value, 18),
      };
    },
  }) as Pop.HookResult<BigNumberWithFormatted>;
};
