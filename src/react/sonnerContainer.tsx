import React, { useEffect, useState } from "react";
import type { SonnerContainerProps, ToastT } from "../types";
import { toastState } from "../state";
import { ToastItem } from "./sonner";

export const SonnerContainer: React.FC<SonnerContainerProps> = ({
  children,
  autoClose = 2500,
  hideIcons = false,
  closeButton = false,
  theme = "light",
  pauseOnHover = true,
  style,
  className,
  toastClassNames,
  toastOptions,
}) => {
  const [toasts, setToasts] = useState<ToastT[]>([]);

  useEffect(() => {
    const unsubscribe = toastState.subscribe((currentToasts) => {
      setToasts(currentToasts);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      {children}
      <div
        className={`mini-sonner-toaster ${className || ""}`}
        style={style}
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={{
              ...toastOptions,
              ...toast,
              classNames: {
                ...toastClassNames,
                ...toastOptions?.classNames,
                ...toast.classNames,
              },
            }}
            autoClose={autoClose}
            hideIcons={hideIcons}
            closeButton={closeButton}
            theme={theme}
            pauseOnHover={pauseOnHover}
          />
        ))}
      </div>
    </>
  );
};

export const Toaster = SonnerContainer;
