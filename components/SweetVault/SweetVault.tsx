import { Fragment, useEffect, useMemo, useState } from "react";
import { Address, useAccount, useSigner, useToken } from "wagmi";
import { BigNumber, constants } from "ethers";

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
import useApproveBalance from "hooks/useApproveBalance";
import useWaitForTx from "lib/utils/hooks/useWaitForTx";
import { validateInput } from "./internals/input";
import { parseUnits } from "ethers/lib/utils.js";
import toast from "react-hot-toast";
import { getBalances, getTokenAllowance, quote } from "wido";
import MainActionButton from "components/MainActionButton";
import InputTokenWithError from "components/InputTokenWithError";
import { ArrowDownIcon } from "@heroicons/react/24/outline";

const HUNDRED = constants.Zero.add(100);

const VAULT_APY_RESOLVER = {
  "Beefy": "beefy",
  "Yearn": "yearnAsset",
  "Origin": "ousd",
  "Flux": "llama",
  "Idle": "idle"
}

function getTagColor(tag: VaultTag): string {
  switch (tag) {
    case VaultTag.lsd:
    default:
      return "bg-teal-500 text-gray-800";
  }
}

function TagBatch({ tag }: { tag: VaultTag }): JSX.Element {
  return <div className={`${getTagColor(tag)} bg-opacity-[15%] py-1 px-3 rounded-md`}>{tag[0].toUpperCase() + tag.slice(1)}</div>
}

function AssetWithName({ token, vault, chainId }: { token: FetchTokenResult; vault: VaultMetadata, chainId: ChainId }) {
  return <div className="flex items-center gap-4">
    <div className="relative">
      <NetworkSticker chainId={chainId} />
      <TokenIcon token={token?.address} chainId={chainId} imageSize="w-8 h-8" />
    </div>
    <Title level={2} as="span" className="text-gray-900 mt-1">
      {vault?.metadata?.name || vault?.metadata?.token?.name || token?.name}
    </Title>
    <div className="bg-red-500 bg-opacity-[15%] py-1 px-3 text-gray-800 rounded-md">{vault?.metadata?.protocol?.name}</div>
    {/* {vault?.metadata?.tags && vault?.metadata?.tags.length > 0 &&
      <>
        {vault?.metadata?.tags.map((tag) => <TagBatch key={tag} tag={tag} />)}
      </>
    } */}
  </div>
}

const WIDO_TOKEN_MANAGER = "0xF2F02200aEd0028fbB9F183420D3fE6dFd2d3EcD"
const WIDO_ROUTER = "0x7Fb69e8fb1525ceEc03783FFd8a317bafbDfD394"
function noOp() { }

