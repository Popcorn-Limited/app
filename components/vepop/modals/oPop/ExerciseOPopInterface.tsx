import Modal from "components/Modal/Modal";
import { Dispatch, FormEventHandler, SetStateAction, useEffect, useState } from "react";
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
import useOPopPrice from "lib/OPop/useOPopPrice";
import useOPopDiscount from "lib/OPop/useOPopDiscount";
import { usePrice } from "lib/Price";
import { formatAndRoundBigNumber, safeRound } from "lib/utils";
import { validateInput } from "components/AssetInputWithAction/internals/input";

const POP = "0xf46292650335BB8Fa56FAb05CcE227E50011Fb35"
const OPOP = "0xdca3d7dFFd966A98CF0F7eBcC9135832169381F1"
const OPOP_ORACLE = "0x22aC7dE4B8E2359dF0650cE29Aa438F9cB59478b"

export default function ExerciseOPopInterface({ amountState, maxPaymentAmountState }:
  { amountState: [number, Dispatch<SetStateAction<number>>], maxPaymentAmountState: [number, Dispatch<SetStateAction<number>>] }): JSX.Element {
  const { address: account } = useAccount();

  const [amount, setAmount] = amountState;
  const [maxPaymentAmount, setMaxPaymentAmount] = maxPaymentAmountState;

  const { data: oPopPrice } = useOPopPrice({ chainId: 5, address: OPOP_ORACLE })
  const { data: popPrice } = usePrice({ chainId: 1, address: "0xd0cd466b34a24fcb2f87676278af2005ca8a78c4" })
  const { data: wethPrice } = usePrice({ chainId: 1, address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" })
  const { data: oPopDiscount } = useOPopDiscount({ chainId: 5, address: OPOP_ORACLE })

  const { data: oPopBal } = useBalanceOf({ chainId: 5, address: OPOP, account })
  const { data: ethBal } = useBalance({ chainId: 5, address: account })

  const { data: oPop } = useToken({ chainId: 5, address: OPOP as Address });
  const { data: pop } = useToken({ chainId: 5, address: POP as Address });
  const { data: weth } = useToken({ chainId: 1, address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" as Address }); // temp - WETH


  const handleMaxWeth = () => {
    const maxEth = safeRound(ethBal?.value || constants.Zero, 18);

    setMaxPaymentAmount(maxEth);
    setAmount(getOPopAmount(maxEth))
  };

  const handleMaxOPop = () => {
    const maxOPop = safeRound(oPopBal?.value || constants.Zero, 18);

    setMaxPaymentAmount(getPaymentAmount(maxOPop));
    setAmount(maxOPop)
  };

  function getPaymentAmount(oPopAmount: number) {
    const oPopValue = oPopAmount * (Number(oPopPrice?.value) / 1e18);

    return oPopValue / (Number(wethPrice?.value) / 1e18);
  }

  function getOPopAmount(paymentAmount: number) {
    const ethValue = paymentAmount * (Number(wethPrice?.value) / 1e18);

    return ethValue / (Number(oPopPrice?.value) / 1e18);
  }

  const handleOPopInput: FormEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    const amount = validateInput(value).isValid ? Number(value as any) : 0
    setAmount(amount);
    setMaxPaymentAmount(getPaymentAmount(amount));
  };

  const handleEthInput: FormEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    const amount = validateInput(value).isValid ? Number(value as any) : 0
    setMaxPaymentAmount(amount);
    setAmount(getOPopAmount(amount));
  };


  return (
    <div className="mb-8 text-start">
      <h2 className="text-start text-5xl">Exercise oPOP</h2>
      <p className="text-primary font-semibold">Strike Price: $ {formatAndRoundBigNumber(oPopPrice?.value, 18)} | POP Price: $ {formatAndRoundBigNumber(popPrice?.value, 18)} | Discount: {(Number(oPopDiscount) / 100).toFixed(2)} %</p>
      <div className="mt-8">
        <InputTokenWithError
          captionText={"Amount oPOP"}
          onSelectToken={() => { }}
          onMaxClick={handleMaxOPop}
          chainId={5}
          value={amount}
          onChange={handleOPopInput}
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
          captionText={"Amount WETH"}
          onSelectToken={() => { }}
          onMaxClick={handleMaxWeth}
          chainId={10}
          value={maxPaymentAmount}
          onChange={handleEthInput}
          defaultValue={maxPaymentAmount}
          selectedToken={
            {
              ...weth,
              icon: "https://etherscan.io/token/images/weth_28.png",
              balance: ethBal?.value || constants.Zero,
            } as any
          }
          tokenList={[]}

        />
      </div>

      <div className="relative -mt-10 -mb-10">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-primaryLight" />
        </div>
        <div className={`relative flex justify-center my-12`}>
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
        <p className="text-primary">Received POP</p>
        <div
          className={`w-full flex flex-row px-5 py-4 items-center justify-between rounded-lg border border-customLightGray`}
        >
          <p>{amount}</p>
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
    </div>
  )
}