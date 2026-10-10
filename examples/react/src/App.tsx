import { useEffect, useMemo, useState } from "react";
import { sonner } from "mini-sonner";
import {
  AlertTriangleIcon,
  BellIcon,
  BoltIcon,
  CheckCircleIcon,
  CheckIcon,
  CodeIcon,
  CopyIcon,
  GithubIcon,
  HandIcon,
  InfoIcon,
  LoaderIcon,
  MoonIcon,
  NpmIcon,
  PaletteIcon,
  PartyPopperIcon,
  RepeatIcon,
  SparklesIcon,
  SunIcon,
  TargetIcon,
  TrashIcon,
  XCircleIcon,
} from "./icons";
import "./App.css";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("mini-sonner-theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const SAMPLE_CODE: Array<{ file: string; code: string }> = [
  {
    file: "main.tsx",
    code: `import { SonnerContainer } from "mini-sonner";
import "mini-sonner/styles.css";

<SonnerContainer autoClose={2500} closeButton theme="light">
  <App />
</SonnerContainer>`,
  },
  {
    file: "anywhere.tsx",
    code: `import { sonner } from "mini-sonner";

sonner.success("Saved!", { description: "Your profile was updated." });
sonner.promise(fetchData(), {
  loading: "Fetching...",
  success: "Done!",
  error: "Error",
});`,
  },
];

