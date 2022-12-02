import { toast } from "solid-toast";

import { InfoIcon } from "@icons/InfoIcon";

export const infoToast = (info: string) => toast(info, { icon: <InfoIcon /> });
export const successToast = (info: string) => toast.success(info);
export const errorToast = (info: string) => toast.error(info);
