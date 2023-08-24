import { parseUnits } from "ethers/lib/utils.js";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { nextThursday } from "date-fns"
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

export function useCreateLock(address: string, amount: number | string, days: number) {
  const _amount = parseUnits(String(amount));
  const unlockTime = Math.floor(Date.now() / 1000) + (86400 * days);

  const { config } = usePrepareContractWrite({
    address,
    abi: ["function create_lock(uint256,uint256) external"],
    functionName: "create_lock",
    args: [_amount, unlockTime],
    chainId: Number(5),
  });

  return useContractWrite({
    ...config,
  });
}

export function useIncreaseLockAmount(address: string, amount: number | string) {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function increase_amount(uint256) external"],
    functionName: "increase_amount",
    args: [parseUnits(String(amount))],
    chainId: Number(5),
  });

  return useContractWrite({
    ...config,
  });
}

export function useIncreaseLockTime(address: string, unlockTime: number) {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function increase_unlock_time(uint256) external"],
    functionName: "increase_unlock_time",
    args: [unlockTime],
    chainId: Number(5),
  });

  return useContractWrite({
    ...config,
  });
}

export function useWithdrawLock(address: string) {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function withdraw() external"],
    functionName: "withdraw",
    args: [],
    chainId: Number(5),
  });

  return useContractWrite({
    ...config,
  });
}

export function useGaugeDeposit(address: string, chainId: ChainId, amount: number | string) {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function deposit(uint256 amount) external"],
    functionName: "deposit",
    args: [String(amount)],
    chainId: Number(chainId),
  });

  return useContractWrite({
    ...config,
  });
}

export function useGaugeWithdraw(address: string, chainId: ChainId, amount: number | string) {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function withdraw(uint256 amount) external"],
    functionName: "withdraw",
    args: [String(amount)],
    chainId: Number(chainId),
  });

  return useContractWrite({
    ...config,
  });
}
