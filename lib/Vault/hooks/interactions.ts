import { BigNumber } from "ethers";
import { ChainId } from "lib/utils";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { showSuccessToast, showErrorToast } from "lib/Toasts";

export function useVaultDeposit(address: `0x${string}`, chainId: ChainId, amount: number | string) {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function deposit(uint256 assetAmount) external"],
    functionName: "deposit",
    args: [Number(amount).toLocaleString("fullwide", { useGrouping: false })],
    chainId: Number(chainId),
  });

  return useContractWrite({
    ...config,
    onSuccess: () => {
      showSuccessToast("Vault Deposit Success!");
    },
    onError: (error) => {
      showErrorToast(error);
    }
  });
}


export function useVaultRedeem(address: `0x${string}`, chainId: ChainId, amount: number | string) {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function redeem(uint256 burnAmount) external"],
    functionName: "redeem",
    args: [Number(amount).toLocaleString("fullwide", { useGrouping: false })],
    chainId: Number(chainId),
  });

  return useContractWrite({
    ...config,
    onSuccess: () => {
      showSuccessToast("Vault Redeem Success!");
    },
    onError: (error) => {
      showErrorToast(error);
    }
  });
}