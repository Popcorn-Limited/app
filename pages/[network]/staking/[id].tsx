import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";

import StatusWithLabel from "components/StatusWithLabel";
import { InfoIconWithTooltip } from "components/InfoIconWithTooltip";
import { NetworkSticker } from "components/NetworkSticker";
import TokenIcon from "components/TokenIcon";
import SecondaryActionButton from "components/SecondaryActionButton";
import { Metadata, Tvl } from "lib/Contract";
import MobileCardSlider from "components/MobileCardSlider";
import { useChainIdFromUrl } from "hooks/useChainIdFromUrl";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { useStakingToken } from "lib/Staking/hooks";
import NoSSR from "react-no-ssr";
import { Erc20, Staking } from "lib";
import MainActionButton from "components/MainActionButton";
import useExit from "lib/Staking/hooks/useExit";
import { usePrice } from "lib/Price";
import { useBalanceOf } from "lib/Erc20/hooks";
import { formatNumber } from "lib/utils";

function noOp() { }

const stakingAddressToAsset = {
  // mainnet
  "0x27A9B8065Af3A678CD121A435BEA9253C53Ab428": { address: "0x109d2034e97eC88f50BEeBC778b5A5650F98c124", symbol: "BTR" },  // butter
  "0x584732f867a4533BC349d438Fba4fc2aEE5f5f83": { address: "0x8b97ADE5843c9BE7a1e8c95F32EC192E31A46cf3", symbol: "3X" },  // 3x
  "0xeB906A75838A8078B181815969b1DCBC20eaF7c0": { address: "0x06450dEe7FD2Fb8E39061434BAbCFC05599a6Fb8", symbol: "XEN" }, // xen
  "0x633b32573793A67cE41A7D0fFe66e78Cd3379C45": { address: "0xbba11b41407df8793a89b44ee4b50afad4508555", symbol: "POP-LP" }, // popUsdc Arrakis
  // polygon
  "0xd3836EF639A74EA7398d34c66aa171b1564BE4bc": { address: "0x6dE0500211bc3140409B345Fa1a5289cb77Af1e4", symbol: "POP-LP" } // popUsdc Arrakis
}

