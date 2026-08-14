import * as React from "react"

import { cn } from "@/lib/utils"
import { FileInput } from "./file-input"

const Input = React.forwardRef(function Input(
  {
    className,
    type,
    ...props
  },
  ref
) {
  if (type === "file") {
    return <FileInput ref={ref} className={className} {...props} />;
  }

  return (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input, FileInput }

