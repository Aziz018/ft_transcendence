import TournamentRecordPlugin from "../routes/tournamentRecord.js";
import metricsPlugin from "../routes/metrics.js";
import fastify from "fastify";
import {setupMetricsHooks} from '../hooks/metricsHooks.js'

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

setupMetricsHooks(app);

app.register(TournamentRecordPlugin);
app.register(metricsPlugin);

app.listen({ port: 3000 , host: '0.0.0.0'}, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