function SweetVault({
  vaultAddress,
  chainId,
  searchString,
  selectedTags,
  inputTokens,
  deployer,
}: {
  chainId: ChainId
  vaultAddress: string
  searchString: string
  selectedTags: string[]
  inputTokens: any[]
  deployer?: string
}) {
  const { address: account } = useAccount();
  const { data: signer } = useSigner();
  const { data: vault } = useToken({ address: vaultAddress as Address, chainId })
  const { data: asset } = useVaultToken(vaultAddress, chainId);
  const { data: adapter } = useAdapterToken(vaultAddress, chainId);
  const vaultMetadata = useVaultMetadata(vaultAddress, asset, adapter, chainId);
  const isDeployer = deployer ? vaultMetadata?.creator === deployer : true;

  const [inputToken, setInputToken] = useState<any>(asset)
  const [outputToken, setOutputToken] = useState<any>(vault)

  const { data: vaultAllowance } = useAllowance({ address: vaultAddress, account: WIDO_TOKEN_MANAGER as Address, chainId });
  const { data: vaultBalance } = useBalanceOf({ address: vaultAddress as Address, chainId, account });

  const { data: price } = usePrice({ address: asset?.address as Address, chainId });
  const { data: totalAssets } = useTotalAssets({ address: vaultAddress as Address, chainId, account });
  const { data: totalSupply } = useTotalSupply({ address: vaultAddress as Address, chainId, account });
  const [pps, setPps] = useState<number>(0);

  const [inputBalance, setInputBalance] = useState<number>(0);
  const [outputPreview, setOutputPreview] = useState<number>(0);
  const [availableToken, setAvailableToken] = useState<any[]>([])

  const isDeposit = inputToken?.address !== vaultAddress
  const showApproveButton = (isDeposit ? (Number(vaultAllowance?.value) / (10 ** vault?.decimals)) : inputToken?.allowance) < inputBalance;

  useEffect(() => {
    if (totalAssets && totalSupply && price
      && Number(totalAssets?.value?.toString()) > 0 && Number(totalSupply?.value?.toString()) > 0) {
      setPps(Number(totalAssets?.value?.toString()) / Number(totalSupply?.value?.toString()));
    }
  }, [totalAssets, totalSupply, price])

  useEffect(() => {
    async function addAvailableToken() {
      const allowances = await Promise.all(inputTokens.map(balance =>
        getTokenAllowance({ chainId: chainId, fromToken: balance.address, toToken: WIDO_TOKEN_MANAGER, toChainId: chainId, accountAddress: account })))
      setAvailableToken(
        inputTokens.map((token, i) => {
          return {
            ...token,
            allowance: Number(allowances[i]) / (10 ** token.decimals),
          }
        }))
    }
    if (account !== undefined) addAvailableToken();
  }, [account, inputTokens])

  const handleChangeInput = ({ currentTarget: { value } }) => {
    setInputBalance(validateInput(value).isValid ? (value as any) : 0);
  };

  const formattedInputBalance = useMemo(() => {
    return parseUnits(validateInput(inputBalance || "0").formatted, inputToken?.decimals);
  }, [inputBalance, asset?.decimals]);

  const { waitForTx } = useWaitForTx();
  const {
    write: approve = noOp,
    isSuccess: isApproveSuccess,
    isLoading: isApproveLoading,
  } = useApproveBalance(inputToken?.address, WIDO_TOKEN_MANAGER, 1, {
    onSuccess: (tx) => {
      waitForTx(tx, {
        successMessage: "Assets approved!",
        errorMessage: "Something went wrong",
      });
    },
    onError: () => {
      toast.error("User rejected the transaction", {
        position: "top-center",
      });
    },
  });

  async function handleDeposit() {
    if ((inputBalance || 0) == 0) return;
    // Early exit if value is ZERO

    //if (chain.id !== Number(chainId)) switchNetwork?.(Number(chainId));

    if (showApproveButton) return approve();
    // When approved continue to deposit
    const quoteResult = await quote({
      fromChainId: Number(chainId),  // Chain Id of from token
      fromToken: inputToken?.address,  // Token address of from token
      toChainId: Number(chainId),  // Chain Id of to token
      toToken: outputToken?.address,  // Token address of to token
      amount: formattedInputBalance?.toString(),  // Token amount of from token
      slippagePercentage: 0.01,  // Acceptable max slippage for the swap
      user: account, // Address of user placing the order.
    });
    signer.sendTransaction({ data: quoteResult.data, to: WIDO_ROUTER, value: "0" }).then(res => console.log(res))
  }

  if (!vaultMetadata || !isDeployer) return <></>
  if (searchString !== "" && !vault?.name.toLowerCase().includes(searchString) && !vault?.symbol.toLowerCase().includes(searchString) && !vaultMetadata?.metadata?.protocol?.name.toLowerCase().includes(searchString)) return <></>
  if (selectedTags.length > 0 && !vaultMetadata?.metadata?.tags?.some((tag) => selectedTags.includes(VaultTag[tag]))) return <></>
  return (
    <Accordion
      header={
        <Fragment>
          <nav className="flex items-center justify-between mb-8 select-none">
            <AssetWithName token={asset} vault={vaultMetadata} chainId={chainId} />
            <AnimatedChevron className="hidden md:flex" />
          </nav>
          <div className="flex flex-row flex-wrap items-center mt-0 md:mt-6 justify-between">
            <div className="w-1/2 md:w-1/4 mt-6 md:mt-0">
              <p className="text-primaryLight font-normal">Your Wallet</p>
              <p className="text-primary text-2xl md:text-3xl leading-6 md:leading-8">
                <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
                  <BalanceOf
                    account={account}
                    chainId={chainId}
                    address={asset?.address}
                    render={(data) => <>{account ? formatAndRoundBigNumber(data?.balance?.value, asset?.decimals) : "-"}</>}
                  />
                </Title>
                <span className="text-secondaryLight text-lg md:text-2xl flex md:inline">{asset?.symbol}</span>
              </p>
            </div>
            <div className="w-1/2 md:w-1/4 mt-6 md:mt-0">
              <p className="text-primaryLight font-normal">Your Deposit</p>
              <div className="text-primary text-2xl md:text-3xl leading-6 md:leading-8">
                <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
                  {account ?
                    formatNumber((pps * Number(vaultBalance?.value?.toString())) / (10 ** (asset?.decimals)))
                    : "-"}
                </Title>
                <span className="text-secondaryLight text-lg md:text-2xl flex md:inline">{asset?.symbol}</span>
              </div>
            </div>
            <div className="w-1/2 md:w-1/4 mt-6 md:mt-0">
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

            <div className="w-1/2 md:w-1/4 mt-6 md:mt-0">
              <p className="leading-6 text-primaryLight">TVL</p>
              <Title as="td" level={2} fontWeight="font-normal" className="text-primary">
                <SweetVaultTVL vaultAddress={vaultAddress} chainId={chainId}>
                  {(tvl) => <>{`$ ${formatNumber(tvl)}`}</>}
                </SweetVaultTVL>
              </Title>
            </div>

          </div>
        </Fragment>
      }
    >
      <div className="flex flex-col md:flex-row mt-8 gap-8">
        <div className="flex flex-col w-full md:w-4/12 gap-8">
          <section className="bg-white flex-grow rounded-lg border border-customLightGray w-full p-6">
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
            <>
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
                value={outputPreview}
                onChange={() => { }}
                selectedToken={outputToken}
                errorMessage={""}
                tokenList={inputToken.address === vault?.address ? availableToken : []}
                allowSelection={inputToken.address === vault?.address}
                allowInput={true}
              />
            </>
            <MainActionButton
              label={showApproveButton ? "Approve" : (isDeposit ? "Deposit" : "Withdraw")}
              type="button"
              handleClick={handleDeposit}
              disabled={inputBalance === 0}
            />
          </section>
        </div>
        <div className="md:hidden flex w-full">
          <Accordion
            initiallyOpen={false}
            containerClassName="w-full bg-white p-6"
            header={
              <Fragment>
                <div className="w-full flex flex-row justify-between">
                  <p className="font-normal text-customBrown">Learn</p>
                  <div className="flex self-center">
                    <RightArrowIcon color="827D69" />
                  </div>
                </div>
              </Fragment>
            }>
            <section className="bg-white rounded-lg w-full md:w-8/12 mt-6">
              <div className="flex flex-row items-center">
                <TokenIcon token={asset?.address} chainId={chainId} imageSize="w-8 h-8" />
                <Title level={2} as="span" className="text-gray-900 mt-1.5 ml-3">
                  {asset?.name}
                </Title>
              </div>
              <div className="mt-8">
                <MarkdownRenderer content={`# ${vaultMetadata?.metadata?.token?.name} \n${vaultMetadata?.metadata?.token?.description}`} />
                <p>{String(availableToken?.map(asset => asset.address))}</p>
              </div>
              <div className="mt-8">
                <MarkdownRenderer content={`# ${vaultMetadata?.metadata?.protocol?.name} \n${vaultMetadata?.metadata?.protocol?.description}`} />
              </div>
              <div className="mt-8">
                <MarkdownRenderer content={`# Strategies \n${vaultMetadata?.metadata?.strategy?.description}`} />
              </div>
            </section>
          </Accordion>
        </div>
        <section className="bg-white rounded-lg border border-customLightGray w-full md:w-8/12 p-6 md:p-8 hidden md:flex flex-col">
          <div className="flex flex-row items-center">
            <TokenIcon token={asset?.address} chainId={chainId} imageSize="w-8 h-8" />
            <Title level={2} as="span" className="text-gray-900 mt-1.5 ml-3">
              {asset?.name}
            </Title>
          </div>
          <div className="mt-8">
            <MarkdownRenderer content={`# ${vaultMetadata?.metadata?.token?.name} \n${vaultMetadata?.metadata?.token?.description}`} />
          </div>
          <div className="mt-8">
            <MarkdownRenderer content={`# Protocol Adapter \n${vaultMetadata?.metadata?.protocol?.description}`} />
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
