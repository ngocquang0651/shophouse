import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, Types } from "mongoose";
import { ProductStatus } from "../common/enums/product-status.enum";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import {
  AdminListQuery,
  DEFAULT_LOW_STOCK_THRESHOLD,
  MAX_PUBLIC_RESULTS,
  PublicListQuery,
  buildAdminFilter,
  buildAdminSort,
  buildFallbackSearchFilter,
  buildSearchText,
  buildTextSearchFilter,
  isPaginated
} from "./product-query";
import { PRODUCT_LIST_PROJECTION, toAdminProductResponse, toProductDetail, toProductListItem } from "./product-response";
import { buildUniqueSlug, slugifyProductName } from "./product-slug";
import { TtlCache } from "../common/ttl-cache";
import { Product } from "./schemas/product.schema";

export const FACET_CACHE_TTL_MS = 60_000;

@Injectable()
export class ProductsService {
  /** Distinct category/brand lists cost a full scan each, and barely ever change. */
  private readonly facetCache = new TtlCache<string[]>(FACET_CACHE_TTL_MS);

  constructor(@InjectModel(Product.name) private readonly productModel: Model<Product>) {}

  /**
   * Storefront listing. Returns a plain array unless the caller asks for a page,
   * so existing catalog pages keep working, and never more than
   * MAX_PUBLIC_RESULTS documents in one response.
   */
  async findAll(query: PublicListQuery) {
    const baseFilter = this.buildPublicFilter(query);

    if (!isPaginated(query)) {
      const documents = await this.runPublicSearch(baseFilter, query.search, {
        limit: MAX_PUBLIC_RESULTS
      });
      return documents.map(toProductListItem);
    }

    const filter = query.search ? await this.resolveSearchFilter(baseFilter, query.search) : baseFilter;
    const total = await this.productModel.countDocuments(filter).exec();
    const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
    const page = Math.min(query.page, pageCount);

    const documents = await this.productModel
      .find(filter, PRODUCT_LIST_PROJECTION)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * query.pageSize)
      .limit(query.pageSize)
      .lean()
      .exec();

    return { items: documents.map(toProductListItem), total, page, pageSize: query.pageSize, pageCount };
  }

  private buildPublicFilter(query: PublicListQuery): FilterQuery<Product> {
    const filter: FilterQuery<Product> = { status: ProductStatus.Active };

    if (query.category) filter.category = query.category;
    if (query.badge) filter.badge = query.badge;
    if (query.audience) filter.audience = query.audience;
    if (query.type) filter.productType = query.type;
    if (query.tag) filter.tags = query.tag;

    return filter;
  }

  /**
   * Tries the indexed text search first and only falls back to a substring scan
   * when it finds nothing, so the common query never scans the collection.
   */
  private async resolveSearchFilter(baseFilter: FilterQuery<Product>, search: string) {
    const textFilter = { ...baseFilter, ...buildTextSearchFilter(search) };
    const hasTextMatch = await this.productModel.exists(textFilter).exec();

    return hasTextMatch ? textFilter : { ...baseFilter, ...buildFallbackSearchFilter(search) };
  }

  private async runPublicSearch(baseFilter: FilterQuery<Product>, search: string, options: { limit: number }) {
    const filter = search ? await this.resolveSearchFilter(baseFilter, search) : baseFilter;

    return this.productModel
      .find(filter, PRODUCT_LIST_PROJECTION)
      .sort({ createdAt: -1, _id: -1 })
      .limit(options.limit)
      .lean()
      .exec();
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
      this.facetCache.wrap("category", () => this.productModel.distinct("category").exec()),
      this.facetCache.wrap("brand", () => this.productModel.distinct("brand").exec())
    ]);

    return {
      items: items.map(toAdminProductResponse),
      total,
      page,
      pageSize: query.pageSize,
      pageCount,
      summary,
      categories,
      brands
    };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException("Không tìm thấy sản phẩm.");
    const product = await this.productModel.findById(id).lean().exec();
    if (!product) throw new NotFoundException("Không tìm thấy sản phẩm.");
    return toProductDetail(product);
  }

  async findOneBySlug(slug: string) {
    const product = await this.productModel.findOne({ slug, status: ProductStatus.Active }).lean().exec();
    if (!product) throw new NotFoundException("Không tìm thấy sản phẩm.");
    return toProductDetail(product);
  }

  async create(dto: CreateProductDto) {
    this.assertUniqueSkus(dto.variants);

    try {
      const normalized = this.normalizeProduct(dto);
      const slug = await this.createUniqueSlug(normalized.slug ?? slugifyProductName(dto.name));
      const created = await this.productModel.create({
        ...normalized,
        slug,
        searchText: buildSearchText(dto)
      });
      this.facetCache.clear();
      return toAdminProductResponse(created.toObject());
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
    const searchText = await this.resolveSearchTextUpdate(id, dto);
    const update = {
      $set: {
        ...rest,
        ...(typeof originalPrice === "number" ? { originalPrice } : {}),
        ...(searchText === undefined ? {} : { searchText })
      },
      ...(originalPrice === null ? { $unset: { originalPrice: 1 } } : {})
    };

    try {
      const product = await this.productModel.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean().exec();
      if (!product) throw new NotFoundException("Không tìm thấy sản phẩm.");
      this.facetCache.clear();
      return toAdminProductResponse(product);
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException("Không tìm thấy sản phẩm.");
    const product = await this.productModel.findByIdAndDelete(id).lean().exec();
    if (!product) throw new NotFoundException("Không tìm thấy sản phẩm.");
    this.facetCache.clear();
    return { ok: true };
  }

  /**
   * `searchText` is derived from four fields, so a patch that touches any of them
   * needs the other three from the stored document to rebuild it.
   */
  private async resolveSearchTextUpdate(id: string, dto: UpdateProductDto) {
    const touchesSearchText =
      dto.name !== undefined || dto.brand !== undefined || dto.category !== undefined || dto.tags !== undefined;
    if (!touchesSearchText) return undefined;

    const current = await this.productModel
      .findById(id, { name: 1, brand: 1, category: 1, tags: 1 })
      .lean()
      .exec();
    if (!current) return undefined;

    return buildSearchText({
      name: dto.name ?? current.name,
      brand: dto.brand ?? current.brand,
      category: dto.category ?? current.category,
      tags: dto.tags ?? current.tags
    });
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

  private createUniqueSlug(base: string) {
    return buildUniqueSlug(base, async (candidate) => Boolean(await this.productModel.exists({ slug: candidate }).exec()));
  }

  private handlePersistenceError(error: unknown): never {
    if (error instanceof Error && "code" in error && error.code === 11000) {
      throw new ConflictException("Đường dẫn của sản phẩm này đã được dùng cho sản phẩm khác.");
    }

    throw error;
  }
}
