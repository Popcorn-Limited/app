import { BigNumber, Contract, constants } from "ethers";
import useApproveBalance from "hooks/useApproveBalance";
import { useAllowance, useBalanceOf } from "lib/Erc20/hooks";
import { getVotePeriodEndTime } from "lib/Gauges/utils";
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
import useOPopPrice from "lib/OPop/useOPopPrice";
import useOPopDiscount from "lib/OPop/useOPopDiscount";
import OPopModal from "components/vepop/modals/oPop/OPopModal";
import useClaimableOPop from "lib/Gauges/useClaimableOPop";
import { useClaimOPop } from "lib/OPop/useClaimOPop";
import { normalizeVotes } from "lib/utils/resolvers/vote-resolvers";
import { showSuccessToast, showErrorToast } from "lib/Toasts";

const POP_LP = "0x29d7a7E0d781C957696697B94D4Bc18C651e358E"
const VOTING_ESCROW = "0xadFF00203dB2C0231853197660C28510B39952C8"
const GAUGE_CONTROLLER = "0xD51d19b42b36b884aBE50A83Cc1a26B15C8054DD"
const OPOP = "0xdca3d7dFFd966A98CF0F7eBcC9135832169381F1"
const OPOP_ORACLE = "0x22aC7dE4B8E2359dF0650cE29Aa438F9cB59478b"
const OPOP_MINTER = ""

