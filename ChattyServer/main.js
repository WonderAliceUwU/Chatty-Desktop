const express = require('express');
const expressWs = require('express-ws');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { User, sequelize } = require('./models');
const app = express();
const wsInstance = expressWs(app);
const JWT_SECRET = 'Wonder4liceChattyKey';
const CryptoJS = require("crypto-js");


app.use(cors());
app.use(express.json());

// Define a secret key for JWT token encryption

// Define a function to generate a JWT token
function generateJwtToken(username) {
    return jwt.sign({ username }, JWT_SECRET);
}

//Finds a user in the database and returns the result
async function findUser(username, password, mode) {
    if(mode === "login"){
        const user = User.findOne({
            where: {
                username,
                password,
            },
        });
        console.log(user)
        return user;
    }
    if (mode === "search"){
        const user = User.findOne({
            where: {
                username,
            },
        });
        console.log(user)
        return user;
    }
}


// Define a login route that accepts a username and password
app.post('/login', async (req, res) => {
    const {username, password} = req.body;

    findUser(username, CryptoJS.SHA3(password, { outputLength: 256 }).toString(), "login")
        .then((user) => {
            if (user === null) {
                res.status(401).json({error: 'Invalid username or password'});
            } else {
                const token = generateJwtToken(username);
                res.status(200).json({token});
                console.log('client autenticated')
            }
        })
        .catch((err) => console.error(err));
});

app.post('/register', async (req, res) => {
    const {username, password} = req.body;

    findUser(username, "", "search")
        .then((user) => {
            if (user === null) {
                sequelize.sync({force: false}).then(() => {
                    // Insert a user
                    User.create({
                        username: username,
                        password: CryptoJS.SHA3(password, { outputLength: 256 }).toString(),
                    }).then((user) => {
                        console.log('User created successfully:', user.toJSON());
                        const token = generateJwtToken(username);
                        res.status(200).json({token});
                        console.log('client autenticated')
                    }).catch((error) => {
                        console.log('Error creating user: ', error);
                        res.status(401).json({error: 'Error creating user'});
                    })
                })
            } else {
                res.status(401).json({error: 'Username is already taken'});
            }
        }).catch((err) => {
            console.error(err)
            res.status(401).json({error: 'Username is already taken'});
    });
});




// Handle incoming WebSocket connections
app.ws('/', (socket, req) => {
    // Check for a valid JWT token in the request headers
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        // If there is no JWT token, close the WebSocket connection
        socket.close();
        return;
    }

    try {
        // Verify the JWT token and extract the username
        const decoded = jwt.verify(token, JWT_SECRET);
        const { username } = decoded;

        // Add the username to the socket object for future use
        socket.username = username;
    } catch (error) {
        // If the JWT token verification fails, close the WebSocket connection
        socket.close();
        return;
    }

    console.log('WebSocket client connected');

    socket.on('message', (message) => {
        console.log(`Received message: ${message}`);

        // Send the message to all connected clients except the sender
        wsInstance.getWss().clients.forEach((client) => {
            if (client !== socket && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    socket.on('close', () => {
        console.log('WebSocket client disconnected');
    });
});

// Start the HTTP server
app.listen(8080, () => {
    console.log('HTTP server listening on port 8080');
});
