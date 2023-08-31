import { Fragment, useEffect, useState } from "react";
import { Address, useAccount, useNetwork, useSwitchNetwork, useToken } from "wagmi";
import { Contract, constants } from "ethers";

import { BalanceOf } from "lib/Erc20";
import useVaultToken from "hooks/useVaultToken";

import { ChainId, RPC_PROVIDERS, formatAndRoundBigNumber } from "lib/utils";
import Title from "components/content/Title";
import { Apy } from "lib/Staking";
import MarkdownRenderer from "./MarkdownRenderer";
import Accordion from "../Accordion";
import TokenIcon from "components/TokenIcon";
import { NetworkSticker } from "components/NetworkSticker";
import { useAllowance, useBalanceOf, useTotalSupply } from "lib/Erc20/hooks";
import { usePrice } from "lib/Price";
import { useTotalAssets } from "lib/Vault/hooks";
import { formatAndRoundNumber, formatNumber } from "lib/utils/formatBigNumber";
import useVaultMetadata, { VaultMetadata, VaultTag } from "lib/Vault/hooks/useVaultMetadata";

import { SweetVaultTVL } from "lib/Vault/AllSweetVaultsTVL";
import useAdapterToken from "hooks/useAdapter";
import InputTokenWithError from "components/InputTokenWithError";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import MainActionButton from "components/MainActionButton";
import TabSelector from "components/TabSelector";
import useApproveBalance from "hooks/useApproveBalance";
import useWaitForTx from "lib/utils/hooks/useWaitForTx";
import toast from "react-hot-toast";
import { useVaultDeposit, useVaultRedeem } from "lib/Vault/hooks/interactions";
import { useGaugeDeposit, useGaugeWithdraw } from "lib/Gauges/utils";
import { InfoIconWithTooltip } from "components/InfoIconWithTooltip";
import { useBaseVaultInputToken } from "lib/Vault/hooks/utils";

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

