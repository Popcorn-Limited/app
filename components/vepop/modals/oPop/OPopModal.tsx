import Modal from "components/Modal/Modal";
import { useEffect, useState } from "react";
import MainActionButton from "components/MainActionButton";
import SecondaryActionButton from "components/SecondaryActionButton";
import useWaitForTx from "lib/utils/hooks/useWaitForTx";
import { useCreateLock } from "lib/Gauges/utils";
import useApproveBalance from "hooks/useApproveBalance";
import toast from "react-hot-toast";
import { useAllowance, useBalanceOf } from "lib/Erc20/hooks";
import { Address, useAccount, useBalance, useNetwork, useSwitchNetwork, useToken } from "wagmi";
import { useExerciseOPop } from "lib/OPop/useExerciseOPop";
import InputTokenWithError from "components/InputTokenWithError";
import { constants } from "ethers";
import { PlusIcon } from "@heroicons/react/24/outline";
import InputNumber from "components/InputNumber";
import TokenIcon from "components/TokenIcon";

const POP = "0xC1fB217e01e67016FF4fF6A46ace54712e124d42"
const OPOP = "0x57de6369E9e1fd485584B78A29b501B1CA65EB29"
const OPOP_ORACLE = "0x4b4a8479CDFaB077BA4D0926041D10098f18bFe7"

function noOp() { }

export default function OPopModal({ show }: { show: [boolean, Function] }): JSX.Element {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { address: account } = useAccount();

  const [step, setStep] = useState(0);
  const [showModal, setShowModal] = show;

  const { data: oPopBal } = useBalanceOf({ chainId: 5, address: OPOP, account })
  const { data: ethBal } = useBalance({ chainId: 5, address: account })

  const { data: oPop } = useToken({ chainId: 5, address: OPOP as Address });
  const { data: pop } = useToken({ chainId: 5, address: POP as Address });
  const { data: weth } = useToken({ chainId: 1, address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as Address }); // temp - WETH


  const [amount, setAmount] = useState<number>(0);
  const [maxPaymentAmount, setMaxPaymentAmount] = useState<number>(0);

  const { write: exercise } = useExerciseOPop(OPOP_ORACLE, account, amount, maxPaymentAmount);

  useEffect(() => {
    if (!showModal) setStep(0)
  },
    [showModal]
  )

  async function handleLock() {
    if ((amount || 0) == 0) return;
    // Early exit if value is ZERO

    if (chain.id !== Number(5)) switchNetwork?.(Number(5));

    exercise();
    setShowModal(false);
  }


  return (
    <Modal show={showModal} setShowModal={setShowModal} >
      <>
        <div>
          <p className="text-primary font-semibold">Amount POP</p>
          <InputTokenWithError
            captionText={``}
            onSelectToken={() => { }}
            onMaxClick={() => { }}
            chainId={5}
            value={amount}
            onChange={() => { }}
            defaultValue={amount}
            selectedToken={
              {
                ...oPop,
                icon: "/images/icons/oPOP.svg",
                balance: oPopBal?.value || constants.Zero,
              } as any
            }
            errorMessage={""}
            tokenList={[]}

          />
          <div className="flex justify-center -mt-2 mb-4">
            <PlusIcon className="w-8 h-8 text-primaryLight" />
          </div>

          <InputTokenWithError
            captionText={``}
            onSelectToken={() => { }}
            onMaxClick={() => { }}
            chainId={10}
            value={amount}
            onChange={() => { }}
            defaultValue={amount}
            selectedToken={
              {
                ...weth,
                icon: "https://etherscan.io/token/images/weth_28.png",
                balance: ethBal?.value || constants.Zero,
              } as any
            }
            tokenList={[]}

          />

          <div className="relative -mt-10 -mb-10">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-primaryLight" />
            </div>
            <div className={`relative flex justify-center my-16`}>
              <div className="w-20 bg-[#FAF9F4]">
                <div
                  className="flex items-center w-14 h-14 mx-auto justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                    <path d="M19 14.1699L12 21.1699M12 21.1699L5 14.1699M12 21.1699L12 3.16992" stroke="#A5A08C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div
              className={`w-full flex flex-row px-5 py-4 items-center justify-between rounded-lg border border-customLightGray`}
            >
              <p>10</p>
              <span
                className={`flex flex-row items-center justify-end`}
              >
                <div className="md:mr-2 relative">
                  <TokenIcon token={pop?.address} imageSize="w-5 h-5" chainId={5} />
                </div>
                <p className="font-medium text-lg leading-none hidden md:block text-black group-hover:text-primary">
                  {pop?.symbol}
                </p>
              </span>
            </div>

          </div>
          <div className="mt-8">
            <MainActionButton label="Exercise oPOP" handleClick={handleLock} />
          </div>
        </div>
      </>
    </Modal >
  )
}