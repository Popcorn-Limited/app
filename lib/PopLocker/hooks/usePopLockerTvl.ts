import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils.js";
import { usePrice } from "lib/Price";
import { BigNumberWithFormatted, Pop } from "lib/types";
import { formatAndRoundBigNumber, useMultiStatus } from "lib/utils";
import { useContractRead } from "wagmi";

export const usePopLockerTvl: Pop.Hook<BigNumberWithFormatted> = ({ chainId, address, enabled }: Pop.StdProps) => {
  const { data: price, status: priceStatus } = usePrice({ address, chainId, resolver: "pop", enabled });

  const { data: popLockerSuppy, status: popLockerSuppyStatus } = useContractRead({
    enabled,
    scopeKey: `popLockerSuppy:${chainId}:${address}`,
    address: (!!address && address) || "",
    chainId: Number(chainId),
    abi: ["function lockedSupply() view returns (uint256)"],
    functionName: "lockedSupply",
  })

  const tvl =
    price?.value && popLockerSuppy
      ? price?.value?.mul(popLockerSuppy as unknown as BigNumber).div(parseEther("1"))
      : undefined;


  return {
    data: {
      value: tvl,
      formatted: tvl && price?.decimals ? formatAndRoundBigNumber(tvl, price?.decimals) : undefined,
    },
    status: useMultiStatus([priceStatus, popLockerSuppyStatus])
  } as Pop.HookResult<BigNumberWithFormatted>;
}

export default usePopLockerTvl;

