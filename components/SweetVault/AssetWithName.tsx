import { NetworkSticker } from "components/NetworkSticker";
import TokenIcon from "components/TokenIcon";
import { VaultMetadata } from "lib/Vault/hooks";
import { ChainId } from "lib/utils";

const PROTOCOL_ICONS = {
  "Aave": "aave",
  "Aura": "aura",
  "Balancer": "balancer",
  "Beefy": "beefy",
  "Compound":"compound",
  "Convex":"convex",
  "Curve":"curve",
  "Flux": "flux-finance",
  "Idle": "idle",
  "Origin": "origin-defi",
  "Stargate":"stargate",
  "Yearn": "yearn-finance",
}

export function AssetWithName({ token, vault, chainId }: { token: any; vault: VaultMetadata, chainId: ChainId }) {
  const protocolIcon = PROTOCOL_ICONS[vault?.metadata?.protocol?.name]
  return <div className="flex items-center gap-4">
    <div className="relative">
      <NetworkSticker chainId={chainId} />
      <TokenIcon token={token} icon={token?.icon} chainId={chainId} imageSize="w-8 h-8" />
    </div>
    <h2 className="text-gray-900 text-2xl font-bold mt-1">
      {vault?.metadata?.name || vault?.metadata?.token?.name || token?.name}
    </h2>
    <div className="bg-[#ebe7d466] border border-[#ebe7d4cc] rounded-lg py-1 px-3 flex flex-row items-center">
      <img
        src={protocolIcon ? `https://icons.llamao.fi/icons/protocols/${protocolIcon}?w=48&h=48` : "/images/icons/POP.svg"}
        className="w-6 h-6 mr-1 rounded-full border border-[#ebe7d4cc]"
      />
      <p className="mt-1 text-[#55503D] font-medium">{vault?.metadata?.protocol?.name}</p>
    </div>
  </div>
}