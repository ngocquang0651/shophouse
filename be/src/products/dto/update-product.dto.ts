import { Type } from "class-transformer";
import { ArrayMaxSize, IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUrl, Min, ValidateNested } from "class-validator";
import { ProductBadge } from "../../common/enums/product-badge.enum";
import { ProductStatus } from "../../common/enums/product-status.enum";
import { MAX_VARIANTS_PER_PRODUCT, ProductVariantDto } from "./product-variant.dto";

export class UpdateProductDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) price?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) originalPrice?: number | null;
  @IsOptional() @IsUrl({ require_protocol: true, require_tld: false }) image?: string;
  @IsOptional() @IsArray() @IsUrl({ require_protocol: true, require_tld: false }, { each: true }) images?: string[];
  @IsOptional() @IsEnum(ProductBadge) badge?: ProductBadge;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) stock?: number;
  @IsOptional() @IsEnum(ProductStatus) status?: ProductStatus;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsEnum(["women", "men", "kids", "unisex"]) audience?: string;
  @IsOptional() @IsEnum(["shoes", "belts", "wallets", "food"]) productType?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsArray() @ArrayMaxSize(MAX_VARIANTS_PER_PRODUCT) @ValidateNested({ each: true }) @Type(() => ProductVariantDto) variants?: ProductVariantDto[];
  @IsOptional() @IsString() material?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) details?: string[];
  @IsOptional() @IsString() careInstructions?: string;
  @IsOptional() @IsString() sizeGuideKey?: string;
}
