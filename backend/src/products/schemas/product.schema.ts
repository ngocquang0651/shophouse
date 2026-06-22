import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { ProductBadge } from "../../common/enums/product-badge.enum";
import { ProductStatus } from "../../common/enums/product-status.enum";

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  brand!: string;

  @Prop({ required: true, trim: true })
  category!: string;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ min: 0 })
  originalPrice?: number;

  @Prop({ required: true, trim: true })
  image!: string;

  @Prop({ default: [], type: [String] })
  images!: string[];

  @Prop({ enum: ProductBadge, default: ProductBadge.Luxury })
  badge!: ProductBadge;

  @Prop({ trim: true, default: "" })
  description?: string;

  @Prop({ min: 0, default: 0 })
  stock!: number;

  @Prop({ enum: ProductStatus, default: ProductStatus.Active })
  status!: ProductStatus;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
