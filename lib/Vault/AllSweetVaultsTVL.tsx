import type { BigNumberWithFormatted } from "lib/types"

import { formatNumber } from "lib/utils"
import { usePrice } from "lib/Price"
import useVaultTokenAddress from "hooks/useVaultTokenAddress"
import { useAllSweetVaults, useTotalAssets } from "./hooks"

const DIRTY_TVL_STORE: Record<string, number> = {}

function AllSweetVaultsTVL({
  render,
}: {
  render?: (tvl: number) => JSX.Element
}) {
  const allSweetVaults = useAllSweetVaults()
  const allTVL = Object.keys(DIRTY_TVL_STORE).reduce((tvl, vaultAddy) => {
    return tvl + DIRTY_TVL_STORE[vaultAddy]
  }, 0)

  return (
    <>
      {allSweetVaults.map(({ address, chainId }) => {
        return (
          <SweetVaultTVL
            vaultAddress={address}
            chainId={chainId}
            key={`tvl-for-${address}`}
          >
            {(tvl) => {
              DIRTY_TVL_STORE[address] = tvl || 0
              return null
            }}
          </SweetVaultTVL>
        )
      })}
      {render ? render(allTVL) : `$ ${formatNumber(allTVL)}`}
    </>
  )
}

export function SweetVaultTVL({
  vaultAddress,
  chainId,
  children,
}: {
  vaultAddress
  chainId
  children: (n: number) => JSX.Element
}) {
  const { data: vaultTokenAddr } = useVaultTokenAddress(vaultAddress, chainId)

  const { data: vaultPrice } = usePrice({
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
    vaultPrice?.value.gt(0) ? vaultPrice : tokenPrice

  return children(
    (Number((price?.formatted as any) || 0) * Number(totalAssets?.value || 0)) /
    10 ** (price?.decimals || 18)
  )
}

export default AllSweetVaultsTVL
