import { BigNumber } from "ethers";
import { useContractRead } from "wagmi";
import { BigNumberWithFormatted, Pop } from "../../types";
import { formatAndRoundBigNumber, useConsistentRepolling } from "lib/utils";

export const useSpendableBalance: Pop.Hook<BigNumberWithFormatted> = ({ account, chainId, enabled }) => {
  const _enabled = !!account && Number(chainId) === 1;

  return useConsistentRepolling(
    useContractRead({
      abi: ["function spendableBalanceOf(address) view returns (uint256)"],
      address: "0x50a7c5a2aA566eB8AAFc80ffC62E984bFeCe334F",
      functionName: "spendableBalanceOf",
      args: [account],
      scopeKey: `useSpendableBalance:${account}`,
      chainId: 1,
      enabled: typeof enabled !== "undefined" ? !!enabled && _enabled : _enabled,
      select: (data) => {
        return {
          value: (data as BigNumber) || BigNumber.from(0),
          formatted: formatAndRoundBigNumber(data as BigNumber, 18),
        };
      },
    })
  ) as Pop.HookResult<BigNumberWithFormatted>;
};
export default useSpendableBalance;
