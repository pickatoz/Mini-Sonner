import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { ToastItem } from "../src/react/sonner";
import { SonnerContainer } from "../src/react/sonnerContainer";
import { sonner, toastState } from "../src/state";
import type { ToastT } from "../src/types";

let idCounter = 0;
const makeToast = (overrides: Partial<ToastT> = {}): ToastT => ({
  id: ++idCounter,
  type: "default",
  message: "Hi",
  createdAt: Date.now(),
  ...overrides,
});

describe("<ToastItem /> — pure render", () => {
  beforeEach(() => {
    sonner.dismiss();
    idCounter = 0;
  });

  it("renders the message and description", () => {
    render(
      <ToastItem
        toast={makeToast({
          message: "Saved",
          description: "Your profile was updated.",
        })}
      />
    );
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("Your profile was updated.")).toBeInTheDocument();
  });

  it("uses data-type and data-theme attributes", () => {
    const { container } = render(
      <ToastItem toast={makeToast({ type: "success" })} theme="dark" />
    );
    const toast = container.querySelector(".mini-sonner-toast")!;
    expect(toast.getAttribute("data-type")).toBe("success");
    expect(toast.getAttribute("data-theme")).toBe("dark");
  });

  it("renders the type-specific icon by default", () => {
    const { container: c1 } = render(
      <ToastItem toast={makeToast({ type: "success" })} />
    );
    expect(c1.querySelector(".mini-sonner-icon svg")).toBeInTheDocument();

    const { container: c2 } = render(
      <ToastItem toast={makeToast({ type: "loading" })} />
    );
    expect(c2.querySelector(".mini-sonner-spinner")).toBeInTheDocument();
  });

  it("hides the icon when hideIcons is true", () => {
    const { container } = render(
      <ToastItem toast={makeToast({ type: "success" })} hideIcons />
    );
    expect(container.querySelector(".mini-sonner-icon")).not.toBeInTheDocument();
  });

  it("prefers toast.icon over the built-in type icon", () => {
    render(
      <ToastItem
        toast={makeToast({
          type: "success",
          icon: <span data-testid="custom-icon">★</span>,
        })}
      />
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("shows the close button when closeButton=true", () => {
    render(<ToastItem toast={makeToast({ type: "default" })} closeButton />);
    expect(screen.getByRole("button", { name: /close toast/i })).toBeInTheDocument();
  });

  it("renders and triggers the action button", () => {
    const onClick = vi.fn();
    render(<ToastItem toast={makeToast({ action: { label: "Undo", onClick } })} />);
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies className and classNames overrides", () => {
    const toast = makeToast({
      className: "extra-class",
      classNames: {
        toast: "t-extra",
        message: "m-extra",
        description: "d-extra",
        success: "success-extra",
      },
    });
    const { container } = render(<ToastItem toast={{ ...toast, type: "success" }} />);
    const toastEl = container.querySelector(".mini-sonner-toast")!;
    expect(toastEl.className).toContain("extra-class");
    expect(toastEl.className).toContain("t-extra");
    expect(toastEl.className).toContain("success-extra");
  });
});

describe("<ToastItem /> — with SonnerContainer (stateful)", () => {
  beforeEach(() => {
    sonner.dismiss();
  });

  it("dismisses via close button click and fires onDismiss", () => {
    const onDismiss = vi.fn();
    let capturedId: string | number = 0;
    render(
      <SonnerContainer closeButton>
        <span>x</span>
      </SonnerContainer>
    );
    act(() => {
      capturedId = sonner("dismissable", { onDismiss });
    });
    fireEvent.click(screen.getByRole("button", { name: /close toast/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(toastState.toasts.map((t) => t.id)).not.toContain(capturedId);
  });

  it("renders the cancel button, fires onClick and dismisses", () => {
    const onClick = vi.fn();
    const onDismiss = vi.fn();
    render(
      <SonnerContainer>
        <span>x</span>
      </SonnerContainer>
    );
    act(() => {
      sonner("cancellable", {
        cancel: { label: "Dismiss", onClick },
        onDismiss,
      });
    });
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("does not auto-dismiss when autoClose=false", async () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(
      <SonnerContainer autoClose={false}>
        <span>x</span>
      </SonnerContainer>
    );
    act(() => {
      sonner("sticky", { onDismiss });
    });
    await act(async () => {
      vi.advanceTimersByTime(10_000);
    });
    expect(onDismiss).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("auto-dismisses after autoClose elapses and fires onAutoClose", async () => {
    vi.useFakeTimers();
    const onAutoClose = vi.fn();
    const onDismiss = vi.fn();
    render(
      <SonnerContainer autoClose={500}>
        <span>x</span>
      </SonnerContainer>
    );
    act(() => {
      sonner("auto", { onAutoClose, onDismiss });
    });

    await act(async () => {
      vi.advanceTimersByTime(499);
    });
    expect(onAutoClose).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(2);
    });
    expect(onAutoClose).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("does not initiate drag when pointerdown originates on a button", () => {
    const onDismiss = vi.fn();
    render(
      <SonnerContainer closeButton>
        <span>x</span>
      </SonnerContainer>
    );
    act(() => {
      sonner("no-drag", { onDismiss });
    });

    const closeBtn = screen.getByRole("button", { name: /close toast/i });
    fireEvent.pointerDown(closeBtn, { clientX: 0, clientY: 0, pointerId: 1 });
    fireEvent.pointerMove(closeBtn, {
      clientX: 200,
      clientY: 200,
      pointerId: 1,
    });
    fireEvent.pointerUp(closeBtn, { clientX: 200, clientY: 200, pointerId: 1 });

    expect(toastState.toasts).toHaveLength(1);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("dismisses on a swipe beyond the 60px threshold", () => {
    const onDismiss = vi.fn();
    render(
      <SonnerContainer>
        <span>x</span>
      </SonnerContainer>
    );
    let id: string | number = 0;
    act(() => {
      id = sonner("swipe", { onDismiss });
    });

    const toastEl = document.querySelector(".mini-sonner-toast")! as HTMLElement;
    fireEvent.pointerDown(toastEl, {
      clientX: 0,
      clientY: 0,
      pointerId: 1,
    });
    fireEvent.pointerMove(toastEl, {
      clientX: 100,
      clientY: 0,
      pointerId: 1,
    });
    fireEvent.pointerUp(toastEl, {
      clientX: 100,
      clientY: 0,
      pointerId: 1,
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(toastState.toasts.map((t) => t.id)).not.toContain(id);
  });

  it("snaps back when swipe distance is below threshold", () => {
    const onDismiss = vi.fn();
    render(
      <SonnerContainer>
        <span>x</span>
      </SonnerContainer>
    );
    act(() => {
      sonner("snap", { onDismiss });
    });

    const toastEl = document.querySelector(".mini-sonner-toast")! as HTMLElement;
    fireEvent.pointerDown(toastEl, {
      clientX: 0,
      clientY: 0,
      pointerId: 1,
    });
    fireEvent.pointerMove(toastEl, {
      clientX: 30,
      clientY: 0,
      pointerId: 1,
    });
    fireEvent.pointerUp(toastEl, {
      clientX: 30,
      clientY: 0,
      pointerId: 1,
    });

    expect(onDismiss).not.toHaveBeenCalled();
    expect(toastState.toasts).toHaveLength(1);
  });
});

afterEach(() => {
  vi.useRealTimers();
});
