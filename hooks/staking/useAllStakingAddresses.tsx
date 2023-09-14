import { useNamedAccounts } from "lib/utils";
import { ChainId } from "lib/utils/connectors";

export enum StakingType {
  PopLocker,
  StakingPool,
}

interface StakingAddressWithMetadata {
  chainId?: ChainId;
  stakingType?: StakingType;
  address?: string;
}

export default function useAllStakingAddresses(): StakingAddressWithMetadata[] {
  // Ethereum
  const [ethereumPopStaking] = useNamedAccounts("1", ["popStaking"]);
  const ethereumStakingAddresses = useNamedAccounts("1", ["butterStaking", "threeXStaking", "xenStaking", "popUsdcArrakisVaultStaking"]);

  // Polygon
  const [polygonPopStaking] = useNamedAccounts("137", ["popStaking"]);
  const polygonStakingAddresses = useNamedAccounts("137", ["popUsdcArrakisVaultStaking"]);

  //Optimism
  const [optimismPopStaking] = useNamedAccounts("10", ["popStaking"]);
  
  return [
    { chainId: ChainId.Ethereum, stakingType: StakingType.PopLocker, address: "0xeEE1d31297B042820349B03027aB3b13a9406184" },
    { chainId: ChainId.Polygon, stakingType: StakingType.PopLocker, address: "0xe8af04AD759Ad790Aa5592f587D3cFB3ecC6A9dA" },
    { chainId: ChainId.Optimism, stakingType: StakingType.PopLocker, address: "0x3Fcc4eA703054453D8697b58C5CB2585F8883C05" },
    ...(ethereumStakingAddresses?.length ? ethereumStakingAddresses : []).map(
      (staking) => ({ chainId: ChainId.Ethereum, stakingType: StakingType.StakingPool, address: staking?.address } || {}),
    ),
    ...(polygonStakingAddresses?.length ? polygonStakingAddresses : []).map(
      (staking) => ({ chainId: ChainId.Polygon, stakingType: StakingType.StakingPool, address: staking?.address } || {}),
    )
  ];
}
