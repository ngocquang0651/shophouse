import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { ProductBadge } from "../../common/enums/product-badge.enum";
import { ProductStatus } from "../../common/enums/product-status.enum";

export type ProductDocument = HydratedDocument<Product>;

@Schema({ _id: false })
export class ProductVariant {
  @Prop({ required: true, trim: true }) sku!: string;
  @Prop({ trim: true }) sourceVariantId?: string;
  @Prop({ trim: true }) sourceLabel?: string;
  @Prop({ trim: true }) gtin?: string;
  @Prop({ required: true, trim: true }) color!: string;
  @Prop({ required: true, trim: true }) colorHex!: string;
  @Prop({ required: true, trim: true }) size!: string;
  @Prop({ required: true, min: 0 }) stock!: number;
  @Prop({ trim: true }) image?: string;
  @Prop({ min: 0 }) price?: number;
}

const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);

@Schema({ _id: false })
export class ProductSource {
  @Prop({ required: true, enum: ["shopee"] }) provider!: string;
  @Prop({ required: true, trim: true }) productId!: string;
  @Prop({ trim: true }) categoryPath?: string;
  @Prop({ trim: true }) fingerprint?: string;
  @Prop({ trim: true }) importRunId?: string;
  @Prop() importedAt?: Date;
  @Prop() lastSeenAt?: Date;
}

const ProductSourceSchema = SchemaFactory.createForClass(ProductSource);

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true }) name!: string;
  @Prop({ required: true, trim: true }) brand!: string;
  @Prop({ required: true, trim: true }) slug!: string;
  @Prop({ required: true, enum: ["women", "men", "kids", "unisex"] }) audience!: string;
  @Prop({ required: true, enum: ["shoes", "belts", "wallets", "food"] }) productType!: string;
  @Prop({ required: true, trim: true }) category!: string;
  @Prop({ default: [], type: [String] }) tags!: string[];
  @Prop({ required: true, min: 0 }) price!: number;
  @Prop({ min: 0 }) originalPrice?: number;
  @Prop({ required: true, trim: true }) image!: string;
  @Prop({ default: [], type: [String] }) images!: string[];
  @Prop({ enum: ProductBadge, default: ProductBadge.New }) badge!: ProductBadge;
  @Prop({ type: ProductSourceSchema }) source?: ProductSource;
  @Prop({ type: [ProductVariantSchema], default: [] }) variants!: ProductVariant[];
  @Prop({ trim: true, default: "" }) description?: string;
  @Prop({ trim: true }) material?: string;
  @Prop({ default: [], type: [String] }) details?: string[];
  @Prop({ trim: true }) careInstructions?: string;
  @Prop({ trim: true }) sizeGuideKey?: string;
  @Prop({ min: 0, default: 0 }) stock!: number;
  @Prop({ enum: ProductStatus, default: ProductStatus.Active }) status!: ProductStatus;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index(
  { "source.provider": 1, "source.productId": 1 },
  { unique: true, partialFilterExpression: { "source.provider": { $exists: true } } }
);
ProductSchema.index({ audience: 1, productType: 1, category: 1 });
