import { Body, Controller, Delete, Get, Param, Patch, Post, Res } from "@nestjs/common";
import type { Response } from "express";
import { ChatService } from "./chat.service";
import { AppendMessageDto } from "./dto/append-message.dto";
import { CreateThreadDto } from "./dto/create-thread.dto";
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
    return this.chatService.createThread(dto.title);
  }

  @Get("threads/:threadId")
  getThread(@Param("threadId") threadId: string) {
    return this.chatService.getThread(threadId);
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

  @Post("threads/:threadId/runs/stream")
  async streamRun(@Param("threadId") threadId: string, @Body() dto: StreamRunDto, @Res() response: Response) {
    this.chatService.ensureThread(threadId);
    const answer = this.chatService.buildMockReply(dto.messages);
    const chunks = answer.match(/.{1,16}(\s|$)|\S+/g) ?? [answer];

    response.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
    response.setHeader("Cache-Control", "no-cache, no-transform");
    response.setHeader("Connection", "keep-alive");
    response.flushHeaders?.();

    for (const chunk of chunks) {
      if (response.destroyed) {
        return;
      }

      response.write(`${JSON.stringify({ type: "chunk", text: chunk })}\n`);
      await sleep(55 + Math.floor(Math.random() * 75));
    }

    response.write(`${JSON.stringify({ type: "done", threadId, assistantMessageId: dto.assistantMessageId })}\n`);
    response.end();
  }
}
