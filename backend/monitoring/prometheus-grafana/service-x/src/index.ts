//import metricsPlugin from "../routes/metrics.ts";
import metricsPlugin from "fastify-metrics";
import { register, Counter } from "prom-client";
import homePlugin from "../routes/home.ts";
import memoryTestPlugin from "../routes/memoryTest.ts";
import fastify from "fastify";

const app = fastify({ requestTimeout: 100000 });

//{ logger: {level: 'debug',
//    transport: {
//        target: 'pino-pretty',
//        options: {
//            colorize: true,
//            translateTime: 'SYS:standard',
//            ignore: 'pid,hostname'
//        }
//    }} }



export const requestCounter = new Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route"],
});



await app.register(metricsPlugin, { endpoint: "/metrics" });

app.register(homePlugin);
app.register(memoryTestPlugin)

app.listen({ port: 3010 , host: '0.0.0.0'}, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
