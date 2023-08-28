import { Dispatch, FormEventHandler, SetStateAction, useMemo } from "react";
import { calcDaysToUnlock, calculateVeOut } from "lib/Gauges/utils";
import { useBalanceOf } from "lib/Erc20/hooks";
import { Address, useAccount, useToken } from "wagmi";
import InputTokenWithError from "components/InputTokenWithError";
import { formatAndRoundBigNumber, safeRound } from "lib/utils";
import { constants } from "ethers";
import { validateInput } from "components/SweetVault/internals/input";
import { LockedBalance } from "lib/Gauges/useLockedBalanceOf";

const POP_LP = "0x29d7a7E0d781C957696697B94D4Bc18C651e358E"

export default function IncreaseStakeInterface({ amountState, lockedBal }:
  { amountState: [number, Dispatch<SetStateAction<number>>], lockedBal: LockedBalance }): JSX.Element {
  const { address: account } = useAccount()

  const { data: popLp } = useToken({ chainId: 5, address: POP_LP as Address });
  const { data: popLpBal } = useBalanceOf({ chainId: 5, address: POP_LP, account })

  const [amount, setAmount] = amountState

  const errorMessage = useMemo(() => {
    return (amount || 0) > Number(popLpBal?.formatted) ? "* Balance not available" : "";
  }, [amount, popLpBal?.formatted]);

  const handleMaxClick = () => setAmount(safeRound(popLpBal?.value || constants.Zero, 18));

  const handleChangeInput: FormEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    setAmount(validateInput(value).isValid ? Number(value as any) : 0);
  };

  return (
    <div className="space-y-8 mb-8 text-start">

      <h2 className="text-start text-5xl">Lock your POP</h2>

      <div>
        <p className="text-primary font-semibold">Amount POP</p>
        <InputTokenWithError
          captionText={``}
          onSelectToken={() => { }}
          onMaxClick={handleMaxClick}
          chainId={5}
          value={amount}
          onChange={handleChangeInput}
          defaultValue={amount}
          selectedToken={
            {
              ...popLp,
              balance: Number(popLpBal?.value || 0),
            } as any
          }
          errorMessage={errorMessage}
          allowInput
          tokenList={[]}
          getTokenUrl="https://app.balancer.fi/#/goerli/pool/0x29d7a7e0d781c957696697b94d4bc18c651e358e0002000000000000000008a0" // temp link
        />
      </div>

      <div className="space-y-2">
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Current Lock Amount</p>
          <p className="text-[#141416]">{lockedBal ? formatAndRoundBigNumber(lockedBal?.amount, 18) : ""} POP</p>
        </div>
        <div className="flex flex-row items-center justify-between text-secondaryLight">
          <p>Unlock Date</p>
          <p className="text-[#141416]">{lockedBal && lockedBal?.end.toString() !== "0" ? new Date(Number(lockedBal?.end) * 1000).toLocaleDateString() : "-"}</p>
        </div>
      </div>

      <div>
        <p className="text-primary font-semibold mb-1">New Voting Power</p>
        <div className="w-full bg-[#d7d7d726] border border-customLightGray rounded-lg p-4">
          <p className="text-primaryDark">{amount > 0 ? calculateVeOut(amount + (Number(lockedBal?.amount) / 1e18), calcDaysToUnlock(Number(lockedBal?.end))).toFixed(2) : "Enter the amount to view your voting power"}</p>
        </div>
      </div>

    </div>
  )
}