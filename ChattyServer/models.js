const { Sequelize, DataTypes } = require('sequelize');
const key = "Wonder4liceChattyKey";


const sequelize = new Sequelize(
    'ChattyDB',
    'root',
    'root',
    {
        host: 'localhost',
        port: 6033,
        dialect: 'mysql'
    }
);
module.exports = sequelize;

sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});

const User = sequelize.define('User', {
    // Model attributes are defined here
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
        // allowNull defaults to true
    }
}, {
    // Other model options go here
});


module.exports = {
    User,
    sequelize,
};

//const decrypted = CryptoJS.AES.decrypt(encrypted, key);
