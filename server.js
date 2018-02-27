const express = require('express') 
const bodyParser = require('body-parser')
const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
const fs = require('fs');
const apiKey = require('./apiKey.js');
const { password, username } = apiKey;
const app = express()();
const server = require('http').createServer(app)
const io = require('socket.io')(server);

const speechToText = new SpeechToTextV1({
  username: username,
  password: password,
});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


app.use(function(request, response, next) {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', async (request, response, next) => {
  response.send('hello world')
});

const params = {
  audio: fs.createReadStream('audio-file-3.flac'),
  content_type: 'audio/flac',
  timestamps: true,
  word_confidence: true,
  // word_alternatives_threshold: 0.9,
  // keywords: ['colorado', 'tornado', 'tornadoes'],
  // keywords_threshold: 0.5
}

app.post('/checkAudioText', async (request, response, next) => {

  console.log('request:', request.body)
  await speechToText.recognize(params, function(error, transcript) {
    if (error) {
      console.log('Error:', error);
    } else {
      console.log('here i am take 2!')
      console.log(JSON.stringify(transcript.results, null, 2));
    }
  });

})


io.on('connection', (socket) => {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', (data) => {
    console.log(data)
  })
})

server.listen(5000, () => {
  console.log('express running localhost5000')
})




