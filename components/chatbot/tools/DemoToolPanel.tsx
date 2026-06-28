import { useMessage } from "@assistant-ui/react";
import { ToolCallCard } from "@/components/chatbot/tools/ToolCallCard";
import { ToolResultBlock } from "@/components/chatbot/tools/ToolResultBlock";
import type { DemoToolCall } from "@/types/chatbot";

export function DemoToolPanel() {
  const demoTools = useMessage((state) => {
    const custom = state.metadata?.custom as { demoTools?: unknown } | undefined;
    return Array.isArray(custom?.demoTools) ? (custom.demoTools as DemoToolCall[]) : [];
  });

  if (demoTools.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 grid gap-2">
      {demoTools.map((tool) => (
        <div className="grid gap-2" key={tool.id}>
          <ToolCallCard name={tool.name} description={tool.description} status={tool.status} />
          {tool.result ? <DemoToolResult result={tool.result} /> : null}
        </div>
      ))}
    </div>
  );
}

function DemoToolResult({ result }: { result: NonNullable<DemoToolCall["result"]> }) {
  const rows = result.rows ?? [];

  return (
    <ToolResultBlock title={result.title}>
      {rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-black/10 text-neutral-500">
                {Object.keys(rows[0] ?? {}).map((key) => (
                  <th className="whitespace-nowrap px-2 py-1.5 font-medium" key={key}>
                    {formatHeader(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr className="border-b border-black/5 last:border-0" key={`${result.title}-${index}`}>
                  {Object.entries(row).map(([key, value]) => (
                    <td className="whitespace-nowrap px-2 py-1.5 text-neutral-800" key={key}>
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {result.bullets?.length ? (
        <ul className="mt-1 list-disc space-y-1 pl-4">
          {result.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}

      {result.note ? <p className="mt-2 text-xs text-neutral-500">{result.note}</p> : null}
    </ToolResultBlock>
  );
}

function formatHeader(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}
