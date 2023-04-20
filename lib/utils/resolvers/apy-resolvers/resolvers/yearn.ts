import { BigNumber } from "ethers";
import { apy } from "lib/Yearn";

export const yearn = async (address, chainId, rpc): Promise<{ value: BigNumber; decimals: number }> => {
  return apy({ address, chainId, rpc });
};
