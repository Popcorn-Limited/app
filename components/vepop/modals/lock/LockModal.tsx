import Modal from "components/Modal/Modal";
import VotingPowerInfo from "./VotingPowerInfo";
import LockPopInterface from "./LockPopInterface";
import LockPreview from "./LockPreview";
import LockPopInfo from "./LockPopInfo";
import { useEffect, useState } from "react";
import MainActionButton from "components/MainActionButton";
import TertiaryActionButton from "components/TertiaryActionButton";
import SecondaryActionButton from "components/SecondaryActionButton";
import useWaitForTx from "lib/utils/hooks/useWaitForTx";
import { useCreateLock } from "lib/Gauges/utils";
import { useApproveBalance } from "hooks/useApproveBalance";
import toast from "react-hot-toast";
import { useAllowance } from "lib/Erc20/hooks";
import { Address, useNetwork, useSwitchNetwork } from "wagmi";
import { getVeAddresses } from "lib/utils/addresses";

const {
  BalancerPool: POP_LP,
  VotingEscrow: VOTING_ESCROW
} = getVeAddresses()

function noOp() { }

export default function LockModal({ show }: { show: [boolean, Function] }): JSX.Element {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const [step, setStep] = useState(0);
  const [showModal, setShowModal] = show;

  const [amount, setAmount] = useState<number>(0);
  const [days, setDays] = useState(7);

  const { waitForTx } = useWaitForTx();
  const { write: createLock } = useCreateLock(VOTING_ESCROW, (amount * (10 ** 18) || 0), days);
  const {
    write: approve = noOp,
    isSuccess: isApproveSuccess,
    isLoading: isApproveLoading,
  } = useApproveBalance(POP_LP, VOTING_ESCROW, 5, {
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

  const { data: allowance } = useAllowance({ chainId: 5, address: POP_LP, account: VOTING_ESCROW as Address });
  const showApproveButton = isApproveSuccess ? false : amount > Number(allowance?.value || 0);

  useEffect(() => {
    if (!showModal) setStep(0)
  },
    [showModal]
  )

  async function handleLock() {
    if ((amount || 0) == 0) return;
    // Early exit if value is ZERO

    if (chain.id !== Number(5)) switchNetwork?.(Number(5));

    if (showApproveButton) return approve();
    // When approved continue to deposit
    createLock();
    setShowModal(false);
  }


  return (
    <Modal show={showModal} setShowModal={setShowModal} >
      <>
        {step === 0 && <LockPopInfo />}
        {step === 1 && <VotingPowerInfo />}
        {step === 2 && <LockPopInterface amountState={[amount, setAmount]} daysState={[days, setDays]} />}
        {step === 3 && <LockPreview amount={amount} days={days} />}

        <div className="space-y-4">
          {step < 3 && <MainActionButton label="Next" handleClick={() => setStep(step + 1)} />}
          {step === 3 && <MainActionButton label={showApproveButton ? "Approve POP LP" : "Lock POP LP"} handleClick={handleLock} />}
          {step === 0 && <SecondaryActionButton label="Skip" handleClick={() => setStep(2)} />}
          {step === 1 || step === 3 && <SecondaryActionButton label="Back" handleClick={() => setStep(step - 1)} />}
        </div>
      </>
    </Modal >
  )
}