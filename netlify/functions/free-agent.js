// netlify/functions/free-agent.js
import { createClient } from '@supabase/supabase-js';

// Optional: centralize CORS if you already have a cors.js used by contact
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'OPTIONS, POST',
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // server-side only
);

export const handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Only POST allowed' }),
    };
  }

  try {
    const { name, email, phone, summary } = JSON.parse(event.body || '{}');

    // Basic validation
    if (!email || !phone || !summary) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Missing required fields: email, phone, summary' }),
      };
    }
    const okEmail = /.+@.+\..+/.test(email);
    const okPhone = /[\d\-\.\(\)\s\+]{7,}/.test(phone);
    if (!okEmail) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid email' }) };
    }
    if (!okPhone) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Invalid phone' }) };
    }

    // Optional: capture limited request metadata (not PII-heavy)
    const reqMeta = {
      ip: event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for'] || null,
      ua: event.headers['user-agent'] || null,
    };

    // Insert into your table (schema from earlier message)
    const { error } = await supabase
      .from('free_agent_applications')
      .insert([{ name, email, phone, summary }]);

    if (error) {
      console.error('Supabase insert error:', error.message);
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Database error: ' + error.message }),
      };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Free agent submission received' }),
    };
  } catch (err) {
    console.error('Unexpected error:', err?.message);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Unexpected server error: ' + err.message }),
    };
  }
};
