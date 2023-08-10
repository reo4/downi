var express = require('express');
var path = require('path');
var bodyParser = require('body-parser')
const request = require('request');
const fs = require('fs');
const ytdl = require('ytdl-core');
const cheerio = require('cheerio')

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

app.post('/get-video-info', (req, res) => {
  // youtube
  let url = req.body.url
  if (ytdl.validateURL(url)) {
    ytdl.getInfo(url).then((info) => {
      let videos = ytdl.filterFormats(info.formats, 'videoandaudio');
      let audios = ytdl.filterFormats(info.formats, 'audioonly');

      res.send({ videos, audios, videoDetails: info.videoDetails })
    })
  }
  else {
    // fb
    let options = {
      'method': 'POST',
      'url': 'https://www.getfvid.com/downloader',
      formData: {
        url
      }
    };

    request(options, function (error, response) {
      const $ = cheerio.load(response.body)
      let title = $('.card-title a').html()
      if (!error && title) {

        title = title.split('app-').shift()

        const backgroundImg = $('.img-video').css('background-image')

        const matchBetweenParentheses = /\(([^)]+)\)/;

        const thumbnail = backgroundImg.match(matchBetweenParentheses)[1]

        const rgx = /<a href="(.+?)" target="_blank" class="btn btn-download"(.+?)>(.+?)<\/a>/g
        let arr = [...response.body.matchAll(rgx)]
        let videos = [];

        arr.map((item, i) => {
          if (i == 0) {
            if (item[3].match('<strong>HD</strong>')) {
              item[3] = "Download in HD Quality"
            }
          }
          videos.push({
            qualityLabel: item[3],
            url: item[1].replace(/amp;/gi, '')
          })
        })

        res.send({ videos, videoDetails: { title, thumbnails: [{ url: thumbnail }] } })

      }
      else {
        res.status(404).send('Link is invalid')
      }

    });
  }
})




var port = process.env.PORT || 5000
app.listen(port)
console.log('server started ' + port)