import { useState } from "react";
import { useAccount } from "wagmi";
import NoSSR from "react-no-ssr";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import SweetVault from "./SweetVault";
import { ChainId } from "../../lib/utils/connectors";
import AllSweetVaultsTVL from "../../lib/Vault/AllSweetVaultsTVL";
import AllSweetVaultDeposits from "lib/Vault/AllSweetVautDeposits";
import NetworkFilter from "components/NetworkFilter";
import { getVeAddresses } from "lib/utils/addresses";
import Title from "components/content/Title";

export const SUPPORTED_NETWORKS = [
  ChainId.ALL,
  ChainId.Ethereum,
  ChainId.Polygon,
  ChainId.Optimism,
  ChainId.Arbitrum,
  // ChainId.BNB,
  // ChainId.Fantom,
  ChainId.Goerli
]

export default function SweetVaults({
  vaults,
  selectNetwork,
  tags,
  deployer,
}: {
  vaults
  selectNetwork,
  tags: string[]
  deployer?: string
}) {
  const { address: account } = useAccount()
  const [searchString, handleSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState(tags)

  const {
    POP: POP,
    WETH: WETH,
  } = getVeAddresses();

  return (
    <NoSSR>
      <section className="lg:py-10 px-8 lg:border-b border-[#F0EEE0] w-full flex flex-row flex-wrap items-center justify-between">

        <div className="md:w-2/3 mt-10">
          <h1 className="text-5xl lg:text-6xl font-normal m-0 leading-[44px] lg:leading-12">
            Smart Vaults
          </h1>
          <p className="text-base text-primaryDark mt-4">
            Add liquidity into vaults for dive most competitive returns across DeFi.
          </p>

          <div className="flex flex-row items-center mt-8">
            <div className="w-1/4 mr-6">
              <p className="leading-6 text-base text-primaryDark">TVL</p>
              <div className="text-3xl font-bold whitespace-nowrap">
                <AllSweetVaultsTVL />
              </div>
            </div>

            <div className="w-1/4 ml-6">
              <p className="leading-6 text-base text-primaryDark">Deposits</p>
              <div className="text-3xl font-bold whitespace-nowrap">
                <AllSweetVaultDeposits account={account} />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/3">

          <div className="bg-customLightYellow text-black rounded-md p-4 mb-8">
            Mint the token needed for testing on Goerli here: <br />
            <a href={`https://goerli.ediverscan.io/address/${POP}#writeCondivact`} className="text-blue-500" target="_blank" rel="noreferrer">POP</a> <br />
            <a href={`https://goerli.ediverscan.io/address/${WETH}#writeCondivact`} className="text-blue-500" target="_blank" rel="noreferrer">WETH</a> <br />
            <a href={`https://app.balancer.fi/#/goerli/pool/0x1050f901a307e7e71471ca3d12dfcea01d0a0a1c0002000000000000000008b4`} className="text-blue-500" target="_blank" rel="noreferrer">BalancerPool</a>
          </div>

          <NetworkFilter supportedNetworks={SUPPORTED_NETWORKS} selectNetwork={selectNetwork} />
        </div>

      </section>

      <section className="">
        <div className="w-full flex flex-row items-center px-8 pt-12 pb-4">
          <div className="w-4/12 -ml-8 xl:pr-16 mr-8">
            <div className="flex px-5 py-1 items-center rounded-lg border border-customLightGray">
              <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
              <input
                className="w-10/12 focus:outline-none border-0 text-gray-500 leading-none mt-1"
                type="text"
                placeholder="Search..."
                onChange={(e) => handleSearch(e.target.value.toLowerCase())}
                defaultValue={searchString}
              />
            </div>
          </div>
          <div className="w-2/12 text-start">
            <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
              Your Wallet
            </Title>
          </div>
          <div className="w-2/12 text-start">
            <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
              Your Deposit
            </Title>
          </div>
          <div className="w-2/12 text-start">
            <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
              TVL
            </Title>
          </div>
          <div className="w-2/12 text-start">
            <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
              vAPR
            </Title>
          </div>
          <div className={`hidden sm:block ml-10 h-5 w-5 flex-shrink-0`}></div>
        </div>

        <div className="space-y-4">
          {vaults.map((vault) => {
            return (
              <SweetVault
                key={`sv-${vault.address}-${vault.chainId}`}
                chainId={vault.chainId}
                vaultAddress={vault.address}
                searchString={searchString}
                selectedTags={selectedTags.length === tags.length ? [] : selectedTags}
                deployer={deployer}
                gaugeAddress={vault.gauge}
              />
            )
          })}
        </div>
      </section>
    </NoSSR >
  )
}
