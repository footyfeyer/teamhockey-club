console.log("🚀 contct.js triggered");

import { createClient } from '@supabase/supabase-js';


const supabase = createClient(
  'https://ibtymcsmwmtofwuecrfp.supabase.co',
  process.env.SUPABASE_ANON_KEY
);


import nodemailer from 'nodemailer';
import { CORS_HEADERS } from './cors.js';


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'essentialservicescoffee@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Only POST requests allowed' }),
    };
  }

  try {
    const { name, email, subject, message } = JSON.parse(event.body || '{}');

    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const { error } = await supabase
      .from('messages')
      .insert([{ name, email, subject, message }]);

    if (error) {
      console.error("Supabase insert error:", error.message);
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Database error: ' + error.message }),
      };
    }

    await transporter.sendMail({
      from: '"Essential Services Contact" <essentialservicescoffee@gmail.com>',
      to: 'pondcommisioner@gmail.com',
      subject: `New message from ${name}: ${subject || '(No subject)'}`,
      text: `From: ${name} <${email}>\n\n${message}`
    });

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Message saved and email sent!' }),
    };
  } catch (err) {
    console.error("Unexpected error:", err.message);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Unexpected server error: ' + err.message }),
    };
  }
};
