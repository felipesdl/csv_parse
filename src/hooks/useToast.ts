import { toast } from "sonner";

/**
 * Custom hook for displaying toast notifications
 * 
 * @returns Object with toast notification methods
 * 
 * @example
 * ```tsx
 * const { success, error, loading, promise, confirm } = useToast();
 * 
 * // Show success message
 * success("File uploaded successfully!");
 * 
 * // Show error message
 * error("Failed to upload file");
 * 
 * // Show loading message
 * const loadingId = loading("Processing...");
 * 
 * // Show promise-based toast
 * promise(
 *   fetchData(),
 *   {
 *     loading: "Loading data...",
 *     success: "Data loaded!",
 *     error: "Failed to load data"
 *   }
 * );
 * 
 * // Show confirmation dialog
 * confirm("Are you sure?", () => {
 *   // User confirmed
 *   console.log("Confirmed!");
 * });
 * ```
 */
export function useToast() {
  /**
   * Show confirmation dialog with confirm/cancel actions
   * @param message - Confirmation message to display
   * @param onConfirm - Callback function to execute when user confirms
   * @param options - Optional configuration
   */
  const confirm = (
    message: string,
    onConfirm: () => void,
    options?: {
      confirmText?: string;
      cancelText?: string;
      description?: string;
    }
  ) => {
    const confirmText = options?.confirmText || "Confirmar";
    const cancelText = options?.cancelText || "Cancelar";
    const description = options?.description || "Esta ação não pode ser desfeita.";

    toast(message, {
      description,
      action: {
        label: confirmText,
        onClick: () => {
          onConfirm();
          toast.success("Ação confirmada");
        },
      },
      cancel: {
        label: cancelText,
        onClick: () => {
          toast.info("Ação cancelada");
        },
      },
      duration: 5000,
    });
  };

  return {
    /** Show success toast notification */
    success: (message: string) => toast.success(message),
    /** Show error toast notification */
    error: (message: string) => toast.error(message),
    /** Show loading toast notification */
    loading: (message: string) => toast.loading(message),
    /** Show promise-based toast notification with loading/success/error states */
    promise: (promise: Promise<any>, messages: { loading: string; success: string; error: string }) => toast.promise(promise, messages),
    /** Show confirmation dialog with confirm/cancel actions */
    confirm,
  };
}
