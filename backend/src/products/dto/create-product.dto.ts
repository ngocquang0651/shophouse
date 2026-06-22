import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUrl, Min } from "class-validator";
import { ProductBadge } from "../../common/enums/product-badge.enum";
import { ProductStatus } from "../../common/enums/product-status.enum";

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsString()
  brand!: string;

  @IsString()
  category!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  price!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  originalPrice?: number;

  @IsUrl({ require_protocol: true, require_tld: false })
  image!: string;

  @IsOptional()
  @IsArray()
  @IsUrl({ require_protocol: true, require_tld: false }, { each: true })
  images?: string[];

  @IsEnum(ProductBadge)
  badge!: ProductBadge;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock!: number;

  @IsEnum(ProductStatus)
  status!: ProductStatus;
}
