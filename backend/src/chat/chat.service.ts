import { Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import type { ChatHistoryItem, ChatHistoryRepository, ChatThread, ChatThreadMessage, ChatThreadStatus } from "./chat.types";

const fallbackPrompts = [
  "Mình có thể giúp bạn lọc sản phẩm theo brand, category, ngân sách hoặc dịp sử dụng.",
  "Nếu bạn muốn mua nhanh, hãy bắt đầu từ category, sau đó chốt theo brand và khoảng giá.",
  "Với LuxeStore, mình ưu tiên gợi ý rõ ràng: sản phẩm nào hợp nhu cầu, vì sao hợp, và nên xem thêm gì."
];

@Injectable()
export class ChatService {
  private readonly threads = new Map<string, ChatThread>();
  private readonly histories = new Map<string, ChatHistoryRepository>();

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
      messages: history.messages,
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
    return this.histories.get(threadId) ?? { messages: [] };
  }

  appendMessage(threadId: string, item: ChatHistoryItem) {
    const thread = this.ensureThread(threadId);
    const history = this.getHistory(threadId);
    const message = {
      ...item.message,
      createdAt: item.message.createdAt ?? new Date().toISOString()
    };
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
    const prompt = this.getLastUserText(messages);
    const normalized = prompt.toLowerCase();
    const starter = fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];

    if (this.matches(normalized, ["sale", "giảm", "outlet", "less", "deal"])) {
      return [
        "Mình sẽ ưu tiên nhóm Luxury for Less cho nhu cầu này.",
        "",
        "- Coach và Michael Kors thường là lựa chọn dễ mua khi muốn túi cao cấp có mức giá mềm hơn.",
        "- Outlet hợp để săn giá tốt, còn Pre-Loved hợp nếu bạn muốn món hiếm hoặc giữ ngân sách.",
        "- Nếu bạn cho mình khoảng giá, mình có thể rút gọn còn 3 lựa chọn đáng xem nhất."
      ].join("\n");
    }

    if (this.matches(normalized, ["bag", "túi", "coach", "kate spade", "michael kors"])) {
      return [
        "Với túi luxury, mình sẽ chọn theo 3 tiêu chí: form, sức chứa và độ dễ phối.",
        "",
        "- Đi làm: ưu tiên tote hoặc satchel màu đen, kem, nâu lạnh.",
        "- Đi chơi: shoulder bag hoặc crossbody sẽ nhẹ và gọn hơn.",
        "- Brand dễ bắt đầu: Coach, Kate Spade, Michael Kors.",
        "",
        "Nếu bạn muốn, hãy gửi ngân sách và dịp dùng, mình sẽ gợi ý sát hơn."
      ].join("\n");
    }

    if (this.matches(normalized, ["authentic", "thật", "chính hãng", "luxury", "cao cấp"])) {
      return [
        "Khi mua luxury, mình sẽ kiểm tra theo thứ tự: nguồn bán, ảnh sản phẩm, thông tin chất liệu, chính sách đổi trả và dấu hiệu xác thực.",
        "",
        "Trong LuxeStore mock flow, phần Authentic Luxury nên giải thích rõ cam kết hàng chính hãng và giúp người mua yên tâm trước khi thêm vào giỏ."
      ].join("\n");
    }

    if (this.matches(normalized, ["brand", "hãng", "thương hiệu"])) {
      return "Nhóm brand nổi bật nên được scan nhanh: ALDO, Lacoste, Nike, Calvin Klein, New Balance, Adidas, Kate Spade, Coach, Michael Kors, BOSS và COS.";
    }

    if (this.matches(normalized, ["login", "đăng nhập", "account", "tài khoản"])) {
      return "Tài khoản demo hiện tại là user@example.com với mật khẩu password123. Sau khi đăng nhập, header sẽ chuyển sang trạng thái user menu.";
    }

    return [
      starter,
      "",
      `Mình hiểu câu hỏi của bạn là: "${prompt || "Bạn muốn tư vấn gì cho LuxeStore?"}"`,
      "",
      "Bạn có thể hỏi theo kiểu: tìm túi đi làm, sản phẩm đang sale, brand nổi bật, hoặc cách cải thiện flow shopping."
    ].join("\n");
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
}
