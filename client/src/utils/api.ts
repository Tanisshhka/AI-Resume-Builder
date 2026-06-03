const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private getUrl(endpoint: string): string {
    return `${API_BASE_URL}${endpoint}`;
  }

  async get<T = any>(endpoint: string): Promise<T> {
    const response = await fetch(this.getUrl(endpoint), {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  async post<T = any>(endpoint: string, body?: any): Promise<T> {
    const response = await fetch(this.getUrl(endpoint), {
      method: 'POST',
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T = any>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(this.getUrl(endpoint), {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    const response = await fetch(this.getUrl(endpoint), {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {}
      console.error('[API ERROR]', response.status, errorMessage);
      throw new Error(errorMessage);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  }
}

export const api = new ApiService();
