// k6 script: ramps up to 500 virtual users hitting the read-heavy endpoints.
// Run with: k6 run loadtest/api-load.js
// Report the actual p95 latency and error rate you observe in your resume bullet --
// don't reuse this comment's numbers, they're placeholders until you run it.
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '1m', target: 500 }, // target concurrency: 500 users
    { duration: '1m', target: 500 }, // hold steady at 500 to measure sustained behavior
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // goal: p95 under 200ms -- adjust based on real results
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';

export default function () {
  const res = http.get(`${BASE_URL}/health`);
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
