import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import { AuthModule } from "./auth/auth.module";
import { ProductsModule } from "./products/products.module";
import { UsersModule } from "./users/users.module";
import { HealthModule } from "./health/health.module";
import { validateEnv } from "./common/env.validation";
import { throttlerOptions } from "./common/throttler.config";
import { buildLoggerOptions } from "./common/logger.config";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        buildLoggerOptions(configService.getOrThrow<string>("NODE_ENV") === "production")
    }),
    ThrottlerModule.forRoot(throttlerOptions),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>("MONGODB_URI")
      })
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    HealthModule
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
})
export class AppModule {}
