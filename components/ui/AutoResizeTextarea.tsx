import React, { useEffect, useRef } from "react";

interface AutoResizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onValueChange?: (value: string) => void;
}

export const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(({ value, onChange, onValueChange, className = "", ...props }, forwardedRef) => {
  const innerRef = useRef<HTMLTextAreaElement>(null);
  
  const ref = (node: HTMLTextAreaElement) => {
    (innerRef as any).current = node;
    if (typeof forwardedRef === "function") {
      forwardedRef(node);
    } else if (forwardedRef) {
      (forwardedRef as any).current = node;
    }
  };

  const resize = () => {
    if (innerRef.current) {
      innerRef.current.style.height = "0px";
      innerRef.current.style.height = innerRef.current.scrollHeight + "px";
    }
  };

  useEffect(() => {
    resize();
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    resize();
    if (onChange) onChange(e);
    if (onValueChange) onValueChange(e.target.value);
  };

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={handleChange}
      className={`resize-none overflow-hidden ${className}`}
      {...props}
    />
  );
});
AutoResizeTextarea.displayName = "AutoResizeTextarea";

