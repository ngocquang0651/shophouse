import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import * as express from "express";
import { join } from "path";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>("FRONTEND_URL") ?? "http://localhost:3000";
  const frontendUrls = (configService.get<string>("FRONTEND_URLS") ?? "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
  const allowedOrigins = new Set([frontendUrl, ...frontendUrls]);
  const localDevOriginPattern = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin) || localDevOriginPattern.test(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS.`), false);
    },
    credentials: true
  });
  app.use("/uploads", express.static(join(process.cwd(), "uploads")));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  const port = configService.get<number>("PORT") ?? 4000;
  await app.listen(port);
}

void bootstrap();
