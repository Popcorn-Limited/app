
import { useContractWrite, usePrepareContractWrite } from "wagmi";

export function useClaimOPop(address: string, gauges: string[]) {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function mintMany(address[] calldata gauges) external"],
    functionName: "mintMany",
    args: [gauges],
    chainId: Number(5),
  });

  return useContractWrite({
    ...config,
  });
}