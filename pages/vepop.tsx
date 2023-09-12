import { BigNumber, Contract, Wallet, constants } from "ethers";
import { useApproveBalance } from "hooks/useApproveBalance";
import { useAllowance, useBalanceOf } from "lib/Erc20/hooks";
import { getVotePeriodEndTime } from "lib/Gauges/utils";
import { Pop } from "lib/types";
import { formatAndRoundBigNumber, formatNumber, useConsistentRepolling } from "lib/utils";
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
import { showSuccessToast, showErrorToast } from "lib/Toasts";
import { getVeAddresses } from "lib/utils/addresses";
import { WalletIcon } from "@heroicons/react/24/outline";

const {
  BalancerPool: POP_LP,
  VotingEscrow: VOTING_ESCROW,
  GaugeController: GAUGE_CONTROLLER,
  oPOP: OPOP,
  POP: POP,
  WETH: WETH,
  BalancerOracle: OPOP_ORACLE,
  Minter: OPOP_MINTER
} = getVeAddresses();

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

  const [votes, setVotes] = useState(gauges?.map(gauge => 0));
  const [totalVotes, setTotalVotes] = useState(0);

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

  const { write: claimOPop = noOp } = useClaimOPop(OPOP_MINTER, gaugeRewards?.amounts?.filter(gauge => Number(gauge.amount) > 0).map(gauge => gauge.address));

  function handleVotes(val: number, index: number) {
    setVotes((prevVotes) => {
      const updatedVotes = [...prevVotes];
      const updatedTotalVotes = updatedVotes.reduce((a, b) => a + b, 0) - updatedVotes[index] + val;

      if (updatedTotalVotes <= 10000) {
        updatedVotes[index] = val;
        setTotalVotes(updatedTotalVotes);
        return updatedVotes;
      }

      return prevVotes;
    });
  }


  function sendVotesTx() {
    const gaugeController = new Contract(
      GAUGE_CONTROLLER,
      ["function vote_for_many_gauge_weights(address[8],uint256[8]) external"],
      signer
    );

    let addr = new Array<string>(8);
    let v = new Array<number>(8);

    for (let i = 0; i < Math.ceil(gauges.length / 8); i++) {
      addr = [];
      v = [];

      for (let n = 0; n < 8; n++) {
        const l = i * 8;
        v[n] = votes[n + l] === undefined ? 0 : votes[n + l];
        addr[n] = gauges[n + l] === undefined || votes[n + l] === 0 ? constants.AddressZero : gauges[n + l].address;

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
        <section className="pt-10 pb-10 pl-8 lg:border-b border-[#F0EEE0] lg:flex lg:flex-row items-center justify-between">
          <div className="lg:w-[1050px]">
            <h1 className="banner-text">
              Lock <span className="banner-highlight-text">20WETH-80POP</span> for vePOP, Rewards, and Voting Power
            </h1>
            <p className="text-base text-primaryDark mt-6 lg:w-[750px]">
              Vote with your vePOP below to influence how much $oPOP each pool will receive. Your vote will persist until you change it and editing a pool can only be done once every 10 days.
            </p>
            <div className="bg-customLightYellow text-black rounded-md w-1/2 p-4">
              Mint the token needed for testing on Goerli here: <br />
              <a href={`https://goerli.etherscan.io/address/${POP}#writeContract`} className="text-blue-500" target="_blank" rel="noreferrer">POP </a> <br />
              <a href={`https://goerli.etherscan.io/address/${WETH}#writeContract`} className="text-blue-500" target="_blank" rel="noreferrer">WETH</a> <br />
              <a href={`https://app.balancer.fi/#/goerli/pool/0x1050f901a307e7e71471ca3d12dfcea01d0a0a1c0002000000000000000008b4`} className="text-blue-500" target="_blank" rel="noreferrer">BalancerPool</a>
            </div>
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
                <p className="font-bold text-end flex items-center justify-end">
                  {(Number(oPopBal?.value) / 1e18).toFixed(2)}
                  <WalletIcon className="ml-2 w-5 h-5" />
                </p>
                <p className="">($ {formatNumber((Number(oPopBal?.value) / 1e18) * (Number(oPopPrice?.value) / 1e18))})</p>
              </div>
            </div>
            <div className="mt-5 flex flex-row items-center justify-between space-x-8">
              <MainActionButton label="Exercise oPOP" handleClick={() => setShowOPopModal(true)} disabled={Number(oPopBal?.value) === 0} />
              <SecondaryActionButton label="Claim oPOP" handleClick={() => claimOPop()} disabled={Number(gaugeRewards?.total) === 0} />
            </div>
          </div>
        </section>

        <section className="hidden md:block space-y-4">
          {gauges?.length > 0 ? gauges.map((gauge, index) =>
            <Gauge key={gauge.address} gauge={gauge} index={index} votes={votes} handleVotes={handleVotes} veBal={veBal} />
          )
            : <p>Loading Gauges...</p>
          }
        </section>

        <section className="md:hidden">
          <p className="text-primary">Gauge Voting not available on mobile.</p>
        </section>

        <div className="hidden md:block absolute left-0 bottom-10 w-full ">
          {account && <div className="z-10 mx-auto w-96 bg-white px-6 py-4 shadow-custom rounded-lg flex flex-row items-center justify-between">
            <p className="mt-1">
              Voting power used: <span className="text-[#05BE64]">
                {
                  veBal && veBal.value
                    ? (votes?.reduce((a, b) => a + b, 0) / 100).toFixed(2)
                    : "0"
                }%
              </span>
            </p>


            <button
              className="bg-[#FEE25D] rounded-lg py-3 px-3 text-center font-medium text-black leading-none"
              onClick={sendVotesTx}
            >
              Submit Votes
            </button>
          </div>}
        </div>

      </div>
    </NoSSR >
  )
}

function noOp() { }
