import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { HttpCacheInterceptor, PublicCache } from "../common/http-cache.interceptor";
import { diskStorage } from "multer";
import { extname } from "node:path";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { UserRole } from "../common/enums/user-role.enum";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { clampLowStockThreshold, parseAdminListQuery, parsePublicListQuery } from "./product-query";
import { ProductsService } from "./products.service";

type UploadRequest = {
  protocol: string;
  get(name: string): string | undefined;
};

const imageFileFilter = (_request: unknown, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
  if (!file.mimetype.startsWith("image/")) {
    callback(new BadRequestException("Chỉ chấp nhận tệp hình ảnh."), false);
    return;
  }

  callback(null, true);
};

const productImageStorage = diskStorage({
  destination: "uploads/products",
  filename: (_request, file, callback) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
    callback(null, uniqueName);
  }
});

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @UseInterceptors(HttpCacheInterceptor)
  @PublicCache({ maxAgeSeconds: 60, staleWhileRevalidateSeconds: 300 })
  findAll(@Query() query: Record<string, string | string[] | undefined>) {
    return this.productsService.findAll(parsePublicListQuery(query));
  }

  @Get("admin")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  findAllForAdmin(@Query() query: Record<string, string | string[] | undefined>) {
    return this.productsService.findAllForAdmin(parseAdminListQuery(query));
  }

  @Get("admin/summary")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  getAdminSummary(@Query("lowStockThreshold") lowStockThreshold?: string) {
    const parsed = Number(lowStockThreshold);
    return this.productsService.getAdminSummary(clampLowStockThreshold(Number.isInteger(parsed) ? parsed : undefined));
  }

  @Get("slug/:slug")
  @UseInterceptors(HttpCacheInterceptor)
  @PublicCache({ maxAgeSeconds: 60, staleWhileRevalidateSeconds: 300 })
  findOneBySlug(@Param("slug") slug: string) {
    return this.productsService.findOneBySlug(slug);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Post("uploads")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @UseInterceptors(
    FilesInterceptor("images", 8, {
      storage: productImageStorage,
      fileFilter: imageFileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024
      }
    })
  )
  uploadImages(@UploadedFiles() files: Express.Multer.File[] = [], @Req() request: UploadRequest) {
    if (!files.length) {
      throw new BadRequestException("Vui lòng chọn ít nhất một ảnh để tải lên.");
    }

    const host = request.get("host");
    const baseUrl = `${request.protocol}://${host}`;

    return {
      urls: files.map((file) => `${baseUrl}/uploads/products/${file.filename}`)
    };
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  update(@Param("id") id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  remove(@Param("id") id: string) {
    return this.productsService.remove(id);
  }
}
