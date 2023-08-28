import useVaultToken from "hooks/useVaultToken";
import { usePrice } from "lib/Price";
import { Address, useToken } from "wagmi";
import { useTotalAssets } from "./useTotalAssets";
import { useAllowance, useBalanceOf, useTotalSupply } from "lib/Erc20/hooks";
import { useEffect, useState } from "react";
import { constants } from "ethers";
import { ChainId } from "lib/utils";

export function useBaseVaultInputToken({ vaultAddress, gaugeAddress, chainId, account }:
  { vaultAddress: string, gaugeAddress?: string, chainId: ChainId, account?: string }) {
  const { data: vault } = useToken({ address: vaultAddress as Address, chainId })
  const { data: gauge } = useToken({ address: gaugeAddress as Address, chainId })
  const { data: asset } = useVaultToken(vaultAddress, chainId);

  const { data: price } = usePrice({ address: asset?.address as Address, chainId });
  const { data: totalAssets } = useTotalAssets({ address: vaultAddress as Address, chainId });
  const { data: totalSupply } = useTotalSupply({ address: vaultAddress as Address, chainId });
  const [pps, setPps] = useState<number>(1);

  useEffect(() => {
    if (totalAssets && totalSupply && price
      && Number(totalAssets?.value) > 0 && Number(totalSupply?.value) > 0 && pps === 0) {
      setPps((Number(totalAssets?.value) / Number(totalSupply?.value)) * (Number(price?.value) / (10 ** asset?.decimals)));
    }
  }, [totalAssets, totalSupply, price])

  const { data: assetBalance } = useBalanceOf({ address: asset?.address as Address, chainId, account });
  const { data: vaultBalance } = useBalanceOf({ address: vaultAddress as Address, chainId, account });
  const { data: stakedBalance } = useBalanceOf({ address: gaugeAddress as Address, chainId, account });

  const { data: assetAllowance } = useAllowance({ address: asset?.address, chainId, account: vaultAddress });
  const { data: vaultAllowance } = useAllowance({ address: vault?.address, chainId, account: gaugeAddress }); // TODO - might also need to approve wido

  const [baseToken, setBaseToken] = useState<any[]>([]);

  useEffect(() => {
    if (vault?.address && asset?.address && price?.value && pps > 0) {
      const _baseToken = [
        {
          ...asset,
          allowance: Number(assetAllowance?.value) || 0,
          balance: Number(assetBalance?.value) || 0,
          price: Number(price?.value) / (10 ** asset?.decimals) || 1,
          chainId: chainId,
          icon: "/images/tokens/eth.png",
          target: { type: "Vault", address: vaultAddress }
        }, // asset
        {
          ...vault,
          allowance: Number(vaultAllowance?.value) || 0,
          balance: Number(vaultBalance?.value) || 0,
          price: pps,
          chainId: chainId,
          icon: undefined,
          isVault: true,
          target: { type: "Gauge", address: gaugeAddress }
        }, // vault
      ]
      if (gaugeAddress) _baseToken.push({
        ...gauge,
        allowance: Number(constants.MaxUint256),
        balance: Number(stakedBalance?.value) || 0,
        price: pps,
        chainId: chainId,
        icon: undefined,
        target: { type: "Gauge", address: gaugeAddress },
      }) // staked vault

      setBaseToken(_baseToken);
    }
  }, [vault, asset, price, pps])

  return baseToken;
}