
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1000'],
  },
};

export default function () {
  const response = http.get('http://127.0.0.1:8000/api/health');

  check(response, {
    'status is 200': (r) => r.status === 200,
    'backend reports healthy': (r) => {
      try {
        return r.json('status') === 'healthy';
      } catch {
        return false;
      }
    },
  });

  sleep(1);
}
