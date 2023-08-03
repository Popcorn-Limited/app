import { BigNumber, constants } from "ethers";

const ZERO = constants.Zero.toString();
export const getPercentage = (total: BigNumber | undefined, partial: BigNumber | undefined): number => {
  return Number(total) > 0 && Number(partial) > 0
    ? parseFloat((100 * ((partial._hex as any) / (total._hex as any))) as any).toFixed(2)
    : (ZERO as any);
};
