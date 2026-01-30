import { type FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import client from 'prom-client'

client.collectDefaultMetrics();

async function metricsPlugin(fastify: FastifyInstance, options: any) {
  fastify.get("/metrics", async (request, reply) => {
    const metrics = await client.register.metrics();
    reply.header('Content-Type', client.register.contentType);
    return metrics;
  });
}

export default fastifyPlugin(metricsPlugin);
