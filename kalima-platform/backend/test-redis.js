const Redis = require('ioredis');
const client = new Redis('redis://localhost:6379', {
    connectTimeout: 2000,
    maxRetriesPerRequest: 1
});
client.on('connect', () => {
    console.log('Redis Works!');
    process.exit(0);
});
client.on('error', (err) => {
    console.error('Redis failing:', err.message);
    process.exit(1);
});
