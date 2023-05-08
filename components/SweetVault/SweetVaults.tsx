import { useState } from "react";
import { useAccount } from "wagmi";
import NoSSR from "react-no-ssr";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import SweetVault from "./SweetVault";
import HeroSection from "../HeroSection";
import { ChainId } from "../../lib/utils/connectors";
import AllSweetVaultsTVL from "../../lib/Vault/AllSweetVaultsTVL";
import AllSweetVaultDeposits from "lib/Vault/AllSweetVautDeposits";

export const SUPPORTED_NETWORKS = [
  ChainId.ALL,
  ChainId.Ethereum,
  ChainId.Polygon,
  ChainId.Optimism,
  ChainId.Arbitrum,
  // ChainId.Fantom,
  ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [ChainId.Hardhat] : [])
]

export default function SweetVaults({
  vaults,
  selectNetwork,
  deployer,
}: {
  vaults
  selectNetwork
  deployer?: string
}) {
  const { address: account } = useAccount()
  const [searchString, handleSearch] = useState("")

  return (
    <NoSSR>
      <HeroSection
        title="Sweet Vaults"
        description="Deposit your crypto to optimize your yield while funding public goods."
        info1={{ title: "TVL", value: <AllSweetVaultsTVL /> }}
        info2={{
          title: "Deposits",
          value: <AllSweetVaultDeposits account={account} />,
        }}
        backgroundColorTailwind="bg-red-400"
        SUPPORTED_NETWORKS={SUPPORTED_NETWORKS}
        selectNetwork={selectNetwork}
        stripeColor="#FFA0B4"
        stripeColorMobile="white"
      />
      <section className="mt-8 mb-10 md:px-8">
        <div className="w-full md:w-96 flex px-5 py-1 items-center rounded-lg border border-customLightGray">
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
      <section className="flex flex-col gap-8 md:px-8">
        {vaults.map((vault) => {
          return (
            <SweetVault
              key={`sv-${vault.address}-${vault.chainId}`}
              chainId={vault.chainId}
              vaultAddress={vault.address}
              searchString={searchString}
              deployer={deployer}
            />
          )
        })}
      </section>
    </NoSSR>
  )
}
