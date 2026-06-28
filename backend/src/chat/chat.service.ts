import { Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import type {
  ChatHistoryItem,
  ChatHistoryRepository,
  ChatRunReply,
  ChatThread,
  ChatThreadMessage,
  ChatThreadStatus,
  DemoToolCall
} from "./chat.types";

const fallbackPrompts = [
  "Mình có thể giúp bạn lọc sản phẩm theo brand, category, ngân sách hoặc dịp sử dụng.",
  "Nếu bạn muốn mua nhanh, hãy bắt đầu từ category, sau đó chốt theo brand và khoảng giá.",
  "Với LuxeStore, mình ưu tiên gợi ý rõ ràng: sản phẩm nào hợp nhu cầu, vì sao hợp, và nên xem thêm gì."
];

const markdownDemoImage =
  "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80";

const markdownShowcaseReply = [
  "# Markdown showcase",
  "",
  "Renderer này dùng `@assistant-ui/react-markdown` với `remark-gfm`, nên có thể render các format Markdown/GFM phổ biến.",
  "",
  "## Inline format",
  "",
  "Bạn có thể dùng **bold**, *italic*, ***bold italic***, ~~strikethrough~~, `inline code`, link như [assistant-ui](https://www.assistant-ui.com/docs/ui/markdown), và footnote.[^note]",
  "",
  "> Quote block hợp để agent nhấn mạnh insight, policy hoặc kết luận quan trọng.",
  "",
  "## Lists",
  "",
  "- Women's Bags",
  "  - Tote",
  "  - Crossbody",
  "- Men's Essentials",
  "- Fine Jewellery",
  "",
  "1. Chọn category",
  "2. So sánh brand",
  "3. Chốt sản phẩm theo ngân sách",
  "",
  "## Task list",
  "",
  "- [x] Render markdown bằng assistant-ui primitive",
  "- [x] Support GFM tables/task lists",
  "- [ ] Gắn syntax highlighter nâng cao nếu cần",
  "",
  "## Table",
  "",
  "| Brand | Category | Badge | Notes |",
  "| --- | --- | --- | --- |",
  "| Coach | Bags | Sale | Dễ bắt đầu với luxury |",
  "| COS | Clothing | Luxury | Tối giản, dễ phối |",
  "| Kate Spade | Accessories | New | Hợp quà tặng |",
  "",
  "## Code block",
  "",
  "```ts",
  "type ChatThreadAction = \"pin\" | \"rename\" | \"delete\";",
  "",
  "function shouldShowAction(isHovered: boolean, isMobile: boolean) {",
  "  return isHovered || isMobile;",
  "}",
  "```",
  "",
  "---",
  "",
  "## Image",
  "",
  `![Structured leather tote](${markdownDemoImage})`,
  "",
  "[^note]: Footnote được hỗ trợ bởi `remark-gfm`."
].join("\n");

const markdownShoppingReply = [
  "## LuxeStore response format",
  "",
  "Khi agent trả lời tư vấn shopping, format nên dễ scan:",
  "",
  "| Need | Best answer shape |",
  "| --- | --- |",
  "| Tìm sản phẩm | Bullet list + lý do chọn |",
  "| So sánh brand | Table ngắn |",
  "| Hướng dẫn flow | Ordered list |",
  "| Cảnh báo/chính sách | Blockquote |",
  "",
  "Ví dụ:",
  "",
  "> Với ngân sách dưới 1.000.000đ, hãy ưu tiên **Coach outlet**, **Michael Kors sale**, hoặc nhóm **Pre-Loved** nếu bạn muốn món hiếm.",
  "",
  "- **Đi làm:** tote hoặc satchel.",
  "- **Đi chơi:** shoulder bag hoặc crossbody.",
  "- **Quà tặng:** Kate Spade accessories.",
  "",
  "```tsx",
  "<MessagePrimitive.Parts components={{ Text: MarkdownMessagePart }} />",
  "```"
].join("\n");

const shoppingDemoTools: DemoToolCall[] = [
  {
    id: "tool-catalog-search",
    name: "catalog.search",
    description: "Find matching LuxeStore products",
    status: "complete",
    result: {
      title: "Top product matches",
      rows: [
        { brand: "Coach", product: "Tabby Shoulder Bag", category: "Women's Bags", price: "8.900.000đ", badge: "Sale" },
        { brand: "Kate Spade", product: "Knott Medium Satchel", category: "Women's Bags", price: "7.450.000đ", badge: "New" },
        { brand: "Michael Kors", product: "Jet Set Crossbody", category: "Women's Bags", price: "5.250.000đ", badge: "Luxury" }
      ],
      note: "Mock result for chatbot tool demo only."
    }
  },
  {
    id: "tool-price-filter",
    name: "price.filter",
    description: "Prioritize sale and outlet-friendly picks",
    status: "complete",
    result: {
      title: "Budget signals",
      bullets: [
        "Coach and Michael Kors are strong demo choices for luxury-for-less positioning.",
        "Pre-Loved is best when the buyer cares about rare finds over new arrivals.",
        "Sale badges should stay visible in product cards for fast scanning."
      ]
    }
  },
  {
    id: "tool-brand-lookup",
    name: "brand.lookup",
    description: "Check brand/category context",
    status: "complete",
    result: {
      title: "Brand context",
      rows: [
        { brand: "Coach", strength: "Everyday leather bags", fit: "Office and gifting" },
        { brand: "Kate Spade", strength: "Playful accessories", fit: "Gifts and casual outfits" },
        { brand: "COS", strength: "Minimal clothing", fit: "Quiet luxury styling" }
      ]
    }
  }
];

const toolDemoReply = [
  "## Tool demo result",
  "",
  "Mình đã chạy thử 3 mock tools cho flow tư vấn shopping:",
  "",
  "- `catalog.search` tìm sản phẩm phù hợp.",
  "- `price.filter` rút gọn theo sale/outlet signal.",
  "- `brand.lookup` bổ sung context về brand.",
  "",
  "Các tool này đang dùng dữ liệu demo để trình diễn UI. Chúng chưa gọi model thật hoặc product API thật."
].join("\n");

@Injectable()
export class ChatService {
  private readonly threads = new Map<string, ChatThread>();
  private readonly histories = new Map<string, ChatHistoryRepository>();

  constructor() {
    this.seedMarkdownDemoThreads();
  }

  listThreads() {
    const threads = Array.from(this.threads.values())
      .sort((a, b) => {
        if (a.pinned !== b.pinned) {
          return a.pinned ? -1 : 1;
        }

        return b.updatedAt.localeCompare(a.updatedAt);
      })
      .map((thread) => ({
        id: thread.id,
        title: thread.title,
        pinned: thread.pinned,
        status: thread.status,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
        custom: thread.custom
      }));

    return { threads };
  }

  createThread(data: { threadId?: string; title?: string } = {}) {
    if (data.threadId) {
      const existing = this.threads.get(data.threadId);
      if (existing) {
        return existing;
      }
    }

    const now = new Date().toISOString();
    const thread: ChatThread = {
      id: data.threadId ?? randomUUID(),
      title: data.title ?? "New conversation",
      pinned: false,
      status: "regular",
      createdAt: now,
      updatedAt: now
    };

    this.threads.set(thread.id, thread);
    this.histories.set(thread.id, { messages: [] });

    return thread;
  }

  ensureThread(threadId: string) {
    const existing = this.threads.get(threadId);
    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    const thread: ChatThread = {
      id: threadId,
      title: "New conversation",
      pinned: false,
      status: "regular",
      createdAt: now,
      updatedAt: now
    };

    this.threads.set(thread.id, thread);
    this.histories.set(thread.id, { messages: [] });

    return thread;
  }

  getThreadDetail(threadId: string) {
    const thread = this.getThread(threadId);
    const history = this.getHistory(threadId);

    return {
      thread,
      messages: history.messages.map((item) => this.normalizeHistoryItem(item)),
      headId: history.headId
    };
  }

  getThread(threadId: string) {
    const thread = this.threads.get(threadId);
    if (!thread) {
      throw new NotFoundException("Thread not found.");
    }

    return thread;
  }

  updateThread(threadId: string, data: { title?: string; status?: ChatThreadStatus; custom?: Record<string, unknown> }) {
    const thread = this.getThread(threadId);
    const updated = {
      ...thread,
      ...data,
      title: data.title ?? thread.title,
      status: data.status ?? thread.status,
      custom: data.custom ?? thread.custom,
      pinned: typeof data.custom?.pinned === "boolean" ? data.custom.pinned : thread.pinned,
      updatedAt: new Date().toISOString()
    };

    this.threads.set(threadId, updated);
    return updated;
  }

  renameThread(threadId: string, title: string) {
    const thread = this.getThread(threadId);
    const updated = {
      ...thread,
      title,
      updatedAt: new Date().toISOString()
    };

    this.threads.set(threadId, updated);
    return updated;
  }

  pinThread(threadId: string) {
    return this.setThreadPinned(threadId, true);
  }

  unpinThread(threadId: string) {
    return this.setThreadPinned(threadId, false);
  }

  deleteThread(threadId: string) {
    this.getThread(threadId);
    this.threads.delete(threadId);
    this.histories.delete(threadId);
  }

  getHistory(threadId: string) {
    this.ensureThread(threadId);
    const history = this.histories.get(threadId) ?? { messages: [] };

    return {
      ...history,
      messages: history.messages.map((item) => this.normalizeHistoryItem(item))
    };
  }

  appendMessage(threadId: string, item: ChatHistoryItem) {
    const thread = this.ensureThread(threadId);
    const history = this.histories.get(threadId) ?? { messages: [] };
    this.histories.set(threadId, history);
    const message = this.normalizeMessage(item.message);
    const nextItem = {
      ...item,
      parentId: item.parentId ?? null,
      message
    };
    const existingIndex = history.messages.findIndex((entry) => entry.message.id === message.id);

    if (existingIndex >= 0) {
      history.messages[existingIndex] = nextItem;
    } else {
      history.messages.push(nextItem);
    }

    history.headId = message.id;
    thread.updatedAt = new Date().toISOString();

    if (message.role === "user" && (thread.title === "New conversation" || thread.title.trim() === "")) {
      thread.title = this.makeTitleFromMessage(message);
    }

    return nextItem;
  }

  buildMockReply(messages: unknown[]) {
    return this.buildMockRun(messages).text;
  }

  buildMockRun(messages: unknown[]): ChatRunReply {
    const prompt = this.getLastUserText(messages);
    const normalized = prompt.toLowerCase();
    const starter = fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];

    if (this.matches(normalized, ["tool", "tools", "demo tool", "tool demo", "demo tools"])) {
      return {
        text: toolDemoReply,
        tools: shoppingDemoTools
      };
    }

    if (this.matches(normalized, ["sale", "giảm", "outlet", "less", "deal"])) {
      return {
        text: [
        "Mình sẽ ưu tiên nhóm Luxury for Less cho nhu cầu này.",
        "",
        "- Coach và Michael Kors thường là lựa chọn dễ mua khi muốn túi cao cấp có mức giá mềm hơn.",
        "- Outlet hợp để săn giá tốt, còn Pre-Loved hợp nếu bạn muốn món hiếm hoặc giữ ngân sách.",
        "- Nếu bạn cho mình khoảng giá, mình có thể rút gọn còn 3 lựa chọn đáng xem nhất."
        ].join("\n"),
        tools: shoppingDemoTools.slice(0, 2)
      };
    }

    if (this.matches(normalized, ["bag", "túi", "coach", "kate spade", "michael kors"])) {
      return {
        text: [
        "Với túi luxury, mình sẽ chọn theo 3 tiêu chí: form, sức chứa và độ dễ phối.",
        "",
        "- Đi làm: ưu tiên tote hoặc satchel màu đen, kem, nâu lạnh.",
        "- Đi chơi: shoulder bag hoặc crossbody sẽ nhẹ và gọn hơn.",
        "- Brand dễ bắt đầu: Coach, Kate Spade, Michael Kors.",
        "",
        "Nếu bạn muốn, hãy gửi ngân sách và dịp dùng, mình sẽ gợi ý sát hơn."
        ].join("\n"),
        tools: [shoppingDemoTools[0], shoppingDemoTools[2]]
      };
    }

    if (this.matches(normalized, ["authentic", "thật", "chính hãng", "luxury", "cao cấp"])) {
      return {
        text: [
        "Khi mua luxury, mình sẽ kiểm tra theo thứ tự: nguồn bán, ảnh sản phẩm, thông tin chất liệu, chính sách đổi trả và dấu hiệu xác thực.",
        "",
        "Trong LuxeStore mock flow, phần Authentic Luxury nên giải thích rõ cam kết hàng chính hãng và giúp người mua yên tâm trước khi thêm vào giỏ."
        ].join("\n")
      };
    }

    if (this.matches(normalized, ["brand", "hãng", "thương hiệu"])) {
      return {
        text: "Nhóm brand nổi bật nên được scan nhanh: ALDO, Lacoste, Nike, Calvin Klein, New Balance, Adidas, Kate Spade, Coach, Michael Kors, BOSS và COS.",
        tools: [shoppingDemoTools[2]]
      };
    }

    if (this.matches(normalized, ["login", "đăng nhập", "account", "tài khoản"])) {
      return { text: "Tài khoản demo hiện tại là user@example.com với mật khẩu password123. Sau khi đăng nhập, header sẽ chuyển sang trạng thái user menu." };
    }

    if (this.matches(normalized, ["markdown", "format", "table", "code", "gfm"])) {
      return { text: markdownShowcaseReply };
    }

    return {
      text: [
      starter,
      "",
      `Mình hiểu câu hỏi của bạn là: "${prompt || "Bạn muốn tư vấn gì cho LuxeStore?"}"`,
      "",
      "Bạn có thể hỏi theo kiểu: tìm túi đi làm, sản phẩm đang sale, brand nổi bật, hoặc cách cải thiện flow shopping."
      ].join("\n")
    };
  }

  private getLastUserText(messages: unknown[]) {
    const chatMessages = messages as ChatThreadMessage[];
    const userMessage = [...chatMessages].reverse().find((message) => message.role === "user");
    const parts = Array.isArray(userMessage?.content) ? userMessage.content : [];

    return parts
      .filter((part) => part.type === "text")
      .map((part) => part.text ?? "")
      .join(" ")
      .trim();
  }

  private matches(input: string, keywords: string[]) {
    return keywords.some((keyword) => input.includes(keyword));
  }

  private makeTitleFromMessage(message: ChatThreadMessage) {
    const text = message.content
      .filter((part) => part.type === "text")
      .map((part) => part.text ?? "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) {
      return "New conversation";
    }

    return text.length > 42 ? `${text.slice(0, 39)}...` : text;
  }

  private setThreadPinned(threadId: string, pinned: boolean) {
    const thread = this.getThread(threadId);
    const updated = {
      ...thread,
      pinned,
      custom: {
        ...(thread.custom ?? {}),
        pinned
      },
      updatedAt: new Date().toISOString()
    };

    this.threads.set(threadId, updated);
    return updated;
  }

  private normalizeHistoryItem(item: ChatHistoryItem): ChatHistoryItem {
    return {
      ...item,
      parentId: item.parentId ?? null,
      message: this.normalizeMessage(item.message)
    };
  }

  private normalizeMessage(message: ChatThreadMessage): ChatThreadMessage {
    const metadata = typeof message.metadata === "object" && message.metadata !== null ? message.metadata : {};
    const metadataRecord = metadata as Record<string, unknown>;
    const createdAt = message.createdAt ?? new Date().toISOString();

    if (message.role === "assistant") {
      return {
        ...message,
        createdAt,
        status: message.status ?? { type: "complete", reason: "stop" },
        metadata: {
          unstable_state: metadataRecord.unstable_state ?? null,
          unstable_annotations: Array.isArray(metadataRecord.unstable_annotations) ? metadataRecord.unstable_annotations : [],
          unstable_data: Array.isArray(metadataRecord.unstable_data) ? metadataRecord.unstable_data : [],
          steps: Array.isArray(metadataRecord.steps) ? metadataRecord.steps : [],
          ...metadataRecord,
          custom: this.getCustomMetadata(metadataRecord.custom)
        }
      };
    }

    if (message.role === "user") {
      return {
        ...message,
        createdAt,
        attachments: Array.isArray(message.attachments) ? message.attachments : [],
        metadata: {
          ...metadataRecord,
          custom: this.getCustomMetadata(metadataRecord.custom)
        }
      };
    }

    return {
      ...message,
      createdAt,
      metadata: {
        ...metadataRecord,
        custom: this.getCustomMetadata(metadataRecord.custom)
      }
    };
  }

  private getCustomMetadata(custom: unknown) {
    return typeof custom === "object" && custom !== null ? (custom as Record<string, unknown>) : {};
  }

  private seedMarkdownDemoThreads() {
    this.createDemoThread({
      id: "demo-tool-calls",
      title: "Demo: Tool calls",
      pinned: true,
      updatedAt: "2026-06-27T08:05:00.000Z",
      userText: "Demo tools tư vấn shopping",
      assistantText: toolDemoReply,
      tools: shoppingDemoTools
    });

    this.createDemoThread({
      id: "demo-markdown-showcase",
      title: "Demo: Markdown showcase",
      pinned: true,
      updatedAt: "2026-06-27T08:00:00.000Z",
      userText: "Show tất cả markdown format đang support",
      assistantText: markdownShowcaseReply
    });

    this.createDemoThread({
      id: "demo-shopping-markdown",
      title: "Demo: Shopping answer format",
      pinned: false,
      updatedAt: "2026-06-27T07:55:00.000Z",
      userText: "Format câu trả lời shopping sao cho dễ scan",
      assistantText: markdownShoppingReply
    });
  }

  private createDemoThread(data: {
    id: string;
    title: string;
    pinned: boolean;
    updatedAt: string;
    userText: string;
    assistantText: string;
    tools?: DemoToolCall[];
  }) {
    if (this.threads.has(data.id)) {
      return;
    }

    const createdAt = data.updatedAt;
    const userMessageId = `${data.id}-user`;
    const assistantMessageId = `${data.id}-assistant`;

    this.threads.set(data.id, {
      id: data.id,
      title: data.title,
      pinned: data.pinned,
      status: "regular",
      createdAt,
      updatedAt: data.updatedAt,
      custom: {
        pinned: data.pinned,
        demo: true
      }
    });

    this.histories.set(data.id, {
      headId: assistantMessageId,
      messages: [
        {
          parentId: null,
          message: {
            id: userMessageId,
            role: "user",
            content: [{ type: "text", text: data.userText }],
            createdAt
          }
        },
        {
          parentId: userMessageId,
          message: {
            id: assistantMessageId,
            role: "assistant",
            content: [{ type: "text", text: data.assistantText }],
            createdAt: data.updatedAt,
            metadata: {
              custom: {
                demoTools: data.tools ?? []
              }
            }
          }
        }
      ]
    });
  }
}
