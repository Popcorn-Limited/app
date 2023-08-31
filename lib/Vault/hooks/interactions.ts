import { Contract } from "ethers";
import { showSuccessToast, showErrorToast, showLoadingToast } from "lib/Toasts";


const vaultAbi = ["function deposit(uint256 assetAmount) external", "function redeem(uint256 burnAmount) external"]
const vaultRouterAbi = ["function depositAndStake(address vault, address gauge, uint256 assetAmount, address receiver) external", "function unstakeAndWithdraw(address vault, address gauge, uint256 assetAmount, address receiver) external"]


export async function vaultDeposit(address: `0x${string}`, amount: number | string, connector: any) {
  showLoadingToast("Vault Deposit Loading...")

  const signer = await connector.getSigner()

  const router = new Contract(address, vaultAbi, signer)
  try {
    const tx = await router.deposit(Number(amount).toLocaleString("fullwide", { useGrouping: false }))
    await tx.wait(1)
    showSuccessToast("Vault Deposit Success!")
  } catch (error) {
    showErrorToast(error)
  }
}


export async function vaultRedeem(address: `0x${string}`, amount: number | string, connector: any) {
  showLoadingToast("Vault Redeem Loading...")
  const signer = await connector.getSigner()

  const router = new Contract(address, vaultAbi, signer)
  try {

    const tx = await router.redeem(Number(amount).toLocaleString("fullwide", { useGrouping: false }))
    await tx.wait(1)
    showSuccessToast("Vault Redeem Success!")
  } catch (error) {
    showErrorToast(error)
  }
}

export async function vaultDepositAndStake(address: `0x${string}`, vault: string, gauge: string, amount: number | string, connector: any) {
  showLoadingToast("Vault Deposit Loading...")
  
  const account = await connector.getAccount()
  const signer = await connector.getSigner()

  const router = new Contract(address, vaultRouterAbi, signer)
  try {
    const tx = await router.depositAndStake(vault, gauge, Number(amount).toLocaleString("fullwide", { useGrouping: false }), account)
    await tx.wait(1)
    showSuccessToast("Vault Deposit Success!")
  } catch (error) {
    showErrorToast(error)
  }
}

export async function vaultUnstakeAndWithdraw(address: `0x${string}`, vault: string, gauge: string, amount: number | string, connector: any) {
  showLoadingToast("Vault Redeem Loading...")

  const account = await connector.getAccount()
  const signer = await connector.getSigner()

  const router = new Contract(address, vaultRouterAbi, signer)
  try {
    const tx = await router.unstakeAndWithdraw(vault, gauge, Number(amount).toLocaleString("fullwide", { useGrouping: false }), account)
    await tx.wait(1)
    showSuccessToast("Vault Redeem Success!")
  } catch (error) {
    showErrorToast(error)
  }
}