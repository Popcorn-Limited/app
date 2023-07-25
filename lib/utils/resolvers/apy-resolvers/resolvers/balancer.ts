import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils.js";
import getAuraPools from "lib/utils/external/aura/getAuraPool"

export async function balancer(address, chainId, rpc): Promise<{ value: BigNumber; decimals: number }> {
  const vault = new Contract(address, ["function asset() external view returns (address)"], rpc);
  const asset = await vault.asset();

  const pools = await getAuraPools(chainId)
  const pool = pools.find(pool => pool.lpToken.address.toLowerCase() === asset.toLowerCase())

  if (pool === undefined) return { value: parseUnits("0"), decimals: 18 };

  const balApy = pool.aprs.breakdown.find(breakdown => breakdown.name === 'BAL')
  const feeApy = pool.aprs.breakdown.find(breakdown => breakdown.name === 'Swap fees')

  return { value: parseUnits(String((balApy?.value || 0) + (feeApy?.value || 0) / 100)), decimals: 18 };

}