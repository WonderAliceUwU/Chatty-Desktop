const express = require('express');
const expressWs = require('express-ws');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { User,FeedMessages,Messages, ProfileImages,sequelize, Friendships} = require('./models');
const app = express();
const wsInstance = expressWs(app);
const JWT_SECRET = 'Wonder4liceChattyKey';
const CryptoJS = require("crypto-js");
const multer = require('multer');
const {where, Op} = require("sequelize");
const upload = multer({ dest: 'uploads/' });


app.use(cors());
app.use(express.json());

// Define a secret key for JWT token encryption
let connected = []

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
        return user;
    }
    if (mode === "search"){
        const user = User.findOne({
            where: {
                username,
            },
        });
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
                const status = user.status
                connected.push(username)
                res.status(200).json({token, status});
                console.log('client autenticated')
            }
        })
        .catch((err) => console.error(err));
});

app.post('/request-friend', async (req, res) =>{
    const {requestedFriend} = req.body;
    const token = req.url.split('?token=')[1];
    if (!token) {
        console.log('request-rejected')
        res.status(401);
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const { username } = decoded;

    const friends = await User.findAll({
        where: {
            username:{
                [Op.like]: "%" + requestedFriend + "%"
            },
        }
    }).then(async friends => {
        res.status(200).json({friends});
    })
})
app.post('/request-feed', async (req, res) =>{
    const token = req.url.split('?token=')[1];
    if (!token) {
        console.log('feed-rejected')
        res.status(401);
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const { username } = decoded;

    const friends = await Friendships.findAll({
        where: {
            username,
        }
    }).then(async friends => {
        const userFriends = [];
        userFriends.push(username)
        for (let i = 0; i < friends.length; i++) {
            userFriends.push(friends[i].friend);
        }

        const feed = await FeedMessages.findAll({
            where: {
                username: {
                    [Op.in]: userFriends
                }
            },
            order: [['createdAt', 'DESC']]
        }).then(async feed => {
            res.status(200).json({feed});
        })
    })
})

app.post('/request-chat', async (req, res) =>{
    const {friend} = req.body;
    const token = req.url.split('?token=')[1];
    if (!token) {
        console.log('feed-rejected')
        res.status(401);
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const { username } = decoded;
    const userFriends = [];
    userFriends.push(username)
    userFriends.push(friend)
    const chat = await Messages.findAll({
        where: {
            username: {[Op.in]:userFriends},
            friend: {[Op.in]:userFriends}},
        order: [['createdAt', 'DESC']]
    }).then(async chat => {
        res.status(200).json({chat});
    })
})

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
                        res.status(200).json({ok: 'User created'});
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

app.post('/feed-message', async(req, res) => {
    const message = req.body.text;
    const token = req.url.split('?token=')[1];
    if (!token) {
        // If there is no JWT token, close the WebSocket connection
        console.log('message rejected')
        return;
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const { username } = decoded;

    sequelize.sync({force: false}).then(() => {
        // Insert a user
        FeedMessages.create({
            username: username,
            message: message,
        }).then((user) => {
            console.log('Feed created successfully:', user.toJSON());
            res.status(200);
            console.log('Recieved feed message: ' + message + ' from ' + username)
        }).catch((error) => {
            console.log('Error creating feed message: ', error);
            res.status(401).json({error: 'Error creating feed message'});
        })
    })
})

app.post('/send-message', async(req, res) => {
    //const message = req.body.text;
    const {friend, text} = req.body;
    const token = req.url.split('?token=')[1];
    if (!token) {
        // If there is no JWT token, close the WebSocket connection
        console.log('message rejected')
        return;
    }
    console.log("friend:" + friend + " message: " + text)
    const decoded = jwt.verify(token, JWT_SECRET);
    const { username } = decoded;

    sequelize.sync({force: false}).then(() => {
        Messages.create({
            username: username,
            friend: friend,
            message: text,
        }).then((user) => {
            //TODO finish send message function
            res.status(200);
            console.log('Recieved message: ' + text + ' from ' + username)
        }).catch((error) => {
            console.log('Error creating message: ', error);
            res.status(401).json({error: 'Error creating message'});
        })
    })
})

app.post('/change_profile', async (req, res) => {
    const {username, newUsername, newPassword, newStatus} = req.body;

    if(newStatus !== "") { //TODO doesnt work as expected yet
        sequelize.sync({force: false}).then(() => {
            User.update(
                {status: newStatus},
                {where: {username: username}}
            ).then((user) => {
                res.status(200);
                console.log("User updated succesfully")
            }).catch(() => {
                res.status(401).json({error: 'Error updating user'});
            })
        })
    }
    if(newPassword !== ""){
        User.update(
            { password: CryptoJS.SHA3(newPassword, { outputLength: 256 }).toString() },
            { where: { username: username}}
        ).then(result =>{
            console.log('User updated successfully:', user.toJSON());
            res.status(200).json({token});
        }).catch(err =>{
            res.status(401).json({error: 'Error updating user'});
        })
    }
    if(newUsername !== ""){
        User.update(
            { username: newUsername },
            { where: { username: username}}
        ).then(result =>{
            console.log('User updated successfully:', user.toJSON());
            res.status(200).json({token});
        }).catch(err =>{
            res.status(401).json({error: 'Error updating user'});
        })
    }
});

//TODO finish store image function
app.post('/upload-profile-image', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No image file uploaded!');
    }
    const {filename, mimetype, buffer} = req.file;
    const token = req.url.split('?token=')[1];
    const {username} = jwt.verify(token, JWT_SECRET);
    // create a new Image instance and save it to the database
    //sequelize.sync({force: false}).then(() => {
        ProfileImages.create({
            filename: filename,
            mimetype,
            data: buffer,
            username: username,
        }).then(r => {
            res.send('Image uploaded successfully!');
            /*}).catch((error) => {
                if (error.name === 'SequelizeValidationError') {
                    // handle validation errors
                    const messages = error.errors.map((err) => err.message);
                    res.status(400).send(`Validation errors: ${messages.join(', ')}`);
                } else if (error.name === 'SequelizeUniqueConstraintError') {
                    // handle unique constraint errors
                    res.status(400).send('Profile image already exists!');
                } else {
                    // handle other errors
                    console.error('Error storing profile image in database:', error);
                    res.status(500).send('Error uploading profile image!');
                }
            })*/
        })
   // });
});


// Handle incoming WebSocket connections
app.ws('/', (socket, req) => {
    // Check for a valid JWT token in the request headers
    const authHeader = req.headers.authorization;
    const token = req.url.split('?token=')[1];
    if (!token) {
        // If there is no JWT token, close the WebSocket connection
        socket.close();
        console.log('client rejected')
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
