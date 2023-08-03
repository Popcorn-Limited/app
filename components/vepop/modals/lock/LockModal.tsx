import Modal from "components/Modal/Modal";
import VotingPowerInfo from "./VotingPowerInfo";
import LockPopInterface from "./LockPopInterface";
import LockPreview from "./LockPreview";
import LockPopInfo from "./LockPopInfo";
import { useState } from "react";
import MainActionButton from "components/MainActionButton";
import TertiaryActionButton from "components/TertiaryActionButton";
import SecondaryActionButton from "components/SecondaryActionButton";

export default function LockModal({ show }: { show: [boolean, Function] }): JSX.Element {
  const [step, setStep] = useState(0);
  const [showModal, setShowModal] = show;

  return (
    <Modal show={showModal} setShowModal={setShowModal} >
      <>
        {step === 0 && <LockPopInfo />}
        {step === 1 && <VotingPowerInfo />}
        {step === 2 && <LockPopInterface />}
        {step === 3 && <LockPreview />}

        <div className="space-y-4">
          <MainActionButton label="Next" handleClick={() => setStep(step + 1)} />
          {step === 0 && <SecondaryActionButton label="Skip" handleClick={() => setStep(2)} />}
          {step === 1 && <SecondaryActionButton label="Back" handleClick={() => setStep(0)} />}
        </div>
      </>
    </Modal >
  )
}