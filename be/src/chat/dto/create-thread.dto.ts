import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateThreadDto {
  @IsOptional()
  @IsString()
  threadId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;
}
