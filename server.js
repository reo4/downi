var express = require('express');
var path = require('path');
var bodyParser = require('body-parser')
const ytdl = require('ytdl-core');
const puppeteer = require('puppeteer')
var userAgent = require('user-agents')
const cheerio = require('cheerio')
const request = require('request');
const axios = require('axios');

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
    request(options, async function (error, response) {

      if (error) throw new Error(error);

      let private = response.body.match(/Uh-Oh! This video might be private and not publi/g)

      if (private) {
        res.status(404).send('This video might be private')
        return
      }

      const $ = cheerio.load(response.body)

      let title = $('.card-title a').html()

      if (title) {

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
        const browser = await puppeteer.launch()
        const page = await browser.newPage();

        await page.setUserAgent(userAgent.random().toString())

        await page.goto('https://snapinsta.app/')

        await page.setViewport({ width: 1080, height: 1024 });

        await page.waitForSelector('input[name="url"]', {
          timeout: 100000
        })

        await page.screenshot({ path: './assets/img/screenshot.png' })

        await page.type('input[name="url"]', url);

        const searchResultSelector = '#downloader button[type="submit"]';

        await page.waitForSelector(searchResultSelector);

        await page.click(searchResultSelector);

        const thumbnail = await page.waitForSelector(
          '#download .media-box img'
        );
        const thumbnailUrl = await thumbnail?.evaluate(el => el.getAttribute('src'));

        const video = await page.waitForSelector(
          'a[data-event="click_download_btn"]'
        );

        const videoUrl = await video?.evaluate(el => el.getAttribute('href'));
        console.log('The title of this blog post is "%s".', videoUrl);

        await browser.close();

        res.send({
          videos: [{ url: videoUrl, qualityLabel: 'mp4' }],
          videoDetails: {
            title: '',
            thumbnails: [{ url: thumbnailUrl }]
          }
        })
      }
    });
  }
})




var port = process.env.PORT || 5000
app.listen(port)
console.log('server started ' + port)