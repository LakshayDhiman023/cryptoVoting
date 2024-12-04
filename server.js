const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('server.key'),            // Server private key
  cert: fs.readFileSync('server.crt'),           // Server certificate
  ca: fs.readFileSync('ca.crt'),                 // CA certificate
  requestCert: true,                             // Require client certificates
  rejectUnauthorized: true                       // Reject unauthorized clients
};

https.createServer(options, (req, res) => {
  if (req.client.authorized) {
    res.writeHead(200);
    res.end('Hello, client fuck you successfully!\n');
  } else {
    res.writeHead(401);
    res.end('Unauthorized\n');
  }
}).listen(8080, () => {
  console.log('Server is running at https://10.0.4.194:8080/');
});
