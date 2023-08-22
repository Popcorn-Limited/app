import { Fragment, useEffect, useState } from "react";
import { Address, useAccount, useToken } from "wagmi";
import { constants } from "ethers";

import { BalanceOf } from "lib/Erc20";
import useVaultToken from "hooks/useVaultToken";

import { ChainId, formatAndRoundBigNumber } from "lib/utils";
import Title from "components/content/Title";
import { Apy } from "lib/Staking";
import MarkdownRenderer from "./MarkdownRenderer";
import AnimatedChevron from "./AnimatedChevron";
import DepositWithdraw from "./DepositWithdraw";
import Accordion from "../Accordion";
import TokenIcon from "components/TokenIcon";
import { FetchTokenResult } from "wagmi/dist/actions";
import { NetworkSticker } from "components/NetworkSticker";
import { useAllowance, useBalanceOf, useTotalSupply } from "lib/Erc20/hooks";
import { usePrice } from "lib/Price";
import { useTotalAssets } from "lib/Vault/hooks";
import { formatNumber } from "lib/utils/formatBigNumber";
import RightArrowIcon from "components/SVGIcons/RightArrowIcon";
import { InfoIconWithTooltip } from "components/InfoIconWithTooltip";
import useVaultMetadata, { VaultMetadata, VaultTag } from "lib/Vault/hooks/useVaultMetadata";

import { SweetVaultTVL } from "lib/Vault/AllSweetVaultsTVL";
import useAdapterToken from "hooks/useAdapter";
import InputTokenWithError from "components/InputTokenWithError";
import { ArrowDownIcon } from "@heroicons/react/24/outline";

const HUNDRED = constants.Zero.add(100);

const VAULT_APY_RESOLVER = {
  "Beefy": "beefy",
  "Yearn": "yearnAsset",
  "Origin": "ousd",
  "Flux": "llama",
  "Idle": "idle",
  "Aura": "aura",
  "Balancer": "balancer",
}

const PROTOCOL_ICONS = {
  "Beefy": "beefy",
  "Yearn": "yearn-finance",
  "Origin": "origin-defi",
  "Flux": "flux-finance",
  "Idle": "idle",
  "Aura": "aura",
  "Balancer": "balancer",
}

