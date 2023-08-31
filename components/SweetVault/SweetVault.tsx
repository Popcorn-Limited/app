import { Fragment, useEffect, useState } from "react";
import { Address, useAccount, useNetwork, useSwitchNetwork, useToken } from "wagmi";
import { Contract, constants } from "ethers";

import { BalanceOf } from "lib/Erc20";
import useVaultToken from "hooks/useVaultToken";

import { ChainId, formatAndRoundBigNumber } from "lib/utils";
import Title from "components/content/Title";
import { Apy } from "lib/Staking";
import MarkdownRenderer from "./MarkdownRenderer";
import Accordion from "../Accordion";
import TokenIcon from "components/TokenIcon";
import { formatAndRoundNumber, formatNumber } from "lib/utils/formatBigNumber";
import useVaultMetadata, { VaultTag } from "lib/Vault/hooks/useVaultMetadata";

import { InfoIconWithTooltip } from "components/InfoIconWithTooltip";
import { useBaseVaultInputToken } from "lib/Vault/hooks/utils";
import { AssetWithName } from "./AssetWithName";
import VaultInputs from "./VaultInputs";

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
  const baseToken = useBaseVaultInputToken({ vaultAddress, gaugeAddress, chainId, account });
  const vaultMetadata = useVaultMetadata(vaultAddress, chainId);
  const asset = baseToken[0];
  const vault = baseToken[1];
  const gauge = gaugeAddress ? baseToken[2] : undefined;

  // Is loading / error
  if (!vaultMetadata || baseToken.length === 0) return <></>
  // Vault is not in search term
  if (searchString !== "" &&
    !vault?.name.toLowerCase().includes(searchString) &&
    !vault?.symbol.toLowerCase().includes(searchString) &&
    !vaultMetadata?.metadata?.protocol?.name.toLowerCase().includes(searchString)) return <></>
  // Vault is not in selected tags
  if (selectedTags.length > 0 && !vaultMetadata?.metadata?.tags?.some((tag) => selectedTags.includes(VaultTag[tag]))) return <></>
  return (<Accordion
    header={
      <div className="w-full flex flex-row flex-wrap items-center justify-between">

        <div className="flex items-center justify-between select-none w-full md:w-1/3">
          <AssetWithName token={asset} vault={vaultMetadata} chainId={chainId} />
        </div>

        <div className="w-1/2 md:w-2/12 mt-6 md:mt-0">
          <p className="text-primaryLight font-normal">Your Wallet</p>
          <p className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
            <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
              {formatAndRoundNumber(asset?.balance, asset?.decimals)}
            </Title>
            <span className="text-secondaryLight text-base inline">{asset?.symbol.slice(0, 12)}</span>
          </p>
        </div>

        <div className="w-1/2 md:w-2/12 mt-6 md:mt-0">
          <p className="text-primaryLight font-normal">Your Deposit</p>
          <div className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
            <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
              {account ? (gaugeAddress ?
                formatAndRoundNumber(gauge.balance, vault.decimals) :
                formatAndRoundNumber(vault.balance, vault.decimals)
              ) : "-"}
            </Title>
            <span className="text-secondaryLight text-base inline">{asset?.symbol.slice(0, 12)}</span>
          </div>
        </div>

        <div className="w-1/2 md:w-2/12 mt-6 md:mt-0">
          <p className="font-normal text-primaryLight">vAPY</p>
          <Title as="td" level={2} fontWeight="font-normal">
            <Apy
              address={vaultAddress}
              chainId={chainId}
              resolver={VAULT_APY_RESOLVER[vaultMetadata?.metadata?.protocol?.name]}
              render={(apy) => {
                return (
                  <Apy
                    address={vaultMetadata.staking}
                    resolver={"multiRewardStaking"}
                    render={(stakingApy) => (Number(apy?.data?.value) > 0 || Number(stakingApy?.data?.value) > 0) ? (
                      <section className="flex items-center gap-1 text-primary">
                        {formatAndRoundBigNumber(
                          HUNDRED.mul((apy?.data?.value || constants.Zero).add(stakingApy?.data?.value || constants.Zero) || constants.Zero),
                          18,
                        )} %
                        <InfoIconWithTooltip
                          title="APR Breakdown"
                          content={
                            <ul className="text-sm">
                              <li>
                                Staking APY:{" "}
                                {formatAndRoundBigNumber(
                                  HUNDRED.mul(stakingApy?.data?.value || constants.Zero),
                                  18,
                                )}
                                %
                              </li>
                              <li>
                                Vault APY:{" "}
                                {formatAndRoundBigNumber(
                                  HUNDRED.mul(apy?.data?.value || constants.Zero),
                                  18,
                                )}
                                %
                              </li>
                            </ul>
                          }
                        />
                      </section>
                    ) : <p className="flex items-center gap-1 text-primary">New ✨</p>
                    }
                    chainId={chainId}
                  />
                );
              }}
            />
          </Title>
        </div>

        <div className="w-1/2 md:w-1/12 mt-6 md:mt-0">
          <p className="leading-6 text-primaryLight">TVL</p>
          <Title as="td" level={2} fontWeight="font-normal" className="text-primary">
            $ {formatNumber((gaugeAddress ?
              gauge.balance / (10 ** vault.decimals) :
              vault.balance / (10 ** vault.decimals))
              * vault.price)}
          </Title>
        </div>

      </div>
    }
  >
    <div className="flex flex-col md:flex-row mt-8 gap-8">

      <section className="flex flex-col w-full md:w-4/12 gap-8">
        <div className="bg-white flex-grow rounded-lg border border-customLightGray w-full p-6">
          <VaultInputs
            tokenOptions={baseToken}
            hasGauge={!!gaugeAddress}
          />
        </div>
      </section>

      <section className="bg-white rounded-lg border border-customLightGray w-full md:w-8/12 p-6 md:p-8 hidden md:flex flex-col">
        <div className="flex flex-row items-center">
          <TokenIcon token={asset?.address} icon={asset?.icon} chainId={chainId} imageSize="w-8 h-8" />
          <Title level={2} as="span" className="text-gray-900 mt-1.5 ml-3">
            {asset?.name}
          </Title>
        </div>
        <div className="mt-8">
          <MarkdownRenderer content={`# ${vaultMetadata?.metadata?.token?.name} \n${vaultMetadata?.metadata?.token?.description}`} />
        </div>
        <div className="mt-8">
          <MarkdownRenderer content={`# ${vaultMetadata?.metadata?.protocol?.name} \n${vaultMetadata?.metadata?.protocol?.description}`} />
        </div>
        <div className="mt-8">
          <MarkdownRenderer content={`# Strategies \n${vaultMetadata?.metadata?.strategy?.description}`} />
        </div>
      </section>

    </div>
  </Accordion>
  )
}

export default SweetVault;
