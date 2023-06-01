const express = require('express');
const expressWs = require('express-ws');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { User,FeedMessages,Messages, sequelize, Friendships, Images, Unreads} = require('./models');
const app = express();
const wsInstance = expressWs(app);
const JWT_SECRET = 'Wonder4liceChattyKey';
const CryptoJS = require("crypto-js");
const multer = require('multer');
const {where, Op} = require("sequelize");
const http = require('http');
const socketio = require('socket.io');

const server = http.createServer(app);
const io = socketio(server);


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        const timestamp = Date.now();
        cb(null, `${timestamp}-${file.originalname}`);
    }
});

const upload = multer({ storage });


app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));


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
                const pfp = user.profilePicture
                connected.push(username)
                res.status(200).json({token, status, pfp});
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
    await Friendships.findAll({
        where: {
                username: username,
        },
    }).then(friendships =>{
        const evadeFriends = friendships.map((friendships) => friendships.friend);
        evadeFriends.push(username)
        User.findAll({
            where: {
                username:{
                    [Op.like]: "%" + requestedFriend + "%",
                    [Op.notIn]: evadeFriends,
                },
            }
        }).then(async friends => {
            res.status(200).json({friends });
        })
    })
})

app.post('/request-list-friend', async (req, res) => {
    const token = req.url.split('?token=')[1];
    if (!token) {
        console.log('request-rejected')
        res.status(401);
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const {username} = decoded;
    await Friendships.findAll({
        where: {
            username: username,
            status: 'Completed'
        },
    }).then(friendships => {
        const include = friendships.map((friendships) => friendships.friend);
        User.findAll({
            where: {
                username: {
                    [Op.in]: include,
                }
            },  order: [['username', 'DESC']]
        }).then(async friends => {
            res.status(200).json({friends});
        })
    })
})

app.post('/request-friend-requests', async (req, res) =>{
    const token = req.url.split('?token=')[1];
    if (!token) {
        console.log('request-rejected')
        res.status(401);
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const { username } = decoded;

    await Friendships.findAll({
        where: {
            friend: username,
            status: 'Pending',
        }
    }).then(async requestsFriends => {
        res.status(200).json({requestsFriends});
    })
})

app.post('/accept-request', async (req, res) => {
    const {target} = req.body;
    const token = req.url.split('?token=')[1];
    if (!token) {
        console.log('request-rejected')
        res.status(401);
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const {username} = decoded;
    console.log("Request from " + target + " accepted by " + username)
    await Friendships.update(
        {status: 'Completed'},
        {where: {username: target,
                friend: username}
        }).then((result) => {
            sequelize.sync({force: false}).then(() => {
            Friendships.create({
                username: username,
                friend: target,
                status: 'Completed'
            }).then((user) => {
                res.status(200).json({message: 'Request completed'});
            }).catch((error) => {
                res.status(401).json({error: 'Error sending request'});
            })
        })
    })
})

app.post('/unfriend', async (req, res) => {
    const {friend} = req.body;
    const token = req.url.split('?token=')[1];
    if (!token) {
        console.log('request-rejected')
        res.status(401);
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const {username} = decoded;

    sequelize.sync({force: false}).then(() => {
        Friendships.destroy(
        {where:
                {username: friend,
                friend: username,}
        })
        Friendships.destroy(
            {where:
                    {username: username,
                    friend: friend,}
        }).then(() => {
            res.status(200).json({message: 'Request completed'});
        }).catch((error) => {
            res.status(401).json({error: 'Error sending request'});
        })
    })
})

app.post('/make-request', async (req, res) =>{
    const {target} = req.body;
    const token = req.url.split('?token=')[1];
    if (!token) {
        console.log('request-rejected')
        res.status(401);
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const { username } = decoded;

    sequelize.sync({force: false}).then(() => {
        Friendships.create({
            username: username,
            friend: target,
            status: "Pending",
        }).then((user) => {
            res.status(200).json({message: 'Request made successfully'});
            console.log('Received friend request');
        }).catch((error) => {
            res.status(401).json({error: 'Error sending request'});
        })
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

    await Friendships.findAll({
        where: {
            username: username,
            status: "Completed",
        }
    }).then(async friends => {
        const userFriends = [];
        userFriends.push(username)
        for (let i = 0; i < friends.length; i++) {
            userFriends.push(friends[i].friend);
        }
        await FeedMessages.findAll({
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

app.post('/request-pfp-url', async (req, res) =>{
    const {username} = req.body;
    findUser(username, '', 'search').then(async user => {
        let url = user.profilePicture
        res.status(200).json({url});
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
    await Messages.findAll({
        where: {
            username: {[Op.in]:userFriends},
            friend: {[Op.in]:userFriends}},
        order: [['createdAt', 'DESC']]
    }).then(async chat => {
        res.status(200).json({chat});
    })
})

app.post('/request-unreads', async (req, res) =>{
    const token = req.url.split('?token=')[1];
    if (!token) {
        console.log('request-rejected')
        res.status(401);
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const { username } = decoded;
    await Unreads.findAll({
        where: {
            username: username}
    }).then(async unreads => {
        res.status(200).json({unreads});
    })
})

app.post('/read-friend', async (req, res) =>{
    const {friend} = req.body;
    const token = req.url.split('?token=')[1];
    if (!token) {
        console.log('request-rejected')
        res.status(401);
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const { username } = decoded;
    await Unreads.destroy({
        where: {
            username: username,
            friend: friend}
    }).then(async unreads => {
        res.status(200).json({message: 'Messages read correctly'});
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
                        profilePicture: '/uploads/default_pfp.png'
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


app.post('/feed-message', upload.single('image'), (req, res) => {
    const message = req.body.text;
    const token = req.url.split('?token=')[1];
    if (!token) {
        // If there is no JWT token, close the WebSocket connection
        console.log('message rejected')
        return;
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const { username } = decoded;
    const {text} = req.body;
    sequelize.sync({force: false}).then(() => {
        if (req.file !== undefined) {
            const {filename, mimetype} = req.file;
            Images.create({
                filename,
                url: `/uploads/${filename}`,
                mimetype,
            })
            FeedMessages.create({
                username: username,
                message: text,
                imageFilename: filename,
            }).then((user) => {
                console.log('Feed created successfully:', user.toJSON());
                res.status(200);
                console.log('Received feed message: ' + message + ' from ' + username)
            }).catch((error) => {
                console.log('Error creating feed message: ', error);
                res.status(401).json({error: 'Error creating feed message'});
            })
        }
        else {
            FeedMessages.create({
                username: username,
                message: text,
            }).then((user) => {
                console.log('Feed created successfully:', user.toJSON());
                res.status(200);
                console.log('Received feed message: ' + message + ' from ' + username)
            }).catch((error) => {
                console.log('Error creating feed message: ', error);
                res.status(401).json({error: 'Error creating feed message'});
            })
        }
    })
})

app.post('/send-message', upload.single('image'), (req, res) => {
    const text = req.body.text;
    const friend = req.body.friend;
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
        if (req.file !== undefined) {
            const {filename, mimetype} = req.file;
            Images.create({
                filename,
                url: `/uploads/${filename}`,
                mimetype,
            })

            Messages.create({
                username: username,
                friend: friend,
                message: text,
                imageFilename: filename,
            }).then((user) => {
                io.to(friend).emit('message', { from: username, text, filename });
                Unreads.findOrCreate({
                    where:{
                        username: friend,
                        friend: username
                    },
                    defaults: { // set the default properties if it doesn't exist
                        username: friend,
                        friend: username
                    }
                }).then(result => {
                    res.status(200).json({message: 'Message sent succesfully'});
                })
            }).catch((error) => {
                console.log('Error creating message: ', error);
                res.status(401).json({error: 'Error creating message'});
            })
        }
        else {
            Messages.create({
                username: username,
                friend: friend,
                message: text,
            }).then((user) => {
                io.to(friend).emit('message', { from: username, text });
                Unreads.findOrCreate({
                    where:{
                        username: friend,
                        friend: username
                    },
                    defaults: { // set the default properties if it doesn't exist
                        username: friend,
                        friend: username
                    }
                }).then(result => {
                    res.status(200).json({message: 'Message sent succesfully'});
                })
            }).catch((error) => {
                console.log('Error creating message: ', error);
                res.status(401).json({error: 'Error creating message'});
            })
        }

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
                res.status(200).json({message: 'Status updated successfully'});
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
// Handle POST request to /api/images
app.post('/api/images', upload.single('image'), (req, res) => {
    const { filename, mimetype } = req.file;
    const { username } = req.body;

    // Create new Image record in database
    Images.destroy({
        where: {username: username}
    }).then(result =>{
        Images.create({
            filename,
            url: `/uploads/${filename}`,
            mimetype,
            username
        }).then(image => {
            res.status(200).json({ url: image.url })
            User.update(
                {profilePicture: image.url},
                {where: {username: username}})
        })
    })
});

// Start the server and listen for WebSocket connections
server.listen(3000, '0.0.0.0', () => {
    console.log(`Server started on port ${3000}`);
});

// Handle WebSocket connections
io.on('connection', (socket) => {
    // Get the username from the socket query parameters
    const { username } = socket.handshake.query;

    // Join a room named after the username
    socket.join(username);

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`${username} disconnected`);
    });
});