export function AssetWithName({ token, vault, chainId }: { token: FetchTokenResult; vault: VaultMetadata, chainId: ChainId }) {
  const protocolIcon = PROTOCOL_ICONS[vault?.metadata?.protocol?.name]
  return <div className="flex items-center gap-4">
    <div className="relative">
      <NetworkSticker chainId={chainId} />
      <TokenIcon token={token?.address} chainId={chainId} imageSize="w-8 h-8" />
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

function VaultInputs({ inputTokenState, outputTokenState, inputBalanceState }) {
  const { inputToken, setInputToken } = inputTokenState;
  const { outputToken, setOutputToken } = outputTokenState;
  const { inputBalance, setInputBalance } = inputBalanceState;

  function handleChangeInput(e) {
    setInputBalance(e.currentTarget.value);
  }

  <>
    <InputTokenWithError
      captionText={isDeposit ? "Deposit Amount" : "Withdraw Amount"}
      onSelectToken={option => setInputToken(option)}
      onMaxClick={() => handleChangeInput({ currentTarget: { value: Number(inputToken.balance) / (10 ** inputToken.decimals) } })}
      chainId={1}
      value={inputBalance}
      onChange={handleChangeInput}
      selectedToken={inputToken}
      errorMessage={""}
      tokenList={availableToken}
      allowSelection={outputToken?.address === vault?.address}
      allowInput
    />
    <div className="relative py-4">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-customLightGray" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-4">
          <ArrowDownIcon
            className="h-10 w-10 p-2 text-customLightGray border border-customLightGray rounded-full cursor-pointer hover:text-primary hover:border-primary"
            aria-hidden="true"
            onClick={() => {
              if (outputToken.address === vault.address) {
                setInputToken(vault);
                setOutputToken(asset)
              } else {
                setInputToken(asset);
                setOutputToken(vault)
              }
            }}
          />
        </span>
      </div>
    </div>
    <InputTokenWithError
      captionText={"Output Amount"}
      onSelectToken={option => setOutputToken(option)}
      onMaxClick={() => { }}
      chainId={1}
      value={getOutput(inputBalance, Number(inputToken?.price), pps)}
      onChange={() => { }}
      selectedToken={outputToken}
      errorMessage={""}
      tokenList={inputToken.address === vault?.address ? [...availableToken, asset] : []}
      allowSelection={inputToken.address === vault?.address}
      allowInput={false}
    />
  </>
}


function useBaseVaultInputToken({ vaultAddress, gaugeAddress, chainId, account }: { vaultAddress: string, gaugeAddress?: string, chainId: ChainId, account?: string }) {
  const { data: vault } = useToken({ address: vaultAddress as Address, chainId })
  const { data: asset } = useVaultToken(vaultAddress, chainId);

  const { data: price } = usePrice({ address: asset?.address as Address, chainId });
  const { data: totalAssets } = useTotalAssets({ address: vaultAddress as Address, chainId });
  const { data: totalSupply } = useTotalSupply({ address: vaultAddress as Address, chainId });
  const [pps, setPps] = useState<number>(0);

  useEffect(() => {
    if (totalAssets && totalSupply && price
      && Number(totalAssets?.value) > 0 && Number(totalSupply?.value) > 0) {
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
          allowance: Number(assetAllowance?.value) / (10 ** asset?.decimals) || 0,
          balance: Number(assetBalance?.value) / (10 ** asset?.decimals) || 0,
          price: Number(price?.value) / (10 ** asset?.decimals),
          chainId: chainId,
          icon: undefined,
          target: { type: "Vault", address: vaultAddress }
        }, // asset
        {
          ...vault,
          allowance: Number(vaultAllowance?.value) / (10 ** vault?.decimals) || 0,
          balance: Number(vaultBalance?.value) / (10 ** vault?.decimals) || 0,
          price: pps,
          chainId: chainId,
          icon: undefined,
          isVault: true,
          target: { type: "Gauge", address: gaugeAddress }
        }, // vault
      ]
      if (gaugeAddress) _baseToken.push({
        ...vault,
        name: "Staked " + vault?.name,
        symbol: "stk-" + vault?.symbol,
        allowance: Number(constants.MaxUint256),
        balance: Number(stakedBalance?.value) / (10 ** vault?.decimals) || 0,
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



function SweetVault({
  vaultAddress,
  gaugeAddress,
  chainId,
  searchString,
  selectedTags,
  deployer,
}: {
  chainId: ChainId,
  vaultAddress: string,
  gaugeAddress: string,
  searchString: string,
  selectedTags: string[],
  deployer?: string
}) {
  const { address: account } = useAccount();
  const baseToken = useBaseVaultInputToken({ vaultAddress, gaugeAddress, chainId });
  const vaultMetadata = useVaultMetadata(vaultAddress, chainId);
  const asset = baseToken[0];
  const vault = baseToken[1];

  const [inputToken, setInputToken] = useState<any>(asset)
  const [outputToken, setOutputToken] = useState<any>(gaugeAddress ? baseToken[2] : vault)

  const [inputBalance, setInputBalance] = useState<number>(0);

  // Error Loading
  if (!vaultMetadata) return <></>
  // Vault is not in search term
  if (searchString !== "" &&
    !vault?.name.toLowerCase().includes(searchString) &&
    !vault?.symbol.toLowerCase().includes(searchString) &&
    !vaultMetadata?.metadata?.protocol?.name.toLowerCase().includes(searchString)) return <></>
  // Vault is not in selected tags
  if (selectedTags.length > 0 && !vaultMetadata?.metadata?.tags?.some((tag) => selectedTags.includes(VaultTag[tag]))) return <></>

  return (
    <Accordion
      header={<div>{vault?.name}</div>}
    >
      <div className="flex flex-col">
        <VaultInputs
          inputTokenState={[inputToken, setInputToken]}
          outputTokenState={[outputToken, setOutputToken]}
          inputBalanceState={[inputBalance, setInputBalance]}
        />

      </div>
    </Accordion>
  )
}

export default SweetVault;
