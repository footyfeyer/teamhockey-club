export async function handler(event, context) {
  return new Response("Hello from Netlify Functions!", {
    status: 200,
    headers: { "content-type": "text/plain" }
  });
}
