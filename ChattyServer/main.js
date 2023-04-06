const net = require('net');
//const { Sequelize } = require('sequelize');

/*const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: "mysql" /* one of 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle'
});

try {
    sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}*/

const server = net.createServer((socket) => {
    // When a client connects to the server, add the socket to the array of clients
    console.log('Client connected');
    const clientId = socket.remoteAddress + ":" + socket.remotePort;
    clients[clientId] = socket;

    // When data is received from a client, send it to all other clients
    socket.on('data', (data) => {
        const message = data.toString();
        console.log(`Received message from ${clientId}: ${message}`);

        // Send the message to all other clients
        Object.keys(clients).forEach((id) => {
            if (id !== clientId) {
                clients[id].write(`${clientId}: ${message}`);
            }
            clients[id].write(`${clientId}: "true"`);
        });
    });

    // When a client disconnects from the server, remove its socket from the array of clients
    socket.on('end', () => {
        console.log(`Client ${clientId} disconnected`);
        delete clients[clientId];
    });
});

// Create an empty object to store the clients
const clients = {};

// Listen for incoming connections on port 3000
server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
