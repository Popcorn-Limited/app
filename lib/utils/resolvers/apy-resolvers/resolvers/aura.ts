import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils.js";
import getAuraPools from "lib/utils/external/aura/getAuraPool"

export async function aura(address, chainId, rpc): Promise<{ value: BigNumber; decimals: number }> {
  const vault = new Contract(address, ["function asset() external view returns (address)"], rpc);
  const asset = await vault.asset();

  const pools = await getAuraPools(chainId)
  const pool = pools.find(pool => pool.lpToken.address.toLowerCase() === asset.toLowerCase())

  return { value: parseUnits(String(pool === undefined ? 0 : (pool.aprs.total / 100))), decimals: 18 };
}