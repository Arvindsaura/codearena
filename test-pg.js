const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.gznzrxqgdxifhbzxprzp:Arvindpuri%401492@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require'
});

client.connect()
  .then(() => {
    console.log('Connected to PG!');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('Time:', res.rows[0].now);
    client.end();
  })
  .catch(err => {
    console.error('Connection error', err.stack);
    client.end();
  });
