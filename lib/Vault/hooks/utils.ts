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
  56: "/images/icons/empty-bnb.svg",
  250: "https://ftmscan.com/images/main/empty-token.png"
}

function getProtocolIcon(asset: any, adapter: any, chainId: ChainId): string | undefined {
  // CURVE
  if (name.includes("Curve")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  // VELODROME 
  else if (name.includes("StableV1 AMM")) {
    // TODO fill this with velodrome lp icon
    return undefined;
  }
  return undefined;
}

function getIconFromTokenList(address: string, chainId: ChainId) {
  const token = tokenList.find(token => token.address[chainId].toLowerCase() === address.toLowerCase());
  return token ? token.logoURI : undefined;
}

function getAssetIcon(asset, adapter, chainId) {
  // TODO wait for zerion api key and fetch the token result first (should be unlocked on the 30.08.23)
  // 1. fetch token result from zerion and return the icon if not undefined
  // 2. if undefined test for protocols
  // 3. if undefined test for tokenlist?
  // 4. if undefined return empty network token
  let icon = getIconFromTokenList(asset.address, chainId);
  if (!icon) return getProtocolIcon(asset, adapter, chainId)
  return EMPTY_TOKEN[chainId]
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
      icon: getAssetIcon(asset, adapter),
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