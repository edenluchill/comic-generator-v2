"use client";

import { cn } from "@/lib/utils";
import { type ComponentProps, memo } from "react";
import { Streamdown } from "streamdown";

type StreamResponseProps = ComponentProps<typeof Streamdown>;

export const StreamResponse = memo(
  ({ className, ...props }: StreamResponseProps) => (
    <Streamdown
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className
      )}
      components={{
        code: ({ children, className, ...props }) => (
          <code className={className} {...props}>
            {children}
          </code>
        ),
      }}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

StreamResponse.displayName = "Response";
