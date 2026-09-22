import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export const SWAGGER_PATH = "docs";

/**
 * Served outside production so the frontend can generate its types from
 * /docs-json instead of hand-writing them, and so the API stays self-describing.
 */
export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle("SHOPO API")
    .setDescription("Storefront catalog and admin product management.")
    .setVersion("1.0")
    .addCookieAuth("luxestore_token")
    .addBearerAuth()
    .build();

  SwaggerModule.setup(SWAGGER_PATH, app, () => SwaggerModule.createDocument(app, config), {
    jsonDocumentUrl: `${SWAGGER_PATH}-json`
  });
}
