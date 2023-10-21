import { Address, useAccount, useConnect, useDisconnect, useToken, useSigner } from 'wagmi'
import { utils, constants } from 'ethers'
import NoSSR from "react-no-ssr";
import { getBalances, getTokenAllowance, quote } from 'wido'
import { parseUnits } from 'ethers/lib/utils.js'
import { useEffect, useMemo, useState, useCallback, FormEvent } from 'react'
import InputTokenWithError from "components/InputTokenWithError";
import { validateInput } from 'components/AssetInputWithAction/internals/input'
import useVaultToken from 'hooks/useVaultToken'
import { ArrowDownIcon } from '@heroicons/react/24/outline'
import MainActionButton from 'components/MainActionButton'
import useApproveBalance from "hooks/useApproveBalance";
import useWaitForTx from 'lib/utils/hooks/useWaitForTx'
import toast from 'react-hot-toast'
import { useAllowance } from 'lib/Erc20/hooks'


import { OrderBookApi, SupportedChainId, OrderSigningUtils, OrderKind, OrderQuoteSideKindSell, SubgraphApi } from '@cowprotocol/cow-sdk'

const orderBookApi = new OrderBookApi({ chainId: SupportedChainId.MAINNET })

function noOp() { }

export default function CowswapPage() {
    return (
        <NoSSR>
            <CowswapTest />
        </NoSSR>
    )
}

const COWSWAP_TOKEN_MANAGER = "0xF2F02200aEd0028fbB9F183420D3fE6dFd2d3EcD"

function CowswapSweetVault({ vaultAddress }: { vaultAddress: string }) {
    const { address: account } = useAccount();
    const { data: vault } = useToken({ address: vaultAddress as Address, chainId: 1 })
    const { data: asset } = useVaultToken(vaultAddress, 1);

    const [inputToken, setInputToken] = useState<any>("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2") // FRAX
    const [outputToken, setOutputToken] = useState<any>("0x6B175474E89094C44Da98b954EedeAC495271d0F") // DAI

    const [cowSwapQuoteResponse, setCowSwapQuoteResponse] = useState<any>("");

    const [inputBalance, setInputBalance] = useState<number>(0);
    const [outputPreview, setOutputPreview] = useState<number>(0);

    const [availableToken, setAvailableToken] = useState<any[]>([])

    const { waitForTx } = useWaitForTx();
    const { data: allowance } = useAllowance({ address: inputToken?.address, account: COWSWAP_TOKEN_MANAGER as Address, chainId: 1 });

    const { data: signer } = useSigner();

    const [actionData, setActionData] = useState<string>("")

    const showApproveButton = Number(allowance?.value) < Number(inputBalance);
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
    } = useApproveBalance(inputToken?.address, COWSWAP_TOKEN_MANAGER, 1, {
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

    useEffect(() => {
        const getQuote = async () => {
            try {
                const quoteResponse = await orderBookApi.getQuote({
                    kind: OrderQuoteSideKindSell.SELL,
                    sellToken: inputToken,
                    buyToken: outputToken,
                    sellAmountBeforeFee: utils.parseUnits(inputBalance.toString(), 18).toString(), // 1 WETH
                    receiver: account,
                    from: account,
                    validTo: Math.floor(Date.now() / 1000) + 3600,
                });
                console.log("quoteResponse", quoteResponse);
                setCowSwapQuoteResponse(quoteResponse);
                setOutputPreview(Number(parseFloat(utils.formatEther(quoteResponse.quote.buyAmount.toString())).toFixed(3)));
            } catch (error) {
                toast.error("Error fetching quote - Try inputing different amount", {
                    position: "top-center",
                });
            }
        };

        if (account !== undefined) getQuote();

    }, [inputBalance, inputToken, outputToken, account]);



    async function sendOrder() {
        const { sellToken, buyToken, validTo, buyAmount, sellAmount, receiver, feeAmount } = cowSwapQuoteResponse.quote
        const order = {
            kind: OrderKind.SELL,
            receiver: account,
            sellToken: inputToken,
            buyToken: outputToken,
            partiallyFillable: false,
            validTo: Math.floor(Date.now() / 1000) + 3600,
            sellAmount: sellAmount,
            buyAmount: buyAmount,
            feeAmount: feeAmount,
            // The appData allows you to attach arbitrary information (meta-data) to the order.
            appData: '0x0000000000000000000000000000000000000000000000000000000000000000'
        }

        const signedOrder = await OrderSigningUtils.signOrder(order, SupportedChainId.MAINNET, signer) as any

        console.log("signedOrder", signedOrder);
        const orderId = await orderBookApi.sendOrder({ ...order, ...signedOrder });

        console.log("orderId", orderId);
        return orderId;
    }

    async function handleZap() {
        if ((inputBalance || 0) == 0) return;
        // Early exit if value is ZERO

        //if (chain.id !== Number(chainId)) switchNetwork?.(Number(chainId));

        if (showApproveButton) return approve();

        // When approved continue to zap
        const orderId = await sendOrder();
    }

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
                    tokenList={availableToken}
                    allowSelection={true}
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
                                        setInputToken(outputToken);
                                        setOutputToken(inputToken);
                                        setInputBalance(outputPreview);
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
                        tokenList={availableToken}
                        allowSelection={true}
                    />
                </>
                <MainActionButton
                    label={showApproveButton ? "Approve" : "Zap"}
                    type="button"
                    handleClick={handleZap}
                    disabled={Number(inputBalance) === 0}
                />
            </section>
        </div>
    )
}


function CowswapTest() {
    return <div className='flex flex-row items-center'>
        <CowswapSweetVault vaultAddress={"0x5d344226578DC100b2001DA251A4b154df58194f"} />
    </div>
}

