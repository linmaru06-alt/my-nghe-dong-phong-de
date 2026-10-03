"use client";

import React, { useRef, useEffect } from "react";

interface RichContentEditableProps {
  html: string;
  onChange: (html: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLDivElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLDivElement>) => void;
  onSelect?: (e: React.SyntheticEvent<HTMLDivElement>) => void;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  placeholder?: string;
}

export function RichContentEditable({
  html,
  onChange,
  onKeyDown,
  onPaste,
  onFocus,
  onSelect,
  className,
  style,
  id,
  placeholder
}: RichContentEditableProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const htmlRef = useRef(html);

  const initialHtml = useRef(html).current;

  // Sync prop -> DOM if changed externally (e.g. undo/redo)
  useEffect(() => {
    if (elRef.current && html !== htmlRef.current) {
      elRef.current.innerHTML = html;
      htmlRef.current = html;
    }
  }, [html]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newHtml = e.currentTarget.innerHTML;
    htmlRef.current = newHtml;
    onChange(newHtml);
  };

  return (
    <div
      id={id}
      ref={elRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onBlur={handleInput}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      onFocus={onFocus}
      onSelect={onSelect}
      className={`${className} empty:before:content-[attr(data-placeholder)] empty:before:text-[#5F6368]/40`}
      style={{
        outline: "none",
        ...style
      }}
      data-placeholder={placeholder}
      dangerouslySetInnerHTML={{ __html: initialHtml }}
    />
  );
}
