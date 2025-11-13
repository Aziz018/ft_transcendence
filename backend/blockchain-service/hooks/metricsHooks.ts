import { FastifyInstance } from 'fastify';
import {
	httpRequestSize,
	httpRequestTotal,
	httpRequestDuration,
	httpResponseSize,
	acctiveConnections
} from '../metrics/metricsDefinition.js';
import { request } from 'axios';

// Setup Fastify hooks to collect metrics
export function setupMetricsHooks(fastify: FastifyInstance) {
	// Hook to track total requests and duration
	fastify.addHook('onResponse', (request, reply, done) => {
		httpRequestTotal
			.labels(request.method, request.url, reply.statusCode.toString())
			.inc();
		httpRequestDuration
			.labels(request.method, request.url, reply.statusCode.toString())
			.observe(reply.elapsedTime)

		done(); // continue processing the request
	})
	// Hook to track response size
	fastify.addHook('onSend', (request, reply, payload, done) => {
		httpResponseSize.labels(request.method, request.url, reply.statusCode.toString())
			.observe(Buffer.byteLength(payload as any))
		acctiveConnections.dec();
		done(); // continue processing the response
	})
	// Hook to track request size
	fastify.addHook('onRequest', (request, reply, done) => {

		const requestSize: number = parseInt(request.headers['content-length'] || '0')
		httpRequestSize
			.labels(request.method, request.url, reply.statusCode.toString())
			.observe(requestSize);
		acctiveConnections.inc();
		done();// continue processing the request
	})
}




