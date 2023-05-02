

import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils.js";

export const ousd = async (address, chainId, rpc): Promise<{ value: BigNumber; decimals: number }> => {
  const apyRes = await (await fetch("https://analytics.ousd.com/api/v1/apr/trailing/30")).json();
  
  // 10 ** 16 cause we need divide it by 100 first.
  return { value: BigNumber.from(String(Number(apyRes.apy) * (10 ** 16))), decimals: 18 };
};
