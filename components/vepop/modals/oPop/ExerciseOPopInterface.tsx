import { Dispatch, FormEventHandler, SetStateAction, useEffect, useState } from "react";
import { useAccount, useBalance, usePublicClient, useToken } from "wagmi";
import { PlusIcon } from "@heroicons/react/24/outline";
import TokenIcon from "@/components/common/TokenIcon";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import { BalancerOracleAbi, ZERO } from "@/lib/constants";
import { getVeAddresses } from "@/lib/utils/addresses";
import { formatAndRoundBigNumber, safeRound } from "@/lib/utils/formatBigNumber";
import { validateInput } from "@/lib/utils/helpers";
import { Token } from "@/lib/types";
import { llama } from "@/lib/resolver/price/resolver";
import { useEthToUsd } from "@/lib/oPop/ethToUsd";

const {
  POP: POP,
  oPOP: OPOP,
  BalancerOracle: OPOP_ORACLE,
  WETH: WETH
} = getVeAddresses();

interface ExerciseOPopInterfaceProps {
  amountState: [number, Dispatch<SetStateAction<number>>];
  maxPaymentAmountState: [number, Dispatch<SetStateAction<number>>];
}

export default function ExerciseOPopInterface({ amountState, maxPaymentAmountState }: ExerciseOPopInterfaceProps): JSX.Element {
  const { address: account } = useAccount();
  const publicClient = usePublicClient();

  const [amount, setAmount] = amountState;
  const [maxPaymentAmount, setMaxPaymentAmount] = maxPaymentAmountState;

  const { data: oPopBal } = useBalance({ chainId: 1, address: account, token: OPOP })
  const { data: ethBal } = useBalance({ chainId: 1, address: account })
  const { data: wethBal } = useBalance({ chainId: 1, address: account, token: WETH })

  const { data: oPop } = useToken({ chainId: 1, address: OPOP });
  const { data: pop } = useToken({ chainId: 1, address: POP });
  const { data: weth } = useToken({ chainId: 1, address: WETH });

  const [oPopPrice, setOPopPrice] = useState<bigint>(ZERO);
  const [oPopDiscount, setOPopDiscount] = useState<number>(0);
  const [popPrice, setPopPrice] = useState<number>(0);
  const [wethPrice, setWethPrice] = useState<number>(0);

  const [initialLoad, setInitialLoad] = useState<boolean>(false)

  useEffect(() => {
    function setUpPrices() {
      setInitialLoad(true)

      llama({ address: "0x6F0fecBC276de8fC69257065fE47C5a03d986394", chainId: 10 }).then(res => setPopPrice(res))
      llama({ address: WETH, chainId: 1 }).then(res => setWethPrice(res))
      publicClient.readContract({
        address: OPOP_ORACLE,
        abi: BalancerOracleAbi,
        functionName: 'getPrice',
      }).then(res => setOPopPrice(res))
      publicClient.readContract({
        address: OPOP_ORACLE,
        abi: BalancerOracleAbi,
        functionName: 'multiplier',
      }).then(res => setOPopDiscount(res))
    }
    if (!initialLoad) setUpPrices()
  }, [initialLoad])

  function handleMaxWeth() {
    const maxEth = Number(safeRound(ethBal?.value || ZERO, 18));

    setMaxPaymentAmount(maxEth);
    setAmount(getOPopAmount(maxEth))
  };

  function handleMaxOPop() {
    const maxOPop = Number(safeRound(oPopBal?.value || ZERO, 18));

    setMaxPaymentAmount(getPaymentAmount(maxOPop));
    setAmount(maxOPop)
  };

  function getPaymentAmount(oPopAmount: number) {
    const oPopValue = oPopAmount * (Number(oPopPrice) / 1e18);

    return oPopValue / wethPrice;
  }

  function getOPopAmount(paymentAmount: number) {
    const ethValue = paymentAmount * wethPrice;

    return ethValue / (Number(oPopPrice) / 1e18);
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
      <p className="text-primary font-semibold">
        Strike Price: $ {formatAndRoundBigNumber(useEthToUsd(oPopPrice) || ZERO, 18)}
        | POP Price: $ {popPrice}
        | Discount: {(Number(oPopDiscount) / 100).toFixed(2)} %</p>
      <div className="mt-8">
        <InputTokenWithError
          captionText={"Amount oPOP"}
          onSelectToken={() => { }}
          onMaxClick={handleMaxOPop}
          chainId={1}
          value={amount}
          onChange={handleOPopInput}
          allowInput={true}
          selectedToken={
            {
              ...oPop,
              icon: "/images/icons/oPOP.svg",
              balance: oPopBal?.value || ZERO,
            } as any
          }
          errorMessage={amount > (Number(oPopBal?.value) / 1e18) ? "Insufficient Balance" : ""}
          tokenList={[]}
        />
        <div className="flex justify-center -mt-2 mb-4">
          <PlusIcon className="w-8 h-8 text-primaryLight" />
        </div>

        <InputTokenWithError
          captionText={"Amount WETH"}
          onSelectToken={() => { }}
          onMaxClick={handleMaxWeth}
          chainId={1}
          value={maxPaymentAmount * 1e3} // temp Goerli value
          onChange={handleEthInput}
          allowInput={true}
          selectedToken={
            {
              ...weth,
              decimals: 18,
              icon: "https://etherscan.io/token/images/weth_28.png",
              balance: wethBal?.value || ZERO,
            } as any
          }
          tokenList={[]}
          errorMessage={(maxPaymentAmount * 1e3) > (Number(wethBal?.value) / 1e18) ? "Insufficient Balance" : ""}
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
              <TokenIcon token={{ logoURI: "/images/icons/POP.svg" } as Token} imageSize="w-5 h-5" chainId={1} />
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