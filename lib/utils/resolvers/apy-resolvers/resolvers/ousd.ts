

import { BigNumber } from "ethers";



const ADDRESS_TO_SYMBOL = { "0xc8C88fdF2802733f8c4cd7c0bE0557fdC5d2471c": "ousd", "0x95Ca391fB08F612Dc6b0CbDdcb6708C21d5A8295": "oeth" }

export const ousd = async (address, chainId, rpc): Promise<{ value: BigNumber; decimals: number }> => {
  const apyRes = await (await fetch(`https://analytics.ousd.com/api/v2/${ADDRESS_TO_SYMBOL[address]}/apr/trailing/30`)).json();

  // 10 ** 16 cause we need divide it by 100 first.
  return { value: BigNumber.from(String(Number(apyRes.apy) * (10 ** 16))), decimals: 18 };
};
