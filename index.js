//https://discordapp.com/oauth2/authorize?client_id=592415543236100111&scope=bot&permissions=68608
require('dotenv').config()
const Discord = require('discord.js');
const client = new Discord.Client();
const Database = require('better-sqlite3');
const db = new Database('deaths.db', { verbose: console.log });


//Once ready, notify that we're ready.
client.once('ready', () => {
    console.log("Things are about to get messy.");
});

//Login with token
client.login(process.env.TOKEN);

// The main loop
client.on('message', async msg => {
    // If it's not the bot check is it's someone's time.
    if(msg.author.username !== 'Uncivilized Bot') {
        let itsTime = await checkCount();
        if (itsTime) {
            let method = await getDeath();
            msg.channel.send(msg.author + ' ' + method);
        }
    }
});


// Function to check the count
checkCount = async () => {
    let count = await getCount();
    count = count - 1;
    if(count < 1) {
        updateCount(Math.round(Math.random() * 13 + 7));
        return true
    } else {
        updateCount(count);
        return false
    }
};

getCount = async () => {
    let row = await db.prepare('SELECT * FROM count LIMIT 1').get();
    return row.count;
};

updateCount = async (count) => {
    let stmnt = db.prepare('UPDATE count SET count=?');
    stmnt.run(count);
};

// Function to get a random method if it's your time
getDeath = async () => {
    let row = await db.prepare('SELECT * FROM deaths ORDER BY RANDOM() LIMIT 1').get();
    return row.method;
};
