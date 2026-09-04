"use client";
import { useState } from "react";
import { About } from "./About";

/** Footer hint plus a button for people without a `?` key. */
export function AboutLauncher() {
  const [signal, setSignal] = useState(0);
  return (
    <>
      <p className="caption m-0">
        <button type="button" className="btn" onClick={() => setSignal((n) => n + 1)}>About this project</button>
        <span className="ml-3">or press <kbd style={{ font: "inherit", padding: "1px 6px", border: "1px solid var(--color-rule)", borderRadius: 6 }}>?</kbd></span>
      </p>
      <About openSignal={signal} />
    </>
  );
}
