// @ts-ignore
import NoSSR from "react-no-ssr";
import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import getVaultNetworth from "@/lib/vault/getVaultNetworth";
import { getVaultsByChain } from "@/lib/vault/getVault";
import { Token, VaultData } from "@/lib/types";
import SmartVault from "@/components/vault/SmartVault";
import NetworkFilter from "@/components/network/NetworkFilter";
import useVaultTvl from "@/lib/vault/useVaultTvl";
import useNetworkFilter from "@/lib/utils/useNetworkFilter";
import getZapAssets from "@/lib/utils/getZapAssets";

export const HIDDEN_VAULTS = ["0xb6cED1C0e5d26B815c3881038B88C829f39CE949", "0x2fD2C18f79F93eF299B20B681Ab2a61f5F28A6fF",
  "0xDFf04Efb38465369fd1A2E8B40C364c22FfEA340", "0xd4D442AC311d918272911691021E6073F620eb07", //@dev for some reason the live 3Crypto yVault isnt picked up by the yearnAdapter nor the yearnFactoryAdapter
  "0x8bd3D95Ec173380AD546a4Bd936B9e8eCb642de1", // Sample Stargate Vault
  "0xcBb5A4a829bC086d062e4af8Eba69138aa61d567", // yOhmFrax factory
  "0x9E237F8A3319b47934468e0b74F0D5219a967aB8", // yABoosted Balancer
  "0x860b717B360378E44A241b23d8e8e171E0120fF0", // R/Dai 
]

const Vaults: NextPage = () => {
  const { address: account } = useAccount();

  const [initalLoad, setInitalLoad] = useState<boolean>(false);
  const [accountLoad, setAccountLoad] = useState<boolean>(false);

  const [selectedNetworks, selectNetwork] = useNetworkFilter(SUPPORTED_NETWORKS.map(network => network.id));
  const [vaults, setVaults] = useState<VaultData[]>([]);
  const [zapAssets, setZapAssets] = useState<Token[]>([]);

  const vaultTvl = useVaultTvl();

  const [searchString, handleSearch] = useState("");

  useEffect(() => {
    async function getVaults() {
      setInitalLoad(true)
      if (account) setAccountLoad(true)
      const fetchedVaults = await Promise.all(
        SUPPORTED_NETWORKS.map(async (chain) => getVaultsByChain({ chain, account }))
      );
      setVaults(fetchedVaults.flat());

      const fetchedZapAssets = await Promise.all(
        SUPPORTED_NETWORKS.map(async (chain) => getZapAssets({ chain, account }))
      );
      setZapAssets(fetchedZapAssets.flat());
    }
    if (!account && !initalLoad) getVaults();
    if (account && !accountLoad) getVaults()
  }, [account])

  const [networth, setNetworth] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);


  useEffect(() => {
    if (account && loading)
      // fetch and set networth
      getVaultNetworth({ account }).then(res => {
        setNetworth(res.total);
        setLoading(false);
      });
  }, [account]);

  return (
    <NoSSR>
      <section className="md:pb-10 md:border-b border-[#EFECDD] md:flex md:flex-row items-center justify-between">

        <div className="w-full md:w-10/12">
          <h1 className="text-5xl md:text-3xl font-normal m-0 mb-4 md:mb-2 leading-0">
            Smart Vaults
          </h1>
          <p className="text-base text-primaryDark">
            Automate your returns in single-asset deposit yield strategies.
          </p>
        </div>

        <div className="w-full md:w-2/12">
          <div className="flex flex-row items-center mt-8">
            <div className="w-1/2">
              <p className="leading-6 text-base text-primaryDark">TVL</p>
              <div className="text-3xl font-bold whitespace-nowrap">
                {`$${NumberFormatter.format(vaultTvl)}`}
              </div>
            </div>

            <div className="w-1/2">
              <p className="leading-6 text-base text-primaryDark">Deposits</p>
              <div className="text-3xl font-bold whitespace-nowrap">
                {`$${loading ? "..." : NumberFormatter.format(networth)}`}
              </div>
            </div>
          </div>
        </div>
      </section>

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
        {vaults.length > 0 ? vaults.filter(vault => selectedNetworks.includes(vault.chainId)).filter(vault => !HIDDEN_VAULTS.includes(vault.address)).map((vault) => {
          return (
            <SmartVault
              key={`sv-${vault.address}-${vault.chainId}`}
              vaultData={vault}
              searchString={searchString}
              zapAssets={zapAssets}
              deployer={"0x22f5413C075Ccd56D575A54763831C4c27A37Bdb"}
            />
          )
        })
          : <p>Loading Vaults...</p>
        }
      </section>
    </NoSSR >
  )
};

export default Vaults;
