import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, Types } from "mongoose";
import { ProductBadge } from "../common/enums/product-badge.enum";
import { ProductStatus } from "../common/enums/product-status.enum";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { AdminListQuery, DEFAULT_LOW_STOCK_THRESHOLD, buildAdminFilter, buildAdminSort } from "./product-query";
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

  async findAll(filters: ProductFilters = {}, options: { includeInactive?: boolean } = {}) {
    const query: FilterQuery<Product> = options.includeInactive ? {} : { status: ProductStatus.Active };

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

  async getAdminSummary(lowStockThreshold: number = DEFAULT_LOW_STOCK_THRESHOLD) {
    const [summary] = await this.productModel
      .aggregate<{ total: number; active: number; inactive: number; low: number; out: number }>([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ["$status", ProductStatus.Active] }, 1, 0] } },
            inactive: { $sum: { $cond: [{ $eq: ["$status", ProductStatus.Inactive] }, 1, 0] } },
            low: { $sum: { $cond: [{ $and: [{ $gt: ["$stock", 0] }, { $lte: ["$stock", lowStockThreshold] }] }, 1, 0] } },
            out: { $sum: { $cond: [{ $lte: ["$stock", 0] }, 1, 0] } }
          }
        },
        { $project: { _id: 0 } }
      ])
      .exec();

    return summary ?? { total: 0, active: 0, inactive: 0, low: 0, out: 0 };
  }

  /** Admin listing: every status, filtered, sorted and paginated on the server. */
  async findAllForAdmin(query: AdminListQuery) {
    const filter = buildAdminFilter(query);
    const total = await this.productModel.countDocuments(filter).exec();
    const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
    const page = Math.min(query.page, pageCount);

    const [items, summary, categories, brands] = await Promise.all([
      this.productModel
        .find(filter)
        .sort(buildAdminSort(query.sort))
        .collation({ locale: "vi" })
        .skip((page - 1) * query.pageSize)
        .limit(query.pageSize)
        .lean()
        .exec(),
      this.getAdminSummary(query.lowStockThreshold),
      this.productModel.distinct("category").exec(),
      this.productModel.distinct("brand").exec()
    ]);

    return { items, total, page, pageSize: query.pageSize, pageCount, summary, categories, brands };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException("Không tìm thấy sản phẩm.");
    const product = await this.productModel.findById(id).lean().exec();
    if (!product) throw new NotFoundException("Không tìm thấy sản phẩm.");
    return product;
  }

  async findOneBySlug(slug: string) {
    const product = await this.productModel.findOne({ slug, status: ProductStatus.Active }).lean().exec();
    if (!product) throw new NotFoundException("Không tìm thấy sản phẩm.");
    return product;
  }

  async create(dto: CreateProductDto) {
    this.assertUniqueSkus(dto.variants);

    try {
      const normalized = this.normalizeProduct(dto);
      const slug = await this.createUniqueSlug(normalized.slug ?? this.slugify(dto.name));
      return await this.productModel.create({ ...normalized, slug });
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  async update(id: string, dto: UpdateProductDto) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException("Không tìm thấy sản phẩm.");
    this.assertUniqueSkus(dto.variants);

    if (dto.stock !== undefined && dto.variants === undefined) {
      const managedByVariants = await this.productModel.exists({ _id: id, "variants.0": { $exists: true } }).exec();
      if (managedByVariants) {
        throw new BadRequestException("Sản phẩm này quản lý tồn kho theo size/màu. Hãy sửa số lượng của từng size.");
      }
    }

    // Renaming a product keeps its URL stable, so links and search results do not break.
    const { originalPrice, ...rest } = this.normalizeProduct(dto);
    const update = {
      $set: { ...rest, ...(typeof originalPrice === "number" ? { originalPrice } : {}) },
      ...(originalPrice === null ? { $unset: { originalPrice: 1 } } : {})
    };

    try {
      const product = await this.productModel.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean().exec();
      if (!product) throw new NotFoundException("Không tìm thấy sản phẩm.");
      return product;
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException("Không tìm thấy sản phẩm.");
    const product = await this.productModel.findByIdAndDelete(id).lean().exec();
    if (!product) throw new NotFoundException("Không tìm thấy sản phẩm.");
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
      ...(stock === undefined ? {} : { stock })
    };

    return normalized;
  }

  private assertUniqueSkus(variants: { sku: string }[] | undefined) {
    const seen = new Set<string>();

    for (const variant of variants ?? []) {
      if (seen.has(variant.sku)) {
        throw new BadRequestException(`Mã SKU "${variant.sku}" bị trùng. Mỗi biến thể cần một mã SKU riêng.`);
      }
      seen.add(variant.sku);
    }
  }

  private async createUniqueSlug(base: string) {
    const root = base || "san-pham";
    let candidate = root;

    for (let suffix = 2; await this.productModel.exists({ slug: candidate }).exec(); suffix += 1) {
      candidate = `${root}-${suffix}`;
    }

    return candidate;
  }

  private slugify(value: string) {
    return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  private handlePersistenceError(error: unknown): never {
    if (error instanceof Error && "code" in error && error.code === 11000) {
      throw new ConflictException("Đường dẫn của sản phẩm này đã được dùng cho sản phẩm khác.");
    }

    throw error;
  }
}
