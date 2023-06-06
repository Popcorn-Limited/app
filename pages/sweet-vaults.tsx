import type { NextPage } from "next";
import SweetVaults, { SUPPORTED_NETWORKS } from "components/SweetVault/SweetVaults";
import useNetworkFilter from "hooks/useNetworkFilter";
import { useAllVaults } from "hooks/vaults";
import { ChainId } from "lib/utils";
import { Contract, ethers } from "ethers";


const HIDDEN_VAULTS = ["0xb6cED1C0e5d26B815c3881038B88C829f39CE949", "0x2fD2C18f79F93eF299B20B681Ab2a61f5F28A6fF",
 "0xDFf04Efb38465369fd1A2E8B40C364c22FfEA340","0xd4D442AC311d918272911691021E6073F620eb07", //@dev for some reason the live 3Crypto yVault isnt picked up by the yearnAdapter nor the yearnFactoryAdapter
  "0xF1649eC625Aca15831237D29cd09F3c71a5cca63", // ystEth factory
  "0xcBb5A4a829bC086d062e4af8Eba69138aa61d567", // yOhmFrax factory
  "0x759281a408A48bfe2029D259c23D7E848A7EA1bC", // stYCrv
  "0x9E237F8A3319b47934468e0b74F0D5219a967aB8", // yABoosted Balancer
]



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

  return <SweetVaults vaults={allVaults.filter(vault => !HIDDEN_VAULTS.includes(vault.address))} selectNetwork={selectNetwork} deployer="0x22f5413C075Ccd56D575A54763831C4c27A37Bdb" />
};

export default PopSweetVaults;
