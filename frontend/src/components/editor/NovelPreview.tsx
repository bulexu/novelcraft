'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NovelPreviewProps {
  content: string;
}

export function NovelPreview({ content }: NovelPreviewProps) {
  return (
    <div className="h-full overflow-y-auto bg-surface-container-low">
      <div className="max-w-none p-6 novel-preview prose prose-slate">
        {content ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Paragraph styling with Chinese indentation
              p: ({ children }) => (
                <p className="mb-4 text-justify" style={{ textIndent: '2em' }}>
                  {children}
                </p>
              ),
              // Heading styles
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold mb-6 mt-8 text-on-surface border-b border-outline-variant/20 pb-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-bold mb-4 mt-6 text-on-surface">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-bold mb-3 mt-4 text-on-surface">
                  {children}
                </h3>
              ),
              // Blockquote for dialogue or emphasis
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary/30 pl-4 my-4 italic text-on-surface-variant">
                  {children}
                </blockquote>
              ),
              // Strong and emphasis
              strong: ({ children }) => (
                <strong className="font-bold text-on-surface">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-on-surface-variant">{children}</em>
              ),
              // Horizontal rule for scene breaks
              hr: () => (
                <hr className="my-8 border-t-2 border-outline-variant/20" />
              ),
              // Lists
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-4 space-y-1 text-on-surface">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-4 space-y-1 text-on-surface">
                  {children}
                </ol>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        ) : (
          <div className="flex items-center justify-center h-32 text-on-surface-variant">
            <p className="text-sm">暂无内容</p>
          </div>
        )}
      </div>

      {/* Styles for Chinese reading optimization */}
      <style jsx global>{`
        .novel-preview {
          font-family: 'Noto Serif SC', 'Source Han Serif CN', 'STSong', serif;
          font-size: 18px;
          line-height: 1.8;
          color: var(--on-surface);
        }

        .novel-preview p {
          margin: 1.5em 0;
          text-indent: 2em;
        }

        .novel-preview p:first-child {
          margin-top: 0;
        }

        .novel-preview p:last-child {
          margin-bottom: 0;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .novel-preview {
            color: var(--on-surface);
          }
        }
      `}</style>
    </div>
  );
}