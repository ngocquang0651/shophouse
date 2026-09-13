import { IsString, MaxLength } from "class-validator";

export class RenameThreadDto {
  @IsString()
  @MaxLength(120)
  title!: string;
}
