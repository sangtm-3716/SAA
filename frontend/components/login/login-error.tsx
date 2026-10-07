/**
 * Renders nothing when `message` is absent (contract from phase-07 integration).
 * Phase 07 wires the real OAuth error message into this prop; this phase only
 * ships the shape so the testid is reachable once there is something to show.
 */
export function LoginError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p
      data-testid="login-error"
      role="alert"
      className="text-sm font-bold text-red-400"
    >
      {message}
    </p>
  );
}
