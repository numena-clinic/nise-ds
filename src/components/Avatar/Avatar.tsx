/* =============================================================================
   Avatar
   -----------------------------------------------------------------------------
   A person's face, or their initials when no image is available. It identifies
   a clinician, a client or a team member in a list or a header; it is never
   interactive and never carries an action (a Button beside it does that).

   The image is presentational unless the caller names it, and an image that
   fails to load falls back to the initials rather than to a broken glyph, so
   the avatar always shows a person. The fallback uses a brand tint with
   content-coloured text; it is an identity colour, not a status or a verdict.

   Tokens consumed:
      --avatar-size, --avatar-font-size → --control-height-md, --font-size-sm
      --control-height-sm, --control-height-lg (for the sm / lg sizes)
      --color-tint-purple, --color-base-content, --radius-full
   ============================================================================= */

import { useState, type ImgHTMLAttributes, type HTMLAttributes } from "react";
import "./Avatar.css";

export type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** The image source. Omitted, or failed, renders the initials fallback. */
  src?: string;
  /** Alt text for the image. Defaults to presentational (""). */
  alt?: string;
  srcSet?: ImgHTMLAttributes<HTMLImageElement>["srcSet"];
  /** Initials shown while, or instead of, the image. */
  fallback?: string;
  size?: AvatarSize;
  className?: string;
}

export function Avatar({
  src,
  alt = "",
  srcSet,
  fallback,
  size = "md",
  className,
  ...rest
}: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const showImage = src != null && !errored;

  const classes = ["nise-avatar", `nise-avatar--${size}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} {...rest}>
      {showImage ? (
        <img
          className="nise-avatar__image"
          src={src}
          srcSet={srcSet}
          alt={alt}
          loading="lazy"
          onError={() => setErrored(true)}
        />
      ) : (
        <span className="nise-avatar__fallback">{fallback}</span>
      )}
    </span>
  );
}
