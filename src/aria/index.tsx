/** React Aria composition surface. Upstream types, refs, collection generics,
 * keyboard behavior and validation are preserved without adapter wrappers.
 * AriaScope applies Nise's semantic tokens and scopes portaled overlay styles.
 * Unstable exports retain their upstream UNSTABLE_ names. */
import { useRef } from "react";
import type { HTMLAttributes } from "react";
import { UNSAFE_PortalProvider } from "react-aria/PortalProvider";
import "./aria.css";

export * as Aria from "react-aria-components";

export function AriaScope({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const container = useRef<HTMLDivElement>(null);
  return (
    <div {...props} className={`nise-aria ${className}`} ref={container}>
      <UNSAFE_PortalProvider getContainer={() => container.current}>
        {children}
      </UNSAFE_PortalProvider>
    </div>
  );
}
