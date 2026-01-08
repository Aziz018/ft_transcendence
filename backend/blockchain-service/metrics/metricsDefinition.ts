import exp from 'constants'
import client from 'prom-client'


export const httpRequestTotal = new client.Counter({
	name: 'http_request_total',
	help: 'total number of HTTP requests',
	labelNames: ['method', 'route', 'status_code']
})

export const httpRequestDuration = new client.Histogram({
	name: 'http_request_duration',
	help: 'duration of HTTP request in milliseconds',
	labelNames: ['method', 'route', 'status_code'],
	buckets: [10, 50, 100, 200, 500]
})

export const httpRequestSize = new client.Histogram({
	name: 'http_request_size_bytes',
	help: 'size of HTTP request in bytes',
	labelNames: ['method', 'route', 'status_code'],
	buckets: [100, 500, 1000, 5000, 10000]
})

export const httpResponseSize = new client.Histogram({
	name: 'http_response_size_bytes',
	help: 'size of HTTP response in bytes',
	labelNames: ['method', 'route', 'status_code'],
	buckets: [100, 500, 1000, 5000, 10000]
})

export const acctiveConnections = new client.Gauge({
	name: 'active_connections',
	help: 'number of active connections'
})

//client.collectDefaultMetrics();
