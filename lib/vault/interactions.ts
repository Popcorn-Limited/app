import { Contract } from "ethers";
import { showSuccessToast, showErrorToast, showLoadingToast } from "@/lib/toasts";


const vaultAbi = ["function deposit(uint256 assetAmount) external", "function redeem(uint256 burnAmount) external"]
const vaultRouterAbi = ["function depositAndStake(address vault, address gauge, uint256 assetAmount, address receiver) external", "function unstakeAndWithdraw(address vault, address gauge, uint256 assetAmount, address receiver) external"]


export async function vaultDeposit(address: `0x${string}`, amount: number | string, connector: any) {
  showLoadingToast("Depositing into the vault...")
  console.log({ address, amount, connector })

  const signer = await connector.getSigner()

  const vault = new Contract(address, vaultAbi, signer)
  try {
    const tx = await vault.deposit(Number(amount).toLocaleString("fullwide", { useGrouping: false }))
    await tx.wait(1)
    showSuccessToast("Deposited into the vault!")
  } catch (error) {
    showErrorToast(error)
  }
}


export async function vaultRedeem(address: `0x${string}`, amount: number | string, connector: any) {
  showLoadingToast("Withdrawing from the vault...")
  const signer = await connector.getSigner()

  const vault = new Contract(address, vaultAbi, signer)
  try {

    const tx = await vault.redeem(Number(amount).toLocaleString("fullwide", { useGrouping: false }))
    await tx.wait(1)
    showSuccessToast("Withdrawn from the vault!")
  } catch (error) {
    showErrorToast(error)
  }
}

export async function vaultDepositAndStake(address: `0x${string}`, vault: string, gauge: string, amount: number | string, connector: any) {
  showLoadingToast("Depositing into the vault...")

  const account = await connector.getAccount()
  const signer = await connector.getSigner()

  const router = new Contract(address, vaultRouterAbi, signer)
  try {
    const tx = await router.depositAndStake(vault, gauge, Number(amount).toLocaleString("fullwide", { useGrouping: false }), account)
    await tx.wait(1)
    showSuccessToast("Deposited into the vault!")
  } catch (error) {
    showErrorToast(error)
  }
}

export async function vaultUnstakeAndWithdraw(address: `0x${string}`, vault: string, gauge: string, amount: number | string, connector: any) {
  showLoadingToast("Withdrawing from the vault...")

  const account = await connector.getAccount()
  const signer = await connector.getSigner()

  const router = new Contract(address, vaultRouterAbi, signer)
  try {
    const tx = await router.unstakeAndWithdraw(vault, gauge, Number(amount).toLocaleString("fullwide", { useGrouping: false }), account)
    await tx.wait(1)
    showSuccessToast("Withdrawn from the vault!")
  } catch (error) {
    showErrorToast(error)
  }
}