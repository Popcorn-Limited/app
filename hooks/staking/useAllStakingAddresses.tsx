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
  const ethereumStakingAddresses = ["0x27A9B8065Af3A678CD121A435BEA9253C53Ab428", "0x584732f867a4533BC349d438Fba4fc2aEE5f5f83", "0xeB906A75838A8078B181815969b1DCBC20eaF7c0", "0x633b32573793A67cE41A7D0fFe66e78Cd3379C45"]; // = useNamedAccounts("1", ["butterStaking", "threeXStaking", "xenStaking", "popUsdcArrakisVaultStaking",]);


  // Polygon
  const [polygonPopStaking] = useNamedAccounts("137", ["popStaking"]);
  const polygonStakingAddresses = ["0xd3836EF639A74EA7398d34c66aa171b1564BE4bc"] // = useNamedAccounts("137", ["popUsdcArrakisVaultStaking"]);

  //Optimism
  const [optimismPopStaking] = useNamedAccounts("10", ["popStaking"]);

  return [
    { chainId: ChainId.Ethereum, stakingType: StakingType.PopLocker, address: "0xeEE1d31297B042820349B03027aB3b13a9406184" },
    { chainId: ChainId.Polygon, stakingType: StakingType.PopLocker, address: "0xe8af04AD759Ad790Aa5592f587D3cFB3ecC6A9dA" },
    { chainId: ChainId.Optimism, stakingType: StakingType.PopLocker, address: "0x3Fcc4eA703054453D8697b58C5CB2585F8883C05" },
    ...(ethereumStakingAddresses?.length ? ethereumStakingAddresses : []).map(
      (staking) => ({ chainId: ChainId.Ethereum, stakingType: StakingType.StakingPool, address: staking } || {}),
    ),
    ...(polygonStakingAddresses?.length ? polygonStakingAddresses : []).map(
      (staking) => ({ chainId: ChainId.Polygon, stakingType: StakingType.StakingPool, address: staking } || {}),
    )
  ];
}
