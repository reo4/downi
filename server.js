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

app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname, './privacy.html'))
})

app.get('/about-us', (req, res) => {
  res.sendFile(path.join(__dirname, './about-us.html'))
})
app.get('/terms-of-use', (req, res) => {
  res.sendFile(path.join(__dirname, './terms-of-use.html'))
})
app.get('/contact-us', (req, res) => {
  res.sendFile(path.join(__dirname, './contact-us.html'))
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
  if (ytdl.validateURL(url)) {
    ytdl.getInfo(url).then((info) => {
      let videos = ytdl.filterFormats(info.formats, 'videoandaudio');
      let audios = ytdl.filterFormats(info.formats, 'audioonly');

      res.send({ videos, audios, videoDetails: info.videoDetails })
    })
  }
  else {
    res.status(404).send('Link is invalid')
  }

})




var port = process.env.PORT || 5000
app.listen(port)
console.log('server started ' + port)
