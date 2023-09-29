import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import SweetVault from "./SweetVault";
import { Vault } from "@/lib/vault/getVault";
import { ChainId, SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import NetworkFilter from "../network/NetworkFilter";
import { Address } from "viem";

export default function SweetVaults({
  vaults,
  selectNetwork,
  deployer,
}: {
  vaults: Vault[]
  selectNetwork: (chainId: ChainId) => void,
  deployer?: Address
}) {
  const [searchString, handleSearch] = useState("");

  return (
    <>
      <section className="mt-8 mb-10 md:flex flex-row items-center justify-between">
        <NetworkFilter supportedNetworks={SUPPORTED_NETWORKS.map(chain => chain.id)} selectNetwork={selectNetwork} />
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
              vaultData={vault}
              searchString={searchString}
              deployer={deployer}
            />
          )
        })}
      </section>
    </>
  )
}
