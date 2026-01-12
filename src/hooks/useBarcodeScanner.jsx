import { useEffect } from "react";

// Simple global barcode scanner singleton.
// Usage: import { useBarcodeScanner } from '../../hooks/useBarcodeScanner'
// then in any component: useBarcodeScanner(code => { /* handle code */ })

const listeners = new Map();
let _buffer = "";
let _lastTime = 0;

// configurable thresholds
let INTERKEY_MAX = 500; // ms — if gap larger, treat as new sequence

function isTypingInInput() {
  const active = document.activeElement;
  if (!active) return false;
  const tag = active.tagName && active.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (active.isContentEditable) return true;
  return false;
}

function processBuffer() {
  if (!_buffer.length) return;
  const code = _buffer;
  _buffer = "";
  _lastTime = 0;
  const typingNow = isTypingInInput();
  try {
    listeners.forEach((opts, cb) => {
      try {
        if (opts && opts.allowInInputs) {
          cb(code);
        } else if (!typingNow) {
          cb(code);
        }
      } catch (err) {
        // swallow individual listener errors
      }
    });
  } catch (e) {}
}

function handleKeydown(e) {
  // Ignore modifier keys
  if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta") return;

  const now = Date.now();
  const key = e.key;

  const typing = isTypingInInput();
  let hasAllowInInputs = false;
  try {
    for (const [, opts] of listeners) {
      if (opts && opts.allowInInputs) {
        hasAllowInInputs = true;
        break;
      }
    }
  } catch (e) {}

  // If user is typing and no listener wants inputs, ignore
  if (typing && !hasAllowInInputs) return;

  if (key === "Enter") {
    if (_buffer.length) {
      processBuffer();
      // prevent default only if we are processing for at least one listener
      e.preventDefault();
    }
    return;
  }

  // Only consider printable single-character keys; only process on Enter
  if (key.length === 1) {
    if (_lastTime && now - _lastTime > INTERKEY_MAX) {
      _buffer = ""; // too slow — start new
    }
    _buffer += key;
    _lastTime = now;
  }
}

// init global listener once
if (typeof window !== "undefined" && !window.__barcode_scanner_initialized) {
  window.addEventListener("keydown", handleKeydown, { passive: false });
  window.__barcode_scanner_initialized = true;
}

export function useBarcodeScanner(callback, options = { allowInInputs: false }) {
  useEffect(() => {
    if (typeof callback !== "function") return;
    listeners.set(callback, { allowInInputs: !!options.allowInInputs });
    return () => listeners.delete(callback);
  }, [callback, options.allowInInputs]);
}

export default useBarcodeScanner;

export function setBarcodeScannerConfig(cfg = {}) {
  if (typeof cfg.interkeyMax === "number") INTERKEY_MAX = cfg.interkeyMax;
}
