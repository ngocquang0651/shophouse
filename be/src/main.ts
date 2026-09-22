import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { Logger } from "nestjs-pino";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import * as express from "express";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";
import { join } from "path";
import { AppModule } from "./app.module";
import { translateValidationErrors } from "./common/validation-messages";
import { splitOrigins } from "./common/env.validation";
import { buildCorsOriginCheck } from "./common/cors";
import { setupSwagger } from "./common/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  const configService = app.get(ConfigService);
  const isProduction = configService.getOrThrow<string>("NODE_ENV") === "production";
  const allowedOrigins = [
    configService.getOrThrow<string>("FRONTEND_URL"),
    ...splitOrigins(configService.get<string>("FRONTEND_URLS"))
  ];

  app.enableCors({
    origin: buildCorsOriginCheck(allowedOrigins, { allowLocalhost: !isProduction }),
    credentials: true
  });
  app.use(
    helmet({
      // Uploaded product images are served from this origin but rendered by the
      // frontend on another one, so the default same-origin policy would block them.
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );
  app.use(cookieParser());
  app.use("/uploads", express.static(join(process.cwd(), "uploads")));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => new BadRequestException(translateValidationErrors(errors))
    })
  );
  // The schema is a development aid and a source of frontend types, not a public surface.
  if (!isProduction) {
    setupSwagger(app);
  }
  app.enableShutdownHooks();

  const port = configService.getOrThrow<number>("PORT");
  await app.listen(port);
}

void bootstrap();
