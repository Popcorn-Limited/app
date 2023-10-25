// @ts-ignore
import NoSSR from "react-no-ssr";
import { mainnet, useAccount, useBalance, usePublicClient, useWalletClient } from "wagmi";
import { Address, WalletClient } from "viem";
import { useEffect, useState } from "react";
import { getVeAddresses } from "@/lib/utils/addresses";
import { hasAlreadyVoted } from "@/lib/gauges/hasAlreadyVoted";
import { VaultData } from "@/lib/types";
import { getVaultsByChain } from "@/lib/vault/getVault";
import VeRewards from "@/components/vepop/VeRewards";
import StakingInterface from "@/components/vepop/StakingInterface";
import { sendVotes } from "@/lib/gauges/interactions";
import Gauge from "@/components/vepop/Gauge";
import LockModal from "@/components/vepop/modals/lock/LockModal";
import ManageLockModal from "@/components/vepop/modals/manage/ManageLockModal";

const { VotingEscrow: VOTING_ESCROW } = getVeAddresses();

function VePopContainer() {
  const { address: account } = useAccount()
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient()

  const { data: veBal } = useBalance({ chainId: 1, address: account, token: VOTING_ESCROW, watch: true })

  const [initalLoad, setInitalLoad] = useState<boolean>(false);
  const [accountLoad, setAccountLoad] = useState<boolean>(false);

  const [vaults, setVaults] = useState<VaultData[]>([]);
  const [votes, setVotes] = useState<number[]>([]);
  const [canVote, setCanVote] = useState<boolean>(false);

  const [showLockModal, setShowLockModal] = useState(false);
  const [showMangementModal, setShowMangementModal] = useState(false);

  useEffect(() => {
    async function initialSetup() {
      setInitalLoad(true)
      if (account) setAccountLoad(true)
      const allVaults = await getVaultsByChain({ chain: mainnet, account })
      const vaultsWithGauges = allVaults.filter(vault => !!vault.gauge)
      setVaults(vaultsWithGauges);
      if (vaultsWithGauges.length > 0 && votes.length === 0 && publicClient.chain.id === 1) {
        setVotes(vaultsWithGauges.map(gauge => 0));

        const hasVoted = await hasAlreadyVoted({
          addresses: vaultsWithGauges?.map((vault: VaultData) => vault.gauge?.address as Address),
          publicClient,
          account: account as Address
        })
        setCanVote(!!account && Number(veBal?.value) > 0 && !hasVoted)
      }
    }
    if (!account && !initalLoad) initialSetup();
    if (account && !accountLoad) initialSetup()
  }, [account])

  function handleVotes(val: number, index: number) {
    const updatedVotes = [...votes];
    const updatedTotalVotes = updatedVotes.reduce((a, b) => a + b, 0) - updatedVotes[index] + val;

    if (updatedTotalVotes <= 10000) {
      // TODO should we adjust the val to the max possible value if it exceeds 10000?
      updatedVotes[index] = val;
    }

    setVotes((prevVotes) => updatedVotes);
  }

  return (
    <>
      <LockModal show={[showLockModal, setShowLockModal]} />
      <ManageLockModal show={[showMangementModal, setShowMangementModal]} />
      <div>
        <section className="pt-10 pb-10 pl-8 lg:border-b border-[#F0EEE0] lg:flex lg:flex-row items-center justify-between">
          <div className="lg:w-[1050px]">
            <h1 className="text-3xl">
              Lock <span className="text-customPurple">20WETH-80POP</span> for <b>vePOP</b>, voting Power & <b>oPOP</b>
            </h1>
            <p className="text-base text-primaryDark mt-6 lg:w-[750px]">
              Vote with your vePOP below to influence how much $oPOP each pool will receive. Your vote will persist until you change it and editing a pool can only be done once every 10 days.
            </p>
          </div>
        </section>

        <section className="py-10 lg:flex lg:flex-row lg:justify-between space-y-4 lg:space-y-0 lg:space-x-8">
          <StakingInterface setShowLockModal={setShowLockModal} setShowMangementModal={setShowMangementModal} />

          {/* <VeRewards /> */}
        </section>

        <section className="hidden md:block space-y-4">
          {vaults?.length > 0 ? vaults.map((vault: VaultData, index: number) =>
            <Gauge key={vault.address} vault={vault} index={index} votes={votes} handleVotes={handleVotes} canVote={canVote} />
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
                onClick={() => sendVotes({ vaults, votes, account: account as Address, clients: { publicClient, walletClient: walletClient as WalletClient } })}
              >
                Submit Votes
              </button>
            </div>
          </>}
        </div>

      </div>
    </>
  )
}

export default function VePOP() {
  return <NoSSR><VePopContainer /></NoSSR>
}

function noOp() { }
