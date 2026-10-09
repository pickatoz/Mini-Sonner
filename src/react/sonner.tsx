import React, { useEffect, useRef, useState } from "react";
import type { ToastT } from "../types";
import {
  SUCCESS_ICON,
  ERROR_ICON,
  WARNING_ICON,
  INFO_ICON,
  SPINNER_ICON,
  CLOSE_ICON,
} from "../assets/icons";
import { toastState } from "../state";

export interface ToastItemProps {
  toast: ToastT;
  autoClose?: number | false;
  hideIcons?: boolean;
  closeButton?: boolean;
  theme?: "light" | "dark" | "system";
  pauseOnHover?: boolean;
}

export const ToastItem: React.FC<ToastItemProps> = ({
  toast,
  autoClose = 2500,
  hideIcons = false,
  closeButton = false,
  theme = "light",
  pauseOnHover = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isSwiping, setIsSwiping] = useState(false);

  // Refs for reliable tracking (avoid stale closure issues)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const currentOffsetRef = useRef({ x: 0, y: 0 });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(
    typeof toast.autoClose === "number"
      ? toast.autoClose
      : typeof toast.duration === "number"
        ? toast.duration
        : typeof autoClose === "number"
          ? autoClose
          : 2500
  );

  const effectiveAutoClose =
    toast.autoClose !== undefined
      ? toast.autoClose
      : toast.duration !== undefined
        ? toast.duration
        : autoClose;

  const shouldHideIcon = toast.hideIcon ?? hideIcons;
  const shouldShowClose = toast.closeButton ?? closeButton;

  const classNames = toast.classNames || {};
  const typeClassName = classNames[toast.type] || classNames.default || "";
  const toastClassName = classNames.toast || "";
  const messageClassName = classNames.message || "";
  const descClassName = classNames.description || "";
  const closeBtnClassName = classNames.closeButton || "";
  const iconContainerClassName = classNames.icon || "";

  useEffect(() => {
    if (effectiveAutoClose === false || effectiveAutoClose <= 0) return;

    const startTimer = () => {
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        if (toast.onAutoClose) {
          toast.onAutoClose(toast);
        }
        toastState.dismiss(toast.id);
      }, remainingTimeRef.current);
    };

    if ((pauseOnHover && isHovered) || isSwiping) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        remainingTimeRef.current -= Date.now() - startTimeRef.current;
      }
    } else {
      startTimer();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [effectiveAutoClose, isHovered, isSwiping, pauseOnHover, toast]);

  const handleDismiss = () => {
    toastState.dismiss(toast.id);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    currentOffsetRef.current = { x: 0, y: 0 };
    setDragOffset({ x: 0, y: 0 });
    setIsSwiping(true);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStartRef.current) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    currentOffsetRef.current = { x: dx, y: dy };
    setDragOffset({ x: dx, y: dy });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStartRef.current) return;
    const { x, y } = currentOffsetRef.current;
    const dist = Math.sqrt(x * x + y * y);
    if (dist > 60) {
      handleDismiss();
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
    pointerStartRef.current = null;
    currentOffsetRef.current = { x: 0, y: 0 };
    setIsSwiping(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const renderIcon = () => {
    if (shouldHideIcon) return null;
    if (toast.icon)
      return (
        <div className={`mini-sonner-icon ${iconContainerClassName}`}>{toast.icon}</div>
      );

    switch (toast.type) {
      case "success":
        return (
          <div className={`mini-sonner-icon ${iconContainerClassName}`}>
            <SUCCESS_ICON />
          </div>
        );
      case "error":
        return (
          <div className={`mini-sonner-icon ${iconContainerClassName}`}>
            <ERROR_ICON />
          </div>
        );
      case "warning":
        return (
          <div className={`mini-sonner-icon ${iconContainerClassName}`}>
            <WARNING_ICON />
          </div>
        );
      case "info":
        return (
          <div className={`mini-sonner-icon ${iconContainerClassName}`}>
            <INFO_ICON />
          </div>
        );
      case "loading":
        return (
          <div className={`mini-sonner-icon ${iconContainerClassName}`}>
            <SPINNER_ICON />
          </div>
        );
      default:
        return null;
    }
  };

  const dist = Math.sqrt(dragOffset.x * dragOffset.x + dragOffset.y * dragOffset.y);
  const opacity = isSwiping ? Math.max(0.1, 1 - dist / 150) : 1;

  return (
    <div
      className={`mini-sonner-toast mini-sonner-toast-${toast.type} ${toastClassName} ${typeClassName} ${
        toast.className || ""
      }`}
      style={{
        ...toast.style,
        transform:
          isSwiping && (dragOffset.x !== 0 || dragOffset.y !== 0)
            ? `translate(${dragOffset.x}px, ${dragOffset.y}px)`
            : undefined,
        opacity,
        transition: isSwiping ? "none" : undefined,
        animation: isSwiping ? "none" : undefined,
      }}
      data-theme={theme}
      data-type={toast.type}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {renderIcon()}
      <div className="mini-sonner-content">
        {toast.message && (
          <div className={`mini-sonner-message ${messageClassName}`}>{toast.message}</div>
        )}
        {toast.description && (
          <div className={`mini-sonner-description ${descClassName}`}>
            {toast.description}
          </div>
        )}
        {(toast.action || toast.cancel) && (
          <div className="mini-sonner-actions">
            {toast.action && (
              <button
                className="mini-sonner-button mini-sonner-button-action"
                onClick={toast.action.onClick}
              >
                {toast.action.label}
              </button>
            )}
            {toast.cancel && (
              <button
                className="mini-sonner-button mini-sonner-button-cancel"
                onClick={(e) => {
                  toast.cancel?.onClick(e);
                  handleDismiss();
                }}
              >
                {toast.cancel.label}
              </button>
            )}
          </div>
        )}
      </div>
      {shouldShowClose && (
        <button
          className={`mini-sonner-close-btn ${closeBtnClassName}`}
          aria-label="Close toast"
          onClick={handleDismiss}
        >
          <CLOSE_ICON />
        </button>
      )}
    </div>
  );
};
