import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users over 30 seconds
    { duration: '1m', target: 20 },  // Stay at 20 users for 1 minute
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
  },
};

const BASE_URL = 'http://localhost:4000/api/v1';

export default function () {
  const payload = JSON.stringify({
    texts: ["Hello", "Welcome to Chhattisgarh", "Discover our culture"],
    sourceLang: "en",
    targetLang: "hi"
  });

  const headers = {
    'Content-Type': 'application/json',
  };

  const res = http.post(`${BASE_URL}/translations/batch`, payload, { headers });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'translation data is present': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data && body.data.length > 0;
      } catch (e) {
        return false;
      }
    },
  });

  sleep(1);
}
