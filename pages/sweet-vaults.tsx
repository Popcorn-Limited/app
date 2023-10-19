import type { NextPage } from "next";
import useNetworkFilter from "hooks/useNetworkFilter";
import { useAllVaults } from "hooks/vaults";
import { ChainId, SUPPORTED_NETWORKS } from "lib/utils";
import { useAccount } from "wagmi";
import AllSweetVaultsTVL from "lib/Vault/AllSweetVaultsTVL";
import AllSweetVaultDeposits from "lib/Vault/AllSweetVautDeposits";
import NoSSR from "react-no-ssr";
import { getVeAddresses } from "lib/utils/addresses";
import useGauges from "lib/Gauges/useGauges";
import NetworkFilter from "components/NetworkFilter";
import { useState } from "react";
import SweetVault from "components/SweetVault";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Title from "components/content/Title";


export const HIDDEN_VAULTS = ["0xb6cED1C0e5d26B815c3881038B88C829f39CE949", "0x2fD2C18f79F93eF299B20B681Ab2a61f5F28A6fF",
  "0xDFf04Efb38465369fd1A2E8B40C364c22FfEA340", "0xd4D442AC311d918272911691021E6073F620eb07", //@dev for some reason the live 3Crypto yVault isnt picked up by the yearnAdapter nor the yearnFactoryAdapter
  "0x8bd3D95Ec173380AD546a4Bd936B9e8eCb642de1", // Sample Stargate Vault
  "0xcBb5A4a829bC086d062e4af8Eba69138aa61d567", // yOhmFrax factory
  "0x9E237F8A3319b47934468e0b74F0D5219a967aB8", // yABoosted Balancer
  "0x860b717B360378E44A241b23d8e8e171E0120fF0", // R/Dai 
]

const {
  GaugeController: GAUGE_CONTROLLER,
  POP: POP,
  WETH: WETH
} = getVeAddresses();

const PopSweetVaults: NextPage = () => {
  const { address: account } = useAccount();
  const [selectedNetworks, selectNetwork] = useNetworkFilter(SUPPORTED_NETWORKS);

  const [searchString, handleSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState([])

  const { data: ethVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Ethereum) ? ChainId.Ethereum : undefined);
  const { data: polyVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Polygon) ? ChainId.Polygon : undefined);
  const { data: ftmVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Fantom) ? ChainId.Fantom : undefined);
  const { data: opVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Optimism) ? ChainId.Optimism : undefined);
  const { data: arbVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Arbitrum) ? ChainId.Arbitrum : undefined);
  const { data: bscVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.BNB) ? ChainId.BNB : undefined);

  const { data: gauges = [] } = useGauges({ address: GAUGE_CONTROLLER, chainId: 1 })

  const allVaults = [
    // ...ethVaults.map(vault => { return { address: vault, chainId: ChainId.Ethereum } }),
    // ...polyVaults.map(vault => { return { address: vault, chainId: ChainId.Polygon } }),
    // ...ftmVaults.map(vault => { return { address: vault, chainId: ChainId.Fantom } }),
    // ...opVaults.map(vault => { return { address: vault, chainId: ChainId.Optimism } }),
    // ...arbVaults.map(vault => { return { address: vault, chainId: ChainId.Arbitrum } }),
    // ...bscVaults.map(vault => { return { address: vault, chainId: ChainId.BNB } }),
    ...gauges.map(gauge => { return { address: gauge.vault, chainId: ChainId.Goerli, gauge: gauge.address } })
  ]

  return (
    <NoSSR>
      <section className="lg:py-10 md:px-8 lg:border-b border-[#F0EEE0] w-full flex flex-row flex-wrap items-center justify-between">
        <div className="md:w-2/3 mt-10">
          <h1 className="text-5xl lg:text-6xl font-normal m-0 leading-[44px] lg:leading-12">
            Smart Vaults
          </h1>
          <p className="text-base text-primaryDark mt-4">
            Add liquidity into vaults for dive most competitive returns across DeFi.
          </p>

          <div className="w-full flex flex-wrap items-center mt-8">
            <div className="w-full md:w-1/4 md:mr-6">
              <p className="leading-6 text-base text-primaryDark">TVL</p>
              <div className="text-3xl font-bold whitespace-nowrap">
                <AllSweetVaultsTVL />
              </div>
            </div>

            <div className="w-full md:w-1/4 md:ml-6">
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
            <a href={`https://app.balancer.fi/#/ethereum/pool/0xd5a44704befd1cfcca67f7bc498a7654cc092959000200000000000000000609`} className="text-blue-500" target="_blank" rel="noreferrer">BalancerPool</a>
          </div>

          <NetworkFilter supportedNetworks={SUPPORTED_NETWORKS} selectNetwork={selectNetwork} />
        </div>
      </section>

      <section>
        <div className="w-full flex flex-wrap items-center md:px-8 md:pt-12 pb-4">
          <div className="md:w-4/12 md:-ml-8 xl:pr-16 md:mr-8">
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
          <div className="hidden md:block w-2/12 text-start">
            <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
              Your Wallet
            </Title>
          </div>
          <div className="hidden md:block w-2/12 text-start">
            <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
              Your Deposit
            </Title>
          </div>
          <div className="hidden md:block w-2/12 text-start">
            <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
              TVL
            </Title>
          </div>
          <div className="hidden md:block w-2/12 text-start">
            <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
              vAPR
            </Title>
          </div>
          <div className={`hidden sm:block ml-10 h-5 w-5 flex-shrink-0`}></div>
        </div>

        <div className="space-y-4">
          {allVaults.filter(vault => !HIDDEN_VAULTS.includes(vault.address)).map((vault) => {
            return (
              <SweetVault
                key={`sv-${vault.address}-${vault.chainId}`}
                chainId={vault.chainId}
                vaultAddress={vault.address}
                searchString={searchString}
                selectedTags={[]}
                deployer={"0x22f5413C075Ccd56D575A54763831C4c27A37Bdb"}
                gaugeAddress={vault.gauge}
              />
            )
          })}
        </div>
      </section>

    </NoSSR>
  )
};

export default PopSweetVaults;
