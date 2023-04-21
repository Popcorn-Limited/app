import { Fragment, useEffect, useState } from "react"
import { Address, useAccount, useToken } from "wagmi"
import { BigNumber, constants } from "ethers"

import { BalanceOf } from "lib/Erc20"
import useVaultToken from "hooks/useVaultToken"

import { ChainId, formatAndRoundBigNumber } from "lib/utils"
import Title from "components/content/Title"
import { Apy } from "lib/Staking"
import MarkdownRenderer from "./MarkdownRenderer"
import AnimatedChevron from "./AnimatedChevron"
import DepositWithdraw from "./DepositWithdraw"

import useVaultMetadata from "lib/Vault/hooks/useVaultMetadata"
import { FetchTokenResult } from "wagmi/dist/actions"
import { NetworkSticker } from "components/NetworkSticker"
import { useBalanceOf, useTotalSupply } from "lib/Erc20/hooks"
import { usePrice } from "lib/Price"
import { parseUnits } from "ethers/lib/utils.js"
import { useTotalAssets } from "lib/Vault/hooks"
import { formatNumber } from "lib/utils/formatBigNumber"
import { InfoIconWithTooltip } from "components/InfoIconWithTooltip"
import RightArrowIcon from "components/SVGIcons/RightArrowIcon"
import Accordion from "../Accordion"
import TokenIcon from "components/TokenIcon"

const HUNDRED = constants.Zero.add(100)

const VAULT_APY_RESOLVER = {
  Beefy: "beefy",
  Yearn: "yearnAsset",
}

function AssetWithName({
  vault,
  token,
  chainId,
  protocol,
}: {
  vault: FetchTokenResult
  token: FetchTokenResult
  chainId: ChainId
  protocol: string
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <NetworkSticker chainId={chainId} />
        <TokenIcon
          token={token?.address}
          chainId={chainId}
          imageSize="w-8 h-8"
        />
      </div>
      <Title level={2} as="span" className="text-gray-900 mt-1">
        {token?.name}
      </Title>
      <div className="bg-red-500 bg-opacity-[15%] py-1 px-3 text-gray-800 rounded-md">
        {protocol}
      </div>
    </div>
  )
}

