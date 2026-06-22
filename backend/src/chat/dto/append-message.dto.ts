import { Allow, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class ChatMessageDto {
  @IsString()
  id!: string;

  @IsString()
  role!: string;

  @IsOptional()
  content?: unknown;

  @Allow()
  createdAt?: unknown;

  @Allow()
  status?: unknown;

  @Allow()
  metadata?: unknown;

  @Allow()
  attachments?: unknown;
}

export class AppendMessageDto {
  @IsOptional()
  @IsString()
  parentId?: string | null;

  @ValidateNested()
  @Type(() => ChatMessageDto)
  message!: ChatMessageDto;

  @IsOptional()
  @IsObject()
  runConfig?: Record<string, unknown>;
}
