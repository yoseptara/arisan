// utils/toastUtils.ts
import { ToastOptions, toast } from 'react-toastify';

const options: ToastOptions = {
  position: 'top-center',
  autoClose: 1500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'light'
};

export const showSuccessToast = (message: string) => {
  toast.success(message, options);
};

export const showErrorToast = (message: string) => {
  toast.error(message, options);
};
