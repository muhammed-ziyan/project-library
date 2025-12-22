import * as React from "react"

import { cn } from "@/lib/utils"

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  // #region agent log
  // NOTE: removed debug "agent log" calls to 127.0.0.1:7242 (not running in normal dev)
  // #endregion
  return (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
})
Label.displayName = "Label"

// #region agent log
// NOTE: removed debug "agent log" calls to 127.0.0.1:7242 (not running in normal dev)
// #endregion

export { Label }

