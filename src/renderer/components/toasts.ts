import { type Id, toast } from "react-toastify";

export const successToast = (info: string): Id => toast.success(info);
export const errorToast = (info: string): Id => toast.error(info);
export const infoToast = (info: string): Id => toast.info(info);
