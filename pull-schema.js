const { Client } = require('ssh2');
const net = require('net');
const { execSync } = require('child_process');

const sshConfig = {
  host: '46.225.151.201',
  port: 22,
  username: 'root',
  password: 'uXahWAsgXNXU'
};

const forwardConfig = {
  srcHost: '127.0.0.1',
  srcPort: 5433,
  dstHost: '127.0.0.1',
  dstPort: 5432
};

const conn = new Client();

const server = net.createServer((socket) => {
  conn.forwardOut(
    forwardConfig.srcHost,
    forwardConfig.srcPort,
    forwardConfig.dstHost,
    forwardConfig.dstPort,
    (err, stream) => {
      if (err) {
        console.error('Forwarding error:', err);
        socket.end();
        return;
      }
      socket.pipe(stream);
      stream.pipe(socket);
    }
  );
});

conn.on('ready', () => {
  console.log('SSH connection established');
  server.listen(forwardConfig.srcPort, forwardConfig.srcHost, () => {
    console.log(`Port forwarding started on ${forwardConfig.srcHost}:${forwardConfig.srcPort}`);
    
    try {
      console.log('Running prisma db pull...');
      const output = execSync('npx prisma db pull', { encoding: 'utf-8', stdio: 'inherit' });
      console.log('Prisma db pull finished successfully.');
    } catch (error) {
      console.error('Error running prisma db pull:', error.message);
    } finally {
      server.close();
      conn.end();
    }
  });
}).on('error', (err) => {
  console.error('SSH connection error:', err);
});

console.log('Connecting to SSH...');
conn.connect(sshConfig);
