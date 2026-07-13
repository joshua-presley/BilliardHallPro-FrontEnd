import axios from 'axios'

const apiClient = axios.create({
    baseURL: "http://localhost:8000/api",
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