import type { BigNumberWithFormatted } from "lib/types"

import { useAllVaults } from "hooks/vaults"
import { ChainId, formatNumber } from "lib/utils"
import { usePrice } from "lib/Price"
import useVaultTokenAddress from "hooks/useVaultTokenAddress"
import { useTotalAssets } from "./hooks"
import { SUPPORTED_NETWORKS } from "components/SweetVault/SweetVaults"

const DIRTY_TVL_STORE: Record<string, number> = {}

function AllSweetVaultsTVL({
  render,
}: {
  render?: (tvl: number) => JSX.Element
}) {
  const { data: ethVaults = [] } = useAllVaults(
    SUPPORTED_NETWORKS.includes(ChainId.Ethereum) ? ChainId.Ethereum : undefined
  )
  const { data: polyVaults = [] } = useAllVaults(
    SUPPORTED_NETWORKS.includes(ChainId.Polygon) ? ChainId.Polygon : undefined
  )
  const { data: ftmVaults = [] } = useAllVaults(
    SUPPORTED_NETWORKS.includes(ChainId.Fantom) ? ChainId.Fantom : undefined
  )
  const { data: opVaults = [] } = useAllVaults(
    SUPPORTED_NETWORKS.includes(ChainId.Optimism) ? ChainId.Optimism : undefined
  )

  const ALL_VAULTS = [
    ...ethVaults.map((vault) => {
      return { address: vault, chainId: ChainId.Ethereum }
    }),
    ...polyVaults.map((vault) => {
      return { address: vault, chainId: ChainId.Polygon }
    }),
    ...ftmVaults.map((vault) => {
      return { address: vault, chainId: ChainId.Fantom }
    }),
    ...opVaults.map((vault) => {
      return { address: vault, chainId: ChainId.Optimism }
    }),
  ]

  const allTVL = Object.keys(DIRTY_TVL_STORE).reduce((tvl, vaultAddy) => {
    return tvl + DIRTY_TVL_STORE[vaultAddy]
  }, 0)

  return (
    <>
      {ALL_VAULTS.map(({ address, chainId }) => {
        return (
          <ProxyTVL
            vaultAddress={address}
            chainId={chainId}
            key={`tvl-for-${address}`}
          >
            {(tvl) => {
              DIRTY_TVL_STORE[address] = tvl || 0
              return null
            }}
          </ProxyTVL>
        )
      })}
      {render ? render(allTVL) : formatNumber(allTVL)}
    </>
  )
}

function ProxyTVL({
  vaultAddress,
  chainId,
  children,
}: {
  vaultAddress
  chainId
  children: (n: number) => JSX.Element
}) {
  const { data: vaultTokenAddr } = useVaultTokenAddress(vaultAddress, chainId)

  const { data: yearnPrice } = usePrice({
    address: vaultAddress,
    chainId,
  })

  const { data: tokenPrice } = usePrice({
    address: vaultTokenAddr,
    chainId,
  })

  const { data: totalAssets } = useTotalAssets({
    address: vaultAddress,
    chainId,
  })

  const price: BigNumberWithFormatted & { decimals?: number } =
    yearnPrice?.value.gt(0) ? yearnPrice : tokenPrice

  return children(
    (Number((price?.formatted as any) || 0) * Number(totalAssets?.value || 0)) /
      10 ** (price?.decimals || 18)
  )
}

export default AllSweetVaultsTVL
