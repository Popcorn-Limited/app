import type { NextPage } from "next";
import SweetVaults, { SUPPORTED_NETWORKS } from "components/SweetVault/SweetVaults";
import useNetworkFilter from "hooks/useNetworkFilter";
import { useAllVaults } from "hooks/vaults";
import { ChainId } from "lib/utils";



const PopSweetVaults: NextPage = () => {
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

  return <SweetVaults vaults={allVaults} selectNetwork={selectNetwork} />
};

export default PopSweetVaults;
