"use client";

import toastLib from "react-hot-toast";

export const toast = {
  success: (msg: string) => toastLib.success(msg),
  error: (msg: string) => toastLib.error(msg),
  loading: (msg: string) => toastLib.loading(msg),
  custom: toastLib,
};
