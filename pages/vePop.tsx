import { BigNumber, Contract } from "ethers";
import useApproveBalance from "hooks/useApproveBalance";
import { useBalanceOf } from "lib/Erc20/hooks";
import { calcUnlockTime, calculateVeOut, getVotePeriodEndTime, useCreateLock } from "lib/Gauges/utils";
import { Pop } from "lib/types";
import { RPC_PROVIDERS, formatAndRoundBigNumber, useConsistentRepolling } from "lib/utils";
import useWaitForTx from "lib/utils/hooks/useWaitForTx";
import { FormEventHandler, useState } from "react";
import toast from "react-hot-toast";
import { useAccount, useContractRead } from "wagmi";
import NoSSR from "react-no-ssr";
import InputNumber from "components/InputNumber";
import MainActionButton from "components/MainActionButton";
import { intervalToDuration } from "date-fns";
import SecondaryActionButton from "components/SecondaryActionButton";
import TertiaryActionButton from "components/TertiaryActionButton";


const POP = "0xC1fB217e01e67016FF4fF6A46ace54712e124d42"
const VOTING_ESCROW = "0x664AD9bE8E5dd1EAc99Db1043C6Ce7ADcC4b9484"
const GAUGE_CONTROLLER = "0x67e9962450B740EcD04b20E87dA55654dad62c3f"

export const useLockedBalanceOf: Pop.Hook<[BigNumber, BigNumber]> = ({ chainId, address, account }) => {
  return useConsistentRepolling(useContractRead({
    address,
    chainId: Number(chainId),
    abi: ["function locked(address) view returns ((uint256,uint256))"],
    functionName: "locked",
    args: (!!account && [account]) || [],
    scopeKey: `lockedBalanceOf:${chainId}:${address}:${account}`,
    enabled: !!(chainId && address && account),
  }),
  ) as Pop.HookResult<[BigNumber, BigNumber]>;
}

