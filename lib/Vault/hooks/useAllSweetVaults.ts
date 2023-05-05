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

  return ALL_VAULTS
}
