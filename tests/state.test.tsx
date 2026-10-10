import { describe, expect, it, beforeEach, vi } from "vitest";
import { sonner, toastState } from "../src/state";
import type { ToastT } from "../src/types";

describe("toastState (ObserverStore)", () => {
  beforeEach(() => {
    sonner.dismiss();
  });

  describe("subscribe", () => {
    it("immediately invokes subscriber with current toasts", () => {
      sonner("first");
      const subscriber = vi.fn();
      toastState.subscribe(subscriber);
      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenLastCalledWith([
        expect.objectContaining({ type: "default", message: "first" }),
      ]);
    });

    it("returns an unsubscribe function that stops future notifications", () => {
      const subscriber = vi.fn();
      const unsubscribe = toastState.subscribe(subscriber);
      const initialCalls = subscriber.mock.calls.length;
      unsubscribe();
      sonner("after-unsub");
      expect(subscriber.mock.calls.length).toBe(initialCalls);
    });

    it("notifies all subscribers with a fresh array copy", () => {
      const a = vi.fn();
      const b = vi.fn();
      toastState.subscribe(a);
      toastState.subscribe(b);

      sonner("hello");

      const aArg = a.mock.calls.at(-1)?.[0] as ToastT[];
      const bArg = b.mock.calls.at(-1)?.[0] as ToastT[];
      expect(aArg[0]!.message).toBe("hello");
      expect(bArg[0]!.message).toBe("hello");
      expect(aArg).not.toBe(bArg);
    });
  });

  describe("create (id handling)", () => {
    it("auto-increments id when not provided", () => {
      const id1 = sonner("one");
      const id2 = sonner("two");
      expect(typeof id1).toBe("number");
      expect(typeof id2).toBe("number");
      expect(id2).toBeGreaterThan(id1 as number);
    });

    it("honors a custom id", () => {
      const id = sonner("custom", { id: "my-id" });
      expect(id).toBe("my-id");
    });

    it("replaces an existing toast with the same id", () => {
      sonner("v1", { id: "shared" });
      sonner.success("v2", { id: "shared" });
      sonner.error("v3", { id: "shared" });

      expect(toastState.toasts).toHaveLength(1);
      expect(toastState.toasts[0]!.type).toBe("error");
      expect(toastState.toasts[0]!.message).toBe("v3");
    });

    it("prepends new toasts", () => {
      sonner("first");
      sonner("second");
      sonner("third");

      const snapshot = toastState.toasts;
      expect(snapshot.map((t) => t.message)).toEqual(["third", "second", "first"]);
    });
  });
});