function SweetVault({
  vaultAddress,
  chainId,
  searchString,
  addToTVL,
  addToDeposit,
}: {
  chainId: ChainId
  vaultAddress: string
  searchString: string
  addToTVL: (key: string, value: BigNumber) => void
  addToDeposit: (key: string, value: BigNumber) => void
}) {
  const { address: account } = useAccount()
  const { data: vault } = useToken({
    address: vaultAddress as Address,
    chainId,
  })
  const { data: token } = useVaultToken(vaultAddress, chainId)
  const vaultMetadata = useVaultMetadata(vaultAddress, chainId)
  const usesStaking =
    vaultMetadata?.staking?.toLowerCase() !==
    constants.AddressZero.toLowerCase()

  const { data: vaultBalance } = useBalanceOf({
    address: vaultAddress as Address,
    chainId,
    account,
  })
  const { data: stakedBalance } = useBalanceOf({
    address: vaultMetadata?.staking as Address,
    chainId,
    account,
  })
  const balance = usesStaking ? stakedBalance : vaultBalance

  const { data: price } = usePrice({
    address: token?.address as Address,
    chainId,
  })
  const { data: totalAssets } = useTotalAssets({
    address: vaultAddress as Address,
    chainId,
    account,
  })
  const { data: totalSupply } = useTotalSupply({
    address: vaultAddress as Address,
    chainId,
    account,
  })
  const [pps, setPps] = useState<number>(0)

  useEffect(() => {
    if (
      totalAssets &&
      totalSupply &&
      price &&
      Number(totalAssets?.value?.toString()) > 0 &&
      Number(totalSupply?.value?.toString()) > 0
    ) {
      setPps(
        Number(totalAssets?.value?.toString()) /
          Number(totalSupply?.value?.toString())
      )
    }
  }, [balance, totalAssets, totalSupply, price])

  useEffect(() => {
    if (price && balance && pps > 0) {
      const assetBal = pps * Number(balance?.value?.toString())
      const depositValue =
        (Number(price?.value?.toString()) * assetBal) /
        10 ** (token?.decimals * 2)

      addToDeposit(
        vaultAddress,
        parseUnits(depositValue < 0.01 ? "0" : String(depositValue))
      )
    }
  }, [balance, price, pps])

  useEffect(() => {
    if (totalAssets && price) {
      const tvlValue =
        (Number(price?.value?.toString()) *
          Number(totalAssets?.value?.toString())) /
        10 ** (token?.decimals * 2)

      addToTVL(
        vaultAddress,
        parseUnits(tvlValue < 0.01 ? "0" : String(tvlValue))
      )
    }
  }, [totalAssets, price])

  // TEMP - filter duplicate vault
  if (
    !vaultMetadata ||
    vault?.address === "0xcf0D91fB9Bc81ac605D2F1962a72Fac8901F57bE"
  ) {
    return null
  }

  if (
    searchString === "" ||
    vault?.name.toLowerCase().includes(searchString) ||
    vault?.symbol.toLowerCase().includes(searchString)
  ) {
    const METADATA =
      vaultMetadata?.metadata || ({} as typeof vaultMetadata["metadata"])
    const TOKEN_NAME = (
      METADATA.token?.name ||
      token?.name ||
      "ETH"
    ).toUpperCase()

    const TOKEN_DESCRIPTION =
      METADATA.token?.description ||
      `No description found. [Search in CoinMarketCap](https://coinmarketcap.com/community/search/latest/?q=${encodeURI(
        token?.symbol
      )})`
    const PROTOCOL_DESCRIPTION = METADATA.protocol?.description || "Popcorn"
    const ADAPTER_DESCRIPTION = METADATA.protocol?.description || "N/A"
    const STRATEGIES = vaultMetadata?.metadata?.strategy?.description || "N/A"

    return (
      <Accordion
        header={
          <Fragment>
            <nav className="flex items-center justify-between mb-8 select-none">
              <AssetWithName
                vault={vault}
                token={token}
                chainId={chainId}
                protocol={vaultMetadata?.metadata?.protocol?.name}
              />
              <AnimatedChevron className="hidden md:flex" />
            </nav>
            <div className="flex flex-row flex-wrap items-center mt-0 md:mt-6 justify-between">
              <div className="w-1/2 md:w-1/4 mt-6 md:mt-0">
                <p className="text-primaryLight font-normal">Your Wallet</p>
                <p className="text-primary text-2xl md:text-3xl leading-6 md:leading-8">
                  <Title
                    level={2}
                    fontWeight="font-normal"
                    as="span"
                    className="mr-1 text-primary"
                  >
                    <BalanceOf
                      account={account}
                      chainId={chainId}
                      address={token?.address}
                      render={(data) => (
                        <>
                          {account
                            ? formatAndRoundBigNumber(
                                data?.balance?.value,
                                token?.decimals
                              )
                            : "-"}
                        </>
                      )}
                    />
                  </Title>
                  <span className="text-secondaryLight text-lg md:text-2xl flex md:inline">
                    {token?.symbol || "ETH"}
                  </span>
                </p>
              </div>
              <div className="w-1/2 md:w-1/4 mt-6 md:mt-0">
                <p className="text-primaryLight font-normal">Your Deposit</p>
                <div className="text-primary text-2xl md:text-3xl leading-6 md:leading-8">
                  <Title
                    level={2}
                    fontWeight="font-normal"
                    as="span"
                    className="mr-1 text-primary"
                  >
                    {account
                      ? formatNumber(
                          (pps * Number(balance?.value?.toString())) /
                            10 ** token?.decimals
                        )
                      : "-"}
                  </Title>
                  <span className="text-secondaryLight text-lg md:text-2xl flex md:inline">
                    {token?.symbol || "ETH"}
                  </span>
                </div>
              </div>
              <div className="w-1/2 md:w-1/4 mt-6 md:mt-0">
                <p className="font-normal text-primaryLight">vAPR</p>
                <Title as="td" level={2} fontWeight="font-normal">
                  <Apy
                    address={vaultAddress}
                    chainId={chainId}
                    resolver={
                      VAULT_APY_RESOLVER[
                        vaultMetadata?.metadata?.protocol?.name
                      ]
                    }
                    render={(apy) => {
                      return (
                        <Apy
                          address={vaultMetadata.staking}
                          resolver={"multiRewardStaking"}
                          render={(stakingApy) => (
                            <section className="flex items-center gap-1 text-primary">
                              {formatAndRoundBigNumber(
                                HUNDRED.mul(
                                  (apy?.data?.value || constants.Zero).add(
                                    stakingApy?.data?.value || constants.Zero
                                  ) || constants.Zero
                                ),
                                18
                              )}{" "}
                              %
                              <InfoIconWithTooltip
                                title="APR Breakdown"
                                content={
                                  <ul className="text-sm">
                                    <li>
                                      Staking APR:{" "}
                                      {formatAndRoundBigNumber(
                                        HUNDRED.mul(
                                          stakingApy?.data?.value ||
                                            constants.Zero
                                        ),
                                        18
                                      )}
                                      %
                                    </li>
                                    <li>
                                      Vault APR:{" "}
                                      {formatAndRoundBigNumber(
                                        HUNDRED.mul(
                                          apy?.data?.value || constants.Zero
                                        ),
                                        18
                                      )}
                                      %
                                    </li>
                                  </ul>
                                }
                              />
                            </section>
                          )}
                          chainId={chainId}
                        />
                      )
                    }}
                  />
                </Title>
              </div>

              <div className="w-1/2 md:w-1/4 mt-6 md:mt-0">
                <p className="leading-6 text-primaryLight">TVL</p>
                <Title
                  as="td"
                  level={2}
                  fontWeight="font-normal"
                  className="text-primary"
                >
                  ${" "}
                  {formatNumber(
                    (Number(price?.value?.toString()) *
                      Number(totalAssets?.value?.toString())) /
                      10 ** (token?.decimals * 2)
                  )}
                </Title>
              </div>
            </div>
          </Fragment>
        }
      >
        <div className="flex flex-col md:flex-row mt-8 gap-8">
          <div className="flex flex-col w-full md:w-4/12 gap-8">
            <section className="bg-white flex-grow rounded-lg border border-customLightGray w-full p-6">
              <DepositWithdraw
                chainId={chainId}
                vault={vaultAddress}
                asset={token?.address}
                staking={vaultMetadata?.staking}
                getTokenUrl={vaultMetadata?.metadata?.getTokenUrl}
                pps={pps}
              />
            </section>
          </div>
          <div className="md:hidden flex w-full">
            <Accordion
              initiallyOpen={false}
              containerClassName="w-full bg-white p-6"
              header={
                <Fragment>
                  <div className="w-full flex flex-row justify-between">
                    <p className="font-normal text-customBrown">Learn</p>
                    <div className="flex self-center">
                      <RightArrowIcon color="827D69" />
                    </div>
                  </div>
                </Fragment>
              }
            >
              <section className="bg-white rounded-lg w-full md:w-8/12 mt-6">
                <div className="flex flex-row items-center">
                  <TokenIcon
                    token={token?.address}
                    chainId={chainId}
                    imageSize="w-8 h-8"
                  />
                  <Title
                    level={2}
                    as="span"
                    className="text-gray-900 mt-1.5 ml-3"
                  >
                    {token?.name}
                  </Title>
                </div>
                <div className="mt-8">
                  <MarkdownRenderer
                    content={`# ${TOKEN_NAME} \n${TOKEN_DESCRIPTION}`}
                  />
                </div>
                <div className="mt-8">
                  <MarkdownRenderer
                    content={`# Protocol Adapter \n${PROTOCOL_DESCRIPTION}`}
                  />
                </div>
                <div className="mt-8">
                  <MarkdownRenderer content={`# Strategy \n${STRATEGIES}`} />
                </div>
              </section>
            </Accordion>
          </div>
          <section className="bg-white rounded-lg border border-customLightGray w-full md:w-8/12 p-6 md:p-8 hidden md:flex flex-col">
            <div className="flex flex-row items-center">
              <TokenIcon
                token={token?.address}
                chainId={chainId}
                imageSize="w-8 h-8"
              />
              <Title level={2} as="span" className="text-gray-900 mt-1.5 ml-3">
                {token?.name}
              </Title>
            </div>
            <div className="mt-8">
              <MarkdownRenderer
                content={`# ${TOKEN_NAME} \n${TOKEN_DESCRIPTION}`}
              />
            </div>
            <div className="mt-8">
              <MarkdownRenderer
                content={`# Protocol Adapter \n${ADAPTER_DESCRIPTION}`}
              />
            </div>
            <div className="mt-8">
              <MarkdownRenderer content={`# Strategies \n${STRATEGIES}`} />
            </div>
          </section>
        </div>
      </Accordion>
    )
  }

  return null
}

export default SweetVault
