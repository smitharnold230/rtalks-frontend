const CONFIG = {
    DEVELOPMENT_API_URL: 'http://localhost:5000/api',
    PRODUCTION_API_URL: 'https://rtalks-back.onrender.com/api',
    
    // API configuration
    getApiUrl: function() {
        // If running locally -> use localhost backend
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return this.DEVELOPMENT_API_URL;
        }
        // Otherwise (vercel / custom domain) -> use Render backend
        return this.PRODUCTION_API_URL;
    },

    // Default fetch options for all API calls
    defaultFetchOptions: {
        credentials: 'include',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        }
    }
};

// Expose globally
window.CONFIG = CONFIG;
