function escapeHtml (unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function unescapeHtml (safe) {
  return safe
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
}

function nl2br (nlStr) {
  return nlStr.replace(/\n/g, "<br/>")
}

const imageToDescriptionHTML = (image) =>
  `<p>${escapeHtml(nl2br(image.description))}<a href="${image.src}">Open in a New Tab</a></p>
    <p>Taken in: ${escapeHtml(nl2br(image.location))}, ${escapeHtml(nl2br(image.state))} ${escapeHtml(nl2br(image.country))}, ${image.yearTaken}</p>`

function imageToEscapedDescriptionHTML (image) {
  return escapeHtml(imageToDescriptionHTML(image))
}


const imageToColorBoxHTML = (image) =>
  `<a href="${image.srcUrl}" class="photo" data-escaped-description="${imageToEscapedDescriptionHTML(image)}">
      <img src="${image.srcUrl}" alt="${escapeHtml(image.description)}">
    </a>`

const imageToSearchItemHTML = (image) =>
  `<li>
    <a href="${image.srcUrl}" class="photo" data-escaped-description="${imageToEscapedDescriptionHTML(image)}">
      <img src="${image.srcUrl}" alt="${escapeHtml(image.description)}">
    </a>
    ${escapeHtml(image.description)}<br/>${escapeHtml(nl2br(image.location))}, ${escapeHtml(nl2br(image.state))} ${escapeHtml(nl2br(image.country))}, ${image.yearTaken}
   </li>`

function displayAllImage (imageList) {
  const photoHTML = imageList.map(imageToColorBoxHTML).join('\n')

  const allPhotosView = $('#all-photos')

  // put in the html
  allPhotosView.html(photoHTML)

  // initialize color box
  allPhotosView.find('.photo').colorbox({
    rel: 'photo', transition: 'elastic', height: '75%',
    title: function () {
      return unescapeHtml($(this).data('escaped-description'))
    }
  })
}

function populateSearchView (imageList) {
  const photoHTML = imageList.map(imageToSearchItemHTML).join('\n')

  // put in the html
  $('#search-photos').html(photoHTML)

  // initialize color box
  $("#search-field").hideseek({
    highlight: true,
    nodata: "no result found",
    ignore_accents: true
  })

  // initialize color box
  $("#search-photos").find('.photo').colorbox({
    rel: 'photo', transition: 'elastic', height: '75%',
    title: function () {
      return unescapeHtml($(this).data('escaped-description'))
    }
  })


}


function handleLoginResponse (responseObj) {

  if (responseObj.success === false)
    $('#login-error').val('wrong username or password')

  else if (responseObj.success === true) {
    // plug the information into the page
    displayAllImage(responseObj.imageList)
    populateSearchView(responseObj.imageList)
    $('#login-name').html(responseObj.username)

    // switch to the fotofun page
    $('#login-page').css({'display': 'none'})
    $('#fotofan-page').css({'display': 'block'})
    $('#search-field').attr({'disabled': false})
    $('#upload-button').attr({'disabled': false})
  }

  else {
    $('#login-error').val('server send a invalid response, Please contact support')
  }
}

async function login () {
  // get the login information
  const username = $('#username').val()
  const password = $('#password').val()

  // check for basic errors
  if (username === '') {
    $('#login-error').html('username cannot be empty')
    return
  }
  else if (password === '') {
    $('#login-error').html('password cannot be empty')
    return
  }

  // get the response
  const response = await $.ajax(`login.php?username=${username}&password=${password}`)

  // display the response
  handleLoginResponse(JSON.parse(response))
}

function toggleSearch() {
  const keyword = $("#search-field").val()

  if (keyword === "") {
    // display all photos
    $("#search-photos").css({"display": "none"})
    $("#all-photos").css({"display": "block"})
  }
  else {
    // enter search mode
    $("#search-photos").css({"display": "block"})
    $("#all-photos").css({"display": "none"})
  }
}

$(() => {

  // register event for the login button
  $('#login-button').click(login)

  $("#search-field").hideseek({
    highlight: true,
    nodata: "no result found",
    ignore_accents: true
  })

  $('#search-field').keyup(toggleSearch)
})
