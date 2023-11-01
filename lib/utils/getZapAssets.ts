import { Token } from "@/lib/types";
import assets from "@/lib/constants/assets";
import { Address, Chain } from "viem";

const symbolsToInclude = ["DAI", "USDC", "USDT", "LUSD"]//, "WETH", "WBTC"]

export default async function getZapAssets({ chain, account }: { chain: Chain, account?: Address }): Promise<Token[]> {
  return assets.filter(asset => asset.chains.includes(chain.id)).filter(asset => symbolsToInclude.includes(asset.symbol)).map(asset => {
    return {
      address: asset.address[String(chain.id)],
      name: asset.name,
      symbol: asset.symbol,
      decimals: asset.decimals,
      logoURI: asset.logoURI,
      balance: 10,
      price: 1
    }
  })
}