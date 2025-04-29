const express = require('express');
const axios = require('axios');
require('dotenv').config();
const path = require('path');
const mysql = require('mysql');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
const rateLimit = require('express-rate-limit');

const voteLimiter = rateLimit({
    rateLimitMS: 60 * 1000, 
    reqeustN: 1,
    message: "too many request"
});

const port = process.env.PORT || 6969;
const ID = process.env.CLIENT_ID || null;
const SECRET = process.env.CLIENT_SECRET || null;

let token = {token : null , expire : null};

const settings = {
    CLEARDB : process.env.CLEARDB,

}

var connection = mysql.createConnection({
	host : process.env.DBHOST,
	user : process.env.DBUSER,
	password : process.env.DBPWD
});

connection.connect((err) => {
    if(err) throw err;
    
    const TABLECREATE = `
        CREATE TABLE IF NOT EXISTS votes (
            VOTE_ID INT(11) NOT NULL AUTO_INCREMENT,
            cookie CHAR(36) NOT NULL,
            idsong CHAR(36) NOT NULL,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (VOTE_ID)
        )`;

    connection.query("CREATE DATABASE IF NOT EXISTS spotivote",function(err,result){
		if(err) throw err;
	});
	connection.query("USE spotivote",function(err,result){
		if(err) throw err;
	});
    connection.query(TABLECREATE, function(err, result) {
        if (err) throw err;
    });
    if(settings.CLEARDB.toUpperCase() == "TRUE"){
        connection.query("TRUNCATE TABLE votes", function(err, result) {
            if (err) throw err;
        });
    }

	console.log("connected to DB");
});

async function TOKEN(FORCENEW = false) {
    try {
        const TIME = Date.now();
        if(FORCENEW || token == null || TIME >= token.expire){

            const response = await axios.post('https://accounts.spotify.com/api/token', 
                new URLSearchParams({ grant_type: 'client_credentials' }).toString(), {
                headers: {
                    'Authorization': `Basic ${Buffer.from(ID + ':' + SECRET).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });
    
            token.token = response.data.access_token;
            token.expire = TIME + (response.data.expires_in * 1000);
        }
        return token.token;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

app.get('/search', async (req, res) => {
    const query = req.query.query;
    if (query == "") return res.status(400).send('EMPTY QUERY');

    try {
        const token = await TOKEN();

        const response = await axios.get('https://api.spotify.com/v1/search', {
            params: {
                q: query,
                type: 'track',
                limit: 10,
            },
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        res.json(response.data.tracks.items);
    } catch (error) {
		await TOKEN(true);
        console.error(error);
        res.status(500).send('ERR');
    }
});

app.post('/vote', voteLimiter, (req, res) => {
    try{
        const userid = req.get('UserID');
        const songID = req.body.id;

        console.log('Vote received for track:', songID, "by", userid);

        if (!/^[a-fA-F0-9]{36}$/.test(songID)) {
            console.log('Vote deleted for track:', songID, "by", userid);
            return res.status(400).send('wrong songID format');
        }
        
        if (!/^[a-fA-F0-9]{36}$/.test(userid)) {
            console.log('Vote deleted for track:', songID, "by", userid);
            return res.status(400).send('wrong userID format');
        }

        connection.query(
			"SELECT VOTE_ID FROM votes WHERE cookie = ?;",
			[userid],
			(err,result) => {
			if(err) throw err;
            if(result) { 
                if(result.length == 0){
                    connection.query(
                        "INSERT INTO `votes` (`cookie`, `idsong`) VALUES (?, ?);",
                        [userid, songID],
                        (err,result) => {
                        if(err) throw err;
                    });
                    console.log('Vote confirmed for track:', songID, "by", userid);
                    res.json({ message: 'Vote registered successfully', track: songID });
                }
                else {
                    console.log('Vote deleted for track:', songID, "by", userid);
                    res.json({ message: 'Already voted for', track: songID});
                }
            }
		});



    } catch (error) {
        console.error(error);
        res.status(500).send('ERR');
    }
});	

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html', 'index.html'));
});

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
