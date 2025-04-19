// Simple utility for conditional class names (like the 'clsx' or 'classnames' library)
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
