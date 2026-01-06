import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from './config';
import { ApiError } from '@/types/auth.types';

const TOKEN_KEY = '@cail_auth_token';

class ApiService {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_CONFIG.BASE_URL,
            timeout: API_CONFIG.TIMEOUT,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor - add auth token
        this.client.interceptors.request.use(
            async (config) => {
                const token = await AsyncStorage.getItem(TOKEN_KEY);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor - handle errors
        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                const apiError: ApiError = {
                    status: error.response?.status || 500,
                    message: this.getErrorMessage(error),
                    details: error.response?.data,
                };
                return Promise.reject(apiError);
            }
        );
    }

    private getErrorMessage(error: AxiosError): string {
        if (error.response?.data && typeof error.response.data === 'object') {
            const data = error.response.data as any;
            return data.message || data.error || 'Error en la solicitud';
        }

        if (error.code === 'ECONNABORTED') {
            return 'Tiempo de espera agotado. Verifica tu conexión.';
        }

        if (error.code === 'ERR_NETWORK') {
            return 'Error de red. Verifica tu conexión a internet.';
        }

        return error.message || 'Error desconocido';
    }

    async get<T>(url: string): Promise<T> {
        const response = await this.client.get<T>(url);
        return response.data;
    }

    async post<T>(url: string, data?: any): Promise<T> {
        const response = await this.client.post<T>(url, data);
        return response.data;
    }

    async put<T>(url: string, data?: any): Promise<T> {
        const response = await this.client.put<T>(url, data);
        return response.data;
    }

    async delete<T>(url: string): Promise<T> {
        const response = await this.client.delete<T>(url);
        return response.data;
    }

    // User profile
    async getUserProfile<T>(): Promise<T> {
        const response = await this.client.get<T>('/api/v1/users/profile');
        return response.data;
    }

    // Token management
    async saveToken(token: string): Promise<void> {
        if (!token) {
            console.warn('Attempted to save null/undefined token');
            return;
        }
        await AsyncStorage.setItem(TOKEN_KEY, token);
    }

    async getToken(): Promise<string | null> {
        return await AsyncStorage.getItem(TOKEN_KEY);
    }

    async removeToken(): Promise<void> {
        await AsyncStorage.removeItem(TOKEN_KEY);
    }
}

export const apiService = new ApiService();
