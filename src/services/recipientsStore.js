const fs = require('fs');
const path = require('path');

const FILE = path.resolve(process.cwd(), 'recipients.json');

function readFile() {
  try {
    const raw = fs.readFileSync(FILE, 'utf8');
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function writeFile(list) {
  fs.writeFileSync(FILE, JSON.stringify(list, null, 2) + '\n', 'utf8');
}

function normalize(msisdn) {
  return String(msisdn || '').trim();
}

function getRecipients() {
  return readFile();
}

function addRecipient(msisdn) {
  const n = normalize(msisdn);
  if (!n) return false;
  const list = readFile();
  if (!list.includes(n)) {
    list.push(n);
    writeFile(list);
    return true;
  }
  return false;
}

function removeRecipient(msisdn) {
  const n = normalize(msisdn);
  if (!n) return false;
  const list = readFile();
  const next = list.filter((x) => x !== n);
  if (next.length !== list.length) {
    writeFile(next);
    return true;
  }
  return false;
}

module.exports = { getRecipients, addRecipient, removeRecipient };

