import { ReactNode, useId, useLayoutEffect, useRef } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}

/** Native focus containment, inert background and focus restoration. */
export default function Dialog({ open, title, description, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const motion = useRef({ position: 0, velocity: 0 });
  const titleId = useId();
  const descriptionId = useId();
  const backdropPressed = useRef(false);

  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const target = open ? 1 : 0;
    let frame = 0;
    let previous = performance.now();
    const paint = () => dialog.style.setProperty("--sheet-progress", String(motion.current.position));
    if (open && !dialog.open) {
      paint();
      dialog.showModal();
      heading.current?.focus({ preventScroll: true });
    }
    if (!dialog.open) return;
    const finish = () => {
      motion.current = { position: target, velocity: 0 };
      paint();
      if (!open) dialog.close();
    };
    const tick = (now: number) => {
      if (reduced.matches) { finish(); return; }
      const dt = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      // Exact critically damped spring; retain position AND velocity on reversal.
      const omega = 23;
      const displacement = motion.current.position - target;
      const coefficient = motion.current.velocity + omega * displacement;
      const decay = Math.exp(-omega * dt);
      motion.current.position = target + (displacement + coefficient * dt) * decay;
      motion.current.velocity = (motion.current.velocity - omega * coefficient * dt) * decay;
      paint();
      if (Math.abs(motion.current.position - target) < 0.001 && Math.abs(motion.current.velocity) < 0.01) finish();
      else frame = requestAnimationFrame(tick);
    };
    if (reduced.matches) finish();
    else frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onPointerDown={(event) => { backdropPressed.current = event.target === event.currentTarget; }}
      onPointerUp={(event) => {
        if (backdropPressed.current && event.target === event.currentTarget) onClose();
        backdropPressed.current = false;
      }}
      onPointerCancel={() => { backdropPressed.current = false; }}
    >
      <div className="sheet-surface">
        <header className="sheet-heading">
          <div>
            <h2 ref={heading} tabIndex={-1} id={titleId}>{title}</h2>
            {description && <p id={descriptionId}>{description}</p>}
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label={`${title} 닫기`}>
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div className="sheet-content">{children}</div>
      </div>
    </dialog>
  );
}
