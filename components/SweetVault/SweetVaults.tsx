import { useState } from "react";
import { useAccount } from "wagmi";
import NoSSR from "react-no-ssr";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import SweetVault from "./SweetVault";
import { ChainId } from "../../lib/utils/connectors";
import AllSweetVaultsTVL from "../../lib/Vault/AllSweetVaultsTVL";
import AllSweetVaultDeposits from "lib/Vault/AllSweetVautDeposits";
import NetworkFilter from "components/NetworkFilter";

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

  return (
    <NoSSR>
      <section className="lg:py-10 lg:border-b border-[#F0EEE0] w-full flex flex-row flex-wrap items-center justify-between">
        <div className="md:w-2/3">
          <h1 className="text-5xl lg:text-6xl font-normal m-0 leading-[44px] lg:leading-12 mb-4 lg:mb-8">
            Sweet Vaults
          </h1>
          <p className="text-base text-primaryDark">
            Add liquidity to earn stablecoin rewards and be a part at creating social impact.
          </p>
          <div className="bg-customLightYellow text-black rounded-md w-1/2 p-4">
            Mint the token needed for testing on Goerli here: <br />
            <a href="https://goerli.etherscan.io/address/0xf46292650335BB8Fa56FAb05CcE227E50011Fb35#writeContract" className="text-blue-500">POP</a> <br/>
            <a href="https://goerli.etherscan.io/address/0xba383A6649a8C849fc9274181D7B077D2b84FA95#writeContract" className="text-blue-500">WETH</a>
          </div>
        </div>

        <div className="flex flex-row items-center mt-8 w-full md:w-1/3">
          <div className="w-1/2 md:w-1/3">
            <p className="leading-6 text-base text-primaryDark">TVL</p>
            <div className="text-3xl font-bold whitespace-nowrap">
              <AllSweetVaultsTVL />
            </div>
          </div>

          <div className="w-1/2 md:w-1/3">
            <p className="leading-6 text-base text-primaryDark">Deposits</p>
            <div className="text-3xl font-bold whitespace-nowrap">
              <AllSweetVaultDeposits account={account} />
            </div>
          </div>

          <div className="w-0 md:w-1/3">
          </div>

        </div>
      </section>

      <section className="mt-8 mb-10 md:flex flex-row items-center justify-between">
        <NetworkFilter supportedNetworks={SUPPORTED_NETWORKS} selectNetwork={selectNetwork} />
        <div className="md:w-96 flex px-5 py-1 items-center rounded-lg border border-customLightGray">
          <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
          <input
            className="w-10/12 md:w-80 focus:outline-none border-0 text-gray-500 leading-none mt-1"
            type="text"
            placeholder="Search..."
            onChange={(e) => handleSearch(e.target.value.toLowerCase())}
            defaultValue={searchString}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
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
      </section>
    </NoSSR>
  )
}
