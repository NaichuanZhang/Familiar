"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

const components: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="mb-2 ml-4 list-disc last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal last:mb-0">{children}</ol>,
  li: ({ children }) => <li className="mb-0.5">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline underline-offset-2 decoration-current/40 hover:decoration-current transition-colors"
    >
      {children}
    </a>
  ),
  h1: ({ children }) => <h1 className="mb-2 text-base font-semibold">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-1.5 text-base font-semibold">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-1 font-semibold">{children}</h3>,
  code: ({ className, children }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className="block mb-2 last:mb-0 rounded-lg bg-black/5 px-3 py-2 text-xs font-mono whitespace-pre-wrap overflow-x-auto">
          {children}
        </code>
      );
    }
    return (
      <code className="rounded bg-black/5 px-1 py-0.5 text-xs font-mono">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <pre className="mb-2 last:mb-0">{children}</pre>,
  blockquote: ({ children }) => (
    <blockquote className="mb-2 last:mb-0 border-l-2 border-current/20 pl-3 italic opacity-80">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-2 border-current/10" />,
};

type MessageContentProps = {
  content: string;
};

export function MessageContent({ content }: MessageContentProps) {
  return (
    <ReactMarkdown components={components}>
      {content}
    </ReactMarkdown>
  );
}
