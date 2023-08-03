import InputNumber from "components/InputNumber";
import { FormEventHandler, useState } from "react";
import { calcUnlockTime, calculateVeOut, getVotePeriodEndTime, useCreateLock } from "lib/Gauges/utils";
import { useAllowance, useBalanceOf } from "lib/Erc20/hooks";
import { Address, useAccount } from "wagmi";
import useApproveBalance from "hooks/useApproveBalance";
import useWaitForTx from "lib/utils/hooks/useWaitForTx";
import toast from "react-hot-toast";

const POP = "0xC1fB217e01e67016FF4fF6A46ace54712e124d42"
const VOTING_ESCROW = "0x11c8AE8cB6779da8282B5837a018862d80e285Df"

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

function noOp() { }


export default function LockPopInterface(): JSX.Element {
  const { address: account } = useAccount()

  const { data: popBal } = useBalanceOf({ chainId: 5, address: POP, account })
  const { data: allowance } = useAllowance({ chainId: 5, address: POP, account: VOTING_ESCROW as Address });

  const [amount, setAmount] = useState(0);
  const [days, setDays] = useState(7);

  const { waitForTx } = useWaitForTx();
  const { write: createLock } = useCreateLock(VOTING_ESCROW, amount, days);
  const {
    write: approve = noOp,
    isSuccess: isApproveSuccess,
    isLoading: isApproveLoading,
  } = useApproveBalance(POP, VOTING_ESCROW, 5, {
    onSuccess: (tx) => {
      waitForTx(tx, {
        successMessage: "POP approved!",
        errorMessage: "Something went wrong",
      });
    },
    onError: () => {
      toast.error("User rejected the transaction", {
        position: "top-center",
      });
    },
  });

  const handleSetAmount: FormEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    setAmount(Number(value));
  };

  const handleSetDays: FormEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    setDays(Number(value));
  };

  return (
    <div className="space-y-8 mb-8">

      <h2 className="text-start text-5xl">Lock your POP</h2>

      <div>
        <p>Amount POP</p>
        <InputNumber
          onChange={handleSetAmount}
          defaultValue={amount}
          autoComplete="off"
          autoCorrect="off"
          type="text"
          pattern="^[0-9]*[.,]?[0-9]*$"
          placeholder={"0.0"}
          minLength={1}
          maxLength={79}
          spellCheck="false"
        />
        <div className="flex flex-row items-center justify-between">
          <p>Available POP</p>
          <p>{popBal?.formatted}</p>
        </div>
      </div>

      <div>
        <p>Lockup Time</p>
        <div className="flex flex-row items-center space-x-2">
          <LockTimeButton label="1W" isActive={days === 7} handleClick={() => setDays(7)} />
          <LockTimeButton label="1M" isActive={days === 30} handleClick={() => setDays(30)} />
          <LockTimeButton label="3M" isActive={days === 90} handleClick={() => setDays(90)} />
          <LockTimeButton label="6M" isActive={days === 180} handleClick={() => setDays(180)} />
          <LockTimeButton label="1Y" isActive={days === 365} handleClick={() => setDays(365)} />
          <LockTimeButton label="2Y" isActive={days === 730} handleClick={() => setDays(730)} />
          <div className="w-40">
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
        <div className="flex flex-row items-center justify-between">
          <p>Unlocks at:</p>
          <p>{new Date(calcUnlockTime(days)).toLocaleDateString()}</p>
        </div>
      </div>

      <div>
        <p>Voting Power</p>
        <div className="w-full bg-[#D7D7D7] border border-[] rounded-lg ">

          <p className="text-[#555555]">{amount > 0 ? calculateVeOut(amount, days).toFixed(2) : "Enter the amount to view your voting power"}</p>
        </div>
      </div>

    </div>
  )
}