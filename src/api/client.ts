import axios from 'axios'

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
})

function getCookie(name: string): string { 
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
    return match ? match[2] : null;
}

apiClient.interceptors.request.use((config) => {
    const csrfToken = getCookie('csrftoken')
    if(csrfToken) { 
        config.headers['X-CSRFToken'] = csrfToken
    }
    return config
})

export default apiClient