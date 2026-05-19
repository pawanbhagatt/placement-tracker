const { Queue } = require("bullmq");
const { createRedisConnection } = require("../config/redis");

const connection = createRedisConnection();

const analysisQueue = new Queue("analysis", {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 2000 },
  },
});

module.exports = { analysisQueue, connection };