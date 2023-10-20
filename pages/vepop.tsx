// @ts-ignore
import NoSSR from "react-no-ssr";
import { useEffect, useState } from "react";
import { intervalToDuration } from "date-fns";
import { WalletIcon } from "@heroicons/react/24/outline";

import MainActionButton from "@/components/button/MainActionButton";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";

import useGauges from "@/lib/gauges/useGauges";
import type { Gauge } from "@/lib/gauges/useGauges";

import Gauge from "@/components/vepop/Gauge";
import LockModal from "@/components/vepop/modals/lock/LockModal";
import ManageLockModal from "@/components/vepop/modals/manage/ManageLockModal";
import useLockedBalanceOf from "@/lib/Gauges/useLockedBalanceOf";
import useOPopPrice from "@/lib/OPop/useOPopPrice";
import useOPopDiscount from "@/lib/OPop/useOPopDiscount";
import OPopModal from "@/components/vepop/modals/oPop/OPopModal";
import useClaimableOPop from "@/lib/Gauges/useClaimableOPop";
import { useClaimOPop } from "@/lib/OPop/useClaimOPop";
import { showSuccessToast, showErrorToast } from "@/lib/toasts";
import { getVeAddresses } from "@/lib/utils/addresses";
import { useHasAlreadyVoted } from "@/lib/gauges/useHasAlreadyVoted";
import { useUserWethReward } from "@/lib/feeDistributor/useUserWethRewards";
import { useClaimTokens } from "@/lib/feeDistributor/useClaimToken";
import useClaimableTokens from "@/lib/feeDistributor/getVeApy";
import getVeApy from "@/lib/feeDistributor/getVeApy";
import { useAccount } from "wagmi";
import { formatAndRoundBigNumber, formatNumber } from "@/lib/utils/formatBigNumber";
import { Address, formatEther, zeroAddress } from "viem";
import { getVotePeriodEndTime } from "@/lib/gauges/utils";

const {
  BalancerPool: POP_LP,
  VotingEscrow: VOTING_ESCROW,
  GaugeController: GAUGE_CONTROLLER,
  oPOP: OPOP,
  POP: POP,
  WETH: WETH,
  BalancerOracle: OPOP_ORACLE,
  Minter: OPOP_MINTER,
  FeeDistributor: FEE_DISTRIBUTOR
} = getVeAddresses();