export default function VePOP() {
  const { waitForTx } = useWaitForTx();


  const { address: account } = useAccount()
  const { data: popBal } = useBalanceOf({ chainId: 5, address: POP, account })
  const { data: lockedBal } = useLockedBalanceOf({ chainId: 5, address: VOTING_ESCROW, account })
  const { data: vePopBal } = useBalanceOf({ chainId: 5, address: VOTING_ESCROW, account })


  const [amount, setAmount] = useState(0);
  const [days, setDays] = useState(0);

  const { write: createLock } = useCreateLock(amount, days);

  async function testStuff() {
    const contract = new Contract(GAUGE_CONTROLLER, ["function gauges(uint256) external view returns (address)"], RPC_PROVIDERS[5])
    const gaugeAddress = await contract.gauges(0)
    console.log({ gaugeAddress })
  }

  testStuff()

  function votingPeriodEnd(): number[] {
    const periodEnd = getVotePeriodEndTime();
    const interval: Interval = { start: new Date(), end: periodEnd };
    const timeUntilEnd: Duration = intervalToDuration(interval);
    const formattedTime = [
      (timeUntilEnd.days || 0) % 7,
      timeUntilEnd.hours || 0,
      timeUntilEnd.minutes || 0,
      timeUntilEnd.seconds || 0,
    ];
    return formattedTime;
  }

  const {
    write: approve = noOp,
    isSuccess: isApproveSuccess,
    isLoading: isApproveLoading,
  } = useApproveBalance("0x2eA78fcDc9B30a615a99dD6B8D7233374b23e273", "0xBA12222222228d8Ba445958a75a0704d566BF2C8", 5, {
    onSuccess: (tx) => {
      waitForTx(tx, {
        successMessage: "Assets approved!",
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
    <NoSSR>
      <div>
        <section className="md:py-10 md:border-b border-[#F0EEE0] md:flex md:flex-row items-center justify-between">

          <div className="bg-[#C391FF] rounded-lg h-64 w-full p-6 mb-10 flex md:hidden justify-end items-end ">
            <svg xmlns="http://www.w3.org/2000/svg" width="132" height="132" viewBox="0 0 132 132" fill="none">
              <path d="M99 0C80.7757 0 66 14.7758 66 33C66 14.7758 51.2243 0 33 0C14.7758 0 0 14.7758 0 33V66C0 102.451 29.5487 132 66 132C47.7758 132 33 117.224 33 99H49.5C40.3865 99 33 91.6135 33 82.5C33 73.3865 40.3865 66 49.5 66C58.6135 66 66 73.3865 66 82.5C66 73.3865 73.3865 66 82.5 66C91.6135 66 99 73.3865 99 82.5C99 91.6135 91.6135 99 82.5 99H99C99 117.224 84.2243 132 66 132C102.451 132 132 102.451 132 66V33C132 14.7758 117.224 0 99 0ZM66 82.5C66 91.6135 58.6135 99 49.5 99H82.5C73.3865 99 66 91.6135 66 82.5Z" fill="#9B55FF" />
            </svg>
          </div>

          <div className="w-1/2">
            <h1 className="text-5xl md:text-6xl font-normal m-0 leading-[38px] md:leading-11 mb-4 md:mb-8">
              Lock <span className="underline text-[#C391FF]">80POP</span> for vePOP, Rewards, and Voting Power
            </h1>
            <p className="text-base text-primaryDark">
              Vote with your vePOP below to influence how much $oPOP each pool will receive. Your vote will persist until you change it and editing a pool can only be done once every 10 days.
            </p>

          </div>

          <div className="bg-[#C391FF] rounded-lg h-64 w-112 p-6 hidden md:flex justify-end items-end ">
            <svg xmlns="http://www.w3.org/2000/svg" width="132" height="132" viewBox="0 0 132 132" fill="none">
              <path d="M99 0C80.7757 0 66 14.7758 66 33C66 14.7758 51.2243 0 33 0C14.7758 0 0 14.7758 0 33V66C0 102.451 29.5487 132 66 132C47.7758 132 33 117.224 33 99H49.5C40.3865 99 33 91.6135 33 82.5C33 73.3865 40.3865 66 49.5 66C58.6135 66 66 73.3865 66 82.5C66 73.3865 73.3865 66 82.5 66C91.6135 66 99 73.3865 99 82.5C99 91.6135 91.6135 99 82.5 99H99C99 117.224 84.2243 132 66 132C102.451 132 132 102.451 132 66V33C132 14.7758 117.224 0 99 0ZM66 82.5C66 91.6135 58.6135 99 49.5 99H82.5C73.3865 99 66 91.6135 66 82.5Z" fill="#9B55FF" />
            </svg>
          </div>
        </section>

        <section className="py-10 flex flex-row items-center justify-between space-x-8">
          <div className="w-1/2 bg-[#FAF9F4] border border-[#F0EEE0] rounded-3xl p-8 text-primary">
            <h3 className="text-2xl pb-6 border-b border-[#F0EEE0]">vePOP</h3>
            <span className="flex flex-row items-center justify-between mt-6">
              <p className="">My POP</p>
              <p className="font-bold">{popBal?.formatted}</p>
            </span>
            <span className="flex flex-row items-center justify-between">
              <p className="">My Locked POP</p>
              <p className="font-bold">{lockedBal ? formatAndRoundBigNumber(lockedBal[0], 18) : ""}</p>
            </span>
            <span className="flex flex-row items-center justify-between">
              <p className="">Locked Until</p>
              <p className="font-bold">{lockedBal && lockedBal[1].toString() !== "0" ? new Date(lockedBal[1].toString()).toLocaleString() : "-"}</p>
            </span>
            <span className="flex flex-row items-center justify-between">
              <p className="">My vePOP</p>
              <p className="font-bold">{vePopBal?.formatted}</p>
            </span>
            <span className="flex flex-row items-center justify-between pb-6 border-b border-[#F0EEE0]">
              <p className="">Voting period ends</p>
              <p className="font-bold">{votingPeriodEnd()[0]}d : {votingPeriodEnd()[1]}h : {votingPeriodEnd()[2]}m</p>
            </span>
            <div className="flex flex-row items-center space-x-8 mt-6">
              <MainActionButton label="Get POP" handleClick={approve} />
              <TertiaryActionButton label="Lock POP" handleClick={approve} />
              <TertiaryActionButton label="Manage Stake" handleClick={approve} />
            </div>
          </div>

          <div className="w-1/2 bg-[#FAF9F4] border border-[#F0EEE0] rounded-3xl p-8 text-primary">
            <h3 className="text-2xl pb-6 border-b border-[#F0EEE0]">Total vePOP Rewards</h3>
            <span className="flex flex-row items-center justify-between mt-6">
              <p className="">APR</p>
              <p className="font-bold">? %</p>
            </span>
            <span className="flex flex-row items-center justify-between">
              <p className="">cPOP</p>
              <p className="font-bold">0</p>
            </span>
            <div className="h-24"></div>
            <div className="flex flex-row items-center justify-between pt-6 border-t border-[#F0EEE0]">
              <p className="">Total</p>
              <div>
                <p className="font-bold">0.0000</p>
                <p className="">($0.00)</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          
        </section>

      </div>
    </NoSSR >
  )
}

function noOp() { }