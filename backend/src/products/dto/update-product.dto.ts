import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUrl, Min } from "class-validator";
import { ProductBadge } from "../../common/enums/product-badge.enum";
import { ProductStatus } from "../../common/enums/product-status.enum";

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  originalPrice?: number;

  @IsOptional()
  @IsUrl({ require_protocol: true, require_tld: false })
  image?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({ require_protocol: true, require_tld: false }, { each: true })
  images?: string[];

  @IsOptional()
  @IsEnum(ProductBadge)
  badge?: ProductBadge;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
