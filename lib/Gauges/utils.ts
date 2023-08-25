import { parseUnits } from "ethers/lib/utils.js";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { nextThursday } from "date-fns"
import { showSuccessToast, showErrorToast } from "lib/Toasts";
import { toast } from 'react-hot-toast';
import { useState, useEffect } from "react";

export function calcUnlockTime(days: number, start = Date.now()): number {
  const week = 86400 * 7;
  const now = start / 1000;
  const unlockTime = now + (86400 * days);

  return Math.floor(unlockTime / week) * week * 1000;
}

export function calcDaysToUnlock(unlockTime: number): number {
  const day = 86400;
  const now = Math.floor(Date.now() / 1000)
  return Math.floor((unlockTime - now) / day)
}

export function calculateVeOut(amount: number | string, days: number) {
  const week = 7;
  const maxTime = 52 * 4; // 4 years in weeks
  const lockTime = Math.floor(days / week);
  return Number(amount) * lockTime / maxTime;
}

export function getVotePeriodEndTime(): number {
  const n = nextThursday(new Date());
  const epochEndTime = Date.UTC(
    n.getFullYear(),
    n.getMonth(),
    n.getDate(),
    0,
    0,
    0
  );
  return epochEndTime;
}

export function useCreateLock(address: string, amount: number | string, days: number) {
  const _amount = parseUnits(String(amount));
  const [unlockTime, setUnlockTime] = useState<number>(0);

  useEffect(() => {
    // This will run once when the component is mounted or whenever `days` changes
    const newUnlockTime = Math.floor(Date.now() / 1000) + (86400 * days);
    setUnlockTime(newUnlockTime);
  }, [days]);

  console.log(_amount);
  console.log(unlockTime);

  const { config } = usePrepareContractWrite({
    address,
    abi: ["function create_lock(uint256,uint256) external"],
    functionName: "create_lock",
    args: [_amount, unlockTime],
    chainId: Number(5),
    onError(error) {
      console.log('Create Lock Error', error)
    },
    onSettled() {
      console.log('Create Lock Settled')
    }
  });

  const result = useContractWrite({
    ...config,
    onSuccess: (tx) => {
      showSuccessToast("Lock created successfully!");
    },
    onError: (error) => {
      showErrorToast(error);
    }
  });

  return result;
}

export function useIncreaseLockAmount(address: string, amount: number | string) {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function increase_amount(uint256) external"],
    functionName: "increase_amount",
    args: [parseUnits(String(amount))],
    chainId: Number(5),
    onError(error) {
      console.log('Increase Lock Error', error)
    },
    onSettled() {
      console.log('Increase Lock Settled')
    }
  });

  // const loadingToastId = toast.loading('Increasing lock amount...');

  const result = useContractWrite({
    ...config,
    onSuccess: (tx) => {
      // toast.dismiss(loadingToastId); // Dismiss loading toast
      showSuccessToast("Lock amount increased successfully!");
    },
    onError: (error) => {
      // toast.dismiss(loadingToastId); // Dismiss loading toast
      showErrorToast(error);
    }
  });

  return result;
}

export function useIncreaseLockTime(address: string, unlockTime: number) {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function increase_unlock_time(uint256) external"],
    functionName: "increase_unlock_time",
    args: [unlockTime],
    chainId: Number(5),
    onError(error) {
      console.log('Increase Time Error', error)
    },
    onSettled() {
      console.log('Increase Time Settled')
    }
  });

  const result = useContractWrite({
    ...config,
    onSuccess: (tx) => {
      showSuccessToast("Lock time increased successfully!");
    },
    onError: (error) => {
      showErrorToast(error);
    }
  });

  return result;
}

export function useWithdrawLock(address: string) {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function withdraw() external"],
    functionName: "withdraw",
    args: [],
    chainId: Number(5),
    onError(error) {
      console.log('Withdraw Lock Error', error)
    },
    onSettled() {
      console.log('Withdraw Lock Settled')
    }
  });

  const result = useContractWrite({
    ...config,
    onSuccess: (tx) => {
      showSuccessToast("Withdrawal successful!");
    },
    onError: (error) => {
      showErrorToast(error);
    }
  });

  return result;
}

