import { toast } from 'sonner';

export const DEFAULT_SNACKBAR_DURATION_MS = 5000;

/** Shows `content` as an error snackbar for `duration` ms (defaults to 5s). */
export function showErrorSnackbar(
  content: string,
  duration: number = DEFAULT_SNACKBAR_DURATION_MS
): void {
  toast.error(content, { duration });
}
