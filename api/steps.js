import { getDb } from './_db.js';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validateBody(date, steps) {
  if (!date || !ISO_DATE_RE.test(date)) {
    return 'date must be a valid ISO date string (YYYY-MM-DD)';
  }
  const num = Number(steps);
  if (steps == null || isNaN(num) || num < 0 || !Number.isInteger(num)) {
    return 'steps must be a non-negative integer';
  }
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const db = await getDb();
  const col = db.collection('steps');

  if (req.method === 'GET') {
    const records = await col
      .find({})
      .sort({ date: 1 })
      .toArray();
    return res.status(200).json(records);
  }

  if (req.method === 'POST') {
    const { date, steps } = req.body;
    const err = validateBody(date, steps);
    if (err) return res.status(400).json({ error: err });
    const result = await col.insertOne({ date, steps: Number(steps) });
    return res.status(201).json({ _id: result.insertedId, date, steps: Number(steps) });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