export function AssetWithName({ token, vault, chainId }: { token: any; vault: VaultMetadata, chainId: ChainId }) {
  const protocolIcon = PROTOCOL_ICONS[vault?.metadata?.protocol?.name]
  return <div className="flex items-center gap-4">
    <div className="relative">
      <NetworkSticker chainId={chainId} />
      <TokenIcon token={token?.address} icon={token?.icon} chainId={chainId} imageSize="w-8 h-8" />
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

function noOp() { }

function VaultInputs({ tokenOptions, hasGauge }) {
  const { waitForTx } = useWaitForTx();
  const { address: account, connector } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const [inputToken, setInputToken] = useState<any>()
  const [outputToken, setOutputToken] = useState<any>()

  const [inputBalance, setInputBalance] = useState<number>(0);

  const asset = tokenOptions[0];
  const vault = tokenOptions[1];
  const gauge = hasGauge ? tokenOptions[2] : undefined;

  useEffect(() => {
    if (tokenOptions.length > 0 && !inputToken?.address && !outputToken?.address) {
      // set default input/output tokens
      setInputToken(tokenOptions[0])
      setOutputToken(hasGauge ? gauge : vault)
    }
  }, [tokenOptions])

  const isDeposit = outputToken?.address === (gauge || vault).address

  function handleChangeInput(e) {
    setInputBalance(Number(e.currentTarget.value));
  }

  function switchTokens() {
    if (isDeposit) {
      // Switch to Withdraw
      setInputToken(hasGauge ? gauge : vault);
      setOutputToken(asset)
    } else {
      // Switch to Deposit
      setInputToken(asset);
      setOutputToken(hasGauge ? gauge : vault)
    }
  }

  const {
    writeAsync: approve = noOp,
  } = useApproveBalance(inputToken?.address, inputToken?.target.address, vault?.chainId, {
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

  const {
    writeAsync: approveVault = noOp,
  } = useApproveBalance(vault?.address, vault?.target.address, vault?.chainId, {
    onSuccess: (tx) => {
      waitForTx(tx, {
        successMessage: "Vault approved!",
        errorMessage: "Something went wrong",
      });
    },
    onError: () => {
      toast.error("User rejected the transaction", {
        position: "top-center",
      });
    },
  });

  const { writeAsync: vaultDeposit } = useVaultDeposit(vault?.address, vault?.chainId, (inputBalance * (10 ** inputToken?.decimals) || 0));
  const { writeAsync: vaultRedeem } = useVaultRedeem(vault?.address, vault?.chainId, (inputBalance * (10 ** inputToken?.decimals) || 0));
  const { writeAsync: gaugeDeposit } = useGaugeDeposit(gauge?.address, vault?.chainId, (inputBalance * (10 ** inputToken?.decimals) || 0));
  const { writeAsync: gaugeWithdraw } = useGaugeWithdraw(gauge?.address, vault?.chainId, (inputBalance * (10 ** inputToken?.decimals) || 0));

  async function depositAndStake() {
    console.log("depositAndStake")
    const oldBal = vault?.balance
    console.log("deposit")
    let tx = await vaultDeposit()
    console.log("wait")
    await tx.wait(1)

    console.log("contract")
    const vaultContract = new Contract(vault?.address, ["function balanceOf(address) view returns (uint256)", "function approve(address spender, uint256 amount) public"], RPC_PROVIDERS[vault?.chainId]);
    console.log("newBal")
    const newBal = await vaultContract.balanceOf(account)
    console.log(newBal, Number(newBal), oldBal, Number(oldBal))
    const depositAmount = Number(newBal) - Number(oldBal)
    console.log("depositAmount", Number(depositAmount).toLocaleString("fullwide", { useGrouping: false }))

    console.log("getSigner")
    const signer = await connector.getSigner()


    console.log(vault.allowance, depositAmount)
    if (!(vault.allowance > 0 && vault.allowance >= depositAmount)) {
      console.log("approve")
      let tx = await vaultContract.connect(signer).approve(gauge?.address, "115792089237316195423570985008687907853269984665640")
      console.log("wait approve")
      await tx.wait(1)
    }

    const gaugeContract = new Contract(gauge?.address, ["function deposit(uint256 amount) external"], RPC_PROVIDERS[vault?.chainId]);
    console.log("gauge deposit")
    gaugeContract.connect(signer).deposit(Number(depositAmount).toLocaleString("fullwide", { useGrouping: false }))
  }

  async function unstakeAndWithdraw() {
    const oldBal = vault?.balance
    console.log("gaugeWithdraw")
    let tx = await gaugeWithdraw()
    console.log("wait")
    await tx.wait(1)

    const vaultContract = new Contract(vault?.address, ["function balanceOf(address) view returns (uint256)", "function redeem(uint256 amount) external"], RPC_PROVIDERS[vault?.chainId]);
    console.log("newBal")
    const newBal = await vaultContract.balanceOf(account)
    const withdrawAmount = Number(newBal) - Number(oldBal)
    console.log("withdrawAmount", Number(withdrawAmount).toLocaleString("fullwide", { useGrouping: false }))

    console.log("signer")
    const signer = await connector.getSigner()

    console.log("redeem")
    vaultContract.connect(signer).redeem(Number(withdrawAmount).toLocaleString("fullwide", { useGrouping: false }))
  }

  function sufficientAllowance(token: any) {
    return token.allowance > 0 && token.allowance >= (inputBalance * (10 ** token?.decimals))
  }

  async function handleMainAction() {
    if (inputBalance === 0) return;

    if (chain.id !== Number(vault.chainId)) switchNetwork?.(Number(vault.chainId));

    switch (inputToken.address) {
      case asset.address:
        console.log("in asset")
        if (outputToken.address === vault.address) {
          console.log("out vault")
          if (!sufficientAllowance(inputToken)) await approve()
          gaugeDeposit()
        }
        else if (outputToken.address === gauge.address) {
          console.log("out gauge")
          if (!sufficientAllowance(inputToken)) await approve()
          if (!sufficientAllowance(vault)) await approveVault()
          depositAndStake()
        }
        else {
          console.log("out error")
          // wrong output token
          return
        }
        break;
      case vault.address:
        console.log("in vault")
        if (outputToken.address === asset.address) {
          console.log("out asset")
          vaultRedeem()
        }
        else if (outputToken.address === gauge.address) {
          console.log("out gauge")
          if (!sufficientAllowance(vault)) await approveVault()
          gaugeDeposit()
        }
        else {
          console.log("out error")
          // wrong output token
          return
        }
        break;
      case gauge.address:
        console.log("in gauge")
        if (outputToken.address === asset.address) {
          console.log("out asset")
          unstakeAndWithdraw()
        }
        else if (outputToken.address === vault.address) {
          console.log("out vault")
          gaugeWithdraw()
        }
        else {
          console.log("out error")
          // wrong output token
          return
        }
        break;
    }
  }

  if (!inputToken || !outputToken) return <></>
  return <>
    <TabSelector
      className="mb-6"
      availableTabs={["Deposit", "Withdraw"]}
      activeTab={isDeposit ? "Deposit" : "Withdraw"}
      setActiveTab={switchTokens}
    />
    <InputTokenWithError
      captionText={isDeposit ? "Deposit Amount" : "Withdraw Amount"}
      onSelectToken={option => setInputToken(option)}
      onMaxClick={() => handleChangeInput({ currentTarget: { value: inputToken.balance / (10 ** inputToken.decimals) } })}
      chainId={vault.chainId}
      value={inputBalance}
      onChange={handleChangeInput}
      selectedToken={inputToken}
      errorMessage={""}
      tokenList={[]}
      allowSelection={false}
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
            onClick={switchTokens}
          />
        </span>
      </div>
    </div>
    <InputTokenWithError
      captionText={"Output Amount"}
      onSelectToken={option => setOutputToken(option)}
      onMaxClick={() => { }}
      chainId={vault.chainId}
      value={(inputBalance * (Number(inputToken.price)) / Number(outputToken.price)) || 0}
      onChange={() => { }}
      selectedToken={outputToken}
      errorMessage={""}
      tokenList={[]}
      allowSelection={false}
      allowInput={false}
    />
    <div className="mt-8">
      <MainActionButton label={isDeposit ? "Deposit" : "Withdraw"} handleClick={handleMainAction} />
    </div>
  </>
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
