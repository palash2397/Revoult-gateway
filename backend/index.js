import axios from "axios";

export const revolutClient = axios.create({
  method: "post",
  maxBodyLength: Infinity,
  baseURL: "https://merchant.revolut.com",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer `,
    "Revolut-Api-Version": "2024-06-19",
  },
});

const registerApplePayDomain = async () => {
  const response = await revolutClient.post("/api/apple-pay/domains/register", {
    domain: "node.aitechnotech.in",
  });
  console.log("Registered:", response.data);
};

registerApplePayDomain();
