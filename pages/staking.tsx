import StakeCard from "components/staking/StakeCard";
import React, { useMemo } from "react";
import useNetworkFilter from "hooks/useNetworkFilter";
import { useChainsWithStaking } from "hooks/staking/useChainsWithStaking";
import NetworkFilter from "components/NetworkFilter";
import useAllStakingAddresses from "hooks/staking/useAllStakingAddresses";
import NoSSR from "react-no-ssr";

export default function StakingOverviewPage(): JSX.Element {
  const stakingAddresses = useAllStakingAddresses();
  const supportedNetworks = useChainsWithStaking();
  const [selectedNetworks, selectNetwork] = useNetworkFilter(supportedNetworks);

  const stakingPools = useMemo(
    () => (stakingAddresses || [])?.filter((staking) => selectedNetworks.includes(staking?.chainId)),
    [selectedNetworks, stakingAddresses],
  );

  return (
    <NoSSR>
      <div className="mb-8 md:flex md:flex-row">
        <div className="md:w-1/4">
          <h1 className="text-5xl md:text-6xl leading-12">Staking</h1>
          <p className="text-black mt-2 mb-4">Earn more by staking your tokens</p>
        </div>
        <div className="bg-customYellow md:w-3/4 rounded-xl p-6">
          <p className="text-black">IMPORTANT UPDATE: As we prepare for the launch of POP 2.0, we will be reducing POP staking rewards to zero. Please do not stake or restake your POP until we announce our new staking contracts. For users who staked recently, rewards will be calculated and airdropped accordingly on September 30th.</p>
        </div>
      </div>
      <NetworkFilter supportedNetworks={supportedNetworks} selectNetwork={selectNetwork} />
      <div className="border-t border-t-customLightGray border-opacity-40 mt-8">
        <div className="w-full">
          <div className="h-full ">
            {stakingPools.map((staking) => (
              <StakeCard
                key={`${staking.chainId}.${staking.address}`}
                chainId={staking?.chainId}
                stakingAddress={staking?.address}
                stakingType={staking?.stakingType}
              />
            ))}
          </div>
        </div>
      </div>
    </NoSSR>
  );
}