function VePopContainer() {
  const { address: account } = useAccount()
  const { data: signer } = useSigner({ chainId: 1 })

  const { data: popLpBal } = useBalanceOf({ chainId: 1, address: POP_LP, account })
  const { data: oPopBal } = useBalanceOf({ chainId: 1, address: OPOP, account })
  const { data: lockedBal } = useLockedBalanceOf({ chainId: 1, address: VOTING_ESCROW, account })
  const { data: veBal } = useBalanceOf({ chainId: 1, address: VOTING_ESCROW, account })

  const { data: oPopPrice } = useOPopPrice({ chainId: 1, address: OPOP_ORACLE })

  const { data: gauges } = useGauges({ address: GAUGE_CONTROLLER, chainId: 1 })
  const { data: gaugeRewards } = useClaimableOPop({ addresses: gauges?.map((gauge: Gauge) => gauge.address), chainId: 1, account })

  const { data: userWethReward } = useUserWethReward({ chainId: 5, address: FEE_DISTRIBUTOR, user: account, token: WETH })

  const [votes, setVotes] = useState([]);
  const { data: hasAlreadyVoted } = useHasAlreadyVoted({ addresses: gauges?.map((gauge: Gauge) => gauge.address), chainId: 1, account })
  const canVote = account && Number(veBal?.value) > 0 && !hasAlreadyVoted

  const [showLockModal, setShowLockModal] = useState(false);
  const [showMangementModal, setShowMangementModal] = useState(false);
  const [showOPopModal, setShowOPopModal] = useState(false);

  const [apy, setApy] = useState(undefined);

  useEffect(() => {
    if (!apy) {
      getVeApy({ chainId: 5, address: FEE_DISTRIBUTOR, token: "0x2D9B33e9918Dce388d1Cb8Bf09D4E827b899e9d9" }).then(res => setApy(res))
    }
  }, [apy])

  useEffect(() => {
    if (gauges?.length > 0, votes?.length === 0) {
      setVotes(new Array(gauges?.length).fill(0));
    }
  }, [gauges, votes])

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

  const { write: claimOPop = noOp } = useClaimOPop(OPOP_MINTER, gaugeRewards?.amounts?.filter((gauge: Gauge) => Number(gauge.amount) > 0).map((gauge: Gauge) => gauge.address));
  const { write: claimTokens = noOp } = useClaimTokens(FEE_DISTRIBUTOR, account as Address, [WETH]);

  function handleVotes(val: number, index: number) {
    setVotes((prevVotes) => {
      const updatedVotes = [...prevVotes];
      const updatedTotalVotes = updatedVotes.reduce((a, b) => a + b, 0) - updatedVotes[index] + val;

      if (updatedTotalVotes <= 10000) {
        // TODO should we adjust the val to the max possible value if it exceeds 10000?
        updatedVotes[index] = val;
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
        addr[n] = gauges[n + l] === undefined || votes[n + l] === 0 ? zeroAddress : gauges[n + l].address;

      }

      gaugeController.vote_for_many_gauge_weights(addr, v)
        .then(() => {
          showSuccessToast();
        })
        .catch((error: any) => {
          showErrorToast(error);
        });
    }
  }

  return (
    <>
      {(!votes || votes.length === 0) ? <></>
        : <>
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
                  <a href={`https://app.balancer.fi/#/ethereum/pool/0xd5a44704befd1cfcca67f7bc498a7654cc092959000200000000000000000609`} className="text-blue-500" target="_blank" rel="noreferrer">BalancerPool</a>
                </div>
              </div>
            </section>

            <section className="py-10 lg:flex lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-8">
              <div className="w-full lg:w-1/2 bg-[#FAF9F4] border border-[#F0EEE0] rounded-3xl p-8 text-primary">
                <h3 className="text-2xl pb-6 border-b border-[#F0EEE0]">vePOP</h3>
                <span className="flex flex-row items-center justify-between mt-6">
                  <p className="">My POP LP</p>
                  <p className="font-bold">{popLpBal?.formatted || "0"}</p>
                </span>
                <span className="flex flex-row items-center justify-between">
                  <p className="">My Locked POP LP</p>
                  <p className="font-bold">{lockedBal ? formatAndRoundBigNumber(lockedBal?.amount, 18) : "0"}</p>
                </span>
                <span className="flex flex-row items-center justify-between">
                  <p className="">Locked Until</p>
                  <p className="font-bold">{lockedBal && lockedBal?.end.toString() !== "0" ? new Date(Number(lockedBal?.end) * 1000).toLocaleDateString() : "-"}</p>
                </span>
                <span className="flex flex-row items-center justify-between">
                  <p className="">My vePOP</p>
                  <p className="font-bold">{veBal?.formatted || "0"}</p>
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
                  <p className="font-bold">{apy || "0"} %</p>
                </span>
                <span className="flex flex-row items-center justify-between">
                  <p className="">Claimable WETH</p>
                  <p className="font-bold">{parseFloat(formatEther(userWethReward)).toFixed(3)} wETH</p>
                </span>
                <div className="mt-5 flex flex-row items-center justify-between space-x-8">
                  <MainActionButton label="Claim WETH" handleClick={() => claimTokens()} disabled={Number(userWethReward) === 0} />
                </div>
                <div className="h-8"></div>
                <div className="pt-6 border-t border-[#F0EEE0]">
                  <span className="flex flex-row items-center justify-between">
                    <p className="">Claimable oPOP</p>
                    <p className="font-bold">{gaugeRewards?.total ? (Number(gaugeRewards?.total) / 1e18).toFixed(2) : "0"}</p>
                  </span>
                  <span className="flex flex-row items-center justify-between">
                    <p className="">My oPOP</p>
                    <div>
                      <p className="font-bold text-end flex items-center justify-end">
                        {oPopBal?.value ? (Number(oPopBal?.value) / 1e18).toFixed(2) : "0"}
                        <WalletIcon className="ml-2 w-5 h-5" />
                      </p>
                      <p className="">
                        ($ {oPopPrice?.value && oPopBal?.value ?
                          formatNumber((Number(oPopBal?.value) / 1e18) * (Number(oPopPrice?.value) / 1e18)) :
                          "0"})
                      </p>
                    </div>
                  </span>
                  <div className="mt-5 flex flex-row items-center justify-between space-x-8">
                    <MainActionButton label="Exercise oPOP" handleClick={() => setShowOPopModal(true)} disabled={Number(oPopBal?.value) === 0} />
                    <SecondaryActionButton label="Claim oPOP" handleClick={() => claimOPop()} disabled={Number(gaugeRewards?.total) === 0} />
                  </div>
                </div>
              </div>
            </section>

            <section className="hidden md:block space-y-4">
              {gauges?.length > 0 ? gauges.map((gauge: Gauge, index: number) =>
                <Gauge key={gauge.address} gauge={gauge} index={index} votes={votes} handleVotes={handleVotes} veBal={veBal} canVote={canVote} />
              )
                : <p>Loading Gauges...</p>
              }
            </section>

            <section className="md:hidden">
              <p className="text-primary">Gauge Voting not available on mobile.</p>
            </section>

            <div className="hidden md:block absolute left-0 bottom-10 w-full ">
              {canVote && <>
                <div className="z-10 mx-auto w-96 bg-white px-6 py-4 shadow-custom rounded-lg flex flex-row items-center justify-between">
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
                </div>
              </>}
            </div>

          </div>
        </>}
    </ >
  )
}

export default function VePOP() {
  return <NoSSR><VePopContainer /></NoSSR>
}

function noOp() { }
