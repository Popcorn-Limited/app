import { Address, useAccount, useConnect, useDisconnect, useToken, useSigner } from 'wagmi'
import { utils, constants } from 'ethers'
import NoSSR from "react-no-ssr";
import { getBalances, getTokenAllowance, quote } from 'wido'
import { parseUnits } from 'ethers/lib/utils.js'
import { useEffect, useMemo, useState, useCallback, FormEvent } from 'react'
import InputTokenWithError from "components/InputTokenWithError";
import { validateInput } from 'components/AssetInputWithAction/internals/input'
import useVaultToken from 'hooks/useVaultToken'
import { ArrowDownIcon, XMarkIcon } from '@heroicons/react/24/outline'
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

    const { data: input } = useToken({ address: inputToken });
    const { data: output } = useToken({ address: outputToken });

    const [cowSwapQuoteResponse, setCowSwapQuoteResponse] = useState<any>("");

    const [inputBalance, setInputBalance] = useState<number>(100);
    const [outputPreview, setOutputPreview] = useState<number>(0);

    const [availableToken, setAvailableToken] = useState<any[]>([]);

    const [activeTab, setActiveTab] = useState<"Deposit" | "Zap">("Deposit");

    const { waitForTx } = useWaitForTx();
    const { data: allowance } = useAllowance({ address: inputToken?.address, account: COWSWAP_TOKEN_MANAGER as Address, chainId: 1 });

    const { data: signer } = useSigner();

    const [actionData, setActionData] = useState<string>("")

    const showApproveButton = Number(allowance?.value) < Number(inputBalance);

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
                console.log("PING", input);

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
        <div className="flex flex-col w-full md:w-4/12 gap-8 bg-[#23272e] p-6 flex justify-center items-center rounded-4xl">
            <div className="flex flex-col justify-between items-center rounded-t-lg w-full px-6 bg-[#23272e]">
                <div className="flex justify-end w-full cursor-pointer ml-8">
                    <XMarkIcon width={40} color='white' />
                </div>
                <div className="flex justify-between w-full mb-2">
                    <div className="flex items-center mb-6">
                        <span className="text-white text-lg font-bold mr-2">*Icon*</span>
                        <span className="text-white text-3xl font-bold mr-8">Origin Ether</span>
                        <div className="w-[101px] h-[32px] p-2 border border-[#141416] rounded-md bg-[#353945]">
                        </div>
                    </div>
                </div>
                <div className="flex justify-between w-full">
                    <div className="flex flex-col">
                        <span className="text-white text-lg font-normal leading-6 font-teka mb-2">APY</span>
                        <span className="text-white text-2xl font-normal leading-6 text-left font-teka">7.7%</span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-white text-lg font-normal leading-6 font-teka mb-2">TVL</span>
                        <span className="text-white text-2xl font-normal leading-6 text-left font-teka">$746K</span>
                    </div>

                    <div className="flex flex-col justify-end">
                        <span className="text-[#FFFFFFCC] text-xl font-normal leading-6 font-teka">⚡ Zap available</span>
                    </div>
                </div>
            </div>

            <div className="h-[1px] bg-gray-700 w-full"></div>

            <section className="bg-[#141416] rounded-lg w-full p-6">
                <div className="flex mb-12">
                    <button
                        className={`flex-1 text-center text-lg py-2 text-base leading-6 ${activeTab === "Deposit" ? 'border-b text-white' : 'border-b-2 border-[#D7D7D7] text-[#D7D7D7]'}`}
                        onClick={() => setActiveTab("Deposit")}
                    >
                        Deposit
                    </button>
                    <button
                        className={`flex-1 text-center text-lg py-2 text-base leading-6 ${activeTab === "Zap" ? 'border-b text-white' : 'border-b-2 border-[#D7D7D7] text-[#D7D7D7]'}`}
                        onClick={() => setActiveTab("Zap")}
                    >
                        Zap
                    </button>


                </div>
                <InputTokenWithError
                    captionText={"Deposit Amount"}
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
                    <div className="relative flex justify-center">
                        <svg
                            onClick={() => {
                                setInputToken(outputToken);
                                setOutputToken(inputToken);
                                setInputBalance(outputPreview);
                            }}
                            xmlns="http://www.w3.org/2000/svg" width="40" height="41" viewBox="0 0 40 41" fill="none"
                            className="cursor-pointer"
                        >
                            <circle opacity="0.35" cx="20" cy="20.314" r="19.5" transform="rotate(-180 20 20.314)" stroke="#9CA3AF" />
                            <path d="M20.3569 13.439L20.3569 27.189" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M23.3032 24.2425L20.3568 27.189L17.4104 24.2425" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
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
                <div className="mt-10">
                    <MainActionButton
                        label={showApproveButton ? "Approve" : "Zap"}
                        type="button"
                        handleClick={handleZap}
                        disabled={Number(inputBalance) === 0}
                    />
                </div>
            </section>
        </div>
    )
}


function CowswapTest() {
    return <div className='flex flex-row items-center'>
        <CowswapSweetVault vaultAddress={"0x5d344226578DC100b2001DA251A4b154df58194f"} />
    </div>
}

