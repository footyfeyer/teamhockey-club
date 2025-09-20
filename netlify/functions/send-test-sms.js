export const handler = async (event) => {
  console.log("ENV From:", process.env.TWILIO_FROM);
  
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { to, body } = JSON.parse(event.body || "{}");
  if (!to) return { statusCode: 400, body: "Missing 'to'" };

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");

  const payload = new URLSearchParams({ To: to, From: from, Body: body || "THC SMS smoke test" });

  console.log("Sending SMS with payload:", Object.fromEntries(payload));

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload,
  });

  const data = await res.json();

  console.log("Twilio response:", data);

  return {
    statusCode: res.ok ? 200 : 500,
    body: JSON.stringify(data, null, 2),
  };
};