export default function VePOP() {
  const { waitForTx } = useWaitForTx();

  const { address: account } = useAccount()
  const { data: signer } = useSigner({ chainId: 5 })

  const { data: popLpBal } = useBalanceOf({ chainId: 5, address: POP_LP, account })
  const { data: oPopBal } = useBalanceOf({ chainId: 5, address: OPOP, account })
  const { data: lockedBal } = useLockedBalanceOf({ chainId: 5, address: VOTING_ESCROW, account })
  const { data: veBal } = useBalanceOf({ chainId: 5, address: VOTING_ESCROW, account })

  const { data: oPopPrice } = useOPopPrice({ chainId: 5, address: OPOP_ORACLE })

  const { data: gauges } = useGauges({ address: GAUGE_CONTROLLER, chainId: 5 })
  const { data: gaugeRewards } = useClaimableOPop({ addresses: gauges?.map(gauge => gauge.address), chainId: 5, account })

  const [avVotes, setAvVotes] = useState(0);
  const [votes, setVotes] = useState(gauges?.map(gauge => 0));

  const [showLockModal, setShowLockModal] = useState(false);
  const [showMangementModal, setShowMangementModal] = useState(false);
  const [showOPopModal, setShowOPopModal] = useState(false);

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

  const { write: claimOPop } = useClaimOPop(OPOP_MINTER, gaugeRewards?.amounts?.filter(gauge => Number(gauge.amount) > 0).map(gauge => gauge.address));

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

  useEffect(() => {
    if (veBal) setAvVotes((Number(veBal?.value) / 1e18))
  }, [])


  function handleAvVotes(val: number, index: number) {
    const newVotes = [...votes]
    const newAvVotes = avVotes - (val - newVotes[index])

    newVotes[index] = val
    setVotes(newVotes)

    setAvVotes(newAvVotes < 0 ? 0 : newAvVotes)
  }

  function handleVotes() {
    const gaugeController = new Contract(
      "0xF9D1E727E1530373654522F293ad01897173142F",
      ["function vote_for_many_gauge_weights(address[8],uint256[8]) external"],
      signer
    );

    const normalizedVotes = normalizeVotes(votes);

    let addr = new Array<string>(8);
    let v = new Array<number>(8);

    for (let i = 0; i < Math.ceil(gauges.length / 8); i++) {
      addr = [];
      v = [];

      for (let n = 0; n < 8; n++) {
        const l = i * 8;
        addr[n] = gauges[n + l] === undefined ? constants.AddressZero : gauges[n + l].address;
        v[n] = normalizedVotes[n + l] === undefined ? 0 : normalizedVotes[n + l];
      }

      gaugeController.vote_for_many_gauge_weights(addr, v)
        .then(() => {
          showSuccessToast();
        })
        .catch(error => {
          showErrorToast(error);
        });

    }
  }

  return (
    <NoSSR>
      <LockModal show={[showLockModal, setShowLockModal]} />
      <ManageLockModal show={[showMangementModal, setShowMangementModal]} />
      <OPopModal show={[showOPopModal, setShowOPopModal]} />
      <div>
        <section className="lg:py-10 lg:border-b border-[#F0EEE0]">
          <div className="w-full">
            <h1 className="text-5xl lg:text-6xl font-normal m-0 leading-[44px] lg:leading-12 mb-4 lg:mb-8">
              Lock <span className="underline text-[#C391FF]">POP LP</span> for vePOP, <br /> voting power, and oPOP rewards
            </h1>
            <p className="text-base text-primaryDark">
              User your vePOP to vote on how much oPOP each vault receives. You can edit your vote only once every 10 days.
            </p>
          </div>
        </section>

        <section className="py-10 lg:flex lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-8">
          <div className="w-full lg:w-1/2 bg-[#FAF9F4] border border-[#F0EEE0] rounded-3xl p-8 text-primary">
            <h3 className="text-2xl pb-6 border-b border-[#F0EEE0]">vePOP</h3>
            <span className="flex flex-row items-center justify-between mt-6">
              <p className="">My POP LP</p>
              <p className="font-bold">{popLpBal?.formatted}</p>
            </span>
            <span className="flex flex-row items-center justify-between">
              <p className="">My Locked POP LP</p>
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
              <p className="font-bold">{votingPeriodEnd()[0]}d : {votingPeriodEnd()[1]}h<span className="hidden lg:inline">: {votingPeriodEnd()[2]}m</span></p>
            </span>
            <div className="lg:flex lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-8 mt-6">
              <MainActionButton label="Lock POP LP" handleClick={() => setShowLockModal(true)} disabled={Number(veBal?.value) > 0} />
              <SecondaryActionButton label="Manage Stake" handleClick={() => setShowMangementModal(true)} disabled={Number(veBal?.value) === 0} />
            </div>
          </div>

          <div className="lg:w-1/2 bg-[#FAF9F4] border border-[#F0EEE0] rounded-3xl p-8 text-primary">
            <h3 className="text-2xl pb-6 border-b border-[#F0EEE0]">Total vePOP Rewards</h3>
            <span className="flex flex-row items-center justify-between mt-6">
              <p className="">APR</p>
              <p className="font-bold">? %</p>
            </span>
            <span className="flex flex-row items-center justify-between">
              <p className="">Claimable oPOP</p>
              <p className="font-bold">{(Number(gaugeRewards?.total) / 1e18).toFixed(2)}</p>
            </span>
            <div className="h-8"></div>
            <div className="flex flex-row items-center justify-between pt-6 border-t border-[#F0EEE0]">
              <p className="">My oPOP</p>
              <div>
                <p className="font-bold text-end">{(Number(oPopBal?.value) / 1e18).toFixed(2)}</p>
                <p className="">($ {(Number(oPopBal?.value) / 1e18) * (Number(oPopPrice?.value) / 1e18)})</p>
              </div>
            </div>
            <div className="mt-5 flex flex-row items-center justify-between space-x-8">
              <MainActionButton label="Exercise oPOP" handleClick={() => setShowOPopModal(true)} />
              <SecondaryActionButton label="Claim oPOP" handleClick={() => claimOPop()} disabled={Number(gaugeRewards?.total) === 0} />
            </div>
          </div>
        </section>

        <section className="hidden sm:block space-y-4">
          {gauges?.length > 0 ? gauges.map((gauge, index) =>
            <Gauge key={gauge.address} gauge={gauge} index={index} votes={[avVotes, handleAvVotes]} veBal={veBal} />
          )
            : <p>Loading Gauges...</p>
          }
        </section>

        <section className="sm:hidden">
          <p className="text-primary">Gauge Voting not available on mobile.</p>
        </section>

        <div className="hidden sm:block absolute left-0 bottom-10 w-full ">
          <div className="z-10 mx-auto w-96 bg-white px-6 py-4 shadow-custom rounded-lg flex flex-row items-center justify-between">
            <p className="mt-1">
              Voting power used: <span className="text-[#05BE64]">
                {
                  veBal && veBal.value
                    ? Math.abs((1 - avVotes / (Number(veBal.value) / 1e18)) * 100) < 0.005
                      ? "0"
                      : ((1 - avVotes / (Number(veBal.value) / 1e18)) * 100).toFixed(2)
                    : "0"
                }%
              </span>
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
