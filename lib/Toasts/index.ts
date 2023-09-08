import { toast } from 'react-hot-toast';
import { loadingStyle, successStyle, errorStyle } from 'styles/toastStyles';

export function showLoadingToast(message: string = 'Transaction pending!') {
    toast.loading(message, loadingStyle);
}

export function showSuccessToast(message: string = 'Transaction successful!') {
    toast.dismiss();
    toast.success(message, successStyle);
}

export function showErrorToast(error: any = 'An error occurred while interacting with the contract.') {
    const errorMessage = extractRevertReason(error);
    const modifiedError = errorMessage.replace(/.{16}/g, "$&\u200B");
    toast.dismiss();
    toast.error(modifiedError, errorStyle);
}

function extractRevertReason(error: any): string {
    if (error.reason) {
        return error.reason;
    }

    if (error.data && error.data.message) {
        return error.data.message;
    }

    return error;
}

