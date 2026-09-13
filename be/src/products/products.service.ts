import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
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
  audience?: string;
  type?: string;
  tag?: string;
  status?: ProductStatus;
};

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private readonly productModel: Model<Product>) {}

  async findAll(filters: ProductFilters = {}) {
    const query: FilterQuery<Product> = { status: ProductStatus.Active };

    if (filters.search?.trim()) {
      const search = filters.search.trim();
      query.$or = [{ name: { $regex: search, $options: "i" } }, { brand: { $regex: search, $options: "i" } }];
    }
    if (filters.category) query.category = filters.category;
    if (filters.badge) query.badge = filters.badge;
    if (filters.audience) query.audience = filters.audience;
    if (filters.type) query.productType = filters.type;
    if (filters.tag) query.tags = filters.tag;

    return this.productModel.find(query).sort({ createdAt: -1 }).lean().exec();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException("Product not found.");
    const product = await this.productModel.findById(id).lean().exec();
    if (!product) throw new NotFoundException("Product not found.");
    return product;
  }

  async findOneBySlug(slug: string) {
    const product = await this.productModel.findOne({ slug, status: ProductStatus.Active }).lean().exec();
    if (!product) throw new NotFoundException("Product not found.");
    return product;
  }

  async create(dto: CreateProductDto) {
    try {
      return await this.productModel.create(this.normalizeProduct(dto));
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  async update(id: string, dto: UpdateProductDto) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException("Product not found.");
    try {
      const product = await this.productModel.findByIdAndUpdate(
        id,
        { $set: this.normalizeProduct(dto) },
        { new: true, runValidators: true }
      ).lean().exec();
      if (!product) throw new NotFoundException("Product not found.");
      return product;
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException("Product not found.");
    const product = await this.productModel.findByIdAndDelete(id).lean().exec();
    if (!product) throw new NotFoundException("Product not found.");
    return { ok: true };
  }

  private normalizeProduct<T extends CreateProductDto | UpdateProductDto>(dto: T) {
    const images = dto.images?.filter(Boolean) ?? [];
    const image = dto.image || images[0];
    const variants = dto.variants;
    const variantStock = variants?.length ? variants.reduce((total, variant) => total + variant.stock, 0) : undefined;
    const stock = variantStock ?? dto.stock;
    const normalized = {
      ...dto,
      ...(image ? { image, images: images.includes(image) ? images : [image, ...images] } : {}),
      ...(stock === undefined ? {} : { stock }),
      ...(dto.slug ? {} : dto.name ? { slug: this.slugify(dto.name) } : {})
    };

    if (normalized.slug === "") {
      delete normalized.slug;
    }

    return normalized;
  }

  private slugify(value: string) {
    return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  private handlePersistenceError(error: unknown): never {
    if (error instanceof Error && "code" in error && error.code === 11000) {
      throw new ConflictException("A product with the same slug already exists.");
    }

    throw error;
  }
}
