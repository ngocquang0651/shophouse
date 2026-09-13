import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUrl, Min, ValidateNested } from "class-validator";
import { ProductBadge } from "../../common/enums/product-badge.enum";
import { ProductStatus } from "../../common/enums/product-status.enum";

class ProductVariantDto {
  @IsString() sku!: string;
  @IsString() color!: string;
  @IsString() colorHex!: string;
  @IsString() size!: string;
  @Type(() => Number) @IsNumber() @Min(0) stock!: number;
  @IsOptional() @IsUrl({ require_protocol: true, require_tld: false }) image?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) price?: number;
}

export class CreateProductDto {
  @IsString() name!: string;
  @IsString() brand!: string;
  @IsString() category!: string;
  @Type(() => Number) @IsNumber() @Min(1) price!: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) originalPrice?: number;
  @IsUrl({ require_protocol: true, require_tld: false }) image!: string;
  @IsOptional() @IsArray() @IsUrl({ require_protocol: true, require_tld: false }, { each: true }) images?: string[];
  @IsEnum(ProductBadge) badge!: ProductBadge;
  @IsOptional() @IsString() description?: string;
  @Type(() => Number) @IsNumber() @Min(0) stock!: number;
  @IsEnum(ProductStatus) status!: ProductStatus;
  @IsOptional() @IsString() slug?: string;
  @IsEnum(["women", "men", "kids", "unisex"]) audience!: string;
  @IsEnum(["shoes", "belts", "wallets", "food"]) productType!: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ProductVariantDto) variants?: ProductVariantDto[];
  @IsOptional() @IsString() material?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) details?: string[];
  @IsOptional() @IsString() careInstructions?: string;
  @IsOptional() @IsString() sizeGuideKey?: string;
}
