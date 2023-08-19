var express = require('express');
var path = require('path');
var bodyParser = require('body-parser')
const ytdl = require('ytdl-core');
const puppeteer = require('puppeteer');
var userAgents = require('user-agents')
const cheerio = require('cheerio')
const axios = require('axios');
const urlParser = require('url')


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

app.post('/get-video-info', async (req, res) => {
  let url = req.body.url

  if (!url.length) {
    return res.status(404).send('Link is Invalid')
  }

  let hostname = urlParser.parse(url, true).hostname

  console.log(hostname)

  // tiktok
  if (hostname === 'www.tiktok.com' || hostname === 'vm.tiktok.com') {
    try {
      const browser = await puppeteer.launch({ headless: true, waitForInitialPage: false })
      const page = await browser.newPage();

      const userAgent = new userAgents()

      await page.setUserAgent(userAgent.toString())

      await page.goto('https://savetik.co/en')


      await page.waitForSelector('input#s_input')

      await page.type('input#s_input', url);

      const searchResultSelector = '#search-form button';

      await page.waitForSelector(searchResultSelector);

      await page.click(searchResultSelector);

      const thumbnail = await page.waitForSelector(
        '#search-result .thumbnail img'
      );
      const thumbnailUrl = await thumbnail?.evaluate(el => el.getAttribute('src'));

      let videoUrl;


      if (await page.$('#ConvertToVideo')) {

        const convertBtn = await page.$('#ConvertToVideo')

        await page.click('#ConvertToVideo')

        await page.waitForSelector('#ConvertToVideo i.icon-download')

        videoUrl = await convertBtn?.evaluate(el => el.getAttribute('href'));

      }
      else {
        const video = await page.waitForSelector('#search-result .dl-action a');

        videoUrl = await video?.evaluate(el => el.getAttribute('href'));
      }

      const titleS = await page.waitForSelector(
        '#search-result .content h3'
      );

      const title = await titleS?.evaluate(el => el.innerHTML);

      await browser.close();

      return res.send({
        videos: [{ url: videoUrl, qualityLabel: 'mp4' }],
        videoDetails: {
          title,
          thumbnails: [{ url: thumbnailUrl }]
        }
      })

    } catch (error) {
      console.log(error)
      return res.status(404).send('Link is Invalid')
    }
  }

  if (hostname === 'www.instagram.com') {

    try {
      const browser = await puppeteer.launch()
      const page = await browser.newPage();

      await page.setUserAgent(`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36`)

      await page.goto('https://snapinsta.app/')

      await page.waitForSelector('input[name="url"]')

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

      await browser.close();

      return res.send({
        videos: [{ url: videoUrl, qualityLabel: 'mp4' }],
        videoDetails: {
          title: '',
          thumbnails: [{ url: thumbnailUrl }]
        }
      })

    } catch (error) {
      console.log(error)
      return res.status(404).send('Link is Invalid')
    }

  }

  if (ytdl.validateURL(url)) {
    ytdl.getInfo(url).then((info) => {
      let videos = ytdl.filterFormats(info.formats, 'videoandaudio');
      let audios = ytdl.filterFormats(info.formats, 'audioonly');

      res.send({ videos, audios, videoDetails: info.videoDetails })
    })
  }
  else {
    axios.post('https://www.getfvid.com/downloader', { url }).then(async function (response) {

      const $ = cheerio.load(response.data)

      let title = $('.card-title a').html()

      if (title) {

        title = title.split('app-').shift()

        const backgroundImg = $('.img-video').css('background-image')

        const matchBetweenParentheses = /\(([^)]+)\)/;

        const thumbnail = backgroundImg.match(matchBetweenParentheses)[1]

        const rgx = /<a href="(.+?)" target="_blank" class="btn btn-download"(.+?)>(.+?)<\/a>/g
        let arr = [...response.data.matchAll(rgx)]
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
        throw new Error()
      }
    }).catch(async err => {

      try {
        console.log('here')
        const browser = await puppeteer.launch()
        const page = await browser.newPage();

        await page.setUserAgent(`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36`)

        await page.goto('https://fdownloader.net/en')

        await page.waitForSelector('input#s_input')

        await page.type('input#s_input', url);

        const searchResultSelector = '#search-form button';

        await page.waitForSelector(searchResultSelector);

        await page.click(searchResultSelector);

        const thumbnail = await page.waitForSelector(
          '#search-result .image-fb img'
        );
        const thumbnailUrl = await thumbnail?.evaluate(el => el.getAttribute('src'));

        const video = await page.waitForSelector(
          '#fbdownloader a.download-link-fb'
        );

        const videoUrl = await video?.evaluate(el => el.getAttribute('href'));

        await browser.close();

        return res.send({
          videos: [{ url: videoUrl, qualityLabel: 'mp4' }],
          videoDetails: {
            title: '',
            thumbnails: [{ url: thumbnailUrl }]
          }
        })

      } catch (error) {
        console.log(error)
        return res.status(404).send('Link is Invalid')
      }
    })
  }

})




var port = process.env.PORT || 5000
app.listen(port)
console.log('server started ' + port)