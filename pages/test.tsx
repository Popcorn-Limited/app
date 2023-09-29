import { getVaults } from "@/lib/vault/getVault"
import getVaultAddresses from "@/lib/vault/getVaultAddresses"
import { createPublicClient, http } from "viem"
import { mainnet } from "wagmi"

async function getData() {
  const client = createPublicClient({
    chain: mainnet,
    transport: http()
  })
  const vaults = await getVaultAddresses({ client })
  getVaults({ vaults, client })
}

export default function Test() {
  getData().then(res => console.log(res))
  return (
    <div>
      <h1>Test</h1>
    </div>
  )
}