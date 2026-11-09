/* =============================================================================
   Avatar
   -----------------------------------------------------------------------------
   A person's face, or their initials when no image is available.

   Tokens consumed:
      --avatar-size, --avatar-font-size → --control-height-md, --font-size-sm
      --control-height-sm, --control-height-lg (for the sm / lg sizes)
      --color-tint-purple, --color-base-content, --radius-full
   ============================================================================= */

import { useState, type ImgHTMLAttributes, type HTMLAttributes } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../../lib/cn";

export type AvatarSize = "sm" | "md" | "lg";

const avatarVariants = cva(
  [
    "nise-avatar",
    "relative inline-flex items-center justify-center shrink-0 overflow-hidden select-none rounded-full bg-tint-purple text-base-content font-sans font-[var(--font-weight-semibold)] leading-none",
  ],
  {
    variants: {
      size: {
        sm: "nise-avatar--sm size-[var(--control-height-sm)] text-[length:var(--font-size-xs)]",
        md: "nise-avatar--md size-[var(--avatar-size)] text-[length:var(--avatar-font-size)]",
        lg: "nise-avatar--lg size-[var(--control-height-lg)] text-[length:var(--font-size-md)]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

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
  const [prevSource, setPrevSource] = useState({ src, srcSet });

  if (prevSource.src !== src || prevSource.srcSet !== srcSet) {
    setPrevSource({ src, srcSet });
    setErrored(false);
  }

  const showImage = src != null && !errored;

  return (
    <span className={cn(avatarVariants({ size }), className)} {...rest}>
      {showImage ? (
        <img
          className="nise-avatar__image size-full object-cover"
          src={src}
          srcSet={srcSet}
          alt={alt}
          loading="lazy"
          onError={() => setErrored(true)}
        />
      ) : (
        <span className="nise-avatar__fallback uppercase tracking-[var(--letter-spacing-wide)]">
          {fallback}
        </span>
      )}
    </span>
  );
}