describe("sonner() — public API", () => {
  beforeEach(() => {
    sonner.dismiss();
  });

  it.each([["success"], ["error"], ["warning"], ["info"], ["loading"]] as const)(
    "creates a %s toast",
    (type) => {
      sonner[type]("hello");
      const id = sonner[type]("after");
      expect(toastState.toasts[0]!.type).toBe(type);
      expect(typeof id === "number" || typeof id === "string").toBe(true);
    }
  );

  it("creates a default toast", () => {
    sonner("hello");
    const id = sonner("after");
    expect(toastState.toasts[0]!.type).toBe("default");
    expect(typeof id === "number" || typeof id === "string").toBe(true);
  });

  it("supports JSX message via custom()", () => {
    const jsx = (<span>Custom JSX</span>) as unknown as React.ReactElement;
    sonner.custom(jsx);
    sonner.custom(jsx);
    expect(toastState.toasts[0]!.type).toBe("custom");
    expect(toastState.toasts[0]!.message).toBe(jsx);
  });

  describe("dismiss", () => {
    it("removes a single toast by id", () => {
      const id = sonner("a");
      sonner("b");
      sonner.dismiss(id);
      expect(toastState.toasts.map((t) => t.id)).not.toContain(id);
      expect(toastState.toasts).toHaveLength(1);
    });

    it("removes every toast when no id is given", () => {
      sonner("a");
      sonner("b");
      sonner.dismiss();
      expect(toastState.toasts).toHaveLength(0);
    });

    it("fires onDismiss for the dismissed toast", () => {
      const onDismiss = vi.fn();
      const id = sonner("x", { onDismiss });
      sonner.dismiss(id);
      expect(onDismiss).toHaveBeenCalledTimes(1);
      expect(onDismiss.mock.calls[0]![0]).toMatchObject({
        id,
        message: "x",
      });
    });

    it("fires onDismiss on every toast when dismissing all", () => {
      const cb1 = vi.fn();
      const cb2 = vi.fn();
      sonner("a", { onDismiss: cb1 });
      sonner("b", { onDismiss: cb2 });
      sonner.dismiss();
      expect(cb1).toHaveBeenCalledTimes(1);
      expect(cb2).toHaveBeenCalledTimes(1);
    });
  });

  describe("promise", () => {
    it("creates a loading toast then resolves to success", async () => {
      await sonner.promise(Promise.resolve("ok"), {
        loading: "Saving...",
        success: "Saved!",
        error: "Failed",
      });

      expect(toastState.toasts).toHaveLength(1);
      expect(toastState.toasts[0]!.type).toBe("success");
      expect(toastState.toasts[0]!.message).toBe("Saved!");
    });

    it("replaces the same loading toast with success on resolve", async () => {
      await sonner.promise(Promise.resolve(1), {
        loading: "Loading",
        success: (n: number) => `Done ${n}`,
        error: "err",
      });

      expect(toastState.toasts).toHaveLength(1);
      expect(toastState.toasts[0]!.type).toBe("success");
      expect(toastState.toasts[0]!.message).toBe("Done 1");
    });

    it("converts the toast to error on rejection", async () => {
      await sonner
        .promise(Promise.reject(new Error("boom")), {
          loading: "Loading",
          success: "ok",
          error: "err",
        })
        .catch(() => {
          /* swallow */
        });

      expect(toastState.toasts).toHaveLength(1);
      expect(toastState.toasts[0]!.type).toBe("error");
      expect(toastState.toasts[0]!.message).toBe("err");
    });

    it("supports object success payload (ToastOptions)", async () => {
      await sonner.promise(Promise.resolve("ok"), {
        loading: "Saving...",
        success: { message: "Saved!", description: "All good" },
        error: "err",
      });

      expect(toastState.toasts[0]!.type).toBe("success");
      expect(toastState.toasts[0]!.message).toBe("Saved!");
      expect(toastState.toasts[0]!.description).toBe("All good");
    });

    it("supports object error payload (ToastOptions)", async () => {
      await sonner
        .promise(Promise.reject(new Error("x")), {
          loading: "Saving...",
          success: "ok",
          error: { message: "Failed", description: "details" },
        })
        .catch(() => {
          /* swallow */
        });

      expect(toastState.toasts[0]!.type).toBe("error");
      expect(toastState.toasts[0]!.message).toBe("Failed");
      expect(toastState.toasts[0]!.description).toBe("details");
    });

    it("invokes a lazy promise factory", async () => {
      const factory = vi.fn(() => Promise.resolve("value"));
      await sonner.promise(factory, {
        loading: "...",
        success: "done",
        error: "x",
      });
      expect(factory).toHaveBeenCalledTimes(1);
    });

    it("falls back to 'Loading...' when loading is missing", async () => {
      await sonner.promise(Promise.resolve("ok"), {
        loading: undefined,
        success: "done",
        error: "err",
      });
      expect(toastState.toasts[0]!.type).toBe("success");
    });

    it("forwards toastOptions to all stages", async () => {
      await sonner.promise(
        Promise.resolve("ok"),
        {
          loading: "...",
          success: "done",
          error: "x",
        },
        { id: "fixed", className: "opt" }
      );
      expect(toastState.toasts[0]!.id).toBe("fixed");
      expect(toastState.toasts[0]!.className).toBe("opt");
    });
  });
});
