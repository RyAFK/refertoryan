import { isDemoMode } from '@/lib/env';

/**
 * §2 requires a permanent, unmissable "no real patient data" banner in demo
 * mode. Rendered from the root layout so no page can omit it, and driven
 * purely by server-resolved env state - there is no client-side toggle a
 * user could hide.
 */
export function DemoModeBanner() {
  if (!isDemoMode) return null;

  return (
    <div
      role="alert"
      className="w-full bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-black"
    >
      Demonstration System — No Real Patient Data. Do not enter identifiable patient information.
    </div>
  );
}
