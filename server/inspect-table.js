const { default: pgStructure } = require('pg-structure');

(async () => {
  const db = await pgStructure({
    database: process.env.PGDATABASE || 'postgres',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'J123654789j',
    host: process.env.PGHOST || '10.0.0.78',
    port: process.env.PGPORT || 5432,
  }, ["public"]);

  const table = db.get('public.Gefilterte_Adressen_Geesthacht');
  if (!table) {
    console.log('Tabelle nicht gefunden!');
    process.exit(1);
  }
  console.log('Spalten:');
  for (const col of table.columns.values()) {
    console.log(`- ${col.name} (${col.type})${col.isPrimaryKey ? ' [PK]' : ''}`);
  }
  if (table.primaryKey) {
    console.log('Primary Key:', table.primaryKey.columns.map(c => c.name).join(', '));
  } else {
    console.log('Kein Primary Key definiert!');
  }
})(); 