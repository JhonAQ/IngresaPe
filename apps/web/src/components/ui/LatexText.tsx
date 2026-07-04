import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface LatexTextProps {
  text: string;
  className?: string;
}

export function LatexText({ text, className }: LatexTextProps) {
  const parts = text.split(/(\$[^$]+\$)/);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const math = part.slice(1, -1);
          return (
            <InlineMath
              key={`${math}-${index}`}
              math={math}
              renderError={(error) => (
                <span key={`${math}-${index}`} className="text-red-500">{error.message}</span>
              )}
            />
          );
        }
        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </span>
  );
}