export default function App() {
  const [withDesc, setWithDesc] = useState(false);
  const [withAction, setWithAction] = useState(false);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("mini-sonner-theme", theme);
  }, [theme]);

  const desc = withDesc ? "Monday, October 9 at 5:00 PM" : undefined;
  const action = withAction
    ? { label: "Undo", onClick: () => sonner("Action undone!") }
    : undefined;

  const handlePromise = () => {
    sonner.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
      loading: "Saving your changes...",
      success: "Changes saved successfully!",
      error: "Failed to save changes.",
    });
  };

  const handleWithOptions = () => {
    sonner.success("Profile updated!", {
      description: "Your changes have been saved to the cloud.",
      autoClose: 4000,
      closeButton: true,
      action: { label: "View", onClick: () => sonner.info("Navigating...") },
      cancel: { label: "Dismiss", onClick: () => {} },
    });
  };

  const themeIcon = theme === "light" ? <MoonIcon /> : <SunIcon />;

  return (
    <div className="app">
      <button
        type="button"
        className="theme-toggle"
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      >
        {themeIcon}
      </button>

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          npm install mini-sonner
        </div>
        <h1 className="hero-title">
          mini<span className="accent">-sonner</span>
        </h1>
        <p className="hero-subtitle">
          Lightweight, production-ready React toast notifications — zero dependencies,
          fully typed, drag to dismiss.
        </p>

        <div className="chips">
          <span className="chip">
            <BoltIcon /> Lightweight
          </span>
          <span className="chip">
            <TargetIcon /> TypeScript
          </span>
          <span className="chip">
            <PaletteIcon /> Themeable
          </span>
          <span className="chip">
            <HandIcon /> Drag to dismiss
          </span>
        </div>
      </section>

      {/* Toast Types */}
      <section className="section">
        <h2 className="section-title">Toast Types</h2>
        <p className="section-desc">Click any button to trigger a toast notification</p>

        <div className="button-grid">
          <button
            className="toast-btn btn-default"
            onClick={() =>
              sonner("Event has been created", { description: desc, action })
            }
          >
            <BellIcon className="btn-icon" /> Default
          </button>

          <button
            className="toast-btn btn-success"
            onClick={() =>
              sonner.success("Changes saved successfully!", {
                description: desc,
                action,
              })
            }
          >
            <CheckCircleIcon className="btn-icon" /> Success
          </button>

          <button
            className="toast-btn btn-error"
            onClick={() =>
              sonner.error("Something went wrong.", { description: desc, action })
            }
          >
            <XCircleIcon className="btn-icon" /> Error
          </button>

          <button
            className="toast-btn btn-warning"
            onClick={() =>
              sonner.warning("Please check your input.", {
                description: desc,
                action,
              })
            }
          >
            <AlertTriangleIcon className="btn-icon" /> Warning
          </button>

          <button
            className="toast-btn btn-info"
            onClick={() =>
              sonner.info("A new update is available.", {
                description: desc,
                action,
              })
            }
          >
            <InfoIcon className="btn-icon" /> Info
          </button>

          <button
            className="toast-btn btn-loading"
            onClick={() => sonner.loading("Processing your request...")}
          >
            <LoaderIcon className="btn-icon" /> Loading
          </button>

          <button className="toast-btn btn-promise" onClick={handlePromise}>
            <RepeatIcon className="btn-icon" /> Promise
          </button>

          <button
            className="toast-btn btn-custom"
            onClick={() =>
              sonner.custom(
                <div className="custom-toast">
                  <span className="custom-toast-icon">
                    <PartyPopperIcon />
                  </span>
                  <div>
                    <div className="custom-toast-title">Custom JSX Toast!</div>
                    <div className="custom-toast-desc">Render any React element</div>
                  </div>
                </div>
              )
            }
          >
            <PaletteIcon className="btn-icon" /> Custom JSX
          </button>
        </div>
      </section>

      {/* With All Options */}
      <section className="section">
        <h2 className="section-title">Full Options Demo</h2>
        <p className="section-desc">
          Toast with description, action button &amp; cancel — all at once
        </p>

        <div className="options-row">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={withDesc}
              onChange={(e) => setWithDesc(e.target.checked)}
              className="toggle-input"
            />
            <span className="toggle-track">
              <span className="toggle-thumb" />
            </span>
            Add description
          </label>

          <label className="toggle-label">
            <input
              type="checkbox"
              checked={withAction}
              onChange={(e) => setWithAction(e.target.checked)}
              className="toggle-input"
            />
            <span className="toggle-track">
              <span className="toggle-thumb" />
            </span>
            Add action button
          </label>
        </div>

        <div className="full-options-btns">
          <button className="toast-btn btn-success full-btn" onClick={handleWithOptions}>
            <SparklesIcon className="btn-icon" /> Fire Full-Option Toast
          </button>
          <button
            className="toast-btn btn-dismiss full-btn"
            onClick={() => sonner.dismiss()}
          >
            <TrashIcon className="btn-icon" /> Dismiss All
          </button>
        </div>
      </section>

      {/* Code Snippet */}
      <section className="section">
        <h2 className="section-title">
          <CodeIcon className="section-title-icon" /> Quick Setup
        </h2>
        <div className="code-blocks">
          {SAMPLE_CODE.map((snippet) => (
            <CodeBlock key={snippet.file} file={snippet.file} code={snippet.code} />
          ))}
        </div>
      </section>

      <footer className="footer">
        <p>
          <a
            href="https://www.npmjs.com/package/mini-sonner"
            target="_blank"
            rel="noreferrer"
          >
            <NpmIcon className="footer-icon" /> npm
          </a>
          <span className="footer-sep">·</span>
          <a
            href="https://github.com/pickatoz/Mini-Sonner"
            target="_blank"
            rel="noreferrer"
          >
            <GithubIcon className="footer-icon" /> GitHub
          </a>
          <span className="footer-sep">·</span>
          <span>MIT License</span>
        </p>
      </footer>
    </div>
  );
}

function CodeBlock({ file, code }: { file: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  const statusLabel = useMemo(() => (copied ? "Copied!" : "Copy"), [copied]);

  return (
    <div className="code-block">
      <div className="code-header">
        <span className="code-file">{file}</span>
        <button
          type="button"
          className={`code-copy ${copied ? "is-copied" : ""}`}
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span>{statusLabel}</span>
        </button>
      </div>
      <pre className="code-body">
        <code>{code}</code>
      </pre>
    </div>
  );
}
