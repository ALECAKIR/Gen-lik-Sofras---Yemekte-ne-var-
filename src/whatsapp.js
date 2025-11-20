const axios = require('axios');
require('dotenv').config();

const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || 'v20.0';
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

if (!WHATSAPP_TOKEN) {
  console.warn('[warn] WHATSAPP_TOKEN is not set. Outbound calls will fail.');
}

if (!PHONE_NUMBER_ID) {
  console.warn('[warn] PHONE_NUMBER_ID is not set. Outbound calls will fail.');
}

const api = axios.create({
  baseURL: `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}`,
  headers: {
    Authorization: `Bearer ${WHATSAPP_TOKEN}`,
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

async function sendText(to, body, previewUrl = false) {
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body, preview_url: !!previewUrl }
  };
  const { data } = await api.post('/messages', payload);
  return data;
}

async function sendTemplate(to, templateName, langCode = 'tr', components = []) {
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: langCode },
      components
    }
  };
  const { data } = await api.post('/messages', payload);
  return data;
}

module.exports = {
  sendText,
  sendTemplate
};

