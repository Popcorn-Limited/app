import { useAllVaults } from "hooks/vaults"
import { ChainId } from "lib/utils"
import { SUPPORTED_NETWORKS } from "components/SweetVault/SweetVaults"

export const useAllSweetVaults = () => {
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
  const { data: arbVaults = [] } = useAllVaults(
    SUPPORTED_NETWORKS.includes(ChainId.Arbitrum) ? ChainId.Arbitrum : undefined
  )

  const ALL_VAULTS = [
    ...ethVaults.map((address) => ({
      address,
      chainId: ChainId.Ethereum,
    })),
    ...polyVaults.map((address) => ({
      address,
      chainId: ChainId.Polygon,
    })),
    ...ftmVaults.map((address) => ({
      address,
      chainId: ChainId.Fantom,
    })),
    ...opVaults.map((address) => ({
      address,
      chainId: ChainId.Optimism,
    })),
    ...arbVaults.map((address) => ({
      address,
      chainId: ChainId.Arbitrum,
    })),
  ]

  return ALL_VAULTS
}
