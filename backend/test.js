import axios from "axios";


export const revolutProdClient = axios.create({
    maxBodyLength: Infinity,
    baseURL: "https://merchant.revolut.com",
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer sk_7CQTceqbnTIzftY7ZBzmbdzZmdHftCC8YbSWInzbL4z6HJpG21CAjV-EudsnLFSI`, // ✅ prod key
        'Revolut-Api-Version': '2024-06-19'
    }
});


const registerApplePayDomain = async () => {
    try {
        const response = await revolutProdClient.post(
            '/api/apple-pay/domains/register',
            { domain: "api.tapsi.pt" }
        );
        console.log("Apple Pay domain registered:", response.data);
    } catch (error) {
        console.error("Registration failed:", error.response?.data || error.message);
    }
};

registerApplePayDomain();