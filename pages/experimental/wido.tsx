import { WidoWidget } from 'wido-widget'
import { Address, useAccount, useConnect, useDisconnect, useToken, useSigner } from 'wagmi'
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
import MainActionButton from 'components/MainActionButton'
import useApproveBalance from "hooks/useApproveBalance";
import useWaitForTx from 'lib/utils/hooks/useWaitForTx'
import toast from 'react-hot-toast'
import { useAllowance } from 'lib/Erc20/hooks'


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

function noOp() { }


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
  const { waitForTx } = useWaitForTx();
  const { data: allowance } = useAllowance({ address: inputToken?.address, account: "0xF2F02200aEd0028fbB9F183420D3fE6dFd2d3EcD" as Address, chainId: 1 });
  const { data: signer } = useSigner();
  const [actionData, setActionData] = useState<string>("")

  const showApproveButton = Number(allowance?.value) < inputBalance;
  const isDeposit = inputToken?.address !== vaultAddress

  const handleChangeInput = ({ currentTarget: { value } }) => {
    setInputBalance(validateInput(value).isValid ? (value as any) : 0);
  };

  const formattedInputBalance = useMemo(() => {
    return parseUnits(validateInput(inputBalance || "0").formatted, inputToken?.decimals);
  }, [inputBalance, asset?.decimals]);

  const {
    write: approve = noOp,
    isSuccess: isApproveSuccess,
    isLoading: isApproveLoading,
  } = useApproveBalance(inputToken?.address, "0xF2F02200aEd0028fbB9F183420D3fE6dFd2d3EcD", 1, {
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
    signer.sendTransaction({ data: actionData, to: "0x7Fb69e8fb1525ceEc03783FFd8a317bafbDfD394", value: "0" }).then(res => console.log(res))
  }


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

    if (account !== undefined) getAvailableToken();
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
      setActionData(quoteResult.data)
      setOutputPreview(quoteResult.toTokenAmount ? Number(quoteResult.toTokenAmount) / (10 ** outputToken.decimals) : 0)
    }
    if (account !== undefined) getPreview();


  }, [inputBalance, inputToken, outputToken, account])

  return (
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
            captionText={"Output Amount"}
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
        <MainActionButton
          label={showApproveButton ? "Approve" : (isDeposit ? "Deposit" : "Withdraw")}
          type="button"
          handleClick={handleDeposit}
          disabled={inputBalance === 0}
        />
      </section>
    </div>)
}


function WidoTest() {
  return <div className='flex flex-row items-center'>
    <WidoSweetVault vaultAddress={"0x5d344226578DC100b2001DA251A4b154df58194f"} />
  </div>
}

