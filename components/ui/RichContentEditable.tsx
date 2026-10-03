"use client";

import React from "react";

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

export class RichContentEditable extends React.Component<RichContentEditableProps> {
  elRef: React.RefObject<HTMLDivElement>;
  lastHtml: string;

  constructor(props: RichContentEditableProps) {
    super(props);
    this.elRef = React.createRef();
    this.lastHtml = props.html;
  }

  shouldComponentUpdate(nextProps: RichContentEditableProps) {
    // Only re-render if the HTML changed EXTERNALLY (different from what's currently in the DOM)
    if (this.elRef.current && nextProps.html !== this.elRef.current.innerHTML) {
      return true;
    }
    
    // Check if structural props changed (deep compare for style object)
    if (
      this.props.className !== nextProps.className ||
      this.props.id !== nextProps.id ||
      this.props.placeholder !== nextProps.placeholder ||
      JSON.stringify(this.props.style) !== JSON.stringify(nextProps.style)
    ) {
      return true;
    }
    
    // Do NOT check function props (onChange, onKeyDown, etc.) because they are often inline 
    // and change every render, which would cause unnecessary re-renders and cursor jumps.
    return false;
  }

  componentDidUpdate() {
    if (this.elRef.current && this.props.html !== this.elRef.current.innerHTML) {
      this.elRef.current.innerHTML = this.props.html;
    }
  }

  handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const html = e.currentTarget.innerHTML;
    this.lastHtml = html;
    if (this.props.onChange) {
      this.props.onChange(html);
    }
  };

  render() {
    const {
      html,
      onKeyDown,
      onPaste,
      onFocus,
      onSelect,
      className,
      style,
      id,
      placeholder,
    } = this.props;

    return (
      <div
        id={id}
        ref={this.elRef}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onInput={this.handleInput}
        onBlur={this.handleInput}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onFocus={onFocus}
        onSelect={onSelect}
        className={`${className || ""} empty:before:content-[attr(data-placeholder)] empty:before:text-[#5F6368]/40`}
        style={{ outline: "none", ...style }}
        data-placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
}
