import { BigNumber, Contract, constants } from "ethers";
import useApproveBalance from "hooks/useApproveBalance";
import { useAllowance, useBalanceOf } from "lib/Erc20/hooks";
import { getVotePeriodEndTime, useVoteForGauges } from "lib/Gauges/utils";
import { Pop } from "lib/types";
import { formatAndRoundBigNumber, useConsistentRepolling } from "lib/utils";
import useWaitForTx from "lib/utils/hooks/useWaitForTx";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Address, useAccount, useContractRead, useSigner } from "wagmi";
import NoSSR from "react-no-ssr";
import MainActionButton from "components/MainActionButton";
import { intervalToDuration } from "date-fns";
import SecondaryActionButton from "components/SecondaryActionButton";
import useGauges from "lib/Gauges/useGauges";
import Gauge from "components/vepop/Gauge";
import LockModal from "components/vepop/modals/lock/LockModal";
import ManageLockModal from "components/vepop/modals/manage/ManageLockModal";
import useLockedBalanceOf from "lib/Gauges/useLockedBalanceOf";

const POP = "0xC1fB217e01e67016FF4fF6A46ace54712e124d42"
const VOTING_ESCROW = "0x11c8AE8cB6779da8282B5837a018862d80e285Df"
const GAUGE_CONTROLLER = "0xF9D1E727E1530373654522F293ad01897173142F"


