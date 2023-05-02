const { Sequelize, DataTypes } = require('sequelize');
const key = "Wonder4liceChattyKey";


const sequelize = new Sequelize(
    'ChattyDB',
    'root',
    'root',
    {
        host: 'localhost',
        port: 6033,
        dialect: 'mysql',
        dialectOptions: {
            // useUTC: false, //for reading from database
            dateStrings: true,
            typeCast: true,
            timezone: "+02:00"
        },
        timezone: "+02:00", //for writing to database
        operatorsAliases: false
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
    },
    status: {
        type: DataTypes.STRING,
        // allowNull defaults to true
    }
}, {
    // Other model options go here
});

const Friendships = sequelize.define('Friendships', {
    // Model attributes are defined here
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    friend: {
        type: DataTypes.STRING,
        allowNull: false
        // allowNull defaults to true
    }
}, {
    // Other model options go here
});

const FeedMessages = sequelize.define('FeedMessages', {
    // Model attributes are defined here
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false
        // allowNull defaults to true
    }
}, {
    // Other model options go here
});

const Messages = sequelize.define('Messages', {
    // Model attributes are defined here
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    friend:{
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false
        // allowNull defaults to true
    }
}, {
    // Other model options go here
});

const ProfileImages = sequelize.define('ProfileImages', {
    filename: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mimetype: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    data: {
        type: DataTypes.BLOB('long'),
        allowNull: false,
    },
    username:{
        type: DataTypes.STRING,
        allowNull:false,
    }
}, {
    // Other model options go here
});

module.exports = {
    User,
    FeedMessages,
    Messages,
    ProfileImages,
    Friendships,
    sequelize,
};
//sequelize.sync({force: true})

