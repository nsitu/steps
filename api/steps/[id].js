import { getDb } from '../_db.js';
import { ObjectId } from 'mongodb';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  let oid;
  try {
    oid = new ObjectId(id);
  } catch {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const db = await getDb();
  const col = db.collection('steps');

  if (req.method === 'GET') {
    const record = await col.findOne({ _id: oid });
    if (!record) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json(record);
  }

  if (req.method === 'PUT') {
    const { date, steps } = req.body;
    const err = validateBody(date, steps);
    if (err) return res.status(400).json({ error: err });
    const result = await col.updateOne({ _id: oid }, { $set: { date, steps: Number(steps) } });
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json({ _id: id, date, steps: Number(steps) });
  }

  if (req.method === 'DELETE') {
    await col.deleteOne({ _id: oid });
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
