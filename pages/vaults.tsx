// @ts-ignore
import NoSSR from "react-no-ssr";
import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { Address, useAccount, useBalance, usePublicClient, useWalletClient } from "wagmi";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import useNetworkFilter from "@/lib/useNetworkFilter";
import useVaultTvl from "@/lib/useVaultTvl";
import { Token, VaultData } from "@/lib/types";
import SmartVault from "@/components/vault/SmartVault";
import NetworkFilter from "@/components/network/NetworkFilter";
import MainActionButton from "@/components/button/MainActionButton";
import getGaugeRewards, { GaugeRewards } from "@/lib/gauges/getGaugeRewards";
import { getVeAddresses } from "@/lib/utils/addresses";
import { claimOPop } from "@/lib/oPop/interactions";
import { WalletClient } from "viem";
import getZapAssets, { getAvailableZapAssets } from "@/lib/utils/getZapAssets";
import { ERC20Abi, VaultAbi } from "@/lib/constants";
import { getVaultNetworthByChain } from "@/lib/getNetworth";
import { useAtom } from "jotai";
import { vaultsAtom } from "@/lib/atoms/vaults";
import VaultsSorting, { VAULT_SORTING_TYPE } from "@/components/vault/VaultsSorting";

const FLAGSHIP_VAULTS = [
  // eth
  "0x6cE9c05E159F8C4910490D8e8F7a63e95E6CEcAF", // DAI IdleJunior
  "0x52Aef3ea0D3F93766D255A1bb0aA7F1C4885E622", // USDC IdleJunior
  "0x3D04Aade5388962C9A4f83B636a3a8ED63ea5b4D", // USDT IdleJunior
  "0xdC266B3D2c62Ce094ff4E12DC52399c430283417", // pCVX Pirex
  "0x6B2c5ef7FB59e6A1Ad79a4dB65234fb7bDDcaD6b", // oETH-LP Beefy
  "0xD211486ed1A04A176E588b67dd3A30a7dE164C0B", // WETH-AURA Beefy
  "0xA3cd112fFb1E3A358EF270a07F5901FF0fD1CD0f", // MIM Yearn
  "0xe1489Af32c45c51f94Acdb3F36B7032A82F6f55D", // WETH Sommelier
  "0x759281a408A48bfe2029D259c23D7E848A7EA1bC", // yCRV Yearn
  // op
  "0x5Df527eb4cE7dE09f8e966F9bbc9bc4Edbc7f458", // USDT IdleSenior
  "0x78C44B3A63b94d2EFc98c2Cc9701F9BEE1b6a56A", // USDT IdleJunior
  "0x5372c5AF5f078f2d4B5dbBE4377b2f0225f2863A", // USDC IdleSenior
  "0x4E564bC61Cf97737cE110c7929b17963E9232aE9", // USDC IdleJunior
  "0x400a838eeA2ec6Daf6fA30d7Bc60505f0CecCec1", // wstETH/WETH Beefy
  "0x5D45accb18A88895aCac95F13a2882C273E22e3A", // USDC/VELO Beefy
  "0x740dc6c1eA74BbbadCCA0aB6253319e200c421a5", // STG/USDC Beefy
  "0x48b2Bc0C40F4483EC982408F06Dc0E1e111D966b", // USDC/DOLA Beefy
  "0x1F01c6bFDE973be1573AbFC1B6b1dFb1D8F22A86", // wstETH/OP Beefy
  "0x0825bb2F6Ce26af1652584F1Da9e55e54015904A", // OP/USDC Beefy
  // arb
  "0x54d921B6397731222aB0b898bAE58c948d187Cd1", // StakedGlp Beefy
  "0x1225354B00372c531e1c39ECe1cec548358926bb", // pGMX Pirex
]

const { oVCX } = getVeAddresses();

const NETWORKS_SUPPORTING_ZAP = [1, 137, 10, 42161, 56]

export interface MutateTokenBalanceProps {
  inputToken: Address;
  outputToken: Address;
  vault: Address;
  chainId: number;
  account: Address;
}

