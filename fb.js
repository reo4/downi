const fs = require('fs');

const download = (name, url) => {
  if (!fs.existsSync('fb video')) {
    fs.mkdirSync('fb video');
  }
  console.log('[+] Downloading File . . .')
  name = name.replace(/[\\/:"*?<>|]/g, '')
  let file = fs.createWriteStream('fb video/' + name);
  return new Promise((resolve, reject) => {
    request({
      uri: url,
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
      },
      gzip: true,
      rejectUnauthorized: false
    })
      .pipe(file)
      .on('finish', () => {
        console.log('\x1b[32m%s\x1b[0m', `[+] Download Success : ${name}`);
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      })
  })
    .catch(error => {
      console.log(`Something happened: ${error}`);
    });
}

const getFbVideoInfo = (url) => {

}

module.exports = getFbVideoInfo