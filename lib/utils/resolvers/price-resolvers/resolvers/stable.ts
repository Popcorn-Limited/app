import { constants } from "ethers";
import { PriceResolver } from "../types";

export const stable: PriceResolver = async (address: string, chainId: number) => {
  return { value: constants.One, decimals: 18 };
};

export default stable;
