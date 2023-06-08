const axios = require('axios');
const { config } = require('dotenv');
config()

const url = 'https://api.elevenlabs.io/v1/models';

const headers = {
    Accept: 'application/json',
    'xi-api-key': process.env.ELEVEN_LABS_API_KEY,
};

axios
    .get(url, { headers })
    .then((response) => {
        console.log(response.data);
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });