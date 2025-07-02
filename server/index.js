const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.PGHOST || '10.0.0.78',
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'J123654789j',
  database: process.env.PGDATABASE || 'postgres',
});

// Beispiel-Endpunkt: Alle Daten aus einer Tabelle holen
app.get('/api/data/:table', async (req, res) => {
  const { table } = req.params;
  try {
    const result = await pool.query(`SELECT * FROM "${table}" LIMIT 10000`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Whitelist für erlaubte Tabellen
const ALLOWED_TABLES = [
  'Gefilterte_Adressen_Geesthacht',
  'Gefilterte_Adressen_Gülzow',
  'Gefilterte_Adressen_Hamwarde',
  'Gefilterte_Adressen_Kollow',
  'Gefilterte_Adressen_Wiershop',
  'Gefilterte_Adressen_Worth',
];

// Update Koordinaten für einen Datensatz anhand Adresse und Tabelle
app.post('/api/update-coords/:table', async (req, res) => {
  const { table } = req.params;
  const { plz, ort, strasse, hausnr, latitude, longitude } = req.body;
  if (!plz || !ort || !strasse || !hausnr || !latitude || !longitude) {
    return res.status(400).json({ error: 'Fehlende Felder' });
  }
  if (!ALLOWED_TABLES.includes(table)) {
    return res.status(400).json({ error: 'Tabelle nicht erlaubt' });
  }
  try {
    const result = await pool.query(
      `UPDATE "${table}"
       SET latitude = $1, longitude = $2
       WHERE "PLZ" = $3 AND "Ort" = $4 AND "Strasse" = $5 AND "Haus-Nr" = $6`,
      [latitude, longitude, plz, ort, strasse, hausnr]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Kein passender Datensatz gefunden' });
    }
    res.json({ success: true, updated: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend läuft auf Port ${PORT}`);
}); 