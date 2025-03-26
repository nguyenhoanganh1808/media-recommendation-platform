import { redisClient, getCache, setCache } from "../config/redis";
import { config } from "../config/env";
import { logger } from "../config/logger";
import { CronJob } from "cron";

export class CacheService {
  private jobs: Map<string, CronJob> = new Map();

  /**
   * Initialize cache service
   */
  constructor() {
    // Initialize any default background jobs
    this.initializeDefaultJobs();
  }

  /**
   * Start a scheduled job to pre-warm cache entries
   * @param pattern Key pattern to pre-warm
   * @param fetchFunction Function to fetch data for pre-warming
   * @param schedule Cron schedule expression
   * @param ttl Optional TTL for cached entries
   */
  public startPreWarmJob(
    pattern: string,
    fetchFunction: () => Promise<Record<string, any>>,
    schedule: string,
    ttl: number = config.REDIS_TTL
  ): void {
    const jobId = `prewarm:${pattern}`;

    const job = new CronJob(schedule, async () => {
      try {
        logger.info(`Running pre-warm job for pattern: ${pattern}`);
        const data = await fetchFunction();

        // Store each key-value pair in cache
        const promises = Object.entries(data).map(([key, value]) => {
          const cacheKey = `${pattern}:${key}`;
          return setCache(cacheKey, JSON.stringify(value), ttl);
        });

        await Promise.all(promises);
        logger.info(
          `Pre-warmed ${promises.length} cache entries for ${pattern}`
        );
      } catch (error) {
        logger.error(`Pre-warm job failed for ${pattern}: ${error}`);
      }
    });

    this.jobs.set(jobId, job);
    job.start();
    logger.info(
      `Started pre-warm job for ${pattern} with schedule: ${schedule}`
    );
  }

  /**
   * Start a cache invalidation job that runs on a schedule
   * @param pattern Key pattern to invalidate
   * @param schedule Cron schedule expression
   */
  public startInvalidationJob(pattern: string, schedule: string): void {
    const jobId = `invalidate:${pattern}`;

    const job = new CronJob(schedule, async () => {
      try {
        await this.invalidateByPattern(pattern);
        logger.info(`Scheduled invalidation completed for pattern: ${pattern}`);
      } catch (error) {
        logger.error(`Scheduled invalidation failed for ${pattern}: ${error}`);
      }
    });

    this.jobs.set(jobId, job);
    job.start();
    logger.info(
      `Started invalidation job for ${pattern} with schedule: ${schedule}`
    );
  }

  /**
   * Start a cache analytics job to track cache metrics
   * @param schedule Cron schedule expression
   */
  public startAnalyticsJob(schedule: string): void {
    const jobId = "cache:analytics";

    const job = new CronJob(schedule, async () => {
      try {
        // Get cache statistics
        const info = await redisClient.info("memory");
        const keyCount = await redisClient.dbSize();
        const memoryUsage =
          info.match(/used_memory_human:(.*)/)?.[1] || "unknown";

        logger.info(
          `Cache analytics - Keys: ${keyCount}, Memory: ${memoryUsage}`
        );

        // Get hit/miss ratio data if you're tracking it
        // This would require implementing hit/miss counters in your middleware
      } catch (error) {
        logger.error(`Cache analytics job failed: ${error}`);
      }
    });

    this.jobs.set(jobId, job);
    job.start();
    logger.info(`Started cache analytics job with schedule: ${schedule}`);
  }

  /**
   * Invalidate cache entries by pattern
   * @param pattern The pattern to match cache keys
   * @returns Number of keys invalidated
   */
  public async invalidateByPattern(pattern: string): Promise<number> {
    try {
      const keys = await redisClient.keys(`*${pattern}*`);
      if (keys.length > 0) {
        await redisClient.del(keys);
        logger.info(
          `Invalidated ${keys.length} cache entries matching pattern: ${pattern}`
        );
        return keys.length;
      }
      return 0;
    } catch (error) {
      logger.error(`Error invalidating cache: ${error}`);
      throw error;
    }
  }

  /**
   * Set or refresh multiple cache entries in a single batch operation
   * @param entries Array of key-value pairs to cache
   * @param ttl Optional TTL (in seconds)
   */
  public async setBatch(
    entries: Array<{ key: string; value: any }>,
    ttl: number = config.REDIS_TTL
  ): Promise<void> {
    try {
      const pipeline = redisClient.multi();

      for (const entry of entries) {
        const value = JSON.stringify(entry.value);
        pipeline.set(entry.key, value, { EX: ttl });
      }

      await pipeline.exec();
      logger.debug(`Batch cached ${entries.length} entries`);
    } catch (error) {
      logger.error(`Batch cache operation failed: ${error}`);
      throw error;
    }
  }

  /**
   * Get multiple cache entries in a single operation
   * @param keys Array of cache keys to retrieve
   * @returns Object mapping keys to their cached values
   */
  public async getBatch(keys: string[]): Promise<Record<string, any>> {
    try {
      if (keys.length === 0) return {};

      const values = await redisClient.mGet(keys);
      const result: Record<string, any> = {};

      keys.forEach((key, index) => {
        if (values[index]) {
          try {
            result[key] = JSON.parse(values[index]);
          } catch (e) {
            result[key] = values[index];
          }
        }
      });

      return result;
    } catch (error) {
      logger.error(`Batch get operation failed: ${error}`);
      throw error;
    }
  }

  /**
   * Initialize default background jobs
   */
  private initializeDefaultJobs(): void {
    // Example: Daily cache cleanup job at midnight
    this.startInvalidationJob("api:", "0 0 * * *");

    // Example: Hourly analytics job
    this.startAnalyticsJob("0 * * * *");
  }

  /**
   * Stop all running background jobs
   */
  public stopAllJobs(): void {
    this.jobs.forEach((job, id) => {
      job.stop();
      logger.info(`Stopped job: ${id}`);
    });

    this.jobs.clear();
  }

  /**
   * Stop a specific background job by ID
   * @param jobId The job ID to stop
   */
  public stopJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (job) {
      job.stop();
      this.jobs.delete(jobId);
      logger.info(`Stopped job: ${jobId}`);
      return true;
    }
    return false;
  }
}

// Create singleton instance
export const cacheService = new CacheService();
