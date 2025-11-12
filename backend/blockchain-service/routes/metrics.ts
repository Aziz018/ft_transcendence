import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

async function metricsPlugin(fastify: FastifyInstance, options: any) {
  fastify.get("/metrics", async (request, reply) => {
	return { metrics: "metrics data" };
  });
}

export default fastifyPlugin(metricsPlugin);
