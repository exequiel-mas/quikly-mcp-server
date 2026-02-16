export type QuiklyClientOptions = {
  baseUrl: string;
  apiKey: string;
  timeoutMs?: number;
};

export class QuiklyClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;

  constructor(opts: QuiklyClientOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/$/, "");
    this.apiKey = opts.apiKey;
    this.timeoutMs = opts.timeoutMs ?? 30_000;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  private async request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.apiKey
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal
      });

      const text = await res.text();
      const isJson = res.headers.get("content-type")?.includes("application/json");
      const data = (isJson && text) ? JSON.parse(text) : text;

      if (!res.ok) {
        const detail =
          typeof data === "string"
            ? data
            : JSON.stringify(data, null, 2);
        throw new Error(
          `Quikly API error (${method} ${url}) (${res.status} ${res.statusText}): ${detail}`
        );
      }

      return data as T;
    } finally {
      clearTimeout(timeout);
    }
  }
}

