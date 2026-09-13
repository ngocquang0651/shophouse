import { Body, Controller, Delete, Get, Param, Patch, Post, Res } from "@nestjs/common";
import { randomUUID } from "crypto";
import type { Response } from "express";
import { ChatService } from "./chat.service";
import type { ChatThreadMessage } from "./chat.types";
import { AppendMessageDto } from "./dto/append-message.dto";
import { CreateThreadDto } from "./dto/create-thread.dto";
import { RenameThreadDto } from "./dto/rename-thread.dto";
import { StreamRunDto } from "./dto/stream-run.dto";
import { UpdateThreadDto } from "./dto/update-thread.dto";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get("threads")
  listThreads() {
    return this.chatService.listThreads();
  }

  @Post("threads")
  createThread(@Body() dto: CreateThreadDto) {
    return this.chatService.createThread({ threadId: dto.threadId, title: dto.title });
  }

  @Get("threads/:threadId")
  getThread(@Param("threadId") threadId: string) {
    return this.chatService.getThreadDetail(threadId);
  }

  @Patch("threads/:threadId/name")
  renameThread(@Param("threadId") threadId: string, @Body() dto: RenameThreadDto) {
    return this.chatService.renameThread(threadId, dto.title);
  }

  @Post("threads/:threadId/pin")
  pinThread(@Param("threadId") threadId: string) {
    return this.chatService.pinThread(threadId);
  }

  @Post("threads/:threadId/unpin")
  unpinThread(@Param("threadId") threadId: string) {
    return this.chatService.unpinThread(threadId);
  }

  @Patch("threads/:threadId")
  updateThread(@Param("threadId") threadId: string, @Body() dto: UpdateThreadDto) {
    return this.chatService.updateThread(threadId, dto);
  }

  @Delete("threads/:threadId")
  deleteThread(@Param("threadId") threadId: string) {
    this.chatService.deleteThread(threadId);
    return { ok: true };
  }

  @Get("threads/:threadId/messages")
  getMessages(@Param("threadId") threadId: string) {
    return this.chatService.getHistory(threadId);
  }

  @Post("threads/:threadId/messages")
  appendMessage(@Param("threadId") threadId: string, @Body() dto: AppendMessageDto) {
    return this.chatService.appendMessage(threadId, dto as never);
  }

  @Post("threads/:threadId/messages/stream")
  async streamMessage(@Param("threadId") threadId: string, @Body() dto: StreamRunDto, @Res() response: Response) {
    this.chatService.ensureThread(threadId);
    const run = this.chatService.buildMockRun(dto.messages);
    const answer = run.text;
    const chunks = answer.match(/.{1,16}(\s|$)|\S+/g) ?? [answer];

    response.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
    response.setHeader("Cache-Control", "no-cache, no-transform");
    response.setHeader("Connection", "keep-alive");
    response.flushHeaders?.();

    if (run.tools?.length) {
      response.write(`${JSON.stringify({ type: "tools", tools: run.tools })}\n`);
    }

    for (const chunk of chunks) {
      if (response.destroyed) {
        return;
      }

      response.write(`${JSON.stringify({ type: "chunk", text: chunk })}\n`);
      await sleep(55 + Math.floor(Math.random() * 75));
    }

    response.write(`${JSON.stringify({ type: "done", threadId, assistantMessageId: dto.assistantMessageId })}\n`);
    this.persistStreamHistory(threadId, dto, run);
    response.end();
  }

  @Post("threads/:threadId/runs/stream")
  async streamRun(@Param("threadId") threadId: string, @Body() dto: StreamRunDto, @Res() response: Response) {
    return this.streamMessage(threadId, dto, response);
  }

  private persistStreamHistory(threadId: string, dto: StreamRunDto, run: ReturnType<ChatService["buildMockRun"]>) {
    const userMessage = this.getLastUserMessage(dto.messages);
    const assistantMessageId = dto.assistantMessageId ?? randomUUID();

    if (userMessage) {
      this.chatService.appendMessage(threadId, {
        parentId: userMessage.id === dto.parentId ? null : (dto.parentId ?? null),
        message: userMessage
      });
    }

    this.chatService.appendMessage(threadId, {
      parentId: userMessage?.id ?? dto.parentId ?? null,
      message: {
        id: assistantMessageId,
        role: "assistant",
        content: [{ type: "text", text: run.text }],
        createdAt: new Date().toISOString(),
        metadata: {
          custom: {
            demoTools: run.tools ?? []
          }
        }
      }
    });
  }

  private getLastUserMessage(messages: unknown[]) {
    return [...(messages as ChatThreadMessage[])].reverse().find((message) => message.role === "user");
  }
}
