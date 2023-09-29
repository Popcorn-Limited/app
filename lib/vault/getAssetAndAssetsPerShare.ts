import { Address, PublicClient } from "viem"
import { VaultAbi } from "../constants"

type AssetAndValue = {
  vault: Address,
  asset: Address,
  assetsPerShare: number
}

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
  }]
}

function prepareResult({ vault, asset, totalAssets, totalSupply }: { vault: Address, asset: Address, totalAssets: number, totalSupply: number }): AssetAndValue {
  const assetsPerShare = totalSupply === 0 ? 0 : Number(totalAssets) / Number(totalSupply)

  return { vault, asset, assetsPerShare: assetsPerShare }
}

export async function getAssetAndValueByVaults({ addresses, client }: { addresses: Address[], client: PublicClient }): Promise<AssetAndValue[]> {
  const res = await client.multicall({ contracts: addresses.map(address => prepareContract(address)).flat() })
  return addresses.map((address, i) => {
    if (i > 0) i = i + 2
    return prepareResult({ vault: address, asset: res[i].result as Address, totalAssets: Number(res[i + 1].result), totalSupply: Number(res[i + 2].result) })
  })
}

export default async function getAssetAndValueByVault({ address, client }: { address: Address, client: PublicClient }): Promise<AssetAndValue> {
  const res = await client.multicall({ contracts: prepareContract(address) })
  return prepareResult({ vault: address, asset: res[0].result as Address, totalAssets: Number(res[1].result), totalSupply: Number(res[2].result) })
}