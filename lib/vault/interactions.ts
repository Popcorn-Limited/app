import { showSuccessToast, showErrorToast, showLoadingToast } from "@/lib/toasts";
import { SimulationResponse } from "@/lib/types";
import { VaultAbi } from "@/lib/constants";
import { Address, PublicClient, WalletClient } from "viem";
import { VaultRouterAbi } from "@/lib/constants/abi/VaultRouter";

interface VaultWriteProps {
  address: Address;
  account: Address;
  amount: number;
  publicClient: PublicClient;
  walletClient: WalletClient;
}

interface VaultSimulateProps {
  address: Address;
  account: Address;
  amount: number;
  functionName: string;
  publicClient: PublicClient;
}

interface VaultRouterWriteProps {
  address: Address;
  account: Address;
  amount: number;
  vault: Address;
  gauge: Address;
  publicClient: PublicClient;
  walletClient: WalletClient;
}

interface VaultRouterSimulateProps {
  address: Address;
  account: Address;
  amount: number;
  vault: Address;
  gauge: Address;
  functionName: string;
  publicClient: PublicClient;
}



async function simulateVaultCall({ address, account, amount, functionName, publicClient }: VaultSimulateProps): Promise<SimulationResponse> {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address,
      abi: VaultAbi,
      // @ts-ignore
      functionName,
      // @dev Since numbers get converted to strings like 1e+21 or similar we need to convert it back to numbers like 10000000000000 and than cast them into BigInts
      args: [BigInt(Number(amount).toLocaleString("fullwide", { useGrouping: false }))]
    })
    return { request: request, success: true, error: null }
  } catch (error: any) {
    return { request: null, success: false, error: error.shortMessage }
  }
}

async function simulateVaultRouterCall({ address, account, amount, vault, gauge, functionName, publicClient }: VaultRouterSimulateProps): Promise<SimulationResponse> {
  try {
    const { request } = await publicClient.simulateContract({
      account,
      address,
      abi: VaultRouterAbi,
      // @ts-ignore
      functionName,
      // @dev Since numbers get converted to strings like 1e+21 or similar we need to convert it back to numbers like 10000000000000 and than cast them into BigInts
      args: [vault, gauge, BigInt(Number(amount).toLocaleString("fullwide", { useGrouping: false })), account]
    })
    return { request: request, success: true, error: null }
  } catch (error: any) {
    return { request: null, success: false, error: error.shortMessage }
  }
}

export async function vaultDeposit({ address, account, amount, publicClient, walletClient }: VaultWriteProps): Promise<boolean> {
  showLoadingToast("Depositing into the vault...")

  const { request, success, error: simulationError } = await simulateVaultCall({ address, account, amount, functionName: "deposit", publicClient })

  if (success) {
    try {
      const hash = await walletClient.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      showSuccessToast("Deposited into the vault!")
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


export async function vaultRedeem({ address, account, amount, publicClient, walletClient }: VaultWriteProps): Promise<boolean> {
  showLoadingToast("Withdrawing from the vault...")

  const { request, success, error: simulationError } = await simulateVaultCall({ address, account, amount, functionName: "redeem", publicClient })

  if (success) {
    try {
      const hash = await walletClient.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      showSuccessToast("Withdrawn from the vault!")
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

export async function vaultDepositAndStake({ address, account, amount, vault, gauge, publicClient, walletClient }: VaultRouterWriteProps): Promise<boolean> {
  showLoadingToast("Depositing into the vault...")

  const { request, success, error: simulationError } = await simulateVaultRouterCall({
    address, account, amount, vault, gauge, functionName: "depositAndStake", publicClient
  })

  if (success) {
    try {
      const hash = await walletClient.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      showSuccessToast("Deposited into the vault!")
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

export async function vaultUnstakeAndWithdraw({ address, account, amount, vault, gauge, publicClient, walletClient }: VaultRouterWriteProps): Promise<boolean> {
  showLoadingToast("Withdrawing from the vault...")

  const { request, success, error: simulationError } = await simulateVaultRouterCall({
    address, account, amount, vault, gauge, functionName: "unstakeAndWithdraw", publicClient
  })

  if (success) {
    try {
      const hash = await walletClient.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      showSuccessToast("Withdrawn from the vault!")
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


// export async function zapIntoVault(){
//   async function sendOrder() {
//     const getQuote = async () => {
//       try {
//           const quoteResponse = await orderBookApi.getQuote({
//               kind: OrderQuoteSideKindSell.SELL,
//               sellToken: inputToken,
//               buyToken: outputToken,
//               sellAmountBeforeFee: utils.parseUnits(inputBalance.toString(), 18).toString(),
//               receiver: account,
//               from: account,
//               validTo: Math.floor(Date.now() / 1000) + 3600,
//           });
//           setCowSwapQuoteResponse(quoteResponse);
//           setOutputPreview(Number(parseFloat(utils.formatEther(quoteResponse.quote.buyAmount.toString())).toFixed(3)));
//       } catch (error) {
//           toast.error("Error fetching quote - Try inputing different amount", {
//               position: "top-center",
//           });
//       }
//   };
//       const { sellToken, buyToken, validTo, buyAmount, sellAmount, receiver, feeAmount } = cowSwapQuoteResponse.quote
//       const order = {
//           kind: OrderKind.SELL,
//           receiver: account,
//           sellToken: inputToken,
//           buyToken: outputToken,
//           partiallyFillable: false,
//           validTo: Math.floor(Date.now() / 1000) + 3600,
//           sellAmount: sellAmount,
//           buyAmount: buyAmount,
//           feeAmount: feeAmount,
//           // The appData allows you to attach arbitrary information (meta-data) to the order.
//           appData: '0x0000000000000000000000000000000000000000000000000000000000000000'
//       }

//       const signedOrder = await OrderSigningUtils.signOrder(order, SupportedChainId.MAINNET, signer) as any

//       console.log("signedOrder", signedOrder);
//       const orderId = await orderBookApi.sendOrder({ ...order, ...signedOrder });

//       console.log("orderId", orderId);
//       return orderId;
//   }
// }