import { ArrowDownIcon } from "@heroicons/react/24/outline";
import InputTokenWithError from "components/InputTokenWithError";
import MainActionButton from "components/MainActionButton";
import TabSelector from "components/TabSelector";
import { Contract, constants } from "ethers";
import { vaultDeposit, vaultDepositAndStake, vaultRedeem, vaultUnstakeAndWithdraw } from "lib/Vault/hooks/interactions";
import { RPC_PROVIDERS } from "lib/utils";
import { useEffect, useState } from "react";
import { Address, useAccount, useNetwork, useSwitchNetwork } from "wagmi";

const { VaultRouter: VAULT_ROUTER } = { VaultRouter: constants.AddressZero }

async function handleAllowance(token: any, connector: any, spender: string, inputAmount: number): Promise<boolean> {
  console.log({ token, connector, spender, inputAmount })
  const tokenContract = new Contract(
    token?.address,
    [
      "function balanceOf(address) view returns (uint256)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function approve(address spender, uint256 amount) public"
    ],
    RPC_PROVIDERS[token?.chainId]
  );
  const account = await connector.getAccount()
  const allowance = await tokenContract.allowance(account, spender)
  console.log({ allowance: Number(allowance) })
  if (Number(allowance) === 0 || Number(allowance) < inputAmount) {
    const signer = await connector.getSigner()

    const tx = await tokenContract.connect(signer).approve(spender, "115792089237316195423570985008687907853269984665640")
    await tx.wait(1)
  }
  return true
}

export default function VaultInputs({ tokenOptions, hasGauge }) {
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


  async function handleMainAction() {
    if (inputBalance === 0) return;

    if (chain.id !== Number(vault.chainId)) switchNetwork?.(Number(vault.chainId));

    switch (inputToken.address) {
      case asset.address:
        console.log("in asset")
        if (outputToken.address === vault.address) {
          console.log("out vault")
          await handleAllowance(inputToken, connector, vault?.address, (inputBalance * (10 ** inputToken?.decimals)))
          vaultDeposit(vault?.address, (inputBalance * (10 ** inputToken?.decimals)), connector)
        }
        else if (outputToken.address === gauge.address) {
          console.log("out gauge")
          await handleAllowance(inputToken, connector, VAULT_ROUTER, (inputBalance * (10 ** inputToken?.decimals)))
          vaultDepositAndStake(VAULT_ROUTER, vault?.address, gauge?.address, (inputBalance * (10 ** inputToken?.decimals)), connector)
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
          vaultRedeem(vault?.address, (inputBalance * (10 ** inputToken?.decimals)), connector)
        }
        else if (outputToken.address === gauge.address) {
          console.log("out gauge")
          await handleAllowance(vault, connector, gauge?.address, (inputBalance * (10 ** vault?.decimals)))
          //gaugeDeposit()
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
          await handleAllowance(inputToken, connector, VAULT_ROUTER, (inputBalance * (10 ** inputToken?.decimals)))
          vaultUnstakeAndWithdraw(VAULT_ROUTER, vault?.address, gauge?.address, (inputBalance * (10 ** inputToken?.decimals)), connector)
        }
        else if (outputToken.address === vault.address) {
          console.log("out vault")
          //gaugeWithdraw()
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