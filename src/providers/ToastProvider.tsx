"use client";

import { Toaster } from "sonner";

/**
 * Toast notification provider using Sonner
 * 
 * Features:
 * - Position: top-right
 * - Theme: light
 * - Rich colors for success/error states
 * - Close button on each toast
 * - Auto-expand for long messages
 * - 3 second duration
 * 
 * Usage:
 * Import useToast hook in your components to show notifications
 * 
 * @example
 * ```tsx
 * import { useToast } from "@/hooks/useToast";
 * 
 * const { success, error } = useToast();
 * success("Operation completed!");
 * error("Something went wrong");
 * ```
 */
export function ToastProvider() {
  return <Toaster position="top-right" theme="light" richColors closeButton expand duration={3000} />;
}
