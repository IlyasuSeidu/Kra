import "fastify";

declare module "@fastify/rate-limit" {
  import type { FastifyPluginAsync } from "fastify";

  interface FastifyRateLimitOptions {
    global?: boolean;
    max?: number;
    timeWindow?: string | number;
    skipOnError?: boolean;
  }

  const rateLimit: FastifyPluginAsync<FastifyRateLimitOptions>;

  export default rateLimit;
}

declare module "fastify" {
  interface FastifyContextConfig {
    rateLimit?: {
      max?: number;
      timeWindow?: string | number;
      skipOnError?: boolean;
    } | false;
  }
}
