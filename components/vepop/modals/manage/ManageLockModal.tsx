import Modal from "components/Modal/Modal";
import { useEffect, useState } from "react";
import MainActionButton from "components/MainActionButton";
import TertiaryActionButton from "components/TertiaryActionButton";
import SecondaryActionButton from "components/SecondaryActionButton";
import useWaitForTx from "lib/utils/hooks/useWaitForTx";
import { useCreateLock, useIncreaseLockAmount, useIncreaseLockTime, useWithdrawLock } from "lib/Gauges/utils";
import useApproveBalance from "hooks/useApproveBalance";
import toast from "react-hot-toast";
import { useAllowance, useBalanceOf } from "lib/Erc20/hooks";
import { Address, useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import SelectManagementOption from "./SelectManagementOption";
import IncreaseStakeInterface from "./IncreaseStakeInterface";
import IncreaseStakePreview from "./IncreaseStakePreview";
import UnstakePreview from "./UnstakePreview";
import IncreaseTimePreview from "./IncreaseTimePreview";
import IncreaseTimeInterface from "./IncreaseTimeInterface";
import useLockedBalanceOf from "lib/Gauges/useLockedBalanceOf";

const POP = "0xC1fB217e01e67016FF4fF6A46ace54712e124d42"
const VOTING_ESCROW = "0x11c8AE8cB6779da8282B5837a018862d80e285Df"

function noOp() { }

export enum ManagementOption {
  IncreaseLock,
  IncreaseTime,
  Unlock
}

export default function ManageLockModal({ show }: { show: [boolean, Function] }): JSX.Element {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { address: account } = useAccount()
  
  const [showModal, setShowModal] = show;
  const [step, setStep] = useState(0);
  const [mangementOption, setMangementOption] = useState();

  const { data: vePopBal } = useBalanceOf({ chainId: 5, address: VOTING_ESCROW, account })
  const { data: lockedBal } = useLockedBalanceOf({ chainId: 5, address: VOTING_ESCROW, account })

  const [amount, setAmount] = useState<number>(0);
  const [days, setDays] = useState(7);

  const { waitForTx } = useWaitForTx();
  const { write: increaseLockAmount } = useIncreaseLockAmount(VOTING_ESCROW, amount);
  const { write: increaseLockTime } = useIncreaseLockTime(VOTING_ESCROW, Number(lockedBal?.end || 0) + (days * 86400));
  const { write: withdrawLock } = useWithdrawLock(VOTING_ESCROW);
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

  const { data: allowance } = useAllowance({ chainId: 5, address: POP, account: VOTING_ESCROW as Address });
  const showApproveButton = isApproveSuccess ? false : amount > Number(allowance?.value || 0);

  useEffect(() => {
    if (!showModal) { setStep(0); setMangementOption(null) }
  },
    [showModal]
  )

  async function handleMainAction() {
    if (chain.id !== Number(5)) switchNetwork?.(Number(5));

    if (mangementOption === ManagementOption.IncreaseLock) {
      if ((amount || 0) == 0) return;
      // Early exit if value is ZERO
      if (showApproveButton) return approve();
      increaseLockAmount()
    }
    if (mangementOption === ManagementOption.IncreaseTime) increaseLockTime()
    if (mangementOption === ManagementOption.Unlock) withdrawLock()
    setShowModal(false)
  }

  return (
    <Modal show={showModal} setShowModal={setShowModal} >
      <>
        {step === 0 && <SelectManagementOption setStep={setStep} setManagementOption={setMangementOption} />}

        {mangementOption === ManagementOption.IncreaseLock &&
          <>
            {step === 1 &&
              <>
                <IncreaseStakeInterface amountState={[amount, setAmount]} lockedBal={lockedBal} />
                <MainActionButton label="Next" handleClick={() => setStep(step + 1)} />
              </>
            }
            {step === 2 &&
              <>
                <IncreaseStakePreview amount={amount} lockedBal={lockedBal} />
                <MainActionButton label={showApproveButton ? "Approve POP" : "Increase Lock Amount"} handleClick={handleMainAction} />
              </>
            }
          </>
        }
        {mangementOption === ManagementOption.IncreaseTime &&
          <>
            {step === 1 &&
              <>
                <IncreaseTimeInterface daysState={[days, setDays]} lockedBal={lockedBal} />
                <MainActionButton label="Next" handleClick={() => setStep(step + 1)} />
              </>
            }
            {step === 2 &&
              <>
                <IncreaseTimePreview days={days} lockedBal={lockedBal} />
                <MainActionButton label="Increase Lock Time" handleClick={handleMainAction} />
              </>
            }
          </>
        }
        {mangementOption === ManagementOption.Unlock &&
          <>
            <UnstakePreview amount={Number(vePopBal?.value) / 1e18} />
            <MainActionButton label="Unlock" handleClick={handleMainAction} />
          </>
        }
      </>
    </Modal >
  )
}