export default function VePOP() {
  const { waitForTx } = useWaitForTx();

  const { address: account } = useAccount()
  const { data: signer } = useSigner({ chainId: 5 })

  const { data: popBal } = useBalanceOf({ chainId: 5, address: POP, account })
  const { data: lockedBal } = useLockedBalanceOf({ chainId: 5, address: VOTING_ESCROW, account })
  const { data: veBal } = useBalanceOf({ chainId: 5, address: VOTING_ESCROW, account })

  const { data: gauges } = useGauges({ address: GAUGE_CONTROLLER, chainId: 5 })

  const [avVotes, setAvVotes] = useState(0);
  const [votes, setVotes] = useState(gauges?.map(gauge => 0));

  const [showLockModal, setShowLockModal] = useState(false);
  const [showMangementModal, setShowMangementModal] = useState(false);

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

  useEffect(() => {
    if (veBal) setAvVotes((Number(veBal?.value) / 1e18))
  }, [veBal])


  function handleAvVotes(val: number, index: number) {
    const newVotes = [...votes]
    newVotes[index] = val
    setVotes(newVotes)

    const newAvVotes = avVotes - (val - newVotes[index])
    setAvVotes(newAvVotes < 0 ? 0 : newAvVotes)
  }

  function handleVotes() {
    const gaugeController = new Contract(
      "0xF9D1E727E1530373654522F293ad01897173142F",
      ["function vote_for_many_gauge_weights(address[8],uint256[8]) external"],
      signer
    )

    let addr = new Array<string>(8);
    let v = new Array<number>(8);

    for (let i = 0; i < Math.ceil(gauges.length / 8); i++) {
      addr = [];
      v = [];

      for (let n = 0; n < 8; n++) {
        const l = i * 8
        addr[n] = gauges[n + l] === undefined ? constants.AddressZero : gauges[n + l].address;
        v[n] = votes[n + l] === undefined ? 0 : votes[n + l];
      }
      gaugeController.vote_for_many_gauge_weights(addr, votes)
    }
  }

  return (
    <NoSSR>
      <LockModal show={[showLockModal, setShowLockModal]} />
      <ManageLockModal show={[showMangementModal, setShowMangementModal]} />
      <div>
        <section className="md:py-10 md:border-b border-[#F0EEE0] md:flex md:flex-row items-center justify-between">

          <div className="bg-[#C391FF] rounded-lg h-64 w-full p-6 mb-10 flex md:hidden justify-end items-end ">
            <svg xmlns="http://www.w3.org/2000/svg" width="132" height="132" viewBox="0 0 132 132" fill="none">
              <path d="M99 0C80.7757 0 66 14.7758 66 33C66 14.7758 51.2243 0 33 0C14.7758 0 0 14.7758 0 33V66C0 102.451 29.5487 132 66 132C47.7758 132 33 117.224 33 99H49.5C40.3865 99 33 91.6135 33 82.5C33 73.3865 40.3865 66 49.5 66C58.6135 66 66 73.3865 66 82.5C66 73.3865 73.3865 66 82.5 66C91.6135 66 99 73.3865 99 82.5C99 91.6135 91.6135 99 82.5 99H99C99 117.224 84.2243 132 66 132C102.451 132 132 102.451 132 66V33C132 14.7758 117.224 0 99 0ZM66 82.5C66 91.6135 58.6135 99 49.5 99H82.5C73.3865 99 66 91.6135 66 82.5Z" fill="#9B55FF" />
            </svg>
          </div>

          <div className="md:w-1/2">
            <h1 className="text-5xl md:text-6xl font-normal m-0 leading-[44px] md:leading-14 mb-4 md:mb-8">
              Lock <span className="underline text-[#C391FF]">POP</span> for vePOP, <br />Rewards, and Voting Power
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

        <section className="py-10 md:flex md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-8">
          <div className="w-full md:w-1/2 bg-[#FAF9F4] border border-[#F0EEE0] rounded-3xl p-8 text-primary">
            <h3 className="text-2xl pb-6 border-b border-[#F0EEE0]">vePOP</h3>
            <span className="flex flex-row items-center justify-between mt-6">
              <p className="">My POP</p>
              <p className="font-bold">{popBal?.formatted}</p>
            </span>
            <span className="flex flex-row items-center justify-between">
              <p className="">My Locked POP</p>
              <p className="font-bold">{lockedBal ? formatAndRoundBigNumber(lockedBal?.amount, 18) : ""}</p>
            </span>
            <span className="flex flex-row items-center justify-between">
              <p className="">Locked Until</p>
              <p className="font-bold">{lockedBal && lockedBal?.end.toString() !== "0" ? new Date(Number(lockedBal?.end) * 1000).toLocaleDateString() : "-"}</p>
            </span>
            <span className="flex flex-row items-center justify-between">
              <p className="">My vePOP</p>
              <p className="font-bold">{veBal?.formatted}</p>
            </span>
            <span className="flex flex-row items-center justify-between pb-6 border-b border-[#F0EEE0]">
              <p className="">Voting period ends</p>
              <p className="font-bold">{votingPeriodEnd()[0]}d : {votingPeriodEnd()[1]}h<span className="hidden md:inline">: {votingPeriodEnd()[2]}m</span></p>
            </span>
            <div className="md:flex md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8 mt-6">
              <MainActionButton label="Get POP" handleClick={approve} />
              <SecondaryActionButton label="Lock POP" handleClick={() => setShowLockModal(true)} disabled={Number(veBal?.value) > 0} />
              <SecondaryActionButton label="Manage Stake" handleClick={() => setShowMangementModal(true)} />
            </div>
          </div>

          <div className="md:w-1/2 bg-[#FAF9F4] border border-[#F0EEE0] rounded-3xl p-8 text-primary">
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

        <section className="hidden md:block space-y-4">
          {gauges?.length > 0 ? gauges.map((gauge, index) =>
            <Gauge key={gauge.address} gauge={gauge} index={index} votes={[avVotes, handleAvVotes]} veBal={veBal} />
          )
            : <p>Loading Gauges...</p>
          }
        </section>

        <section className="md:hidden">
          <p className="text-primary">Gauge Voting not available on mobile.</p>
        </section>

        <div className="hidden md:block absolute left-0 bottom-10 w-full ">
          <div className="z-10 mx-auto w-96 bg-white px-6 py-4 shadow-custom rounded-lg flex flex-row items-center justify-between">
            <p className="mt-1">
              Voting power used: <span className="text-[#05BE64]">{veBal ? ((1 - avVotes / (Number(veBal?.value) / 1e18)) * 100).toFixed(2) : "0"}%</span>
            </p>
            <button
              className="bg-[#FEE25D] rounded-lg py-3 px-3 text-center font-medium text-black leading-none"
              onClick={handleVotes}
            >
              Submit Votes
            </button>
          </div>
        </div>

      </div>
    </NoSSR >
  )
}

function noOp() { }
