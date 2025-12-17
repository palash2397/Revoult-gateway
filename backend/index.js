import axios from "axios";

let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://sandbox-merchant.revolut.com/api/1.0/customers/339a265f4-8b52-44ce-8f60-af37dec15f38/payment-methods',
    headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer sk_hDAxJ4W6zzTH5u96aMXXGtmzCYMWLMfFUxx7Dx3p3-skQw4_HXjCrJnNwnXSZ-aZ',
        'Revolut-Api-Version': '2024-06-19'
    }
};

axios(config)
    .then((response) => {
        console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
        console.log(error);
    });