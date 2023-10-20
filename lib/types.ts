import { ProtocolName } from "vaultcraft-sdk";
import { Address } from "viem";

export type Token = {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  balance: number;
  price: number;
};

export type veAddresses = {
  POP: `0x${string}`;
  WETH: `0x${string}`;
  BalancerPool: `0x${string}`;
  BalancerOracle: `0x${string}`;
  oPOP: `0x${string}`;
  VaultRegistry: `0x${string}`;
  Vault1DAI: `0x${string}`;
  Vault2USDC: `0x${string}`;
  Vault2OUSD: `0x${string}`;
  Minter: `0x${string}`;
  TokenAdmin: `0x${string}`;
  VotingEscrow: `0x${string}`;
  GaugeController: `0x${string}`;
  GaugeFactory: `0x${string}`;
  SmartWalletChecker: `0x${string}`;
  VotingEscrowDelegation: `0x${string}`;
  Vault1DAIGauge: `0x${string}`;
  Vault2USDCGauge: `0x${string}`;
  Vault2OUSDGauge: `0x${string}`;
  VaultRouter: `0x${string}`;
  FeeDistributor: `0x${string}`;
};



export type TokenConstant = {
  chains: number[];
  address: { [key: string]: Address };
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
}

export type VaultData = {
  address: Address;
  vault: Token;
  asset: Token;
  adapter: Token;
  gauge?: Token;
  totalAssets: number;
  totalSupply: number;
  assetsPerShare: number;
  assetPrice: number;
  pricePerShare: number;
  tvl: number;
  fees: {
    deposit: number;
    withdrawal: number;
    management: number;
    performance: number;
  };
  depositLimit: number;
  metadata: VaultMetadata;
  chainId: number;
}

export type VaultMetadata = {
  creator: Address;
  cid: string;
  optionalMetadata: OptionalMetadata;
  vaultName?: string;
}

export type OptionalMetadata = {
  token: {
    name: string;
    description: string;
  };
  protocol: {
    name: string;
    description: string;
  }
  strategy: {
    name: string;
    description: string;
  },
  getTokenUrl?: string;
  resolver?: ProtocolName;
}

export type SimulationResponse = {
  request: any | null;
  success: boolean;
  error: string | null;
}

export interface IconProps {
  color: string;
  size: string;
  className?: string;
}