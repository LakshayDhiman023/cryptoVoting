const https = require('https');
const fs = require('fs');
const crypto = require('crypto');

// In-memory vote tally
let votes = {};

const options = {
  key: fs.readFileSync('server.key'),            // Server private key
  cert: fs.readFileSync('server.crt'),           // Server certificate
  ca: fs.readFileSync('ca.crt'),                 // CA certificate
  requestCert: true,                             // Require client certificates
  rejectUnauthorized: true                       // Reject unauthorized clients
};

https.createServer(options, (req, res) => {
  if (req.client.authorized) {
    if (req.method === 'POST' && req.url === '/vote') {
      // Cast vote
      handleVote(req, res);
    } else if (req.method === 'GET' && req.url === '/tally') {
      // Show tally
      handleTally(req, res);
    } else {
      res.writeHead(404);
      res.end('Endpoint not found');
    }
  } else {
    res.writeHead(401);
    res.end('Unauthorized');
  }
}).listen(8080, () => {
  console.log('Server is running at https://10.0.4.194:8080/');
});

// Function to handle vote casting
function handleVote(req, res) {
  let data = '';
  req.on('data', (chunk) => { data += chunk; });
  req.on('end', () => {
    try {
      // Decrypt the vote using the server's private key
      const serverPrivateKey = fs.readFileSync('server.key', 'utf8');
      const decryptedVote = crypto.privateDecrypt(
        { key: serverPrivateKey, padding: crypto.constants.RSA_PKCS1_PADDING },
        Buffer.from(data, 'base64')
      ).toString();

      // Tally the vote
      votes[decryptedVote] = (votes[decryptedVote] || 0) + 1;

      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Vote recorded successfully!');
    } catch (err) {
      console.error('Error processing vote:', err.message);
      res.writeHead(500);
      res.end('Failed to record vote.');
    }
  });
}

// Function to handle vote tally retrieval
function handleTally(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(votes, null, 2)); // Pretty-print JSON tally
}
