const express = require('express');
const axios = require('axios');
const fs = require('fs');
const { config } = require('dotenv');
const openaiRoutes = require('./routes/openai');

config();

const app = express();
const port = 3000;
const CHUNK_SIZE = 1024;
const url = 'https://api.elevenlabs.io/v1/text-to-speech/VR6AewLTigWG4xSOukaG';

const headers = {
    Accept: 'audio/mpeg',
    'Content-Type': 'application/json',
    'xi-api-key': process.env.ELEVEN_LABS_API_KEY,
};

// Simple request logging
app.use((req, res, next) => {
    console.log(`Request received: ${req.method}: ${req.path}`)
    next()
})

// OpenAI Required Routes
app.use(openaiRoutes);

app.post('/generate-audio', (req, res) => {
    const text = req.body.text;
    const data = {
        text: text,
        model_id: 'eleven_multilingual_v1',
        voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
        },
    };

    axios
        .post(url, data, {
            headers: headers,
            responseType: 'stream',
        })
        .then((response) => {
            const fileName = `${Date.now()}.mp3`;
            const filePath = `audio/${fileName}`;
            const fileStream = fs.createWriteStream(filePath);

            response.data.pipe(fileStream);
            response.data.on('end', () => {
                console.log('Archivo de audio generado correctamente.');

                const downloadLink = `http://localhost:${port}/download/${fileName}`;
                res.json({ downloadLink });
            });
        })
        .catch((error) => {
            console.error('Error al realizar la solicitud:', error.message);
            res.status(500).json({ error: 'Error al generar el audio.' });
        });
});

app.get('/download/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = `audio/${fileName}`;
    res.download(filePath, (err) => {
        if (err) {
            console.error('Error al descargar el archivo:', err.message);
            res.status(500).json({ error: 'Error al descargar el archivo.' });
        } else {
            console.log('Archivo descargado correctamente.');
            fs.unlinkSync(filePath);
        }
    });
});

app.get('/', (req, res) => {
    console.log('Solicitud GET recibida en la raíz del servidor');
    res.send('¡Hola desde el servidor!');
});

app.listen(port, () => {
    console.log(`Servidor web iniciado en el puerto ${port}`);
});