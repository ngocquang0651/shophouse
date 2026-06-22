import { IsIn, IsObject, IsOptional, IsString, MaxLength } from "class-validator";
import type { ChatThreadStatus } from "../chat.types";

export class UpdateThreadDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsIn(["regular", "archived"])
  status?: ChatThreadStatus;

  @IsOptional()
  @IsObject()
  custom?: Record<string, unknown>;
}
