import { useState, useCallback } from "react";

/**
 * InviteModal — generates and displays a shareable invite link.
 */

interface InviteModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
}

export const InviteModal = ({ isOpen, onClose }: InviteModalProps): React.JSX.Element | null => {
  const [copied, setCopied] = useState(false);

  /** Generate invite link (uses current origin) */
  const inviteLink = typeof window !== "undefined"
    ? `${window.origin}/invite`
    : "";

  const handleCopy = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [inviteLink]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        role="presentation"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 animate-fade-in">
        <h2 className="text-lg font-bold text-bee-brown mb-2">Invite a Friend</h2>
        <p className="text-sm text-muted mb-4">
          Share this link to challenge your friends to today&apos;s puzzle!
        </p>

        {/* Link display */}
        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg mb-4">
          <input
            type="text"
            value={inviteLink}
            readOnly
            className="flex-1 text-sm bg-transparent outline-none text-bee-brown"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-1 text-sm font-medium text-bee-brown bg-bee-yellow rounded hover:bg-bee-yellow-dark transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full py-2 text-sm font-medium text-muted hover:text-bee-brown transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
