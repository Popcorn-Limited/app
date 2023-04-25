

import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils.js";

export const ousd = async (address, chainId, rpc): Promise<{ value: BigNumber; decimals: number }> => {
  const apyRes = await (await fetch("https://analytics.ousd.com/api/v1/apr/trailing/30")).json();

  return { value: parseUnits(String(apyRes.apy)), decimals: 18 };
};
