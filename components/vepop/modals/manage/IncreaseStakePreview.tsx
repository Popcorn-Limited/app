import { BigNumber } from "ethers";
import { calcDaysToUnlock, calculateVeOut } from "lib/Gauges/utils";

export default function IncreaseStakePreview({ amount, lockedBal }: { amount: number, lockedBal: [BigNumber, BigNumber] }): JSX.Element {
  const totalLocked = (Number(lockedBal[0]) / 1e18) + amount

  return (
    <div className="space-y-8 mb-8 text-start">

      <h2 className="text-start text-5xl">Preview Lock</h2>

      <div className="space-y-2">
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Lock Amount</p>
          <p className="text-[#141416]">{amount > 0 ? amount.toFixed(2) : "0"} POP</p>
        </div>
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Total Locked</p>
          <p className="text-[#141416]">{lockedBal ? totalLocked.toFixed(2) : ""} POP</p>
        </div>
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Unlock Date</p>
          <p className="text-[#141416]">{lockedBal && lockedBal[1].toString() !== "0" ? new Date(Number(lockedBal[1]) * 1000).toLocaleDateString() : "-"}</p>
        </div>
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>New Voting Power</p>
          <p className="text-[#141416]">{amount > 0 ? calculateVeOut(amount, calcDaysToUnlock(Number(lockedBal[1]))).toFixed(2) : "0"} vePOP</p>
        </div>
      </div>

      <div className="w-full bg-[#d7d7d726] border border-customLightGray rounded-lg p-4">
        <p className="text-primaryDark">Important: vePOP is not transferrable and unlocking POP early results in a penalty of up to 75% of your POP</p>
      </div>

    </div >
  )
}