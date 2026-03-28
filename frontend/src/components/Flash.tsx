import "./Flash.css";

export function Flash({
  type,
  message,
  onDismiss,
}: {
  type: "success" | "error";
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className={`flash flash--${type}`} role="alert">
      <span>{message}</span>
      <button type="button" className="flash__close" onClick={onDismiss}>
        ×
      </button>
    </div>
  );
}
