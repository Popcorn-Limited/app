import type { NextPage } from "next";
import SweetVaults, { SUPPORTED_NETWORKS } from "components/SweetVault/SweetVaults";
import useNetworkFilter from "hooks/useNetworkFilter";
import { useAllVaults } from "hooks/vaults";
import { ChainId } from "lib/utils";
import { VaultTag } from "lib/Vault/hooks";



const PopSweetVaults: NextPage = () => {
  const [selectedNetworks, selectNetwork] = useNetworkFilter(SUPPORTED_NETWORKS);

  const { data: ethVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Ethereum) ? ChainId.Ethereum : undefined);
  const { data: polyVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Polygon) ? ChainId.Polygon : undefined);
  const { data: ftmVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Fantom) ? ChainId.Fantom : undefined);
  const { data: opVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Optimism) ? ChainId.Optimism : undefined);
  const { data: arbVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Arbitrum) ? ChainId.Arbitrum : undefined);
  const { data: bscVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.BNB) ? ChainId.BNB : undefined);
  //const { data: localVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Localhost) ? ChainId.Localhost : undefined);

  const allVaults = [
    ...ethVaults.map(vault => { return { address: vault, chainId: ChainId.Ethereum } }),
    ...polyVaults.map(vault => { return { address: vault, chainId: ChainId.Polygon } }),
    ...ftmVaults.map(vault => { return { address: vault, chainId: ChainId.Fantom } }),
    ...opVaults.map(vault => { return { address: vault, chainId: ChainId.Optimism } }),
    ...arbVaults.map(vault => { return { address: vault, chainId: ChainId.Arbitrum } }),
    ...bscVaults.map(vault => { return { address: vault, chainId: ChainId.BNB } }),
    //...localVaults.map(vault => { return { address: vault, chainId: ChainId.Localhost } }),
  ]

  return (
    <SweetVaults
      vaults={allVaults}
      selectNetwork={selectNetwork}
      tags={[VaultTag.deltaNeutral, VaultTag.lsd, VaultTag.degen, VaultTag.decentralized, VaultTag.wildcard]}
    />
  )
};

export default PopSweetVaults;
