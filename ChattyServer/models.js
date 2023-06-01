const { Sequelize, DataTypes } = require('sequelize');
const key = "Wonder4liceChattyKey";


const sequelize = new Sequelize(
    'ChattyDB',
    'root',
    'Wonder4lice',
    {
        host: '34.175.215.82',
        dialect: 'mysql',
        dialectOptions: {
            dateStrings: true,
            typeCast: true,
            timezone: "+02:00"
        },
        timezone: "+02:00", //for writing to database
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
    },
    profilePicture: {
        type: DataTypes.STRING,
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
    },
    status:{
        type: DataTypes.STRING,
        allowNull: false
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
    },
    imageFilename: {
        type: DataTypes.STRING,
    }
}, {
    // Other model options go here
});

const Unreads = sequelize.define('Unreads', {
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
    },
    imageFilename: {
        type: DataTypes.STRING,
    }
}, {
    // Other model options go here
});

const Images = sequelize.define('Images', {
    filename: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    url:{
        type: DataTypes.STRING,
        allowNull: false
    },
    mimetype: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    username:{
        type: DataTypes.STRING,
    }
}, {
    // Other model options go here
});

module.exports = {
    User,
    FeedMessages,
    Messages,
    Images,
    Friendships,
    Unreads,
    sequelize,
};
//sequelize.sync({force: true})