export default function Index(): JSX.Element {
  const chainId = useChainIdFromUrl();
  const router = useRouter();
  const stakingAddress = router.query.id as string;
  const { data: stakingToken } = useStakingToken({ address: stakingAddress, chainId });
  const { address: account } = useAccount();
  const { write: exit = noOp } = useExit(stakingAddress, chainId);
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const { data: tokenStaked } = useBalanceOf({ address: stakingAddressToAsset[stakingAddress]?.address, chainId, account: stakingAddress });

  function handleExit() {
    if (chain.id !== Number(chainId)) switchNetwork?.(Number(chainId))
    exit();
  }

  return (
    <NoSSR>
      <Metadata address={stakingToken} chainId={chainId}>
        {(metadata) => (
          <>
            <div className="-ml-2">
              <div className="flex items-center cursor-pointer" onClick={() => router.push("/staking")}>
                <ChevronLeftIcon className="w-6 h-6 mb-1 text-secondaryLight" />
                <p className="text-primary">Staking</p>
              </div>
            </div>

            <div className="grid grid-cols-12 mt-10">
              <div className="col-span-12 md:col-span-5">
                <div className="relative ml-4">
                  <NetworkSticker chainId={chainId} />
                  <TokenIcon token={stakingToken} chainId={chainId} />
                </div>
                <h1 className="text-black text-5xl md:text-6xl leading-12 mt-9">{metadata.name}</h1>
                <div className="flex flex-wrap">
                  <div className="block pr-8 md:pr-6 mt-6 md:mt-8">
                    <StatusWithLabel
                      content={"0.00%"}
                      label={
                        <>
                          <span className="lowercase">v</span>APR
                        </>
                      }
                      green
                      infoIconProps={{
                        id: "vAPR",
                        title: "vAPR",
                        content:
                          "This is a variable annual percentage rate. 90% of POP rewards are vested over one year.",
                      }}
                    />
                  </div>
                  <div className="block mt-6 md:mt-8 pr-8 md:pr-6 md:pl-6 md:border-l md:border-customLightGray">
                    <StatusWithLabel
                      content={`${formatNumber(Number(tokenStaked?.value) / 1e18)} ${stakingAddressToAsset[stakingAddress]?.symbol}`}
                      label="TOTAL STAKED"
                    />
                  </div>
                  <div className="block mt-6 laptop:mt-8 pr-8 laptop:pr-0 laptop:pl-6 laptop:border-l laptop:border-customLightGray">
                    <StatusWithLabel
                      content={"Paused"}
                      label="STATUS"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-customGreen col-span-12 md:col-span-3 md:col-end-13 h-80 p-6 hidden md:flex justify-end items-end">
                <img src="/images/stakingCard.svg" alt="" />
              </div>
            </div>
            <div className="flex flex-col md:flex-row mt-10">
              <div className="md:w-1/3 order-2 md:order-1">
                <div className="p-6 border border-customLightGray rounded-lg mb-12 mt-12 md:mt-0">
                  <div className="border-b border-primaryLight">
                    <p
                      className={`text-xl md:text-center mb-4 cursor-pointer word-spacing-full sm:word-spacing-normal text-primary font-medium`}
                    >
                      Exit
                    </p>
                  </div>
                  <div className="h-full flex flex-col justify-between">
                    <div className="mb-8">
                      <p className="text-primaryDark mt-12 text-xl">We are winding down this staking pool. <br />All your funds are safe and waiting for you.</p>
                      <p className="text-primaryDark" >
                        <span className="font-bold text-lg"></span>
                      </p>
                      <p className="text-primaryDark mt-4">You will no longer be able to stake new tokens.</p>
                      <p className="text-primaryDark">
                        To withdraw your funds and claim your accrued rewards click the button below.
                        It will withdraw your entire staked balance.
                      </p>
                    </div>
                    <MainActionButton label="Exit and Claim" handleClick={handleExit} />
                  </div>
                </div>
              </div>

              <div className="md:w-2/3 md:ml-8 order-1 md:order-2">
                <div className="w-full md:grid grid-cols-12 gap-8 hidden">
                  <div className="rounded-lg border border-customLightGray p-6 pb-4 col-span-12 md:col-span-6">
                    <div className="flex gap-6 md:gap-0 md:space-x-6 items-center pb-6">
                      <div className="relative ml-4">
                        <NetworkSticker chainId={chainId} />
                        <TokenIcon token={stakingToken} chainId={chainId} imageSize="w-12 h-12" />
                      </div>
                      <div>
                        <div className="flex md:mb-2">
                          <h2 className="text-primaryLight leading-5 text-base">Your Staked Balance</h2>
                          <InfoIconWithTooltip
                            classExtras="mt-0 ml-1 md:ml-2 p-0"
                            id="1"
                            title="Staked Balance"
                            content={`This is the balance of ${metadata.symbol} that you have staked.`}
                          />
                        </div>
                        <p className="text-primary text-2xl leading-6">
                          <Erc20.BalanceOf
                            chainId={chainId}
                            account={account}
                            address={stakingAddress}
                            render={({ balance, status }) => (<>{status === "success" ? balance?.formatted : "-"}</>)}
                          />
                          {` ${metadata.symbol}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-customLightGray p-6 pb-4 col-span-12 md:col-span-6">
                    <div className="flex gap-6 md:gap-0 md:space-x-6 items-center pb-6">
                      <div className="relative ml-4">
                        <NetworkSticker chainId={chainId} />
                        <TokenIcon token={stakingToken} chainId={chainId} imageSize="w-12 h-12" />
                      </div>
                      <div>
                        <div className="flex md:mb-2">
                          <h2 className="text-primaryLight leading-5 text-base">Your Staking Rewards</h2>
                          <InfoIconWithTooltip
                            classExtras="mt-0 ml-1 md:ml-2 p-0"
                            id="2"
                            title="Your Staking Rewards"
                            content={`Staking rewards are received for staking tokens. Rewards may be claimed under the rewards page. Whenever rewards are claimed, 10% is transferred immediately to your wallet, and the rest is streamed and claimable over the next 1 year.`}
                          />
                        </div>
                        <p className="text-primary text-2xl leading-6">
                          <Staking.ClaimableBalanceOf chainId={chainId} account={account} address={stakingAddress} /> POP
                        </p>
                      </div>
                    </div>
                    <Link href={`/rewards`} passHref target="_self">
                      <div className="border-t border-customLightGray pt-2 px-1">
                        <SecondaryActionButton label="Claim Page" />
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="md:hidden">
                  <MobileCardSlider>
                    <div className="px-1">
                      <div className="rounded-lg border border-customLightGray p-6 col-span-12 md:col-span-6">
                        <div className="flex gap-6 md:gap-0 md:space-x-6">
                          <div className="relative ml-4">
                            <NetworkSticker chainId={chainId} />
                            <TokenIcon token={stakingToken} chainId={chainId} />
                          </div>
                          <div className="pb-6">
                            <div className="flex">
                              <h2 className="text-primaryLight leading-5 text-base">Your Staked Balance</h2>
                              <InfoIconWithTooltip
                                classExtras="mt-0 ml-1 md:ml-2 md:mb-2 p-0"
                                id="1"
                                title="Staked Balance"
                                content={`This is the balance of ${metadata.symbol} that you have staked.`}
                              />
                            </div>
                            <p className="text-primary text-2xl">
                              <Erc20.BalanceOf chainId={chainId} account={account} address={stakingAddress} />
                              {metadata.symbol}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-1">
                      <div className="rounded-lg border border-customLightGray p-6 col-span-12 md:col-span-6">
                        <div className="flex gap-6 md:gap-0 md:space-x-6">
                          <div className="relative ml-4">
                            <NetworkSticker chainId={chainId} />
                            <TokenIcon token={stakingToken} chainId={chainId} />
                          </div>
                          <div className="pb-6">
                            <div className="flex">
                              <h2 className="text-primaryLight leading-5 text-base">Your Staking Rewards</h2>
                              <InfoIconWithTooltip
                                classExtras="mt-0 ml-1 md:ml-2 md:mb-2 p-0"
                                id="2"
                                title="Your Staking Rewards"
                                content={`Staking rewards are received for staking tokens. Rewards may be claimed under the rewards page. Whenever rewards are claimed, 10% is transferred immediately to your wallet, and the rest is streamed and claimable over the next 1 year.`}
                              />
                            </div>
                            <p className="text-primary text-2xl">
                              <Staking.ClaimableBalanceOf chainId={chainId} account={account} address={stakingAddress} />
                              POP
                            </p>
                          </div>
                        </div>
                        <Link href={`/rewards`} passHref target="_self">
                          <div className="border-t border-customLightGray pt-2 px-1">
                            <SecondaryActionButton label="Claim Page" />
                          </div>
                        </Link>
                      </div>
                    </div>
                  </MobileCardSlider>
                </div>

                <div className="bg-customLightYellow rounded-lg p-8 pb-6 hidden md:flex flex-col justify-between mt-8">
                  <h2 className="text-6xl leading-11">{/* removed text for now - @am */}</h2>
                  <div className="flex justify-end mt-28">
                    <img src="/images/hands.svg" alt="" className="h-28 w-28" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </Metadata>
    </NoSSR>
  );
}
