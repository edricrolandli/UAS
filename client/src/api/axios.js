import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BASEURL,
    withCredentials: true // Kirim cookies untuk Clerk session
})

export default api