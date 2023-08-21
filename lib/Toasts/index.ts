import { toast } from 'react-hot-toast';
import { successStyle, errorStyle } from 'styles/toastStyles';

export function showSuccessToast(message: string = 'Transaction successful!') {
    toast.success(message, successStyle);
}

export function showErrorToast(error: any) {
    const errorMessage = extractRevertReason(error);
    toast.error(errorMessage, errorStyle);
}

function extractRevertReason(error: any): string {
    if (error.reason) {
        return error.reason;
    }

    if (error.data && error.data.message) {
        return error.data.message;
    }

    return 'An error occurred while interacting with the contract.';
}

