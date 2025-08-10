import type {
  CreateProductInput,
  UpdateProductInput,
  ProductQuery,
  AddInventoryInput,
  SetInventoryInput,
  CreateSaleInput,
} from "./schemas";

const API_BASE = "/api";

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Products API
export async function getProducts(query?: ProductQuery) {
  const params = new URLSearchParams();
  if (query?.q) params.set("q", query.q);
  if (query?.page) params.set("page", query.page.toString());
  if (query?.limit) params.set("limit", query.limit.toString());

  const queryString = params.toString();
  return apiCall<any>(`/products${queryString ? `?${queryString}` : ""}`);
}

export async function createProduct(data: CreateProductInput) {
  return apiCall<any>("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id: string, data: UpdateProductInput) {
  return apiCall<any>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: string) {
  return apiCall<any>(`/products/${id}`, {
    method: "DELETE",
  });
}

export async function getProduct(id: string) {
  return apiCall<any>(`/products/${id}`);
}

// Inventory API
export async function getInventory() {
  return apiCall<any>("/inventory");
}

export async function addInventory(data: AddInventoryInput) {
  return apiCall<any>("/inventory/add", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function setInventory(data: SetInventoryInput) {
  return apiCall<any>("/inventory/set", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Sales API
export async function createSale(data: CreateSaleInput) {
  return apiCall<any>("/sales", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getSale(id: string) {
  return apiCall<any>(`/sales/${id}`);
}

export function getReceiptPdfUrl(id: string): string {
  return `${API_BASE}/sales/${id}/receipt.pdf`;
}

// Upload API
export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE}/uploads`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Upload failed" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}
