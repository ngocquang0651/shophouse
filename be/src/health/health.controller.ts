import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { SkipThrottle } from "@nestjs/throttler";
import { buildHealthReport } from "./health.status";

@Controller("health")
@SkipThrottle()
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  /** Liveness: the process answers. Readiness: MongoDB is reachable too. */
  @Get()
  check() {
    const report = buildHealthReport(this.connection.readyState, process.uptime());
    if (report.status === "down") {
      throw new ServiceUnavailableException(report);
    }

    return report;
  }
}
