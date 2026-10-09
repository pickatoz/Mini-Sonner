import type React from "react";

export type ToastType =
  "default" | "success" | "error" | "warning" | "info" | "loading" | "custom";

export interface ToastAction {
  label: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface ToastClassNames {
  toast?: string;
  message?: string;
  description?: string;
  success?: string;
  error?: string;
  warning?: string;
  info?: string;
  default?: string;
  loading?: string;
  custom?: string;
  closeButton?: string;
  icon?: string;
}

export interface ToastOptions {
  id?: string | number;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  hideIcon?: boolean;
  closeButton?: boolean;
  duration?: number | false;
  autoClose?: number | false;
  action?: ToastAction;
  cancel?: ToastAction;
  onDismiss?: (toast: ToastT) => void;
  onAutoClose?: (toast: ToastT) => void;
  style?: React.CSSProperties;
  className?: string;
  classNames?: ToastClassNames;
  unstyled?: boolean;
}

export interface ToastT extends ToastOptions {
  id: string | number;
  type: ToastType;
  message?: React.ReactNode;
  createdAt: number;
}

export interface SonnerContainerProps {
  children?: React.ReactNode;
  autoClose?: number | false; // default: 2500
  visibleToasts?: number; // default: 3
  hideIcons?: boolean;
  closeButton?: boolean;
  theme?: "light" | "dark" | "system";
  pauseOnHover?: boolean;
  style?: React.CSSProperties;
  className?: string;
  toastClassNames?: ToastClassNames;
  toastOptions?: ToastOptions;
}

export type PromiseData<T = any> = {
  loading: React.ReactNode | ToastOptions;
  success: React.ReactNode | ((data: T) => React.ReactNode | ToastOptions);
  error: React.ReactNode | ((error: any) => React.ReactNode | ToastOptions);
};
