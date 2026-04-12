import { FormEvent } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

type Props = {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    isSubmitting?: boolean;
}

export const CommentInput = ({ value, onChange, onSubmit, isSubmitting }: Props) => {
  const { data: session } = useSession();

  const handleAutoResize = (e: FormEvent<HTMLTextAreaElement>) => {
    const element = e.currentTarget;
    const maxRows = 7;

    element.style.height = "auto";

    const computedStyle = window.getComputedStyle(element);
    const lineHeight = Number.parseFloat(computedStyle.lineHeight) || 20;
    const maxHeight = lineHeight * maxRows;

    element.style.height = `${Math.min(element.scrollHeight, maxHeight)}px`;
    element.style.overflowY = element.scrollHeight > maxHeight ? "auto" : "hidden";
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value.trim() || isSubmitting) return;
    onSubmit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!value.trim() || isSubmitting) return;
      onSubmit();
    }
  };

  return (
    <form className="border-t border-slate-200 p-3">
      <div className="flex items-end gap-2 rounded-2xl bg-slate-100 p-2">
        <Image
          src={session?.user?.image || "/avatar.png"}
          alt="Your avatar"
          width={32}
          height={32}
          className="shrink-0 self-end rounded-full"
        />

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleAutoResize}
          placeholder="Add a comment..."
          rows={1}
          className="comment-input-scrollbar min-h-10 flex-1 resize-none rounded-xl bg-transparent px-2 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-500"
          style={{ overflowY: "hidden" }}
        />

        <button
          type="submit"
          disabled={!value.trim() || isSubmitting}
          className="shrink-0 self-end rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
};
