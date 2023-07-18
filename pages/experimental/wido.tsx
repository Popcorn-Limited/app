import { WidoWidget } from 'wido-widget'
import { Address, useAccount, useConnect, useDisconnect, useToken } from 'wagmi'
import { RPC_PROVIDERS, RPC_URLS } from 'lib/utils'
import { BigNumber, Contract, constants, ethers } from 'ethers'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import NoSSR from "react-no-ssr";
import { approve, getBalances, getSupportedTokens, getTokenAllowance, quote } from 'wido'
import { formatUnits, parseUnits } from 'ethers/lib/utils.js'
import { FormEventHandler, useEffect, useMemo, useState } from 'react'
import InputTokenWithError from "components/InputTokenWithError";
import { parse } from 'path'
import TokenIcon from 'components/TokenIcon'
import FeeBreakdown from 'components/SweetVault/FeeBreakdown'
import { validateInput } from 'components/AssetInputWithAction/internals/input'
import useVaultToken from 'hooks/useVaultToken'
import { ArrowDownIcon } from '@heroicons/react/24/outline'


const widoTheme = {
  borderRadius: {
    large: 5,
    medium: 5,
    small: 5,
  },
  fontFamily: "",
  fontFamilyCode: "",
  accent: "string",
  accentSoft: "string",
  container: "string",
  module: "string",
  interactive: "string",
  outline: "string",
  dialog: "string",
  scrim: "string",
  primary: "string",
  onAccent: "string",
  secondary: "string",
  hint: "string",
  onInteractive: "string",
  active: "string",
  activeSoft: "string",
  success: "string",
  warning: "string",
  warningSoft: "string",
  error: "string",
  critical: "string",
  criticalSoft: "string",
  networkDefaultShadow: "string",
  deepShadow: "string",
  currentColor: 'currentColor'
}

export default function WidoPage() {
  return (
    <NoSSR>
      <WidoTest />
    </NoSSR>
  )
}

function WidoSweetVault({ vaultAddress }: { vaultAddress: string }) {
  const { address: account } = useAccount()
  const { data: vault } = useToken({ address: vaultAddress as Address, chainId: 1 })
  const { data: asset } = useVaultToken(vaultAddress, 1);
  const [inputToken, setInputToken] = useState<any>(asset)
  const [outputToken, setOutputToken] = useState<any>(vault)
  const [inputBalance, setInputBalance] = useState<number>(0);
  const [outputPreview, setOutputPreview] = useState<number>(0);
  const [availableToken, setAvailableToken] = useState<any[]>([])

  const handleChangeInput = ({ currentTarget: { value } }) => {
    setInputBalance(validateInput(value).isValid ? (value as any) : 0);
  };

  const formattedInputBalance = useMemo(() => {
    return parseUnits(validateInput(inputBalance || "0").formatted, inputToken?.decimals);
  }, [inputBalance, asset?.decimals]);


  useEffect(() => {
    async function getAvailableToken() {
      let balances = await getBalances(
        account, // Address of the user 
        [1] // Optional Array of chain ids to filter by.
      );
      balances = balances.filter(balance => Number(balance.balanceUsdValue) > 10);
      const allowances = await Promise.all(balances.map(balance =>
        getTokenAllowance({ chainId: 1, fromToken: balance.address, toToken: vaultAddress, toChainId: 1, accountAddress: account })))

      setAvailableToken(
        balances.map((balance, i) => {
          return {
            address: balance.address,
            name: balance.name,
            symbol: balance.symbol,
            decimals: balance.decimals,
            icon: balance.logoURI,
            balance: BigNumber.from(balance.balance),
            allowances: BigNumber.from(allowances[i].allowance),
            price: BigNumber.from("1"),
          }
        }))
    }
    getAvailableToken();
  }, [account])

  useEffect(() => {
    async function getPreview() {
      const quoteResult = await quote({
        fromChainId: 1,  // Chain Id of from token
        fromToken: inputToken?.address,  // Token address of from token
        toChainId: 1,  // Chain Id of to token
        toToken: outputToken?.address,  // Token address of to token
        amount: formattedInputBalance?.toString(),  // Token amount of from token
        slippagePercentage: 0.01,  // Acceptable max slippage for the swap
        user: account, // Address of user placing the order.
      })
      setOutputPreview(quoteResult.toTokenAmount ? Number(quoteResult.toTokenAmount) / (10 ** outputToken.decimals) : 0)
    }
    getPreview();
  }, [inputBalance, inputToken, outputToken])

  return (
    <div className="flex flex-col w-full md:w-4/12 gap-8">
      <section className="bg-white flex-grow rounded-lg border border-customLightGray w-full p-6">
        <InputTokenWithError
          captionText={"Input"}
          onSelectToken={option => setInputToken(option)}
          onMaxClick={() => handleChangeInput({ currentTarget: { value: Number(inputToken.balance) / (10 ** inputToken.decimals) } })}
          chainId={1}
          value={inputBalance}
          onChange={handleChangeInput}
          selectedToken={inputToken}
          errorMessage={""}
          tokenList={outputToken.address === vault.address ? availableToken : []}
          allowSelection={outputToken.address === vault.address}
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
            captionText={"Output"}
            onSelectToken={option => setOutputToken(option)}
            onMaxClick={() => { }}
            chainId={1}
            value={outputPreview}
            onChange={() => { }}
            selectedToken={outputToken}
            errorMessage={""}
            tokenList={inputToken.address === vault.address ? availableToken : []}
            allowSelection={inputToken.address === vault.address}
          />
        </>
      </section>
    </div>)
}


function WidoTest() {
  const { connector: activeConnector, isConnected, address: account } = useAccount()
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect()
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect()
  const [availableToken, setAvailableToken] = useState([])

  const ethProvider = window.ethereum
    ? new ethers.providers.Web3Provider(window.ethereum as any)
    : undefined;

  useEffect(() => {
    async function getAvailableToken() {
      const balances = await getBalances(
        account, // Address of the user 
        [1] // Optional Array of chain ids to filter by.
      );
      setAvailableToken(balances.filter(balance => Number(balance.balanceUsdValue) > 10).map(balance => { return { chainId: 1, address: balance.address } }))
    }
    getAvailableToken();
  }, [account])

  return <div className='flex flex-row items-center space-x-8'>
    <div>
      <button onClick={() => disconnect()}>Disconnect</button>
      <WidoWidget
        onConnectWalletClick={openConnectModal}
        ethProvider={ethProvider}
        presetFromToken={{ chainId: 1, address: "0x6B175474E89094C44Da98b954EedeAC495271d0F" }}
        fromTokens={availableToken}
        toTokens={[{ chainId: 1, address: "0x5d344226578DC100b2001DA251A4b154df58194f" }]}
        // width={200}
        title="Title"
      />
    </div>
    <WidoSweetVault vaultAddress={"0x5d344226578DC100b2001DA251A4b154df58194f"} />
  </div>
}

