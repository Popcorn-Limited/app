

import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils.js";

export const idle = async (address, chainId, rpc): Promise<{ value: BigNumber; decimals: number }> => {
  const cdo = new Contract(tranches[address].cdo, ["function getApr(address) view returns (uint256)"], rpc);
  const apr = await cdo.getApr(tranches[address].tranch)

  const apr2apy = (apr) => {
    return (1 + (Number(apr) / 1e20) / 365) ** 365 - 1;
  }

  return { value: parseUnits(String(apr2apy(apr))), decimals: 18 }
};

const tranches = {
  "0x30D6a7B8c985d5dd7B9823d3B6Ae2726c8FFf81F": { cdo: "0x5dca0b3ed7594a6613c1a2acd367d56e1f74f92d", tranch: "0x43eD68703006add5F99ce36b5182392362369C1c" }, // dai senior
  "0x6cE9c05E159F8C4910490D8e8F7a63e95E6CEcAF": { cdo: "0x5dca0b3ed7594a6613c1a2acd367d56e1f74f92d", tranch: "0x38d36353d07cfb92650822d9c31fb4ada1c73d6e" }, // dai junior
  "0xcdc3CbF94114406a0b59aDA090807838369ced2b": { cdo: "0x1329E8DB9Ed7a44726572D44729427F132Fa290D", tranch: "0x9CAcd44cfDf22731bc99FaCf3531C809d56BD4A2" }, // usdc senior
  "0x52Aef3ea0D3F93766D255A1bb0aA7F1C4885E622": { cdo: "0x1329E8DB9Ed7a44726572D44729427F132Fa290D", tranch: "0xf85Fd280B301c0A6232d515001dA8B6c8503D714" }, // usdc junior
  "0x11E10B12e8DbF7aE44EE50873c09e5C7c3e01385": { cdo: "0xc4574C60a455655864aB80fa7638561A756C5E61", tranch: "0x0a6f2449C09769950cFb76f905Ad11c341541f70" }, // usdt senior
  "0x3D04Aade5388962C9A4f83B636a3a8ED63ea5b4D": { cdo: "0xc4574C60a455655864aB80fa7638561A756C5E61", tranch: "0x3Eb6318b8D9f362a0e1D99F6032eDB1C4c602500" }, // usdt junior

}
