import { Trophy } from "lucide-react";

/* Small "game achievement" notification. */
export default function AchievementToast({ toast }) {
  return (
    <div className="mk-toast-region" role="status" aria-live="polite">
      {toast && (
        <div className="mk-toast" key={toast.id}>
          <span className="mk-toast-icon">
            <Trophy size={20} />
          </span>
          <span className="mk-toast-text">
            <small>{toast.kicker}</small>
            <strong>{toast.title}</strong>
          </span>
          <span className="mk-toast-bar" />
        </div>
      )}
    </div>
  );
}
