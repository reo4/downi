var express = require('express');
var path = require('path');
var bodyParser = require('body-parser')
const https = require('https');
const ytdl = require('ytdl-core');

app = express()

app.use('/assets', express.static(path.join(__dirname, './assets')))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());



app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './index.html'))
})



app.get('/download', (req, res) => {
  let url = req.query.url
  const request = https.get(url, readable => {

    readable.on('', () => {
      res.download(readable)
    })
  })
})

app.post('/get-video-info', (req, res) => {
  let url = req.body.url
  ytdl.getInfo(url).then((info) => {
    let videos = ytdl.filterFormats(info.formats, 'videoandaudio');
    let audios = ytdl.filterFormats(info.formats, 'audioonly');

    res.send({ videos, audios, videoDetails: info.videoDetails })
  })

})




var port = process.env.PORT || 5000
app.listen(port)
console.log('server started ' + port)
