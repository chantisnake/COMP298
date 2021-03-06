/**
 * handle the basic errors before submission
 */
function loginSubmissionError () {
  // get the login information
  const username = $('#username').val()
  const password = $('#password').val()

  // check for basic errors
  // if there is anything wrong, just terminate
  if (username === '')
    return 'username cannot be empty'
  else if (password === '')
    return 'password cannot be empty'
  else
    return null
}

function getQueryStringValue (key) {
  return decodeURIComponent(window.location.search.replace(new RegExp('^(?:.*[&\\?]' + encodeURIComponent(key).replace(/[.+*]/g, '\\$&') + '(?:\\=([^&]*))?)?.*$', 'i'), '$1'))
}

/**
 * function to do the ajax call
 */
function doLoginAjax () {
  // get the login information
  const username = $('#username').val()
  const password = $('#password').val()

  // get the response
  $.ajax(`php/login.php?username=${username}&password=${password}`)

  // handles server response
    .done((response) => {
      const responseObj = JSON.parse(response)

      // if the server gives an error
      if (responseObj.success === false)
        $('#login-error').text(responseObj.error)

      else if (responseObj.success === true) {
        // get where do the user come from
        const from_url = getQueryStringValue('from')

        // if there is no from parameter set
        // go to the home page
        if (from_url === '')
          window.location.href = './index.html'
        else
          window.location.href = from_url
      }


      // server send invalid request
      else
        throw 'server send invalid respond'
    })

    // handle error during ajax requests
    .fail(() => $('#login-error').text('error encountered will login in'))
}

/**
 * handles the login to get the token
 * token will be automatically set in the cookie
 */
function getAuthenticateToken () {
  const loginError = $('#login-error')

  const error_message = loginSubmissionError()

  if (error_message === null) {
    doLoginAjax()
  }
  else {
    loginError.text(error_message)
  }

}

/**
 * pre login process
 * - validate the username
 * - change the avatar
 * - display the welcome message
 */
function preLogin () {
  const username = $('#username').val()

  $.ajax(`php/pre_login.php?username=${username}`)
    .done((response) => handlePareLoginResponse(JSON.parse(response)))
    .fail(() => $('#login-error').text('login failed, please try again later'))
}

/**
 * handles the pre login response
 * - validate the username
 * - change the avatar
 * - display the welcome message
 *
 * @param responseObj {object}: the ajax response
 */
function handlePareLoginResponse (responseObj) {
  if (responseObj.success === true) {
    // populate the greeting
    $('#login-name').text(responseObj.name)
    $('#login-avatar').attr('src', responseObj.avatar)
    // display the greeting
    $('#greeting-placeholder').css('display', 'none')
    $('#greet-user').css('display', 'block')
  }
  else {
    $('#greeting-placeholder').css('display', 'block')
    $('#greet-user').css('display', 'none')
  }
}

/**
 * This function clears the greeting to user
 */
function clearGreeting () {
  $('#greeting-placeholder').css('display', 'block')
  $('#greet-user').css('display', 'none')
}

/**
 * This function clears the greeting to user
 */
function clearError () {
  $('#login-error').text('')
}

/**
 * this function handles the functionality
 * to press enter to login on the form
 */
function userEnterToLogin (keyupEvent) {
  const keyCode = keyupEvent.which
  if (keyCode === 32 || keyCode === 13 || keyCode === 188 || keyCode === 186) {
    getAuthenticateToken()
  }
}

$(() => {
  // pre display the greeting
  $('#username')
    .focusout(preLogin)
    .keyup(clearGreeting)

  // clear the error message when user do any input
  $('#login-form')
    .keyup(userEnterToLogin)
    .find('input').keyup(clearError)

  // login
  $('#login-button').click(getAuthenticateToken)

})
