import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";
import { SonnerContainer, Toaster } from "../src/react/sonnerContainer";
import { sonner } from "../src/state";

describe("<SonnerContainer />", () => {
  beforeEach(() => {
    sonner.dismiss();
  });

  it("renders its children", () => {
    render(
      <SonnerContainer>
        <span>page content</span>
      </SonnerContainer>
    );
    expect(screen.getByText("page content")).toBeInTheDocument();
  });

  it("renders nothing when there are no toasts", () => {
    const { container } = render(
      <SonnerContainer>
        <span>x</span>
      </SonnerContainer>
    );
    expect(container.querySelectorAll(".mini-sonner-toast")).toHaveLength(0);
  });

  it("renders a toast when sonner() is called", () => {
    render(
      <SonnerContainer>
        <span>x</span>
      </SonnerContainer>
    );
    act(() => {
      sonner("Hello world");
    });
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders multiple toasts in reverse order (newest on top)", () => {
    render(
      <SonnerContainer>
        <span>x</span>
      </SonnerContainer>
    );
    act(() => {
      sonner("first");
      sonner("second");
      sonner("third");
    });

    const toasts = document.querySelectorAll(".mini-sonner-toast");
    expect(toasts).toHaveLength(3);
    expect(toasts[0]!.textContent).toContain("third");
    expect(toasts[2]!.textContent).toContain("first");
  });

  it("removes a toast from the DOM after dismissal", () => {
    render(
      <SonnerContainer>
        <span>x</span>
      </SonnerContainer>
    );
    let id: string | number = 0;
    act(() => {
      id = sonner("temp");
    });
    expect(screen.getByText("temp")).toBeInTheDocument();
    act(() => {
      sonner.dismiss(id);
    });
    expect(screen.queryByText("temp")).not.toBeInTheDocument();
  });

  it("applies aria-live for accessibility", () => {
    const { container } = render(
      <SonnerContainer>
        <span>x</span>
      </SonnerContainer>
    );
    const toaster = container.querySelector(".mini-sonner-toaster");
    expect(toaster?.getAttribute("aria-live")).toBe("polite");
  });

  it("passes className and style through to the toaster", () => {
    const { container } = render(
      <SonnerContainer className="my-class" style={{ padding: "10px" }}>
        <span>x</span>
      </SonnerContainer>
    );
    const toaster = container.querySelector(".mini-sonner-toaster");
    expect(toaster?.className).toContain("my-class");
    expect((toaster as HTMLElement).style.padding).toBe("10px");
  });

  it("forwards theme to rendered toasts", () => {
    render(
      <SonnerContainer theme="dark">
        <span>x</span>
      </SonnerContainer>
    );
    act(() => {
      sonner("dark toast");
    });
    const toast = document.querySelector(".mini-sonner-toast")!;
    expect(toast.getAttribute("data-theme")).toBe("dark");
  });

  it("passes toastOptions to every toast", () => {
    render(
      <SonnerContainer toastOptions={{ className: "shared-class" }}>
        <span>x</span>
      </SonnerContainer>
    );
    act(() => {
      sonner("a");
      sonner("b");
    });
    const toasts = document.querySelectorAll(".mini-sonner-toast");
    expect(toasts[0]!.className).toContain("shared-class");
    expect(toasts[1]!.className).toContain("shared-class");
  });

  it("lets individual toast options override container defaults", () => {
    render(
      <SonnerContainer toastOptions={{ className: "shared" }}>
        <span>x</span>
      </SonnerContainer>
    );
    act(() => {
      sonner("plain");
      sonner.success("fancy", { className: "fancy" });
    });
    const plain = document.querySelectorAll(".mini-sonner-toast")[1]!;
    expect(plain.className).toContain("shared");
    expect(plain.className).not.toContain("fancy");
    const fancy = document.querySelectorAll(".mini-sonner-toast")[0]!;
    expect(fancy.className).toContain("fancy");
    expect(fancy.className).not.toContain("shared");
  });

  it("unsubscribes when unmounted", () => {
    const { unmount } = render(
      <SonnerContainer>
        <span>x</span>
      </SonnerContainer>
    );
    unmount();
    expect(() => {
      act(() => {
        sonner("after-unmount");
      });
    }).not.toThrow();
  });

  it("Toaster is an alias for SonnerContainer", () => {
    expect(Toaster).toBe(SonnerContainer);
  });
});
