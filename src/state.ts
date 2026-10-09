import React from "react";
import type { ToastOptions, ToastT, ToastType, PromiseData } from "./types";

let toastsCounter = 0;

class ObserverStore {
  private subscribers: Array<(toasts: ToastT[]) => void> = [];
  public toasts: ToastT[] = [];

  public subscribe = (subscriber: (toasts: ToastT[]) => void) => {
    this.subscribers.push(subscriber);
    subscriber(this.toasts);

    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== subscriber);
    };
  };

  public notify = () => {
    this.subscribers.forEach((subscriber) => subscriber([...this.toasts]));
  };

  public create = (
    type: ToastType,
    message?: React.ReactNode,
    options?: ToastOptions
  ): string | number => {
    const id = options?.id ?? ++toastsCounter;
    const exists = this.toasts.find((t) => t.id === id);

    const toastItem: ToastT = {
      id,
      type,
      message,
      createdAt: Date.now(),
      ...options,
    };

    if (exists) {
      this.toasts = this.toasts.map((t) => (t.id === id ? toastItem : t));
    } else {
      this.toasts = [toastItem, ...this.toasts];
    }

    this.notify();
    return id;
  };

  public dismiss = (id?: string | number) => {
    if (id !== undefined) {
      const toastToDismiss = this.toasts.find((t) => t.id === id);
      if (toastToDismiss && toastToDismiss.onDismiss) {
        toastToDismiss.onDismiss(toastToDismiss);
      }
      this.toasts = this.toasts.filter((t) => t.id !== id);
    } else {
      this.toasts.forEach((t) => t.onDismiss?.(t));
      this.toasts = [];
    }
    this.notify();
  };
}

export const toastState = new ObserverStore();

// Main sonner trigger implementation
const sonnerImpl = (
  message: React.ReactNode,
  options?: ToastOptions
): string | number => {
  return toastState.create("default", message, options);
};

sonnerImpl.success = (
  message: React.ReactNode,
  options?: ToastOptions
): string | number => {
  return toastState.create("success", message, options);
};

sonnerImpl.error = (
  message: React.ReactNode,
  options?: ToastOptions
): string | number => {
  return toastState.create("error", message, options);
};

sonnerImpl.warning = (
  message: React.ReactNode,
  options?: ToastOptions
): string | number => {
  return toastState.create("warning", message, options);
};

sonnerImpl.info = (message: React.ReactNode, options?: ToastOptions): string | number => {
  return toastState.create("info", message, options);
};

sonnerImpl.loading = (
  message: React.ReactNode,
  options?: ToastOptions
): string | number => {
  return toastState.create("loading", message, options);
};

sonnerImpl.custom = (jsx: React.ReactNode, options?: ToastOptions): string | number => {
  return toastState.create("custom", jsx, options);
};

sonnerImpl.dismiss = (id?: string | number) => {
  toastState.dismiss(id);
};

sonnerImpl.promise = <T>(
  promise: Promise<T> | (() => Promise<T>),
  data: PromiseData<T>,
  options?: ToastOptions
): Promise<T> => {
  const id = toastState.create(
    "loading",
    typeof data.loading === "string" || React.isValidElement(data.loading)
      ? (data.loading as React.ReactNode)
      : "Loading...",
    {
      ...options,
      ...(typeof data.loading === "object" && !React.isValidElement(data.loading)
        ? (data.loading as ToastOptions)
        : {}),
    }
  );

  const p = typeof promise === "function" ? promise() : promise;

  p.then((response) => {
    const successResult =
      typeof data.success === "function" ? data.success(response) : data.success;

    if (
      typeof successResult === "object" &&
      successResult !== null &&
      !React.isValidElement(successResult)
    ) {
      toastState.create("success", undefined, {
        id,
        ...options,
        ...(successResult as ToastOptions),
      });
    } else {
      toastState.create("success", successResult as React.ReactNode, {
        id,
        ...options,
      });
    }
  }).catch((error) => {
    const errorResult = typeof data.error === "function" ? data.error(error) : data.error;

    if (
      typeof errorResult === "object" &&
      errorResult !== null &&
      !React.isValidElement(errorResult)
    ) {
      toastState.create("error", undefined, {
        id,
        ...options,
        ...(errorResult as ToastOptions),
      });
    } else {
      toastState.create("error", errorResult as React.ReactNode, {
        id,
        ...options,
      });
    }
  });

  return p;
};

export const sonner = sonnerImpl;
