import { networkMap } from "lib/utils";
import { BigNumber, constants } from "ethers";
import { PriceResolver } from "../types";
import { parseUnits } from "ethers/lib/utils.js";

const NO_DATA = ["0x6C5019D345Ec05004A7E7B0623A91a0D9B8D590d"]

const STATIC_PRICE = {
  "0x6c5019d345ec05004a7e7b0623a91a0d9b8d590d": { value: parseUnits("1990766"), decimals: 18 }
}

export const defi_llama: PriceResolver = async (address: string, chainId: number) => {
  if (!!NO_DATA.find(token => token.toLowerCase() === address.toLowerCase())) return STATIC_PRICE[address.toLowerCase()];

  const chainString = chainId === 1337 ? "ethereum" : networkMap[chainId].toLowerCase();
  const queryString = `${chainString}:${address}`;
  const url = `https://coins.llama.fi/prices/current/${queryString}`;
  const result = await fetch(url);
  const parsed = await result.json();
  const token = parsed.coins[`${chainString}:${address}`];

  return token?.price && token?.decimals
    ? {
      value: BigNumber.from(Number(token?.price * (10 ** token?.decimals)).toFixed(0)),
      decimals: token.decimals,
    }
    : { value: constants.Zero, decimals: 0 };
};

export default defi_llama;
