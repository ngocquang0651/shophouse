import { IsArray, IsOptional, IsString } from "class-validator";

export class StreamRunDto {
  @IsArray()
  messages!: unknown[];

  @IsOptional()
  @IsString()
  parentId?: string | null;

  @IsOptional()
  @IsString()
  assistantMessageId?: string;
}
