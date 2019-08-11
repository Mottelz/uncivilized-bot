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
    if(!msg.author.bot) {

        let itsTime = await checkCount();

        if (itsTime) {
            increaseUserDeathCount(msg.author.id);
            let method = await getDeath();
            msg.channel.send(msg.author + ' ' + method);
        }

        if(msg.content === 'How many times?') {
            let myDeathCount = await getUserDeathCount(msg.author.id);
            if (myDeathCount < 1) {
                msg.channel.send('We have no record of ' + msg.author + "'s death.");
            } else {
                msg.channel.send(msg.author + ' has died ' + myDeathCount + ' times.');
            }
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

increaseUserDeathCount = async (id) => {
    //check if author already died
    let row = await db.prepare('SELECT * FROM death_count WHERE id=? LIMIT 1').get(id);
    //If they haven't add them to the db
    if(!row) {
        let stmnt = await db.prepare('INSERT INTO death_count(count, id) VALUES(?, ?)');
        stmnt.run(1, id);
    } else {
        count = row.count + 1;
        //If they already died, increase the death count
        let stmnt = db.prepare('UPDATE death_count SET count=? WHERE id=?');
        stmnt.run(count, id);
    }
};

getUserDeathCount = async(id) => {
    let row = await db.prepare('SELECT * FROM death_count WHERE id=? LIMIT 1').get(id);
    if (row) {
        return row.count;
    } else {
        return 0;
    }
};
