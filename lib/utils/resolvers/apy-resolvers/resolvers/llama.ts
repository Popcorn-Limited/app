

import { BigNumber } from "ethers";

export const llama = async (address, chainId, rpc): Promise<{ value: BigNumber; decimals: number }> => {
  const pools = await (await fetch("https://yields.llama.fi/pools")).json();
  const pool = pools.data.find(pool => pool.pool === poolIds[address]);

  // 10 ** 16 cause we need divide it by 100 first.
  return { value: BigNumber.from(String(Number(pool.apyBase) * (10 ** 16))), decimals: 18 };
};

const poolIds = {
  "0xc1D4a319dD7C44e332Bd54c724433C6067FeDd0D": "fa4d7ee4-0001-4133-9e8d-cf7d5d194a91",
  "0x5d344226578DC100b2001DA251A4b154df58194f": "ed227286-abb0-4a34-ada5-39f7ebd81afb"
}
