// @ts-ignore
import NoSSR from "react-no-ssr";
import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import useNetworkFilter from "@/lib/useNetworkFilter";
import getVaultNetworth from "@/lib/vault/getVaultNetworth";
import useVaultTvl from "@/lib/useVaultTvl";
import { getVaultsByChain } from "@/lib/vault/getVault";
import { VaultData } from "@/lib/types";
import SweetVault from "@/components/vault/SweetVault";
import NetworkFilter from "@/components/network/NetworkFilter";

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
      <section className="md:py-10 md:border-b border-[#EFECDD] md:flex md:flex-row items-center justify-between">

        <div className="bg-[#FA5A6E] rounded-lg h-64 w-full p-6 mb-10 flex md:hidden justify-end items-end ">
          <svg xmlns="http://www.w3.org/2000/svg" width="132" height="132" viewBox="0 0 132 132" fill="none">
            <path d="M99 0C80.7757 0 66 14.7758 66 33C66 14.7758 51.2243 0 33 0C14.7758 0 0 14.7758 0 33V66C0 102.451 29.5487 132 66 132C47.7758 132 33 117.224 33 99H49.5C40.3865 99 33 91.6135 33 82.5C33 73.3865 40.3865 66 49.5 66C58.6135 66 66 73.3865 66 82.5C66 73.3865 73.3865 66 82.5 66C91.6135 66 99 73.3865 99 82.5C99 91.6135 91.6135 99 82.5 99H99C99 117.224 84.2243 132 66 132C102.451 132 132 102.451 132 66V33C132 14.7758 117.224 0 99 0ZM66 82.5C66 91.6135 58.6135 99 49.5 99H82.5C73.3865 99 66 91.6135 66 82.5Z" fill="#961423" />
          </svg>
        </div>

        <div className="">
          <h1 className="text-5xl md:text-6xl font-normal m-0 leading-[38px] md:leading-11 mb-4 md:mb-8">
            Sweet Vaults
          </h1>
          <p className="text-base text-primaryDark">
            Add liquidity to earn stablecoin rewards <br className="hidden md:block" />
            and be a part at creating social impact.
          </p>

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

        <div className="bg-[#FA5A6E] rounded-lg h-64 w-112 p-6 hidden md:flex justify-end items-end ">
          <svg xmlns="http://www.w3.org/2000/svg" width="132" height="132" viewBox="0 0 132 132" fill="none">
            <path d="M99 0C80.7757 0 66 14.7758 66 33C66 14.7758 51.2243 0 33 0C14.7758 0 0 14.7758 0 33V66C0 102.451 29.5487 132 66 132C47.7758 132 33 117.224 33 99H49.5C40.3865 99 33 91.6135 33 82.5C33 73.3865 40.3865 66 49.5 66C58.6135 66 66 73.3865 66 82.5C66 73.3865 73.3865 66 82.5 66C91.6135 66 99 73.3865 99 82.5C99 91.6135 91.6135 99 82.5 99H99C99 117.224 84.2243 132 66 132C102.451 132 132 102.451 132 66V33C132 14.7758 117.224 0 99 0ZM66 82.5C66 91.6135 58.6135 99 49.5 99H82.5C73.3865 99 66 91.6135 66 82.5Z" fill="#961423" />
          </svg>
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
            <SweetVault
              key={`sv-${vault.address}-${vault.chainId}`}
              vaultData={vault}
              searchString={searchString}
              deployer={"0x22f5413C075Ccd56D575A54763831C4c27A37Bdb"}
            />
          )
        })
          : <p>Loading Vaults...</p>
        }
      </section>
    </NoSSR>
  )
};

export default Vaults;
