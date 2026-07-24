import { useAnimate } from "../hooks/useAnimate";

/**
 * Universal animation wrapper.
 * variant: "fadeUp" | "fadeIn" | "fadeLeft" | "fadeRight" | "scaleUp" | "stagger"
 * delay: ms string e.g. "100" → 100ms
 */
export default function Animate({ children, variant = "fadeUp", delay = 0, className = "", as: Tag = "div" }) {
  const [ref, visible] = useAnimate();

  const base = "transition-all duration-700 ease-out";
  const hidden = {
    fadeUp: "opacity-0 translate-y-10",
    fadeIn: "opacity-0",
    fadeLeft: "opacity-0 -translate-x-10",
    fadeRight: "opacity-0 translate-x-10",
    scaleUp: "opacity-0 scale-95",
  };
  const shown = "opacity-100 translate-y-0 translate-x-0 scale-100";

  return (
    <Tag
      ref={ref}
      className={`${base} ${visible ? shown : (hidden[variant] ?? hidden.fadeUp)} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}
