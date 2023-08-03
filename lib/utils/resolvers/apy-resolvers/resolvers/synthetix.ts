import { BigNumber, Contract } from "ethers";
import { parseEther, parseUnits } from "ethers/lib/utils";
import { resolve_price } from "../../price-resolvers/resolve_price";

export async function synthetix(address, chainId, rpc?): Promise<{ value: BigNumber; decimals: number }> {
  chainId = Number(chainId);
  const contract = new Contract(
    address,
    [
      "function rewardsDuration() external view returns (uint256)", // in seconds
      "function getRewardForDuration() external view returns (uint256)",
      "function totalSupply() external view returns (uint256)",
      "function stakingToken() external view returns (address)",
      "function rewardsToken() external view returns (address)",
    ],
    rpc,
  );

  const [rewardsDuration, rewardForDuration, totalSupply, stakingToken, rewardsToken] = await Promise.all([
    contract.rewardsDuration(),
    contract.getRewardForDuration(),
    contract.totalSupply(),
    contract.stakingToken(),
    contract.rewardsToken(),
  ]);

  const [stakingTokenPrice, rewardsTokenPrice] = await Promise.all([
    resolve_price({ address: stakingToken, chainId, rpc }),
    resolve_price({ address: rewardsToken, chainId, rpc }),
  ]);

  const totalSupplyValue = totalSupply * stakingTokenPrice.value / parseUnits("1", stakingTokenPrice.decimals);

  const rewardsValuePerPeriod = rewardForDuration
    * rewardsTokenPrice.value
    / parseUnits("1", rewardsTokenPrice.decimals);

  const rewardsValuePerYear = BigInt(365 * 24 * 60 * 60)
    / rewardsDuration
    * rewardsValuePerPeriod;

  const apy = rewardsValuePerYear * parseEther("100") / totalSupplyValue;

  return { value: apy, decimals: 18 };
}
