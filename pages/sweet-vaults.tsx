import type { NextPage } from "next";
import SweetVaults, { SUPPORTED_NETWORKS } from "components/SweetVault/SweetVaults";
import useNetworkFilter from "hooks/useNetworkFilter";
import { useAllVaults } from "hooks/vaults";
import { ChainId } from "lib/utils";


const HIDDEN_VAULTS = ["0xb6cED1C0e5d26B815c3881038B88C829f39CE949", "0x2fD2C18f79F93eF299B20B681Ab2a61f5F28A6fF",
  "0xC2241a5B22Af50b2bb4C4960C23Ed1c8DB7f4D6c" // Dola / USDC LP
  , "0xc8C88fdF2802733f8c4cd7c0bE0557fdC5d2471c" // OUSD
]

const PopSweetVaults: NextPage = () => {
  const [selectedNetworks, selectNetwork] = useNetworkFilter(SUPPORTED_NETWORKS);

  const { data: ethVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Ethereum) ? ChainId.Ethereum : undefined);
  const { data: polyVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Polygon) ? ChainId.Polygon : undefined);
  const { data: ftmVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Fantom) ? ChainId.Fantom : undefined);
  const { data: opVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Optimism) ? ChainId.Optimism : undefined);
  const { data: arbVaults = [] } = useAllVaults(selectedNetworks.includes(ChainId.Arbitrum) ? ChainId.Arbitrum : undefined);

  const allVaults = [
    ...ethVaults.map(vault => { return { address: vault, chainId: ChainId.Ethereum } }),
    ...polyVaults.map(vault => { return { address: vault, chainId: ChainId.Polygon } }),
    ...ftmVaults.map(vault => { return { address: vault, chainId: ChainId.Fantom } }),
    ...opVaults.map(vault => { return { address: vault, chainId: ChainId.Optimism } }),
    ...arbVaults.map(vault => { return { address: vault, chainId: ChainId.Arbitrum } })
  ]



  return <SweetVaults vaults={allVaults.filter(vault => !HIDDEN_VAULTS.includes(vault.address))} selectNetwork={selectNetwork} deployer="0x22f5413C075Ccd56D575A54763831C4c27A37Bdb" />
};

export default PopSweetVaults;
