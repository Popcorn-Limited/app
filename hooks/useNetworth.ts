import { ChainId } from "lib/utils/connectors";
import { BigNumber, constants } from "ethers/lib/ethers";
import { useCallback } from "react";
import { useAccount } from "wagmi";
import { useNamedAccounts } from "lib/utils";
import usePrice from "lib/Price/hooks/usePrice";
import { useBalanceOf } from "lib/Erc20/hooks";
import { useClaimableBalance } from "lib/PopLocker/hooks/useClaimableBalance";
import { useClaimableBalance as useClaimableEscrowBalance } from "lib/Escrow/hooks/useClaimableBalance"
import { useLockedBalances } from "lib/PopLocker/hooks";
import { useEscrowBalance } from "lib/Escrow/hooks/useEscrowBalance";
import { useEscrowIds, useEscrows } from "lib/Escrow";

function getHoldingValue(tokenAmount: BigNumber, tokenPrice: BigNumber): BigNumber {
  tokenAmount = tokenAmount?.gt(constants.Zero) ? tokenAmount : constants.Zero;
  return tokenAmount.eq(constants.Zero) || tokenPrice?.eq(constants.Zero)
    ? constants.Zero
    : tokenAmount?.mul(tokenPrice ? tokenPrice : constants.Zero).div(constants.WeiPerEther) || constants.Zero;
}

