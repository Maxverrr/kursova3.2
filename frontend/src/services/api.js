const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
    static getToken() {
        return localStorage.getItem('token');
    }

    static clearToken() {
        localStorage.removeItem('token');
    }

    static isTokenExpired(token) {
        if (!token) return true;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const { exp } = JSON.parse(jsonPayload);
            return Date.now() >= exp * 1000;
        } catch (error) {
            console.error('Token validation error:', error);
            return true;
        }
    }

    static async request(endpoint, options = {}) {
        const url = `${API_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        const token = this.getToken();
        if (token) {
            if (this.isTokenExpired(token)) {
                console.log('Термін дії токена закінчився, очищення токена');
                this.clearToken();
                window.location.href = '/login';
                throw new Error('Термін дії токена закінчився');
            }
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            console.log(`Making request to: ${url}`);
            console.log('Request headers:', headers);
            console.log('Request options:', options);

            const response = await fetch(url, {
                ...options,
                headers
            });

            console.log(`Response status: ${response.status}`);
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Виникла невідома помилка' }));
                console.error('Response error:', error);
                if (response.status === 401) {
                    this.clearToken();
                    window.location.href = '/login';
                }
                throw new Error(error.error || error.message || 'Помилка запиту');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API request error:', error);
            console.error('Full error details:', {
                message: error.message,
                stack: error.stack,
                url,
                options
            });
            throw error;
        }
    }

    // Auth endpoints
    static async login(email, password) {
        return this.request('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    static async signup(userData) {
        return this.request('/signup', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // Reference data endpoints
    static async getReferenceData() {
        const [bodyTypes, classes, fuelTypes, statuses] = await Promise.all([
            this.request('/body-types'),
            this.request('/classes'),
            this.request('/fuel-types'),
            this.request('/statuses')
        ]);
        return { bodyTypes, classes, fuelTypes, statuses };
    }

    // Cars endpoints
    static async getCars(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/cars${queryString ? `?${queryString}` : ''}`);
    }

    static async getCar(id) {
        return this.request(`/cars/${id}`);
    }

    static async getCarReviews(id) {
        return this.request(`/cars/${id}/reviews`);
    }

    static async createReview(carId, reviewData) {
        return this.request(`/cars/${carId}/reviews`, {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    }

    static async createCar(carData) {
        return this.request('/cars', {
            method: 'POST',
            body: JSON.stringify(carData)
        });
    }

    static async updateCar(id, carData) {
        return this.request(`/cars/${id}`, {
            method: 'PUT',
            body: JSON.stringify(carData)
        });
    }

    static async deleteCar(id) {
        return this.request(`/cars/${id}`, {
            method: 'DELETE'
        });
    }

    // Users
    static async getUsers() {
        return this.request('/users');
    }

    static async updateUser(userId, userData) {
        return this.request(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    static async deleteUser(userId) {
        return this.request(`/users/${userId}`, {
            method: 'DELETE'
        });
    }

    // Rentals
    static async getRentals() {
        const response = await this.request('/rentals');
        return response;
    }

    static async updateRental(rentalId, rentalData) {
        return this.request(`/rentals/${rentalId}`, {
            method: 'PUT',
            body: JSON.stringify(rentalData)
        });
    }

    static async deleteRental(rentalId) {
        return this.request(`/rentals/${rentalId}`, {
            method: 'DELETE'
        });
    }

    // Check car availability
    static async checkCarAvailability(carId, startDate, endDate) {
        return this.request(`/cars/${carId}/check-availability`, {
            method: 'POST',
            body: JSON.stringify({ startDate, endDate })
        });
    }

    // Create rental
    static async createRental(rentalData) {
        return this.request('/rentals', {
            method: 'POST',
            body: JSON.stringify(rentalData)
        });
    }

    static async deleteReview(reviewId) {
        return this.request(`/reviews/${reviewId}`, {
            method: 'DELETE'
        });
    }
}

export default ApiService; 