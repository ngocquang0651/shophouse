/** Mongoose readyState values, mapped to something a probe can read. */
export const MONGO_READY_STATE_CONNECTED = 1;

export type DependencyStatus = "up" | "down";

export type HealthReport = {
  status: DependencyStatus;
  uptime: number;
  details: {
    mongodb: DependencyStatus;
  };
};

export function buildHealthReport(mongoReadyState: number, uptimeSeconds: number): HealthReport {
  const mongodb: DependencyStatus = mongoReadyState === MONGO_READY_STATE_CONNECTED ? "up" : "down";

  return {
    status: mongodb,
    uptime: Math.max(0, Math.round(uptimeSeconds)),
    details: { mongodb }
  };
}
