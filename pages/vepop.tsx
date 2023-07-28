import { BigNumber, Contract } from "ethers";
import useApproveBalance from "hooks/useApproveBalance";
import { useAllowance, useBalanceOf } from "lib/Erc20/hooks";
import { calcUnlockTime, calculateVeOut, getVotePeriodEndTime, useCreateLock } from "lib/Gauges/utils";
import { Pop } from "lib/types";
import { RPC_PROVIDERS, formatAndRoundBigNumber, useConsistentRepolling } from "lib/utils";
import useWaitForTx from "lib/utils/hooks/useWaitForTx";
import { FormEventHandler, useState } from "react";
import toast from "react-hot-toast";
import { Address, useAccount, useContractRead } from "wagmi";
import NoSSR from "react-no-ssr";
import InputNumber from "components/InputNumber";
import MainActionButton from "components/MainActionButton";
import { intervalToDuration } from "date-fns";
import SecondaryActionButton from "components/SecondaryActionButton";
import TertiaryActionButton from "components/TertiaryActionButton";
import useGauges from "lib/Gauges/useGauges";
import AnimatedChevron from "components/SweetVault/AnimatedChevron";
import Title from "components/content/Title";
import Accordion from "components/Accordion";
import { NetworkSticker } from "components/NetworkSticker";
import TokenIcon from "components/TokenIcon";
import Modal from "components/Modal/Modal";
import InputTokenWithError from "components/InputTokenWithError";


const POP = "0xC1fB217e01e67016FF4fF6A46ace54712e124d42"
const VOTING_ESCROW = "0x11c8AE8cB6779da8282B5837a018862d80e285Df"
const GAUGE_CONTROLLER = "0xF9D1E727E1530373654522F293ad01897173142F"

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
  const { data: allowance } = useAllowance({ chainId: 5, address: POP, account: VOTING_ESCROW as Address });

  const { data: gauges } = useGauges({ address: GAUGE_CONTROLLER, chainId: 5 })

  const [amount, setAmount] = useState(0);
  const [days, setDays] = useState(0);

  const [showModal, setShowModal] = useState(false);

  const { write: createLock } = useCreateLock(VOTING_ESCROW, amount, days);

  async function testStuff() {
    // const contract = new Contract(GAUGE_CONTROLLER, ["function gauges(uint256) external view returns (address)"], RPC_PROVIDERS[5])
    // const gaugeAddress = await contract.gauges(1)
    // console.log({ gaugeAddress })

    const contract2 = new Contract(VOTING_ESCROW, ["function token() view returns (address)"], RPC_PROVIDERS[5])
    const lpToken = await contract2.token()
    console.log({ lpToken })
  }

  // testStuff()


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

  const handleSetAmount: FormEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    setAmount(Number(value));
  };

  const handleSetDays: FormEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    setDays(Number(value));
  };

  return (
    <NoSSR>
      <Modal show={showModal} setShowModal={setShowModal} >
        <>
          <h2 className="text-2xl mb-8">
            Lock POP
          </h2>
          <InputNumber
            onChange={handleSetAmount}
            defaultValue={amount}
            autoComplete="off"
            autoCorrect="off"
            type="text"
            pattern="^[0-9]*[.,]?[0-9]*$"
            placeholder={"0.0"}
            minLength={1}
            maxLength={79}
            spellCheck="false"
          />
          <InputNumber
            onChange={handleSetDays}
            defaultValue={days}
            autoComplete="off"
            autoCorrect="off"
            type="text"
            pattern="^[0-9]*[.,]?[0-9]*$"
            placeholder={"0.0"}
            minLength={1}
            maxLength={79}
            spellCheck="false"
          />
          <div className="flex flex-row items-center mt-8 space-x-8">
            <SecondaryActionButton label="Cancel" handleClick={() => setShowModal(false)} />
            <MainActionButton label="Deposit" handleClick={() => { createLock(); setShowModal(false) }} />
          </div>
        </>
      </Modal>
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
              <p className="font-bold">{lockedBal && lockedBal[1].toString() !== "0" ? new Date(Number(lockedBal[1]) * 1000).toLocaleDateString() : "-"}</p>
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
              <TertiaryActionButton label="Lock POP" handleClick={() => setShowModal(true)} />
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

        <section className="space-y-4">
          {gauges?.length > 0 ? gauges.map((gauge, index) =>
            <Accordion
              header={
                <div className="flex flex-row flex-wrap items-center justify-between">

                  <div className="flex items-center justify-between select-none w-full md:w-1/3">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <NetworkSticker chainId={1} />
                        <TokenIcon token={"0x5271045F7B73c17825A7A7aee6917eE46b0B7520"} chainId={1} imageSize="w-8 h-8" />
                      </div>
                      <h2 className="text-gray-900 text-2xl font-bold mt-1">
                        OHM / FRAX LP
                      </h2>
                    </div>
                  </div>

                  <div className="">
                    <p className="text-primaryLight font-normal">Total Votes</p>
                    <p className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
                      <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
                        845000
                      </Title>
                    </p>
                  </div>

                  <div className="flex flex-row items-center">
                    <div>
                      <p className="text-primaryLight font-normal">My Votes</p>
                      <div className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
                        <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
                          11000
                        </Title>
                      </div>
                    </div>
                    <div className="">
                      <p className="text-primaryLight font-normal">My Vote %</p>
                      <div className="w-40 h-1 bg-black">
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:flex md:w-1/12 md:flex-row md:justify-end">
                    <AnimatedChevron className="w-7 h-7" />
                  </div>

                </div>
              }
            >
              <div className="flex flex-row space-x-8 mt-8">
                <div className="border border-[#F0EEE0] rounded-lg bg-white w-1/2 p-6">
                  <span className="flex flex-row items-center justify-between">
                    <p className="text-primaryLight font-normal">Gauge address:</p>
                    <p className="font-bold text-primary">
                      {gauge.address.slice(0, 6)}...{gauge.address.slice(-6)}
                    </p>
                  </span>

                  <span className="flex flex-row items-center justify-between">
                    <p className="text-primaryLight font-normal">Vault address:</p>
                    <p className="font-bold text-primary">
                      {gauge.vault.slice(0, 6)}...{gauge.vault.slice(-6)}
                    </p>
                  </span>

                </div>
                <div className="border border-[#F0EEE0] rounded-lg bg-white w-1/2 p-6">
                  <span className="flex flex-row items-center justify-between">
                    <p className="text-primaryLight font-normal">Last Epochs Votes:</p>
                    <p className="font-bold text-primary">
                      11000
                    </p>
                  </span>
                </div>
              </div>
            </Accordion>
          )
            : <p>Loading Gauges...</p>
          }
        </section>

      </div>
    </NoSSR >
  )
}

function noOp() { }
