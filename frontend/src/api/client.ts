import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const defaultUrl = import.meta.env.DEV ? 'http://localhost:8080' : 'https://skill-portal-1-mn1n.onrender.com';
const rawBaseUrl = import.meta.env.VITE_API_URL || defaultUrl;
const apiBaseUrl = `${rawBaseUrl.replace(/\/+$/, '')}/api/v1`;

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// Ultra-Fast SWR In-Memory & Session Cache
// ==========================================
interface CacheEntry {
  data: any;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<any>>();

// Fresh cache TTL: 30 seconds
const FRESH_TTL = 30 * 1000;
// Stale allowable TTL: 5 minutes
const MAX_STALE_TTL = 5 * 60 * 1000;

function buildKey(url: string, params?: any): string {
  const q = params ? JSON.stringify(params) : '';
  return `${url}::${q}`;
}

export function clearApiCache(prefix?: string) {
  if (prefix) {
    for (const key of memoryCache.keys()) {
      if (key.includes(prefix)) memoryCache.delete(key);
    }
  } else {
    memoryCache.clear();
    try {
      const keys = Object.keys(sessionStorage).filter((k) => k.startsWith('sp_swr_'));
      keys.forEach((k) => sessionStorage.removeItem(k));
    } catch {}
  }
}

// Interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor to handle 401 & token refresh + cache invalidation on mutations
api.interceptors.response.use(
  (response) => {
    // If mutating request succeeded, invalidate GET cache so data updates immediately
    const method = response.config.method?.toUpperCase();
    if (method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      clearApiCache();
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${apiBaseUrl}/auth/refresh`, { refreshToken });
          const newAccessToken = res.data.data.accessToken;
          const newRefreshToken = res.data.data.refreshToken;
          localStorage.setItem('access_token', newAccessToken);
          localStorage.setItem('refresh_token', newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_info');
          clearApiCache();
          window.location.href = '/login';
          return Promise.reject(refreshErr);
        }
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_info');
        clearApiCache();
      }
    }
    return Promise.reject(error);
  }
);

// High-performance SWR wrapped GET
const originalGet = api.get.bind(api);

api.get = function <T = any, R = AxiosResponse<T>, D = any>(
  url: string,
  config?: AxiosRequestConfig<D> & { skipCache?: boolean }
): Promise<R> {
  const key = buildKey(url, config?.params);

  if (!config?.skipCache) {
    // 1. Check memory cache
    let entry = memoryCache.get(key);

    // 2. Check session storage if not in memory
    if (!entry) {
      try {
        const stored = sessionStorage.getItem(`sp_swr_${key}`);
        if (stored) {
          entry = JSON.parse(stored);
          if (entry) memoryCache.set(key, entry);
        }
      } catch {}
    }

    if (entry && (Date.now() - entry.timestamp < MAX_STALE_TTL)) {
      const isFresh = Date.now() - entry.timestamp < FRESH_TTL;

      // If fresh, return immediately in 0ms!
      if (isFresh) {
        return Promise.resolve({
          data: entry.data,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: config || {},
        } as unknown as R);
      }

      // If stale, return cached data immediately and revalidate in background!
      setTimeout(() => {
        originalGet<T, R, D>(url, { ...config, skipCache: true } as any)
          .then((res: any) => {
            const updated = { data: res.data, timestamp: Date.now() };
            memoryCache.set(key, updated);
            try {
              sessionStorage.setItem(`sp_swr_${key}`, JSON.stringify(updated));
            } catch {}
          })
          .catch(() => {});
      }, 0);

      return Promise.resolve({
        data: entry.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config || {},
      } as unknown as R);
    }
  }

  // 3. Request deduplication: return existing in-flight request if present
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key) as unknown as Promise<R>;
  }

  const reqPromise = originalGet<T, R, D>(url, config as any)
    .then((res: any) => {
      const item = { data: res.data, timestamp: Date.now() };
      memoryCache.set(key, item);
      try {
        sessionStorage.setItem(`sp_swr_${key}`, JSON.stringify(item));
      } catch {}
      return res;
    })
    .finally(() => {
      inFlightRequests.delete(key);
    });

  inFlightRequests.set(key, reqPromise);
  return reqPromise as unknown as Promise<R>;
} as any;

export default api;
