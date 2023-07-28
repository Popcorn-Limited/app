import { parseUnits } from "ethers/lib/utils.js";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import {nextThursday} from "date-fns"

export function calcUnlockTime(days: number, start = Date.now()): number {
  const week = 86400 * 7;
  const now = start / 1000;
  const unlockTime = now + (86400 * days);

  return Math.floor(unlockTime / week) * week * 1000;
}

export function calculateVeOut(amount: number | string, days: number) {
  const week = 7;
  const maxTime = 52;
  const lockTime = Math.floor(days / week);
  return Number(amount) * lockTime / maxTime;
}

export function useCreateLock(address:string, amount: number | string, days: number) {
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