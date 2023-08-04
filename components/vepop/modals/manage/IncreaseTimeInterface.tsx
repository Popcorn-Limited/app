import InputNumber from "components/InputNumber";
import { Dispatch, FormEventHandler, SetStateAction, useMemo } from "react";
import { calcDaysToUnlock, calcUnlockTime, calculateVeOut } from "lib/Gauges/utils";
import { useBalanceOf } from "lib/Erc20/hooks";
import { Address, useAccount, useToken } from "wagmi";
import InputTokenWithError from "components/InputTokenWithError";
import { safeRound } from "lib/utils";
import { BigNumber, constants } from "ethers";
import { validateInput } from "components/SweetVault/internals/input";
import { LockedBalance } from "lib/Gauges/useLockedBalanceOf";

const POP = "0xC1fB217e01e67016FF4fF6A46ace54712e124d42"

function LockTimeButton({ label, isActive, handleClick }: { label: string, isActive: boolean, handleClick: Function }): JSX.Element {
  return (
    <button
      className={`w-10 h-10 border border-[#C8C8C8] rounded-lg ${isActive ? "bg-[#D7D5BC] text-[#645F4B]" : "text-[#969696]"}`}
      onClick={() => handleClick()}
    >
      {label}
    </button>
  )
}

export default function IncreaseTimeInterface({ daysState, lockedBal }:
  { daysState: [number, Dispatch<SetStateAction<number>>], lockedBal: LockedBalance }): JSX.Element {
  const [days, setDays] = daysState

  const handleSetDays: FormEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    setDays(Number(value));
  };

  const totalDays = calcDaysToUnlock(Number(lockedBal?.end)) + days

  return (
    <div className="space-y-8 mb-8 text-start">

      <h2 className="text-start text-5xl">Increase lock time</h2>

      <div>
        <p className="text-primary font-semibold mb-1">Lockup Time</p>
        <div className="flex flex-row items-center space-x-2">
          <LockTimeButton label="1W" isActive={days === 7} handleClick={() => setDays(7)} />
          <LockTimeButton label="1M" isActive={days === 30} handleClick={() => setDays(30)} />
          <LockTimeButton label="3M" isActive={days === 90} handleClick={() => setDays(90)} />
          <LockTimeButton label="6M" isActive={days === 180} handleClick={() => setDays(180)} />
          <LockTimeButton label="1Y" isActive={days === 365} handleClick={() => setDays(365)} />
          <LockTimeButton label="2Y" isActive={days === 730} handleClick={() => setDays(730)} />
          <div className="w-40 flex px-5 py-2 items-center rounded-lg border border-customLightGray">
            <InputNumber
              onChange={handleSetDays}
              defaultValue={days}
              autoComplete="off"
              autoCorrect="off"
              type="text"
              pattern="^[0-9]*[.,]?[0-9]*$"
              placeholder={"0.0"}
              minLength={1}
              maxLength={79}
              spellCheck="false"
            />
          </div>
        </div>
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Unlocks at:</p>
          <p>{new Date(calcUnlockTime(totalDays)).toLocaleDateString()}</p>
        </div>
      </div>

      <div>
        <p className="text-primary font-semibold mb-1">Voting Power</p>
        <div className="w-full bg-[#d7d7d726] border border-customLightGray rounded-lg p-4">

          <p className="text-primaryDark">{Number(lockedBal?.amount) > 0 ? calculateVeOut(Number(lockedBal?.amount) / 1e18, totalDays).toFixed(2) : "0"}</p>
        </div>
      </div>

    </div>
  )
}