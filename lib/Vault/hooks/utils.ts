import useVaultToken from "hooks/useVaultToken";
import { usePrice } from "lib/Price";
import { Address, useContractReads, useToken } from "wagmi";
import { useEffect, useState } from "react";
import { ChainId } from "lib/utils";
import useAdapterToken from "hooks/useAdapter";
import { tokenList } from "lib/constants/tokenList";

const EMPTY_TOKEN = {
  1: "https://etherscan.io/images/main/empty-token.png",
  1337: "https://etherscan.io/images/main/empty-token.png",
  5: "https://etherscan.io/images/main/empty-token.png",
  137: "https://polygonscan.com/images/main/empty-token.png",
  10: "/images/icons/empty-op.svg",
  42161: "https://arbiscan.io/images/main/empty-token.png",
  56: "/images/icons/empty-bsc.svg",
  250: "https://ftmscan.com/images/main/empty-token.png"
}

function getProtocolIcon(asset: any, adapter: any, chainId: ChainId): string | undefined {
  if (asset.name.includes("Aave")) {
    // TODO fill this with AaveV2 lp icon
    return undefined;
  }
  else if (asset.name.includes("Aave")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  else if (adapter?.name?.includes("Across")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  else if (adapter?.name?.includes("AlpacaV1")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  else if (adapter?.name?.includes("AlpacaV2")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  else if (adapter?.name?.includes("Balancer") || adapter?.name?.includes("Aura")) {
    // TODO fill this with curve lp icon
    return "/images/icons/balancer-lp.png";
  }
  else if (asset.name.includes("Compound")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  else if (adapter?.name?.includes("Curve") || asset?.name?.includes("Curve") || adapter?.name?.includes("Convex")) {
    // TODO fill this with curve lp icon
    return "/images/icons/curve-lp.png";
  }
  else if (adapter?.name?.includes("DotDot") || adapter?.name?.includes("Ellipsis")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  else if (adapter?.name?.includes("GMD")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  else if (adapter?.name?.includes("Ichi")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  else if (adapter?.name?.includes("Metapool")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  else if (adapter?.name?.includes("Radiant")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  else if (adapter?.name?.includes("Solidly")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  else if (adapter?.name?.includes("Stargate") || asset?.name?.includes("STG") || asset?.symbol?.includes("STG") || asset?.symbol?.includes("S*")) {
    // TODO fill this with curve lp icon
    return getIconFromTokenListBySymbol(asset?.symbol?.includes("*") ? asset?.symbol?.split("*")[1] : asset?.symbol?.split(" ")[1], chainId);
  }
  else if (adapter?.name?.includes("Sushi")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  else if (adapter?.name?.includes("Velodrome")) {
    // TODO fill this with curve lp icon
    return "/images/icons/velodrome-lp.svg";
  }
  else if (adapter?.name?.includes("Yearn")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  else if (asset?.name?.includes("HOP") || asset?.symbol?.includes("HOP-LP")) {
    return getIconFromTokenListBySymbol(asset?.symbol?.includes("HOP-LP") ? asset?.symbol?.split("HOP-LP-")[1] : asset?.symbol?.split(" ")[1], chainId);
  }
}

function getIconFromTokenListByAddress(address: string, chainId: ChainId) {
  const token = tokenList.find(token => token.address[String(chainId)]?.toLowerCase() === address?.toLowerCase());
  return token ? token.logoURI : undefined;
}

function getIconFromTokenListBySymbol(symbol: string, chainId: ChainId) {
  const token = tokenList.find(token => token.symbol.toLowerCase() === symbol?.toLowerCase());
  return token ? token.logoURI : undefined;
}

function getAssetIcon(asset, adapter, chainId): string {
  let icon: string = getIconFromTokenListByAddress(asset?.address, chainId);
  if (!icon) icon = getProtocolIcon(asset, adapter, chainId)
  if (!icon) icon = EMPTY_TOKEN[chainId]
  return icon;
}

function useGetTotalAssetsAndSupply({ vaultAddress, chainId }) {
  const contract = {
    address: vaultAddress,
    abi: vaultABI,
    chainId
  }
  return useContractReads({
    contracts: [
      {
        ...contract,
        functionName: 'totalAssets',
      },
      {
        ...contract,
        functionName: 'totalSupply',
      },
    ],
    enabled: !!vaultAddress && !!chainId,
  })
}

function useGetBaseTokenBalances({ vaultAddress, gaugeAddress, assetAddress, chainId, account }) {
  const baseContract = {
    abi: vaultABI,
    chainId,
    functionName: 'balanceOf',
    args: [account]
  }
  const contracts = [{ ...baseContract, address: assetAddress }, { ...baseContract, address: vaultAddress }]
  if (gaugeAddress) contracts.push({ ...baseContract, address: gaugeAddress })

  return useContractReads({
    contracts,
    enabled: !!vaultAddress && !!assetAddress && !!chainId && !!account,
  })
}

export function useBaseVaultInputToken({ vaultAddress, gaugeAddress, chainId, account }:
  { vaultAddress: Address, gaugeAddress?: Address, chainId: ChainId, account?: Address }) {
  const { data: vault } = useToken({ address: vaultAddress, chainId })
  const { data: gauge } = useToken({ address: gaugeAddress, chainId })
  const { data: asset } = useVaultToken({ vaultAddress, chainId });
  const { data: adapter } = useAdapterToken({ vaultAddress, chainId });

  const { data: price } = usePrice({ address: asset?.address, chainId });

  const { data: totalAssetsAndSupply } = useGetTotalAssetsAndSupply({ vaultAddress, chainId })
  const { data: balances } = useGetBaseTokenBalances({ vaultAddress, gaugeAddress, assetAddress: asset?.address, chainId, account })

  const assetPrice = Number(price?.value) / (10 ** asset?.decimals) || 1
  const vaultPrice = (Number(totalAssetsAndSupply?.[0]) || 1) / (Number(totalAssetsAndSupply?.[1]) || 1) * assetPrice
  const vaultSupply = (Number(totalAssetsAndSupply?.[1]) || 1) / (10 ** asset?.decimals) || 0

  const baseToken: any[] = [
    {
      ...asset,
      balance: account ? Number(balances?.[0]) : 0,
      price: assetPrice,
      chainId: chainId,
      icon: getAssetIcon(asset, adapter, chainId),
      target: { type: "Vault", address: vaultAddress }
    }, // asset
    {
      ...vault,
      balance: account ? Number(balances?.[1]) : 0,
      price: vaultPrice,
      chainId: chainId,
      icon: undefined,
      isVault: true,
      target: { type: "Gauge", address: gaugeAddress },
      supply: vaultSupply,
    }, // vault
  ]
  if (gaugeAddress) baseToken.push({
    ...gauge,
    decimals: vault?.decimals,
    balance: account ? Number(balances?.[2]) : 0,
    price: vaultPrice,
    chainId: chainId,
    icon: undefined,
    target: { type: "VaultRouter", address: gaugeAddress },
    supply: vaultSupply,
  }) // staked vault

  return baseToken;
}


const vaultABI = [
  { "inputs": [], "name": "totalAssets", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
] as const 