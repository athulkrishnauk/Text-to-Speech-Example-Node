const express = require('express');
const bodyparser = require('body-parser');

const app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.set('view engine','ejs');

app.get('/', (req, res) =>{
    res.render('index');
});

// Text to speech function
app.post('/', async (req, res) => {

    process.env.GOOGLE_APPLICATION_CREDENTIALS = './textTospeech.json'

    var text = req.body.text;

    const textToSpeech = require('@google-cloud/text-to-speech');
    const fs = require('fs');
    const util = require('util');
    var uniqid = require('uniqid'); 

    console.log(uniqid());

    const client = new textToSpeech.TextToSpeechClient();

    const request = {
        input: {text: text},
        voice: { languageCode: "ml-IN", name: "ml-IN-Wavenet-B" },
        audioConfig: { pitch: 4, speakingRate: 1, audioEncoding: 'MP3' },
    };

    const [response] = await client.synthesizeSpeech(request);
    const writeFile = util.promisify(fs.writeFile);
    // Store the audio file to asset folder
    const fileName = 'assets/'+uniqid()+'.wav';
    await writeFile(fileName, response.audioContent, 'binary');
    console.log('Audio content written to file: '+fileName);

    // Download audio file
    res.download(fileName);
});

app.listen(5000, function() {
    console.log("Server is live on port 5000");
});