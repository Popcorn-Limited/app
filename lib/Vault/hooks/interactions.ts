import { BigNumber } from "ethers";
import { ChainId } from "lib/utils";
import { useContractWrite, usePrepareContractWrite } from "wagmi";

export function useVaultDeposit(address: string, chainId: ChainId, amount: number | string) {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function deposit(uint256 assetAmount) external"],
    functionName: "deposit",
    args: [String(amount)],
    chainId: Number(chainId),
  });

  return useContractWrite({
    ...config,
  });
}


export function useVaultRedeem(address: string, chainId: ChainId, amount: number | string) {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function redeem(uint256 burnAmount) external"],
    functionName: "redeem",
    args: [String(amount)],
    chainId: Number(chainId),
  });

  return useContractWrite({
    ...config,
  });
}