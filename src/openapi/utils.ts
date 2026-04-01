import { IRouter } from "express";
import { DataTypes, type Model, type ModelAttributeColumnOptions, type ModelStatic } from "sequelize";
import swaggerJSDoc, { OAS3Options, Schema } from "swagger-jsdoc";
import swaggerUi, { SwaggerUiOptions } from "swagger-ui-express";
import { SwaggerTheme, SwaggerThemeNameEnum } from "swagger-themes";
import { GenericRequest, GenericResponse } from "../utils";


function typeInfoForAttribute<M extends Model>(attribute: ModelAttributeColumnOptions<M>): Record<string, unknown> | null{
  const type: string = typeof attribute.type === "string" ? attribute.type : attribute.type.key;

  const stringTypes = [DataTypes.STRING, DataTypes.TEXT].map(t => t.key);
  if (stringTypes.includes(type)) {
    return { type: "string" };
  }
  if (type == DataTypes.ENUM.key) {
    return { type: "string", enum: attribute.values };
  }

  if (type == DataTypes.DATE.key) {
    return { type: "string", format: "date-time" };
  }
  if (type == DataTypes.DATEONLY.key) {
    return { type: "string", format: "date" };
  }

  const intTypes = [DataTypes.INTEGER, DataTypes.INTEGER.UNSIGNED].map(t => t.key);
  if (intTypes.includes(type)) {
    return { type: "integer", format: "int32" };
  }

  const bigIntTypes = [DataTypes.BIGINT, DataTypes.BIGINT.UNSIGNED].map(t => t.key);
  if (bigIntTypes.includes(type)) {
    return { type: "integer", format: "int64" };
  }

  if (type == DataTypes.BOOLEAN.key) {
    return { type: "boolean" };
  }

  if (type == DataTypes.JSON.key) {
    return { type: "object" };
  }
  
  return null;
}

export function modelToSchema<M extends Model>(modelType: ModelStatic<M>): Schema {
  const required: string[] = [];
  const properties: Record<string, Record<string, unknown>> = {};

  const attributes = modelType.getAttributes();
  Object.entries(attributes).forEach(([key, attr]) => {
    const info = typeInfoForAttribute(attr);
    if (info == null) {
      return;
    }

    if (!attr.allowNull) {
      required.push(key);
    }
    properties[key] = info;
  });

  return {
    type: "object",
    required,
    properties,
  };
}

export interface SwaggerSetupOptions {
  router: IRouter;
  swaggerOptions: OAS3Options;
  name: string;
  basePath: string;
  docsPath?: string;
  title?: string;
  theme?: SwaggerThemeNameEnum;
}

const swaggerOptions: SwaggerSetupOptions[] = [];

export function registerSwaggerDocs(options: SwaggerSetupOptions) {
  swaggerOptions.push(options);
}

export function setupSwaggerDocs() {

  const defaultDocsPath = "/docs";
  const urls = swaggerOptions.map(options => {
    const docsPath = options.docsPath ?? defaultDocsPath;
    return {
      url: `${options.basePath}${docsPath}.json`,
      name: options.name,
    };
  });

  swaggerOptions.forEach(options => {
    const router = options.router;
    const swaggerSpec = swaggerJSDoc(options.swaggerOptions);

    const docsPath = options.docsPath ?? defaultDocsPath;
    router.get(`${docsPath}.json`, (_req: GenericRequest, res: GenericResponse) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerSpec);
    });

    const theme = new SwaggerTheme();
    const swaggerUIOptions: SwaggerUiOptions = {
      explorer: true,
      customSiteTitle: options.title ?? "CosmicDS Database API",
      customCss: theme.getBuffer(options.theme ?? SwaggerThemeNameEnum.GRUVBOX),
      swaggerOptions: {
        urls,
        "urls.primaryName": "Base",
      }
    };

    router.use(docsPath, swaggerUi.serveFiles(undefined, swaggerUIOptions));
    router.get(docsPath, swaggerUi.serve, swaggerUi.setup(null, swaggerUIOptions));
  });

}
