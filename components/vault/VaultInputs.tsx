import { ArrowDownIcon } from "@heroicons/react/24/outline";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import MainActionButton from "@/components/button/MainActionButton";
import { useEffect, useState } from "react";
import { Address, useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import TabSelector from "@/components/common/TabSelector";
import { Token } from "@/lib/types";
import { handleAllowance } from "@/lib/approve";
import { WalletClient } from "viem";
import { vaultDeposit, vaultDepositAndStake, vaultRedeem, vaultUnstakeAndWithdraw, zapIntoGauge, zapIntoVault } from "@/lib/vault/interactions";
import { validateInput } from "@/lib/utils/helpers";
import { getVeAddresses } from "@/lib/utils/addresses";
import { gaugeDeposit, gaugeWithdraw } from "@/lib/gauges/interactions";
import { ERC20Abi } from "@/lib/constants";
import zap from "@/lib/vault/zap";

const { VaultRouter: VAULT_ROUTER } = getVeAddresses()
const COWSWAP_RELAYER = "0xC92E8bdf79f0507f65a392b0ab4667716BFE0110"

interface VaultInputsProps {
  vault: Token;
  asset: Token;
  gauge?: Token;
  tokenOptions: Token[];
  chainId: number
}

export default function VaultInputs({ vault, asset, gauge, tokenOptions, chainId }: VaultInputsProps): JSX.Element {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient()
  const { address: account } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const [inputToken, setInputToken] = useState<Token>()
  const [outputToken, setOutputToken] = useState<Token>()

  const [inputBalance, setInputBalance] = useState<string>("0");

  const [isDeposit, setIsDeposit] = useState<boolean>(true);

  useEffect(() => {
    // set default input/output tokens
    setInputToken(asset)
    setOutputToken(!!gauge ? gauge : vault)
  }, [])

  function handleChangeInput(e: any) {
    const value = e.currentTarget.value
    setInputBalance(validateInput(value).isValid ? value : "0");
  };


  function switchTokens() {
    if (isDeposit) {
      // Switch to Withdraw
      setInputToken(!!gauge ? gauge : vault);
      setOutputToken(asset)
      setIsDeposit(false)
    } else {
      // Switch to Deposit
      setInputToken(asset);
      setOutputToken(!!gauge ? gauge : vault)
      setIsDeposit(true)
    }
  }


  async function handleMainAction() {
    const val = Number(inputBalance)
    if (val === 0 || !inputToken || !outputToken || !account || !walletClient) return;

    if (chain?.id !== Number(chainId)) switchNetwork?.(Number(chainId));

    switch (inputToken.address) {
      case asset.address:
        console.log("in asset")
        if (outputToken.address === vault.address) {
          console.log("out vault")
          await handleAllowance({
            token: inputToken.address,
            inputAmount: (val * (10 ** inputToken.decimals)),
            account,
            spender: vault.address,
            publicClient,
            walletClient
          })
          vaultDeposit({
            address: vault.address,
            account,
            amount: (val * (10 ** inputToken.decimals)),
            publicClient,
            walletClient
          })
        }
        else if (outputToken.address === gauge?.address) {
          console.log("out gauge")
          await handleAllowance({
            token: inputToken.address,
            inputAmount: (val * (10 ** inputToken.decimals)),
            account,
            spender: VAULT_ROUTER,
            publicClient,
            walletClient
          })
          vaultDepositAndStake({
            address: VAULT_ROUTER,
            account,
            amount: (val * (10 ** inputToken.decimals)),
            vault: vault?.address as Address,
            gauge: gauge?.address as Address,
            publicClient,
            walletClient
          })
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
          vaultRedeem({
            address: vault.address,
            account,
            amount: (val * (10 ** inputToken.decimals)),
            publicClient,
            walletClient
          })
        }
        else if (outputToken.address === gauge?.address) {
          console.log("out gauge")
          await handleAllowance({
            token: inputToken.address,
            inputAmount: (val * (10 ** inputToken.decimals)),
            account,
            spender: gauge.address,
            publicClient,
            walletClient
          })
          gaugeDeposit({
            address: gauge.address,
            amount: (val * (10 ** inputToken.decimals)),
            account,
            clients: {
              publicClient,
              walletClient
            }
          })
        }
        else if (outputToken.address === vault.address) {
          console.log("out error")
          // wrong output token
          return
        }
        else {
          console.log("out zap")

          const preBal = asset.balance
          await vaultRedeem({
            address: vault.address,
            account,
            amount: (val * (10 ** inputToken.decimals)),
            publicClient,
            walletClient
          })
          const postBal = Number(await publicClient.readContract({ address: asset.address, abi: ERC20Abi, functionName: "balanceOf", args: [account] }))
          zap({ account, signer: walletClient, sellToken: asset.address, buyToken: outputToken.address, amount: postBal - preBal })
        }
        break;
      case gauge?.address:
        console.log("in gauge")
        if (outputToken.address === asset.address) {
          console.log("out asset")
          await handleAllowance({
            token: inputToken.address,
            inputAmount: (val * (10 ** inputToken.decimals)),
            account,
            spender: VAULT_ROUTER,
            publicClient,
            walletClient
          })
          vaultUnstakeAndWithdraw({
            address: VAULT_ROUTER,
            account,
            amount: (val * (10 ** inputToken.decimals)),
            vault: vault.address,
            gauge: gauge?.address as Address,
            publicClient,
            walletClient
          })
        }
        else if (outputToken.address === vault.address) {
          console.log("out vault")
          gaugeWithdraw({
            address: gauge?.address as Address,
            amount: (val * (10 ** inputToken.decimals)),
            account,
            clients: {
              publicClient,
              walletClient
            }
          })
        }
        else if (outputToken.address === gauge?.address) {
          console.log("out error")
          // wrong output token
          return
        }
        else {
          console.log("out zap")

          const preBal = asset.balance
          await handleAllowance({
            token: inputToken.address,
            inputAmount: (val * (10 ** inputToken.decimals)),
            account,
            spender: VAULT_ROUTER,
            publicClient,
            walletClient
          })
          await vaultUnstakeAndWithdraw({
            address: VAULT_ROUTER,
            account,
            amount: (val * (10 ** inputToken.decimals)),
            vault: vault.address,
            gauge: gauge?.address as Address,
            publicClient,
            walletClient
          })
          const postBal = Number(await publicClient.readContract({ address: asset.address, abi: ERC20Abi, functionName: "balanceOf", args: [account] }))
          zap({ account, signer: walletClient, sellToken: asset.address, buyToken: outputToken.address, amount: postBal - preBal })
        }
        break;
      default:
        console.log("in zap asset")
        if (outputToken.address === vault.address) {
          console.log("out vault")
          // handle cow router allowance
          await handleAllowance({
            token: inputToken.address,
            inputAmount: (val * (10 ** inputToken.decimals)),
            account,
            spender: COWSWAP_RELAYER,
            publicClient,
            walletClient
          })
          zapIntoVault({
            sellToken: inputToken.address,
            asset: asset.address,
            vault: vault.address,
            account,
            amount: (val * (10 ** inputToken.decimals)),
            publicClient,
            walletClient
          })
        }
        else if (outputToken.address === gauge?.address) {
          console.log("out gauge")
          await handleAllowance({
            token: inputToken.address,
            inputAmount: (val * (10 ** inputToken.decimals)),
            account,
            spender: COWSWAP_RELAYER,
            publicClient,
            walletClient
          })
          zapIntoGauge({
            sellToken: inputToken.address,
            router: VAULT_ROUTER,
            asset: asset.address,
            vault: vault.address,
            gauge: gauge.address,
            account,
            amount: (val * (10 ** inputToken.decimals)),
            publicClient,
            walletClient
          })
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
      chainId={chainId}
      value={inputBalance}
      onChange={handleChangeInput}
      selectedToken={inputToken}
      errorMessage={""}
      tokenList={tokenOptions.filter(token =>
        gauge?.address
          ? token.address !== gauge?.address
          : token.address !== vault.address
      )}
      allowSelection={isDeposit}
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
      chainId={chainId}
      value={(Number(inputBalance) * (Number(inputToken?.price)) / Number(outputToken?.price)) || 0}
      onChange={() => { }}
      selectedToken={outputToken}
      errorMessage={""}
      tokenList={tokenOptions.filter(token =>
        gauge?.address
          ? token.address !== gauge?.address
          : token.address !== vault.address
      )}
      allowSelection={!isDeposit}
      allowInput={false}
    />
    <div className="mt-8">
      <MainActionButton label={isDeposit ? "Deposit" : "Withdraw"} handleClick={handleMainAction} />
    </div>
  </>
}