import MainActionButton from "@/components/button/MainActionButton";
import InputTokenWithError from "@/components/input/InputTokenWithError";
import { handleAllowance } from "@/lib/approve";
import { VCXAbi } from "@/lib/constants";
import { showErrorToast, showLoadingToast, showSuccessToast } from "@/lib/toasts";
import { SimulationResponse } from "@/lib/types";
import { getVeAddresses } from "@/lib/utils/addresses";
import { validateInput } from "@/lib/utils/helpers";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Address, WalletClient, formatEther } from "viem";
import { PublicClient, useAccount, useBalance, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";

const { VCX, POP } = getVeAddresses();

interface SimulateProps {
  address: Address;
  account: Address;
  amount: number;
  publicClient: PublicClient;
}

interface MigrateWriteProps {
  address: Address;
  account: Address;
  amount: number;
  publicClient: PublicClient;
  walletClient: WalletClient;
}

async function simulate({ address, account, amount, publicClient }: SimulateProps): Promise<SimulationResponse> {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address,
      abi: VCXAbi,
      // @ts-ignore
      functionName: "migrate",
      // @dev Since numbers get converted to strings like 1e+21 or similar we need to convert it back to numbers like 10000000000000 and than cast them into BigInts
      args: [account, BigInt(Number(amount).toLocaleString("fullwide", { useGrouping: false }))]
    })
    return { request: request, success: true, error: null }
  } catch (error: any) {
    return { request: null, success: false, error: error.shortMessage }
  }
}

async function migrate({ address, account, amount, publicClient, walletClient }: MigrateWriteProps): Promise<boolean> {
  showLoadingToast("Migrating POP to VCX...")

  const { request, success, error: simulationError } = await simulate({ address, account, amount, publicClient })

  if (success) {
    try {
      const hash = await walletClient.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      showSuccessToast("Migration sucessful!")
      return true;
    } catch (error: any) {
      showErrorToast(error.shortMessage)
      return false;
    }
  } else {
    showErrorToast(simulationError)
    return false;
  }
}

export default function Migration(): JSX.Element {
  const { address: account } = useAccount();
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const { data: vcxBal } = useBalance({ chainId: 1, address: account, token: VCX, watch: true })
  const { data: popBal } = useBalance({ chainId: 1, address: account, token: POP, watch: true })

  const [inputBalance, setInputBalance] = useState<string>("0");

  function handleChangeInput(e: any) {
    const value = e.currentTarget.value
    setInputBalance(validateInput(value).isValid ? value : "0");
  };

  async function handleMainAction() {
    const val = Number(inputBalance)
    if (val === 0 || !account || !walletClient) return;

    if (chain?.id !== 1) switchNetwork?.(1);

    await handleAllowance({
      token: POP,
      inputAmount: (val * (10 ** 18)),
      account,
      spender: VCX,
      publicClient,
      walletClient
    })
    migrate({
      address: VCX,
      account,
      amount: (val * (10 ** 18)),
      publicClient,
      walletClient
    })
  }

  return (
    <>
      <div className="w-full md:w-10/12 mb-8">
        <h1 className="text-5xl md:text-3xl font-normal m-0 mb-4 md:mb-2 leading-0">
          POP Migration
        </h1>
        <p className="text-base text-primaryDark">
          Migrate your POP to VCX
        </p>
      </div>
      {(vcxBal && popBal) ?
        <div className="md:w-1/3 px-8 pt-6 pb-5 md:pl-11 md:rounded-3xl border border-[#F0EEE0] [&_summary::-webkit-details-marker]:hidden">
          <InputTokenWithError
            captionText={"Pop Amount"}
            onSelectToken={() => { }}
            onMaxClick={() => handleChangeInput({ currentTarget: { value: formatEther(popBal.value) } })}
            chainId={1}
            value={inputBalance}
            onChange={handleChangeInput}
            selectedToken={{
              address: POP,
              name: "POP",
              symbol: "POP",
              decimals: 18,
              logoURI: "",
              balance: Number(popBal.value),
              price: 1,
            }}
            errorMessage={""}
            tokenList={[]}
            allowInput
          />
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-customLightGray" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4">
                <ArrowDownIcon
                  className="h-10 w-10 p-2 text-customLightGray border border-customLightGray rounded-full"
                  aria-hidden="true"
                />
              </span>
            </div>
          </div>
          <InputTokenWithError
            captionText={"VCX Amount"}
            onSelectToken={() => { }}
            onMaxClick={() => { }}
            chainId={1}
            value={(Number(inputBalance) * 10) || 0}
            onChange={() => { }}
            selectedToken={{
              address: VCX,
              name: "VCX",
              symbol: "VCX",
              decimals: 18,
              logoURI: "/images/tokens/vcx.svg",
              balance: 0,
              price: 1,
            }}
            errorMessage={""}
            tokenList={[]}
            allowSelection={false}
            allowInput={false}
          />
          <MainActionButton label="Convert POP" handleClick={handleMainAction} />
        </div>
        : <p>Loading...</p>
      }
    </>
  )

}