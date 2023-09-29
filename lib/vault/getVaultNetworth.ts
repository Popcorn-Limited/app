import axios from "axios";
import { Address, usePublicClient } from "wagmi";
import { ChainId, networkMap } from "@/lib/utils/connectors";
import { ERC20Abi, PopByChain, PopStakingByChain, VaultAbi } from "@/lib/constants";
import getVaultAddresses from "@/lib/vault/getVaultAddresses";
import { getAssetAndValueByVaults } from "@/lib/vault/getAssetAndAssetsPerShare";
import { PublicClient } from "viem";

// TODO -- update this with learnings from `getNetworth`

function prepareContract(address: Address) {
  const vaultContract = {
    address,
    abi: VaultAbi
  }
  return [{
    ...vaultContract,
    functionName: 'asset'
  },
  {
    ...vaultContract,
    functionName: 'totalAssets'
  },
  {
    ...vaultContract,
    functionName: 'totalSupply'
  },
  {
    ...vaultContract,
    functionName: 'balanceOf'
  }]
}


export async function getVaultNetworthByChain({ client }: { client: PublicClient }): Promise<number> {
  const chainId = client.chain?.id as number
  const vaultAddresses = await getVaultAddresses({ client })

  const balances = await client.multicall({
    contracts: vaultAddresses.map((address) => prepareContract(address)).flat()
  })

  const assetAndValues = await getAssetAndValueByVaults({ addresses: vaultAddresses, client })
  const { data } = await axios.get(`https://coins.llama.fi/prices/current/${String(assetAndValues.map(entry => `${networkMap[chainId].toLowerCase()}:${entry.asset},`))}`)
  const vaultPrices = assetAndValues.map(entry => Number(data.coins[`${networkMap[chainId].toLowerCase()}:${entry.asset}`].price || 0) * entry.assetsPerShare)

  return vaultPrices.map((price, i) => Number(balances[i + 2].result) * price).reduce((a, b) => a + b, 0)
}

export default async function getVaultNetworth(): Promise<{ [key: number]: number, total: number }> {
  const ethereumNetworth = await getVaultNetworthByChain({ client: usePublicClient({ chainId: ChainId.Ethereum }) })
  const polygonNetworth = await getVaultNetworthByChain({ client: usePublicClient({ chainId: ChainId.Polygon }) })
  const optimismNetworth = await getVaultNetworthByChain({ client: usePublicClient({ chainId: ChainId.Optimism }) })
  const arbitrumNetworth = await getVaultNetworthByChain({ client: usePublicClient({ chainId: ChainId.Arbitrum }) })

  return {
    [ChainId.Ethereum]: ethereumNetworth,
    [ChainId.Polygon]: polygonNetworth,
    [ChainId.Optimism]: optimismNetworth,
    [ChainId.Arbitrum]: arbitrumNetworth,
    total: ethereumNetworth + polygonNetworth + optimismNetworth + arbitrumNetworth
  }
}