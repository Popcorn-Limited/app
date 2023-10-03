import { useEffect, useState } from "react";
import { Address, verifyMessage } from "viem";
import { WalletClient, useAccount, useWalletClient } from "wagmi";
import Modal from "@/components/modal/Modal";
import MainActionButton from "../button/MainActionButton";

interface SignTermsAndConditionsProps {
  account: Address,
  walletClient: WalletClient,
  setShow: (show: boolean) => void
}

async function signTermsAndConditions({ account, walletClient, setShow }: SignTermsAndConditionsProps) {
  const message = getShortTerms(Date.now());
  const signature = await walletClient.signMessage({
    account,
    message,
  })
  const valid = await verifyMessage({ address: account, message, signature })
  if (valid) {
    localStorage.setItem("termsAndConditionsSigned", "true");
    setShow(false);
  }
}

const getShortTerms = (timestamp: number) => {
  return `Welcome to Popcorn!

Please read the disclaimer carefully before accessing, interacting with, or using the pop.network, consisting of the pop.network smart contract technology stack and the user interface for the Popcorn DeFi application, as well as any other application developed in the future (together the “Popcorn Software”). 
By signing this message, you confirm that you have carefully read this disclaimer.
https://app.pop.network/disclaimer

Timestamp: ${timestamp}`;
};

export default function TermsCheck(): JSX.Element {
  const { address: account, isConnected, isDisconnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!!account && isConnected && !localStorage.getItem("termsAndConditionsSigned")) setShow(true);
    if (!account && isDisconnected && !show) setShow(false);
  }, [account])

  return (
    <Modal visibility={[show, setShow]}>
      <div className="text-start space-y-8">
        <img src="/images/icons/pendulum.svg" alt="pendulum" className="w-20 h-20 mb-4" />
        <h2 className="text-4xl leading-tight">Terms & <br /> Conditions</h2>
        <p className="text-base text-primaryDark">
          Please read the disclaimer carefully before accessing, interacting with, or using the pop.network, consisting of the pop.network smart contract technology stack and the user interface for the Popcorn DeFi application, as well as any other application developed in the future (together the “Popcorn Software”). By signing this message, you confirm that you have carefully read this disclaimer.
          <br />
          <a className="text-blue-800 cursor-pointer">https://app.pop.network/disclaimer</a>
        </p>
        <MainActionButton
          label="Sign Message"
          handleClick={() => {
            signTermsAndConditions({
              account: account as Address,
              walletClient: walletClient as WalletClient,
              setShow
            })
          }}
        />
      </div>
    </Modal>
  )
}
