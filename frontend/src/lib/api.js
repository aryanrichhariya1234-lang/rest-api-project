const API_URL = process.env.NEXT_PUBLIC_API_URL + "/api/v1";

function getTokens() {
  if (typeof window === "undefined")
    return { accessToken: null, refreshToken: null };
  return {
    accessToken: localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
  };
}

function setTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem("accessToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
}

function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

async function request(
  path,
  { method = "GET", body, auth = true, retry = true } = {}
) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const { accessToken } = getTokens();
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  // Access token expired -> try refresh once, then retry original request
  if (res.status === 401 && auth && retry) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      return request(path, { method, body, auth, retry: false });
    }
  }

  if (!res.ok) {
    const err = new Error(data.message || "Request failed");
    err.status = res.status;
    err.errors = data.errors;
    throw err;
  }

  return data;
}

async function tryRefreshToken() {
  const { refreshToken } = getTokens();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json();
    if (!res.ok) {
      clearTokens();
      return false;
    }
    setTokens({ accessToken: data.data.accessToken });
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

export const api = {
  register: (payload) =>
    request("/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload) =>
    request("/auth/login", { method: "POST", body: payload, auth: false }),
  logout: (refreshToken) =>
    request("/auth/logout", {
      method: "POST",
      body: { refreshToken },
      auth: false,
    }),
  getMe: () => request("/auth/me"),

  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products${qs ? `?${qs}` : ""}`);
  },
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (payload) =>
    request("/products", { method: "POST", body: payload }),
  updateProduct: (id, payload) =>
    request(`/products/${id}`, { method: "PUT", body: payload }),
  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE" }),
};

export { getTokens, setTokens, clearTokens };
