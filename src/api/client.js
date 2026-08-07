import api from './axios.js'

export const registerClient = async (name,email)=>{
    const response = await api.post('/clients/register/',{name,email});
    return response.data;
}

export const loginClient = async(email)=>{
    const response = await api.post('/clients/login/',{email})
    return response.data
}

export const verifyEmail = async(token,email)=>{
    const response = await api.get(
        `/clients/verify-email/?token=${token}&email=${email}`
    );
    return response.data;
}

export const resendVerification = async(email)=>{
    const response = await api.post('/clients/resend-verification/',{email})
    return response.data
}

export const getRateLimitConfigs = async()=>{
    const response = await api.get('/ratelimiter/configs/')
    return response.data
}

export const createRateLimitConfig = async(data)=>{
    const response = await api.post('/ratelimiter/configs/',data)
    return response.data
}

export const getAnalytics = async()=>{
    const response = await api.get('/ratelimiter/analytics');
    return response.data
}