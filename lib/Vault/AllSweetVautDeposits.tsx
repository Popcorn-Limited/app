import type { BigNumberWithFormatted } from "lib/types"
import { constants } from "ethers"

import { formatNumber } from "lib/utils"
import useVaultTokenAddress from "hooks/useVaultTokenAddress"
import useVaultMetadata from "./hooks/useVaultMetadata"
import { useBalanceOf, useTotalSupply } from "lib/Erc20/hooks"
import { usePrice } from "lib/Price"
import { useTotalAssets, useAllSweetVaults } from "./hooks"

const DIRTY_STORE: Record<string, number> = {}

function AllSweetVaultDeposits({
  account,
  render,
}: {
  account: string
  render?: (tvl: number) => JSX.Element
}) {
  const allSweetVaults = useAllSweetVaults()
  const allDeposits = Object.keys(DIRTY_STORE).reduce((tvl, vaultAddy) => {
    return tvl + DIRTY_STORE[vaultAddy]
  }, 0)

  return (
    <>
      {allSweetVaults.map(({ address, chainId }) => {
        return (
          <AccountDeposits
            account={account}
            vaultAddress={address}
            chainId={chainId}
            key={`tvl-for-${address}`}
          >
            {(deposits) => {
              DIRTY_STORE[address] = deposits || 0
              return null
            }}
          </AccountDeposits>
        )
      })}
      {render ? render(allDeposits) : `$ ${formatNumber(allDeposits)}`}
    </>
  )
}

export function AccountDeposits({
  account,
  vaultAddress,
  forceTokenPrice,
  chainId,
  children,
}: {
  vaultAddress
  chainId
  forceTokenPrice?: number
  account: string
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

  const { data: totalSupply } = useTotalSupply({
    address: vaultAddress,
    chainId,
  })

  const vaultMetadata = useVaultMetadata(vaultAddress, chainId)

  const isStaking =
    vaultMetadata?.staking?.toLowerCase() !==
    constants.AddressZero.toLowerCase()

  const { data: vaultBalance } = useBalanceOf({
    address: vaultAddress,
    chainId,
    account,
  })
  const { data: stakedBalance } = useBalanceOf({
    address: vaultMetadata?.staking,
    chainId,
    account,
  })

  const depositBalance = isStaking ? stakedBalance : vaultBalance

  const price: BigNumberWithFormatted & { decimals?: number } =
    vaultPrice?.value.gt(0) ? vaultPrice : tokenPrice

  const pricePerShare = Number(
    totalAssets?.value?.gt(0)
      ? (totalAssets.value._hex as any) /
          ((totalSupply?.value._hex as any) || 0)
      : 0
  )

  const pricedDeposits =
    pricePerShare * ((depositBalance as any)?.value?._hex || 0)

  const parsedTokenPrice =
    forceTokenPrice || Number((price?.formatted as any) || 0)

  return children(
    (parsedTokenPrice * pricedDeposits) / 10 ** (price?.decimals || 18)
  )
}

export default AllSweetVaultDeposits
