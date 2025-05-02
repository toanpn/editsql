"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1 w-full">
              {title && <ToastTitle className="flex items-center">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-sm font-medium">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action && <div className="ml-2 shrink-0">{action}</div>}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport className="p-4" />
    </ToastProvider>
  )
} 