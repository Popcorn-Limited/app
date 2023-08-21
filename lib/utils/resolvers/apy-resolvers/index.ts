import { BigNumber } from "ethers";
import { ChainId } from "lib/utils/connectors";
import { synthetix, set_token, yearn, yearnAsset, convex, beefy, multiRewardStaking, ousd, llama, idle, aura, balancer } from "./resolvers";

export type ApyResolver = (
  address: string,
  chainId: ChainId,
  rpc?: any,
) => Promise<{ value: BigNumber; formatted: number }>;

export type ApyResolvers = typeof ApyResolvers;

export const ApyResolvers = {
  aura,
  balancer,
  yearn,
  yearnAsset,
  synthetix,
  set_token,
  convex,
  beefy,
  multiRewardStaking,
  ousd,
  llama,
  idle,
  default: synthetix,
};

export default ApyResolvers;
