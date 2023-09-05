import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { showErrorToast, showSuccessToast } from "lib/Toasts";
import { ethers } from 'ethers';

export async function exerciseOPop(address: `0x${string}`, account: `0x${string}`, amount: number | string, maxPaymentAmount: number | string) {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const exerciseAbi = ["function exercise(uint256,uint256,address) external"];
    const contract = new ethers.Contract(address, exerciseAbi, signer);

    const tx = await contract.exercise(amount, maxPaymentAmount, account);
    await tx.wait();

    showSuccessToast("oPOP exercised successfully!");
    return tx;

  } catch (error) {
    console.error(error);
    showErrorToast(error.message || "An error occurred");
    throw error;
  }
}

export function useExerciseOPop(address: `0x${string}`, account: `0x${string}`, amount: number | string, maxPaymentAmount: number | string) {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function exercise(uint256,uint256,address) external"],
    functionName: "exercise",
    args: [amount, maxPaymentAmount, account],
    chainId: Number(5),
  });

  const result = useContractWrite({
    ...config,
    onSuccess: () => {
      showSuccessToast("oPOP exercised successfully!");
    },
    onError: (error) => {
      showErrorToast(error);
    }
  });

  return result;
}