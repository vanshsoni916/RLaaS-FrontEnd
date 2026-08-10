import axios from "axios";

const api = axios.create({
    baseURL:import.meta.env.VITE_API_URL,
    headers:{
        'Content-Type':'application/json',
    },
});

api.interceptors.request.use((config)=>{
    const api_key = localStorage.getItem('api_key')
    if(api_key){
        config.headers['X-API-KEY']=api_key
    }
    return config;
});

export default api 