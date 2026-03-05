import axios from "axios";



export const revolutClient = axios.create({
    method: 'post',
    maxBodyLength: Infinity,
    baseURL: process.env.REVOLUT_BASE_URL, // sandbox or prod
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.REVOLUT_SECRET_KEY}`,
        'Revolut-Api-Version': '2024-06-19'
    }
});