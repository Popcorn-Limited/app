import Modal from "components/Modal/Modal";
import { useEffect, useState } from "react";
import MainActionButton from "components/MainActionButton";
import SecondaryActionButton from "components/SecondaryActionButton";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { useExerciseOPop, exerciseOPop } from "lib/OPop/useExerciseOPop";
import ExerciseOPopInterface from "./ExerciseOPopInterface";
import OptionInfo from "./OptionInfo";
import { getVeAddresses } from "lib/utils/addresses";
import { useAllowance } from "lib/Erc20/hooks";
import { approveBalance } from "hooks/useApproveBalance";
import { Address } from "wagmi";

const { BalancerOracle: OPOP_ORACLE, WETH: WETH, oPOP: OPOP } = getVeAddresses();

export default function OPopModal({ show }: { show: [boolean, Function] }): JSX.Element {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { address: account } = useAccount();

  const [step, setStep] = useState(0);
  const [showModal, setShowModal] = show;

  const [amount, setAmount] = useState<number>(0);
  const [maxPaymentAmount, setMaxPaymentAmount] = useState<number>(0);

  // const { write: exercise } = useExerciseOPop(OPOP, account, amount, maxPaymentAmount);

  const { data: allowance } = useAllowance({ chainId: 5, address: WETH, account: OPOP as Address });
  const needAllowance = amount > Number(allowance?.value || 0);

  useEffect(() => {
    if (!showModal) setStep(0)
  },
    [showModal]
  )

  async function handleExerciseOPop() {
    if ((amount || 0) == 0) return;
    // Early exit if value is ZERO

    if (chain.id !== Number(5)) switchNetwork?.(Number(5));

    if (needAllowance) await approveBalance(WETH, OPOP);
    exerciseOPop(OPOP, account, amount, maxPaymentAmount);
    setShowModal(false);
  }


  return (
    <Modal show={showModal} setShowModal={setShowModal} >
      <>
        {step === 0 && <OptionInfo />}
        {step === 1 && <ExerciseOPopInterface amountState={[amount, setAmount]} maxPaymentAmountState={[maxPaymentAmount, setMaxPaymentAmount]} />}

        <div className="space-y-4">
          {step === 0 && <MainActionButton label="Next" handleClick={() => setStep(step + 1)} />}
          {step === 1 && <MainActionButton label={"Exercise oPOP"} handleClick={handleExerciseOPop} />}
          {step === 1 && <SecondaryActionButton label="Back" handleClick={() => setStep(step - 1)} />}
        </div>
      </>
    </Modal >
  )
}