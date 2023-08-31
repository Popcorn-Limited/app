
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { showSuccessToast, showErrorToast } from "lib/Toasts";

export function useClaimOPop(address: `0x${string}`, gauges: string[]) {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function mintMany(address[] calldata gauges) external"],
    functionName: "mintMany",
    args: [gauges],
    chainId: Number(5),
  });

  const result = useContractWrite({
    ...config,
    onSuccess: () => {
      showSuccessToast("oPOP Succesfully Claimed!");
    },
    onError: (error) => {
      showErrorToast(error);
    }
  });

  return result;
}