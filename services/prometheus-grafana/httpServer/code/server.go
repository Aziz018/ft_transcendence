package main

import (
	"fmt"
	"net/http"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	pingCounter = prometheus.NewCounter(
		prometheus.CounterOpts{
			Name: "ping_request_count",
			Help: "No of request handled by Ping handler",
		},
	)
	
	httpRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests by status code",
		},
		[]string{"code"},
	)
)

func ping(w http.ResponseWriter, req *http.Request) {
	pingCounter.Inc()
	fmt.Fprintf(w, "pong")
}

// Custom handler that wraps the promhttp handler and tracks all requests
func metricsHandler(w http.ResponseWriter, r *http.Request) {
	// Only handle /metrics path
	if r.URL.Path != "/metrics" {
		httpRequestsTotal.WithLabelValues("404").Inc()
		http.NotFound(w, r)
		return
	}
	
	// For /metrics path, use the promhttp handler
	promhttp.Handler().ServeHTTP(w, r)
}

func main() {
	prometheus.MustRegister(pingCounter)
	prometheus.MustRegister(httpRequestsTotal)

	http.HandleFunc("/ping", ping)
	http.HandleFunc("/metrics", metricsHandler)
	
	// Optional: Add a catch-all handler for 404s on other routes
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" && r.URL.Path != "/ping" && r.URL.Path != "/metrics" {
			httpRequestsTotal.WithLabelValues("404").Inc()
			http.NotFound(w, r)
			return
		}
		// For root path "/", show a simple message
		fmt.Fprintf(w, "Available endpoints:\n- /ping\n- /metrics")
	})

	http.ListenAndServe(":8090", nil)
}