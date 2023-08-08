let downloadBtn = $('#download-btn')
let loadingIcon = $('.loading')
let downloadIcon = $('.fa-download')

const toggleLoadingState = () => {
  loadingIcon.toggle()
  downloadIcon.toggle()
}

const getVideoInfo = () => {

  toggleLoadingState()

  let url = $('#url-input').val()

  $.post('/get-video-info', { url }).then(({ videos, audios, videoDetails }) => {

    toggleLoadingState()

    let { thumbnails } = videoDetails
    let thumbnail = thumbnails[thumbnails.length - 1].url
    let audio = audios[0]

    $('#video-download').addClass('show')

    $('#video-download .img-box').css('background-image', `url(${thumbnail})`)
    $('#video-title').html(videoDetails.title)

    $('#video-download .formats-box .quality-btn').remove()
    videos.forEach(video => {
      $('#video-download .formats-box').append(`
        <a href="${video.url}" class="quality-btn" download target="_blank">
          <i class="fa-solid fa-photo-film"></i>
          ${video.qualityLabel}
        </a>
      `)
    })
    $('#video-download .formats-box').append(`
      <a href="${audio.url}" class="quality-btn" download target="_blank">
        <i class="fa-solid fa-music"></i>
        Audio
      </a>
    `)
  })
}

downloadBtn.on('click', () => {
  getVideoInfo()
})

let clearBtn = $('#clear-btn')
let input = $('#url-input')

input.on('input', e => {
  if (input.val()) {
    clearBtn.show()
  }
  else {
    clearBtn.hide()
  }
})

input.on('keypress', e => {
  if (e.which == 13) {
    getVideoInfo()
  }
})

clearBtn.on('click', e => {
  input.val('')
  clearBtn.hide()
})

// $('#video-download .formats-box').on('click', '.quality-btn', (e) => {
//   let url = $(e.target).attr('url')
//   $.get(`/download?url=${url}`)
// })