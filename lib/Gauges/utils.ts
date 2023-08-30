import { parseEther } from "ethers/lib/utils.js";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { nextThursday } from "date-fns"
import { showSuccessToast, showErrorToast } from "lib/Toasts";
import { toast } from 'react-hot-toast';
import { useState, useEffect } from "react";
import { ChainId } from "lib/utils";
import { BigNumber } from "ethers";

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

export function useCreateLock(address: `0x${string}`, amount: number | string, days: number) {
  const [unlockTime, setUnlockTime] = useState<number>(0);

  useEffect(() => {
    // This will run once when the component is mounted or whenever `days` changes
    const newUnlockTime = Math.floor(Date.now() / 1000) + (86400 * days);
    setUnlockTime(newUnlockTime);
  }, [days]);

  const { config } = usePrepareContractWrite({
    address,
    abi: ["function create_lock(uint256,uint256) external"],
    functionName: "create_lock",
    args: [Number(amount).toLocaleString("fullwide", { useGrouping: false }), unlockTime],
    chainId: Number(5),
  });

  const result = useContractWrite({
    ...config,
    onSuccess: () => {
      showSuccessToast("Lock created successfully!");
    },
    onError: (error) => {
      showErrorToast(error);
    }
  });

  return result;
}

export function useIncreaseLockAmount(address: `0x${string}`, amount: number | string) {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function increase_amount(uint256) external"],
    functionName: "increase_amount",
    args: [parseEther(Number(amount).toLocaleString("fullwide", { useGrouping: false }))],
    chainId: Number(5),
  });


  const result = useContractWrite({
    ...config,
    onSuccess: () => {
      showSuccessToast("Lock amount increased successfully!");
    },
    onError: (error) => {
      showErrorToast(error);
    }
  });

  return result;
}

export function useIncreaseLockTime(address: `0x${string}`, unlockTime: number) {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function increase_unlock_time(uint256) external"],
    functionName: "increase_unlock_time",
    args: [unlockTime],
    chainId: Number(5),
  });

  const result = useContractWrite({
    ...config,
    onSuccess: () => {
      showSuccessToast("Lock time increased successfully!");
    },
    onError: (error) => {
      showErrorToast(error);
    }
  });

  return result;
}

export function useWithdrawLock(address: `0x${string}`) {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function withdraw() external"],
    functionName: "withdraw",
    args: [],
    chainId: Number(5),
  });


  const result = useContractWrite({
    ...config,
    onSuccess: () => {
      showSuccessToast("Withdrawal successful!");
    },
    onError: (error) => {
      showErrorToast(error);
    }
  });

  return result;
}

export function useGaugeDeposit(address: `0x${string}`, chainId: ChainId, amount: number | string) {
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
      showSuccessToast("Gauge Deposit Success!");
    },
    onError: (error) => {
      showErrorToast(error);
    }
  });
}


export function useGaugeWithdraw(address: `0x${string}`, chainId: ChainId, amount: number | string) {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function withdraw(uint256 assetAmount) external"],
    functionName: "withdraw",
    args: [Number(amount).toLocaleString("fullwide", { useGrouping: false })],
    chainId: Number(chainId),
  });

  return useContractWrite({
    ...config,
    onSuccess: () => {
      showSuccessToast("Gauge Withdraw Success!");
    },
    onError: (error) => {
      showErrorToast(error);
    }
  });
}
