import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, Types } from "mongoose";
import { ProductBadge } from "../common/enums/product-badge.enum";
import { ProductStatus } from "../common/enums/product-status.enum";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./schemas/product.schema";

type ProductFilters = {
  search?: string;
  category?: string;
  badge?: ProductBadge;
  status?: ProductStatus;
};

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private readonly productModel: Model<Product>) {}

  async findAll(filters: ProductFilters = {}) {
    const query: FilterQuery<Product> = {};

    if (filters.search?.trim()) {
      const search = filters.search.trim();
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } }
      ];
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.badge) {
      query.badge = filters.badge;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    return this.productModel.find(query).sort({ createdAt: -1 }).lean().exec();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException("Product not found.");
    }

    const product = await this.productModel.findById(id).lean().exec();
    if (!product) {
      throw new NotFoundException("Product not found.");
    }

    return product;
  }

  create(dto: CreateProductDto) {
    return this.productModel.create(this.normalizeImages(dto));
  }

  async update(id: string, dto: UpdateProductDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException("Product not found.");
    }

    const product = await this.productModel
      .findByIdAndUpdate(id, this.normalizeImages(dto), { new: true, runValidators: true })
      .lean()
      .exec();

    if (!product) {
      throw new NotFoundException("Product not found.");
    }

    return product;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException("Product not found.");
    }

    const product = await this.productModel.findByIdAndDelete(id).lean().exec();
    if (!product) {
      throw new NotFoundException("Product not found.");
    }

    return { ok: true };
  }

  private normalizeImages<T extends CreateProductDto | UpdateProductDto>(dto: T) {
    const images = dto.images?.filter(Boolean) ?? [];
    const image = dto.image || images[0];

    if (!image) {
      return dto;
    }

    return {
      ...dto,
      image,
      images: images.includes(image) ? images : [image, ...images]
    };
  }
}
