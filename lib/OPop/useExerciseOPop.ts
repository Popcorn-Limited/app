import { useContractWrite, usePrepareContractWrite } from "wagmi";

export function useExerciseOPop(address: string, account: string, amount: number | string, maxPaymentAmount: number | string) {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function exercise(uint256 amount, uint256 maxPaymentAmount, address recipient) external"],
    functionName: "exercise",
    args: [amount, maxPaymentAmount, account],
    chainId: Number(5),
  });

  return useContractWrite({
    ...config,
  });
}