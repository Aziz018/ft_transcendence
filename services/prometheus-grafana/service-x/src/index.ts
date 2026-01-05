//import metricsPlugin from "../routes/metrics.ts";

import f from "fastify";

const fastify = f({ requestTimeout: 100000 });

//{ logger: {level: 'debug',
//    transport: {
  //        target: 'pino-pretty',
  //        options: {
    //            colorize: true,
    //            translateTime: 'SYS:standard',
    //            ignore: 'pid,hostname'
    //        }
    //    }} }
    
    
    
import metricsPlugin from "fastify-metrics";
import { Counter } from "prom-client";

export const requestCounter = new Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route"],
});

await fastify.register(metricsPlugin, { endpoint: "/metrics" });

app.listen({ port: 3010 , host: '0.0.0.0'}, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
