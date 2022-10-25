import { toast } from "react-toastify";

export const successToast = (info: string) => toast.success(info);
export const errorToast = (info: string) => toast.error(info);
export const infoToast = (info: string) => toast.info(info);
