const axios = require("axios");
const config = require("config");

const paystack = async (
  payment,
  { number, cvv, expiry_month, expiry_year },
  userEmail
) => {
  const headers = {
    Authorization: `Bearer ${config.get("payStackKey")}`
  };

  const payload = {
    email: userEmail,
    amount: payment.amount * 100,
    card: {
      number,
      cvv,
      expiry_month,
      expiry_year
    },
    metadata: {
      custom_fields: [
        {
          value: "transactionName",
          display_name: payment.transactionName,
          variable_name: "transactionName"
        }
      ]
    }
  };
  try {
    let response = await axios.post("https://api.paystack.co/charge", payload, {
      headers
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};

module.exports = paystack;
