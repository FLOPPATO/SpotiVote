const express = require('express');
const axios = require('axios');
require('dotenv').config();
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
const authController = require('./authHandler.js');
const authMiddleware = require('./middleware/authMiddleW.js');
const { connection }= require('./connection.js');


const port = process.env.PORT || 6969;
const ID = process.env.CLIENT_ID || null;
const SECRET = process.env.CLIENT_SECRET || null;

let token = {token : null , expire : null};



async function TOKEN(FORCENEW = false) {
    try {
        if(!ID || !SECRET){
            throw new Error("no spotify credentials (FIX IN .env)");
        }

        const TIME = Date.now();
        if(FORCENEW || token.token == null || TIME >= token.expire){

            const response = await axios.post('https://accounts.spotify.com/api/token', 
                new URLSearchParams({ grant_type: 'client_credentials' }).toString(), {
                headers: {
                    'Authorization': `Basic ${Buffer.from(ID + ':' + SECRET).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });
    
            token = {
                token: response.data.access_token,
                expire: TIME + (response.data.expires_in * 1000)
            };
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
        console.error(error);
        res.status(500).send('ERR');
    }
});

app.post('/vote', authMiddleware.protect,  async (req, res) => {  //IMPLEMENTARE FRONTEND 🙏💀
                                                                  //error handling trovare modo
                                                                  //(manda il json nella catch)
    try{
        const user = req.user.id;
        const songID = req.body.id;

        console.log(user+""+songID);

        const token = await TOKEN();

        console.log('Vote received for track:', songID, "by", user);

        connection.query(
			"SELECT * FROM users u JOIN votes v on v.user = u.user WHERE u.user = ?;",
			[user],
			(err,result) => {
			if(err) throw err;
            if(result) { 
                if(result.length == 0){
                    connection.query(
                        "INSERT INTO `votes` (`user`, `idsong`) VALUES (?, ?);",
                        [user, songID],
                        (err,result) => {
                        if(err) throw err;
                    });
                    console.log('Vote confirmed for track:', songID, "by", user);
                    res.json({
                        success : 1,
                        message: 'Voted successfully',
                        track: songID
                    });
                }
                else {
                    console.log('Vote deleted for track:', result[0].idsong, "by", user);
                    axios.get(`https://api.spotify.com/v1/tracks/${result[0].idsong}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    .then(response => {
                        const name = response.data.name;
                        res.json({
                            success : 0,
                            message: 'Already voted',
                            track: songID,
                            name: name
                        });
                    });
                }
            }
		});



    } catch (error) {
        console.error(error);
        res.status(500).send('ERR');
    }
});

app.post('/register', authController.register);
app.post('/login', authController.login);



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/html', 'index.html'));
});

app.get('/api/votes', async (req, res) => {
    try {
        connection.query(
            `SELECT idsong AS track_id, COUNT(*) AS votes
             FROM votes
             GROUP BY idsong`,
            (err, results) => {
                if (err) {
                    console.error('DB error:', err);
                    return res.status(500).json({ error: 'Database query failed' });
                }
                res.json(results);
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Unexpected server error' });
    }
});

app.get('/track/:id', async (req, res) => {
  try {
    const tokenVal = await TOKEN();
    const trackId = req.params.id;

    const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        Authorization: `Bearer ${tokenVal}`
      }
    });

    res.json({
      id: trackId,
      name: response.data.name
    });

  } catch (err) {
    console.error('Failed to fetch track:', err);
    res.status(500).json({ name: 'Unknown' });
  }
});


app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
