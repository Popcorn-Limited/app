import { handleAllowance } from "@/lib/approve"
import axios from "axios"
import { getAddress } from "viem"
import { mainnet, useAccount, usePublicClient, useWalletClient } from "wagmi"

async function zapDemo(publicClient: any, walletClient: any) {
  const quote = (await axios.get(
    `https://api.enso.finance/api/v1/shortcuts/route?chainId=1&fromAddress=0x849664E1F06693103c4852c232034Ae7A8C42736&spender=0x849664E1F06693103c4852c232034Ae7A8C42736&amountIn=50000000&slippage=300&tokenIn=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48&tokenOut=0x6B175474E89094C44Da98b954EedeAC495271d0F`,
    { headers: { Authorization: `Bearer ee722f6b-8d53-463b-8440-71ba67df0cf4` } }
  )).data
  console.log({ quote })

  const ensoWallet = (await axios.get("https://api.enso.finance/api/v1/wallet?chainId=1&fromAddress=0x849664E1F06693103c4852c232034Ae7A8C42736")).data
  // ensoWallet -> 
  //  {
  //    "address": "0xC3347AECd3C8049b64C6476e9CF05B6BEc00a9Ee",
  //    "isDeployed": false
  //  }

  await handleAllowance({
    token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    inputAmount: 50000000,
    account: "0x849664E1F06693103c4852c232034Ae7A8C42736",
    spender: "0xC3347AECd3C8049b64C6476e9CF05B6BEc00a9Ee",
    publicClient,
    walletClient
  })

  const hash = await walletClient.sendTransaction({ account: "0x849664E1F06693103c4852c232034Ae7A8C42736", data: quote.tx.data, chain: mainnet })
  console.log({ hash })
  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  console.log({ receipt })

}


export default function ZapPage() {
  const { address: account } = useAccount();
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  return <><button onClick={() => zapDemo(publicClient, walletClient)}>Zap</button></>
}