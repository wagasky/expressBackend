const express = require('express') 
const bodyParser = require('body-parser')
const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
const fs = require('fs');
const apiKey = require('./apiKey.js');
const { password, username } = apiKey;
const app = express();
const http = require('http')
const socketIO = require('socket.io')
const server = http.createServer(app)
const io = socketIO(server);
const ss = require('socket.io-stream');
const L16 = require('./webaudio-l16-stream');
const inspect = require('inspect-stream');
const port = 5000

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

// app.get('/', async (request, response, next) => {
//   response.send('hello world')
// });

const params = {
  audio: fs.createReadStream('audio-file-3.flac'),
  content_type: 'audio/flac',
  timestamps: true,
  word_confidence: true,
  // word_alternatives_threshold: 0.9,
  // keywords: ['colorado', 'tornado', 'tornadoes'],
  // keywords_threshold: 0.5
}

const recognizeStream = app.post('/checkAudioText', async (request, response, next) => {

  console.log('request:', request.body)
  await speechToText.recognize({
    audio: fs.createReadStream('audio-file-3.flac'),
    content_type: 'audio/wav',
    timestamps: true,
    word_confidence: true,
  }, function(error, transcript) {
    if (error) {
      console.log('Error:', error);
    } else {
      console.log('here i am!')
      console.log(JSON.stringify(transcript.results, null, 2));
    }
  });
})

const l16Stream = new L16({ writableObjectMode: false });

io.on('connection', (socket) => {
  console.log('something')

  ss(socket).on('audio', (stream) => {
    console.log('audio stream')
    stream.pipe(l16Stream).pipe(inspect()).pipe(recognizeStream)
  })
})

// erroring out at l16Stream

server.listen(port, () => {
  console.log(`express running port ${port}`)
})



