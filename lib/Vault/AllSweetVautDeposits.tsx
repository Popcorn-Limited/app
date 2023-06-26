import type { BigNumberWithFormatted } from "lib/types"
import { constants } from "ethers"

import { formatNumber } from "lib/utils"
import useVaultTokenAddress from "hooks/useVaultTokenAddress"
import useVaultMetadata from "./hooks/useVaultMetadata"
import { useBalanceOf, useTotalSupply } from "lib/Erc20/hooks"
import { usePrice } from "lib/Price"
import { useTotalAssets, useAllSweetVaults } from "./hooks"
import { useEffect, useState } from "react"
import useVaultToken from "hooks/useVaultToken"

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
  const { data: token } = useVaultToken(vaultAddress, chainId);

  const { data: price } = usePrice({
    address: token?.address,
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

  const { data: balance } = useBalanceOf({
    address: vaultAddress,
    chainId,
    account,
  })

  const [value, setValue] = useState<number>(0);

  useEffect(() => {
    if (balance && totalAssets && totalSupply && price
      && Number(totalAssets?.value?.toString()) > 0 && Number(totalSupply?.value?.toString()) > 0) {
      const pps = Number(totalAssets?.value?.toString()) / Number(totalSupply?.value?.toString())
      const bal = (pps * Number(balance?.value?.toString())) / (10 ** (token?.decimals))
      setValue(bal);
    }
  }, [balance, totalAssets, totalSupply, price])

  return children(value)
}

export default AllSweetVaultDeposits
