import { createLogger, format, transports } from "winston";

export const logger = createLogger({
  level: process.env.CDS_API_LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.label({ label: "cds-api-server" }),
    format.json()
  ),
  transports: [
    new transports.Console()
  ]
});
