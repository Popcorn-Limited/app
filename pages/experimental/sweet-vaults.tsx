import type { NextPage } from "next";
import SweetVaults, { SUPPORTED_NETWORKS } from "components/SweetVault/SweetVaults";
import useNetworkFilter from "hooks/useNetworkFilter";
import { useAllVaults } from "hooks/vaults";
import { ChainId } from "lib/utils";
import { HIDDEN_VAULTS } from "pages/sweet-vaults";
import AllSweetVaultsTVL from "lib/Vault/AllSweetVaultsTVL";
import AllSweetVaultDeposits from "lib/Vault/AllSweetVautDeposits";
import { useAccount } from "wagmi";
import NoSSR from "react-no-ssr";


const PopSweetVaults: NextPage = () => {
  const { address: account } = useAccount();
  const [selectedNetworks, selectNetwork] = useNetworkFilter(SUPPORTED_NETWORKS);

  const { data: ethVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Ethereum) ? ChainId.Ethereum : undefined);
  const { data: polyVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Polygon) ? ChainId.Polygon : undefined);
  const { data: ftmVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Fantom) ? ChainId.Fantom : undefined);
  const { data: opVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Optimism) ? ChainId.Optimism : undefined);
  const { data: arbVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Arbitrum) ? ChainId.Arbitrum : undefined);
  const { data: bscVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.BNB) ? ChainId.BNB : undefined);

  const allVaults = [
    ...ethVaults.map(vault => { return { address: vault, chainId: ChainId.Ethereum } }),
    ...polyVaults.map(vault => { return { address: vault, chainId: ChainId.Polygon } }),
    ...ftmVaults.map(vault => { return { address: vault, chainId: ChainId.Fantom } }),
    ...opVaults.map(vault => { return { address: vault, chainId: ChainId.Optimism } }),
    ...arbVaults.map(vault => { return { address: vault, chainId: ChainId.Arbitrum } }),
    ...bscVaults.map(vault => { return { address: vault, chainId: ChainId.BNB } })
  ]

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
            Experimental Sweet Vaults
          </h1>
          <p className="text-base text-primaryDark">
            Vaults created by Popcorn and the community
          </p>

          <div className="flex flex-row items-center mt-8">
            <div className="w-1/2">
              <p className="leading-6 text-base text-primaryDark">TVL</p>
              <div className="text-3xl font-bold whitespace-nowrap">
                <AllSweetVaultsTVL />
              </div>
            </div>

            <div className="w-1/2">
              <p className="leading-6 text-base text-primaryDark">Deposits</p>
              <div className="text-3xl font-bold whitespace-nowrap">
                <AllSweetVaultDeposits account={account} />
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

      <SweetVaults
        vaults={allVaults.filter(vault => !HIDDEN_VAULTS.includes(vault.address))}
        selectNetwork={selectNetwork}
        tags={[]}
      />
    </NoSSR>
  )
};

export default PopSweetVaults;
