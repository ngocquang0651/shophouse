import { CallHandler, ExecutionContext, Injectable, NestInterceptor, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request, Response } from "express";
import { map } from "rxjs/operators";
import { buildEtag, buildPublicCacheControl, etagMatches } from "./http-cache";

export const HTTP_CACHE_KEY = "http-cache-options";

export type HttpCacheOptions = {
  maxAgeSeconds: number;
  staleWhileRevalidateSeconds: number;
};

/**
 * Marks a public GET route as cacheable by browsers and shared caches.
 * SetMetadata stores this on the handler itself, which is what Reflector reads.
 */
export const PublicCache = (options: HttpCacheOptions) => SetMetadata(HTTP_CACHE_KEY, options);

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const options = this.reflector.get<HttpCacheOptions | undefined>(HTTP_CACHE_KEY, context.getHandler());
    if (!options || context.getType() !== "http") {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((body: unknown) => {
        const etag = buildEtag(body);
        response.setHeader("Cache-Control", buildPublicCacheControl(options.maxAgeSeconds, options.staleWhileRevalidateSeconds));
        response.setHeader("ETag", etag);
        response.setHeader("Vary", "Origin");

        if (etagMatches(request.headers["if-none-match"], etag)) {
          response.status(304);
          return undefined;
        }

        return body;
      })
    );
  }
}