const Vaults: NextPage = () => {
  const { address: account } = useAccount();
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const [initalLoad, setInitalLoad] = useState<boolean>(false);
  const [accountLoad, setAccountLoad] = useState<boolean>(false);

  const [selectedNetworks, selectNetwork] = useNetworkFilter(SUPPORTED_NETWORKS.map(network => network.id));

  const [vaults, setVaults] = useAtom(vaultsAtom)

  const [zapAssets, setZapAssets] = useState<{ [key: number]: Token[] }>({});
  const [availableZapAssets, setAvailableZapAssets] = useState<{ [key: number]: Address[] }>({})

  const vaultTvl = useVaultTvl();
  const [networth, setNetworth] = useState<number>(0);

  const [gaugeRewards, setGaugeRewards] = useState<GaugeRewards>()
  const { data: oBal } = useBalance({ chainId: 1, address: account, token: oVCX, watch: true })

  const [searchString, handleSearch] = useState("");
  const [sortingType, setSortingType] = useState(VAULT_SORTING_TYPE.none)

  useEffect(() => {
    async function getVaults() {
      setInitalLoad(true)
      if (account) setAccountLoad(true)
      // get zap assets
      const newZapAssets: { [key: number]: Token[] } = {}
      SUPPORTED_NETWORKS.forEach(async (chain) => newZapAssets[chain.id] = await getZapAssets({ chain, account }))
      setZapAssets(newZapAssets);

      // get available zapAddresses
      setAvailableZapAssets({
        1: await getAvailableZapAssets(1),
        137: await getAvailableZapAssets(137),
        10: await getAvailableZapAssets(10),
        42161: await getAvailableZapAssets(42161),
        56: await getAvailableZapAssets(56)
      })

      // get gauge rewards
      if (account) {
        const rewards = await getGaugeRewards({
          gauges: vaults.filter(vault => vault.gauge && vault.chainId === 1).map(vault => vault.gauge?.address) as Address[],
          account: account as Address,
          publicClient
        })
        setGaugeRewards(rewards)
      }
      setNetworth(SUPPORTED_NETWORKS.map(chain => getVaultNetworthByChain({ vaults, chainId: chain.id })).reduce((a, b) => a + b, 0));
    }
    if (!account && !initalLoad && vaults.length > 0) getVaults();
    if (account && !accountLoad && vaults.length > 0) getVaults()
  }, [account, initalLoad, accountLoad, vaults])


  async function mutateTokenBalance({ inputToken, outputToken, vault, chainId, account }: MutateTokenBalanceProps) {
    const data = await publicClient.multicall({
      contracts: [
        {
          address: inputToken,
          abi: ERC20Abi,
          functionName: "balanceOf",
          args: [account]
        },
        {
          address: outputToken,
          abi: ERC20Abi,
          functionName: "balanceOf",
          args: [account]
        },
        {
          address: vault,
          abi: VaultAbi,
          functionName: 'totalAssets'
        },
        {
          address: vault,
          abi: VaultAbi,
          functionName: 'totalSupply'
        }],
      allowFailure: false
    })

    // Modify zap assets
    if (NETWORKS_SUPPORTING_ZAP.includes(chainId)) {
      const zapAssetFound = zapAssets[chainId].find(asset => asset.address === inputToken || asset.address === outputToken) // @dev -- might need to copy the state here already to avoid modifing a pointer
      if (zapAssetFound) {
        zapAssetFound.balance = zapAssetFound.address === inputToken ? Number(data[0]) : Number(data[1])
        setZapAssets({ ...zapAssets, [chainId]: [...zapAssets[chainId], zapAssetFound] })
      }
    }

    // Modify vaults, assets and gauges
    const newVaultState: VaultData[] = [...vaults]
    newVaultState.forEach(vaultData => {
      if (vaultData.chainId === chainId) {
        // Modify vault pricing and tvl
        if (vaultData.address === vault) {
          const assetsPerShare = Number(data[3]) > 0 ? Number(data[2]) / Number(data[3]) : Number(1e-9)
          const pricePerShare = assetsPerShare * vaultData.assetPrice

          vaultData.totalAssets = Number(data[2])
          vaultData.totalSupply = Number(data[3])
          vaultData.assetsPerShare = assetsPerShare
          vaultData.pricePerShare = pricePerShare
          vaultData.tvl = (Number(data[3]) * pricePerShare) / (10 ** vaultData.asset.decimals)
          vaultData.vault.price = pricePerShare * 1e9

          if (vaultData.gauge) vaultData.gauge.price = pricePerShare * 1e9
        }
        // Adjust vault balance
        if (vaultData.vault.address === inputToken || vaultData.vault.address === outputToken) {
          vaultData.vault.balance = vaultData.vault.address === inputToken ? Number(data[0]) : Number(data[1])
        }
        // Adjust asset balance
        if (vaultData.asset.address === inputToken || vaultData.asset.address === outputToken) {
          vaultData.asset.balance = vaultData.asset.address === inputToken ? Number(data[0]) : Number(data[1])
        }
        // Adjust gauge balance
        if (vaultData.gauge?.address === inputToken || vaultData.gauge?.address === outputToken) {
          vaultData.gauge.balance = vaultData.gauge.address === inputToken ? Number(data[0]) : Number(data[1])
        }
      }
    })
    setVaults(newVaultState)
  }

  const sortByAscendingTvl = () => {
    const sortedVaults = [...vaults].sort((a, b) => b.tvl - a.tvl);
    setSortingType(VAULT_SORTING_TYPE.mostTvl)
    setVaults(sortedVaults)
  }

  const sortByDescendingTvl = () => {
    const sortedVaults = [...vaults].sort((a, b) => a.tvl - b.tvl);
    setSortingType(VAULT_SORTING_TYPE.lessTvl)
    setVaults(sortedVaults)
  }

  const sortByAscendingApy = () => {
    const sortedVaults = [...vaults].sort((a, b) => b.apy - a.apy);
    setSortingType(VAULT_SORTING_TYPE.mostvAPR)
    setVaults(sortedVaults)
  }

  const sortByDescendingApy = () => {
    const sortedVaults = [...vaults].sort((a, b) => a.apy - b.apy);
    setSortingType(VAULT_SORTING_TYPE.lessvAPR)
    setVaults(sortedVaults)
  }

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

        <div className="w-full md:w-8/12 md:divide-x md:flex md:flex-row space-y-4 md:space-y-0 mt-4 md:mt-0">
          <div className="flex flex-row items-center md:w-4/12">
            <div className="w-1/2">
              <p className="leading-6 text-base text-primaryDark">TVL</p>
              <div className="text-3xl font-bold whitespace-nowrap">
                {`$${NumberFormatter.format(vaultTvl)}`}
              </div>
            </div>

            <div className="w-1/2">
              <p className="leading-6 text-base text-primaryDark">Deposits</p>
              <div className="text-3xl font-bold whitespace-nowrap">
                {`$${NumberFormatter.format(networth)}`}
              </div>
            </div>
          </div>

          <div className="flex flex-row items-center md:w-8/12 md:pl-12">
            <div className="w-1/2 md:w-1/3">
              <p className="leading-6 text-base text-primaryDark">My oVCX</p>
              <div className="text-3xl font-bold whitespace-nowrap">
                {`${oBal ? NumberFormatter.format(Number(oBal?.value) / 1e18) : "0"}`}
              </div>
            </div>

            <div className="w-1/2 md:w-1/3">
              <p className="leading-6 text-base text-primaryDark">Claimable oVCX</p>
              <div className="text-3xl font-bold whitespace-nowrap">
                {`$${gaugeRewards ? NumberFormatter.format(Number(gaugeRewards?.total) / 1e18) : "0"}`}
              </div>
            </div>

            <div className="hidden md:block w-1/3">
              <MainActionButton
                label="Claim oVCX"
                handleClick={() =>
                  claimOPop({
                    gauges: gaugeRewards?.amounts?.filter(gauge => Number(gauge.amount) > 0).map(gauge => gauge.address) as Address[],
                    account: account as Address,
                    clients: { publicClient, walletClient: walletClient as WalletClient }
                  })}
              />
            </div>
          </div>
          <div className="md:hidden">
            <MainActionButton
              label="Claim oVCX"
              handleClick={() =>
                claimOPop({
                  gauges: gaugeRewards?.amounts?.filter(gauge => Number(gauge.amount) > 0).map(gauge => gauge.address) as Address[],
                  account: account as Address,
                  clients: { publicClient, walletClient: walletClient as WalletClient }
                })}
            />
          </div>
        </div>
      </section>

      <section className="mt-8 mb-10 md:mb-6 md:my-10 md:flex flex-row items-center justify-between">
        <NetworkFilter supportedNetworks={SUPPORTED_NETWORKS.map(chain => chain.id)} selectNetwork={selectNetwork} />
        <div className="flex gap-4 justify-between md:justify-end">
          <div className="md:w-96 flex px-6 py-3 items-center rounded-lg border border-customLightGray group/search hover:border-opacity-80 gap-2 md:mt-6 mt-12 mb-6 md:my-0">
            <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
            <input
              className="w-10/12 md:w-80 focus:outline-none border-0 text-gray-500"
              type="text"
              placeholder="Search..."
              onChange={(e) => handleSearch(e.target.value.toLowerCase())}
              defaultValue={searchString}
            />
          </div>
          <VaultsSorting className="md:mt-6 mt-12 mb-6 md:my-0" currentSortingType={sortingType} sortByLessTvl={sortByDescendingTvl} sortByMostTvl={sortByAscendingTvl} sortByLessApy={sortByDescendingApy} sortByMostApy={sortByAscendingApy} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        {(vaults.length > 0 && Object.keys(availableZapAssets).length > 0) ? vaults.filter(vault => selectedNetworks.includes(vault.chainId)).filter(vault => FLAGSHIP_VAULTS.includes(vault.address)).map((vault) => {
          return (
            <SmartVault
              key={`sv-${vault.address}-${vault.chainId}`}
              vaultData={vault}
              mutateTokenBalance={mutateTokenBalance}
              searchString={searchString}
              zapAssets={availableZapAssets[vault.chainId].includes(vault.asset.address) ? zapAssets[vault.chainId] : undefined}
              deployer={"0x22f5413C075Ccd56D575A54763831C4c27A37Bdb"}
            />
          )
        })
          : <p className="">Loading Vaults...</p>
        }
      </section>
    </NoSSR >
  )
};

export default Vaults;
