import type { ReactNode } from "react";
import { flattenText, parseMarkdownBlocks, renderInlineMarkdown } from "@/components/chatbot/markdown/markdown-parser";

export function MarkdownText({ children }: { children?: ReactNode }) {
  const text = flattenText(children);
  const blocks = parseMarkdownBlocks(text);

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const HeadingTag = `h${block.level}` as "h1" | "h2" | "h3";

          return (
            <HeadingTag className="font-semibold leading-snug text-inherit" key={index}>
              {renderInlineMarkdown(block.text)}
            </HeadingTag>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p className="whitespace-pre-wrap" key={index}>
              {renderInlineMarkdown(block.text)}
            </p>
          );
        }

        if (block.type === "unordered-list") {
          return (
            <ul className="list-disc space-y-1 pl-5" key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInlineMarkdown(item)}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "ordered-list") {
          return (
            <ol className="list-decimal space-y-1 pl-5" key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInlineMarkdown(item)}</li>
              ))}
            </ol>
          );
        }

        return (
          <pre
            className="overflow-x-auto rounded-xl border border-black/10 bg-[#f0eee8] p-3 text-xs leading-5 text-neutral-900"
            key={index}
          >
            <code>{block.text}</code>
          </pre>
        );
      })}
    </div>
  );
}