export default function useNetWorth(): {
  Ethereum: BigNumber;
  Polygon: BigNumber;
  BNB: BigNumber;
  Arbitrum: BigNumber;
  Optimism: BigNumber;
  totalNetWorth: BigNumber;
  pop: BigNumber;
  vesting: BigNumber;
  deposits: BigNumber;
} {
  const { address: account } = useAccount();
  const { Ethereum, Polygon, BNB, Arbitrum, Optimism } = ChainId;
  const useHoldingValue = useCallback(getHoldingValue, []);

  const ethereum = useNamedAccounts("1", [
    "pop",
    "popUsdcArrakisVault",
    "popStaking",
    "rewardsEscrow",
    "butterStaking",
    "threeXStaking",
    "popUsdcArrakisVaultStaking",
    "butter",
    "threeCrv",
    "threeX",
    "usdc",
    "butterBatch",
  ]);
  const [
    ethereumPop,
    ethereumPopUsdcArrakisVault,
    ethereumPopStaking,
    ethereumRewardsEscrow,
    ethereumButterStaking,
    ethereumThreeXStaking,
    ethereumPopUsdcArrakisVaultStaking,
    ethereumButter,
    ethereumThreeCrv,
    ethereumThreeX,
  ] = ethereum;
  const polygon = useNamedAccounts("137", [
    "pop",
    "popUsdcArrakisVault",
    "popStaking",
    "rewardsEscrow",
    "popUsdcArrakisVaultStaking",
  ]);
  const [
    polygonPop,
    polygonPopUsdcArrakisVault,
    polygonPopStaking,
    polygonRewardsEscrow,
    polygonPopUsdcArrakisVaultStaking,
  ] = polygon;
  const [bnbPop, bnbRewardsEscrow] = useNamedAccounts("56", ["pop", "rewardsEscrow"]);
  const [arbPop] = useNamedAccounts("42161", ["pop"]);
  const [opPop, opPopStaking, opRewardsEscrow] = useNamedAccounts("56", ["pop", "popStaking", "rewardsEscrow"]);


  const { data: popPrice } = usePrice({ address: ethereumPop?.address, chainId: Ethereum });
  const { data: mainnetLpPrice } = usePrice({ address: ethereumPopUsdcArrakisVault?.address, chainId: Ethereum });
  const { data: polygonLpPrice } = usePrice({ address: polygonPopUsdcArrakisVault?.address, chainId: Polygon });

  const { data: polygonPopBalance } = useBalanceOf({ address: polygonPop.address, chainId: Polygon, account });
  const { data: mainnetPopBalance } = useBalanceOf({ address: ethereumPop.address, chainId: Ethereum, account });
  const { data: bnbPopBalance } = useBalanceOf({ address: bnbPop.address, account, chainId: BNB });
  const { data: arbitrumPopBalance } = useBalanceOf({ address: arbPop.address, account, chainId: Arbitrum });
  const { data: optimismPopBalance } = useBalanceOf({ address: opPop.address, account, chainId: Optimism });

  const { data: mainnetEscrows } = useEscrows({
    chainId: Ethereum,
    address: ethereumRewardsEscrow?.address,
    account,
  })
  const mainnetEscrowClaimablePop = mainnetEscrows?.reduce((total, escrow) => total.add(escrow.claimable), constants.Zero)
  const mainnetEscrowVestingPop = mainnetEscrows?.reduce((total, escrow) => total.add(escrow.vesting), constants.Zero)

  const { data: polygonEscrows } = useEscrows({
    chainId: Polygon,
    address: polygonRewardsEscrow?.address,
    account,
  })
  const polygonEscrowClaimablePop = polygonEscrows?.reduce((total, escrow) => total.add(escrow.claimable), constants.Zero)
  const polygonEscrowVestingPop = polygonEscrows?.reduce((total, escrow) => total.add(escrow.vesting), constants.Zero)

  const { data: optimismEscrows } = useEscrows({
    chainId: Optimism,
    address: opRewardsEscrow?.address,
    account,
  })
  const optimismEscrowClaimablePop = optimismEscrows?.reduce((total, escrow) => total.add(escrow.claimable), constants.Zero)
  const optimismEscrowVestingPop = optimismEscrows?.reduce((total, escrow) => total.add(escrow.vesting), constants.Zero)


  const { data: bnbEscrows } = useEscrows({
    chainId: BNB,
    address: bnbRewardsEscrow?.address,
    account,
  })
  const bnbEscrowClaimablePop = bnbEscrows?.reduce((total, escrow) => total.add(escrow.claimable), constants.Zero)
  const bnbEscrowVestingPop = bnbEscrows?.reduce((total, escrow) => total.add(escrow.vesting), constants.Zero)

  const { data: mainnetLpBalance } = useBalanceOf({
    address: ethereumPopUsdcArrakisVault?.address,
    account,
    chainId: Ethereum,
  });
  const { data: polygonLpBalance } = useBalanceOf({
    address: polygonPopUsdcArrakisVault?.address,
    account,
    chainId: Polygon,
  });
  const { data: mainnetLpStakingPoolBalance } = useBalanceOf({
    address: ethereumPopUsdcArrakisVaultStaking?.address,
    account,
    chainId: Ethereum,
  });
  const { data: polygonLpStakingPoolBalance } = useBalanceOf({
    address: polygonPopUsdcArrakisVaultStaking?.address,
    account,
    chainId: Polygon,
  });

  const mainnetPopLpHoldings = useHoldingValue(mainnetLpBalance?.value, mainnetLpPrice?.value);
  const polygonPopLpHoldings = useHoldingValue(polygonLpBalance?.value, polygonLpPrice?.value);
  const mainnetPopLpStakingHoldings = useHoldingValue(mainnetLpStakingPoolBalance?.value, mainnetLpPrice?.value); // Are  these variables meant to be the same thing?
  const polygonPopLpStakingHoldings = useHoldingValue(polygonLpStakingPoolBalance?.value, polygonLpPrice?.value);

  const mainnetPopHoldings = useHoldingValue(mainnetPopBalance?.value, popPrice?.value);
  const polygonPopHoldings = useHoldingValue(polygonPopBalance?.value, popPrice?.value);
  const bnbPopHoldings = useHoldingValue(bnbPopBalance?.value, popPrice?.value);
  const arbitrumPopHoldings = useHoldingValue(arbitrumPopBalance?.value, popPrice?.value);
  const optimismPopHoldings = useHoldingValue(optimismPopBalance?.value, popPrice?.value);

  const { data: ethereumLockedBalances } = useLockedBalances({
    address: ethereumPopStaking?.address,
    chainId: Ethereum,
    account,
  });
  const mainnetPopStakingHoldings = useHoldingValue(ethereumLockedBalances?.locked, popPrice?.value);

  const { data: polygonLockedBalances2 } = useLockedBalances({
    address: polygonPopStaking?.address,
    chainId: Polygon,
    account,
  });
  const polygonPopStakingHoldings = useHoldingValue(polygonLockedBalances2?.locked, popPrice?.value);

  const { data: earnedMainnetPop } = useClaimableBalance({
    address: ethereumPopStaking?.address,
    account,
    chainId: Ethereum,
  });
  const mainnetPopStakingRewardsHoldings = useHoldingValue(earnedMainnetPop?.value, popPrice?.value);

  const { data: earnedPolygonPop } = useClaimableBalance({
    address: polygonPopStaking?.address,
    account,
    chainId: Polygon,
  });
  const polygonPopStakingRewardsHoldings = useHoldingValue(earnedPolygonPop?.value, popPrice?.value);

  const { data: optimismLockedBalances } = useLockedBalances({
    address: opPopStaking?.address,
    chainId: Optimism,
    account,
  });
  const optimismPopStakingHoldings = useHoldingValue(optimismLockedBalances?.locked, popPrice?.value);

  const { data: earnedOptimismPop } = useClaimableBalance({
    address: opPopStaking?.address,
    account,
    chainId: Optimism,
  });
  const optimismPopStakingRewardsHoldings = useHoldingValue(earnedOptimismPop?.value, popPrice?.value);


  const { data: earnedButterStaking } = useClaimableBalance({
    address: ethereumButterStaking?.address,
    account,
    chainId: Ethereum,
  });
  const butterStakingRewardsHoldings = useHoldingValue(earnedButterStaking?.value, popPrice?.value);

  const { data: earnedThreeX } = useClaimableBalance({
    address: ethereumThreeXStaking?.address,
    account,
    chainId: Ethereum,
  });
  const threeXStakingRewardsHoldings = useHoldingValue(earnedThreeX?.value, popPrice?.value);

  const { data: earnedEthereumPopUsdcStaking } = useClaimableBalance({
    address: ethereumPopUsdcArrakisVault?.address,
    account,
    chainId: Ethereum,
  });
  const mainnetLPStakingRewardsHoldings = useHoldingValue(earnedEthereumPopUsdcStaking?.value, popPrice?.value);

  const { data: earnedPolygonPopUsdcStaking } = useClaimableBalance({
    address: polygonPopUsdcArrakisVault?.address,
    account,
    chainId: Polygon,
  });
  const polygonLPStakingRewardsHoldings = useHoldingValue(earnedPolygonPopUsdcStaking?.value, popPrice?.value);


  const mainnetEscrowHoldings = useHoldingValue(
    constants.Zero.add(mainnetEscrowClaimablePop || "0").add(mainnetEscrowVestingPop || "0"),
    popPrice?.value,
  );

  const polygonEscrowHoldings = useHoldingValue(
    constants.Zero.add(polygonEscrowClaimablePop || "0").add(polygonEscrowVestingPop || "0"),
    popPrice?.value,
  );
  const bnbEscrowHoldings = useHoldingValue(
    constants.Zero.add(bnbEscrowClaimablePop || "0").add(bnbEscrowVestingPop || "0"),
    popPrice?.value,
  );
  const optimismEscrowHoldings = useHoldingValue(
    constants.Zero.add(optimismEscrowClaimablePop || "0").add(optimismEscrowVestingPop || "0"),
    popPrice?.value,
  );


  const { data: butterBalance } = useBalanceOf({ address: ethereumButter?.address, account, chainId: Ethereum });
  const { data: butterPrice } = usePrice({ address: ethereumButter?.address, account, chainId: Ethereum });
  const butterHoldings = useHoldingValue(butterBalance?.value, butterPrice?.value);

  const { data: butterStaking } = useBalanceOf({
    address: ethereumButterStaking?.address,
    account,
    chainId: Ethereum,
  });
  const butterStakingHoldings = useHoldingValue(butterStaking?.value, butterPrice?.value);

  const { data: threeXBalance } = useBalanceOf({ address: ethereumThreeX?.address, account, chainId: Ethereum });
  const { data: threeXPrice } = usePrice({ address: ethereumThreeX?.address, account, chainId: Ethereum });
  const threeXHoldings = useHoldingValue(threeXBalance?.value, threeXPrice?.value);

  const { data: threeXStaking } = useBalanceOf({
    address: ethereumThreeXStaking?.address,
    account,
    chainId: Ethereum,
  });
  const threeXStakingHoldings = useHoldingValue(threeXStaking?.value, threeXPrice?.value);


  const calculatePopHoldings = () => {
    return [
      mainnetPopHoldings,
      polygonPopHoldings,
      arbitrumPopHoldings,
      optimismPopHoldings,
      bnbPopHoldings,
    ].reduce((total, num) => total.add(num));
  };

  const calculateVestingHoldings = () => {
    return [
      mainnetEscrowHoldings,
      polygonEscrowHoldings,
      bnbEscrowHoldings,
      optimismEscrowHoldings,
      polygonPopStakingRewardsHoldings,
      mainnetPopStakingRewardsHoldings,
      optimismPopStakingRewardsHoldings,
      butterStakingRewardsHoldings,
      threeXStakingRewardsHoldings,
      mainnetLPStakingRewardsHoldings,
      polygonLPStakingRewardsHoldings
    ].reduce((total, num) => total.add(num));
  }

  const calculateDepositHoldings = () => {
    return [
      butterHoldings,
      threeXHoldings,
      butterStakingHoldings,
      threeXStakingHoldings,
      mainnetPopStakingHoldings,
      polygonPopStakingHoldings,
      optimismPopStakingHoldings
    ].reduce((total, num) => total.add(num));
  }


  const calculateEthereumHoldings = (): BigNumber => {
    return [
      mainnetPopHoldings,
      mainnetPopStakingHoldings,
      butterHoldings,
      threeXHoldings,
      butterStakingHoldings,
      threeXStakingHoldings,
      mainnetEscrowHoldings,
      mainnetPopStakingRewardsHoldings,
      butterStakingRewardsHoldings,
      threeXStakingRewardsHoldings,
      mainnetLPStakingRewardsHoldings,
      mainnetPopLpHoldings,
      mainnetPopLpStakingHoldings,
    ].reduce((total, num) => total.add(num));
  };

  const calculatePolygonHoldings = (): BigNumber => {
    return [
      polygonPopHoldings,
      polygonPopStakingHoldings,
      polygonEscrowHoldings,
      polygonPopStakingRewardsHoldings,
      polygonLPStakingRewardsHoldings,
      polygonPopLpHoldings,
      polygonPopLpStakingHoldings,
    ].reduce((total, num) => total.add(num));
  };

  const calculateArbitrumHoldings = (): BigNumber => {
    return [arbitrumPopHoldings].reduce((total, num) => total.add(num));
  };

  const calculateOptimismHoldings = (): BigNumber => {
    return [optimismPopHoldings, optimismEscrowHoldings, optimismPopStakingHoldings].reduce((total, num) => total.add(num));
  };

  const calculateBnbHoldings = (): BigNumber => {
    return [bnbPopHoldings, bnbEscrowHoldings].reduce((total, num) => total.add(num));
  };

  const calculateTotalHoldings = () => {
    return [
      calculateEthereumHoldings(),
      calculatePolygonHoldings(),
      calculateBnbHoldings(),
      calculateArbitrumHoldings(),
      calculateOptimismHoldings(),
    ].reduce((total, num) => total.add(num));
  };

  return {
    Ethereum: calculateEthereumHoldings(),
    Polygon: calculatePolygonHoldings(),
    BNB: calculateBnbHoldings(),
    Arbitrum: calculateArbitrumHoldings(),
    Optimism: calculateOptimismHoldings(),
    totalNetWorth: calculateTotalHoldings(),
    pop: calculatePopHoldings(),
    vesting: calculateVestingHoldings(),
    deposits: calculateDepositHoldings()
  };
}
