import { Type } from "class-transformer";
import { IsInt, IsNumber, IsOptional, IsString, IsUrl, Min } from "class-validator";

export const MAX_VARIANTS_PER_PRODUCT = 200;

export class ProductVariantDto {
  @IsString() sku!: string;
  @IsString() color!: string;
  @IsString() colorHex!: string;
  @IsString() size!: string;
  @Type(() => Number) @IsInt() @Min(0) stock!: number;
  @IsOptional() @IsUrl({ require_protocol: true, require_tld: false }) image?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) price?: number;
  @IsOptional() @IsString() sourceVariantId?: string;
  @IsOptional() @IsString() sourceLabel?: string;
  @IsOptional() @IsString() gtin?: string;
}
