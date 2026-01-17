export const API_URL = 'https://lockrbackend.vercel.app/api';

// Token management
export const getToken = (): string | null => {
    return localStorage.getItem('lockr_token');
};

export const setToken = (token: string): void => {
    localStorage.setItem('lockr_token', token);
};

export const setUserId = (userId: string): void => {
    localStorage.setItem('lockr_userId', userId);
};

export const removeToken = (): void => {
    localStorage.removeItem('lockr_token');
    localStorage.removeItem('lockr_userId');
};

// API client with automatic token handling
export const apiClient = {
    async get(endpoint: string) {
        const token = getToken();
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 401) {
            removeToken();
            window.location.href = '/'; // Redirect to login
            throw new Error('Unauthorized');
        }

        return response;
    },

    async post(endpoint: string, data: any) {
        const token = getToken();
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.status === 401) {
            removeToken();
            window.location.href = '/';
            throw new Error('Unauthorized');
        }

        return response;
    },

    async put(endpoint: string, data: any) {
        const token = getToken();
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.status === 401) {
            removeToken();
            window.location.href = '/';
            throw new Error('Unauthorized');
        }

        return response;
    },

    async delete(endpoint: string) {
        const token = getToken();
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 401) {
            removeToken();
            window.location.href = '/';
            throw new Error('Unauthorized');
        }

        return response;
    },
};
