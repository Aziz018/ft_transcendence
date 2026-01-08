import { type FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { requestCounter } from "../src/index.ts";


async function homePlugin(fastify: FastifyInstance, options: any) {
  fastify.get("/home", async (request, reply) => {
	
	requestCounter.labels(request.method, "/home").inc();

	return { message: "Welcome to the Home Page!" };

  });
}

export default fastifyPlugin(homePlugin);
