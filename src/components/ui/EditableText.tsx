import React from 'react';

interface EditableTextProps {
  text?: string;
  tag?: string;
  className?: string;
  onChange: (value: string) => void;
}

export const EditableText = ({
  text,
  tag = 'div',
  className,
  onChange,
}: EditableTextProps) => {
  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (e.currentTarget.textContent !== text) {
      onChange(e.currentTarget.textContent || '');
    }
  };

  const Tag = tag as keyof React.JSX.IntrinsicElements;

  return React.createElement(
    Tag,
    {
      contentEditable: true,
      suppressContentEditableWarning: true,
      className: `editable-text transition-all ${className}`,
      onBlur: handleBlur,
    },
    text || 'Click to edit'
  );
};
