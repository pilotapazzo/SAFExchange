function completeLogout(logged_with) {
    console.log(logged_with)

    switch (logged_with) {
        case "GOOGLE":
            googleLogout(); break;

        case "FACEBOOK":
            setTimeout(facebookLogout, 500);
            break;

        case "MAIL":
            loggedOut(); break;
    }
}

function loggedOut() {
    console.log('Logged out')
    $('#logging_out_msg').hide()
    $('#error_msg').hide()
    $('#logged_out_msg').show()
}

function errorLogginOut() {
    console.log('Error logging out')
    $('#logging_out_msg').hide()
    $('#logged_out_msg').hide()
    $('#error_msg').show()
}


// GOOGLE
function googleLogout() {
    console.log('Logging out of Google')

    gapi.load('auth2', async function () {
        gapi.auth2.init();

        var auth2 = await gapi.auth2.getAuthInstance()
        auth2.signOut().then(loggedOut).catch(errorLogginOut);
    })
}


// FACEBOOK
var FB;

window.fbAsyncInit = function () {
    FB.init({
        appId: '2178730182445130',
        cookie: true,
        xfbml: true,
        version: 'v3.2'
    });
    FB.AppEvents.logPageView();
};

(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) { return; }
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));


async function facebookLogout() {
    FB.getLoginStatus(function (response) {
        statusChangeCallback(response);
    });


}

function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    if (response.status === 'connected') {
        FB.logout(loggedOut);
    } else {
        console.log("Error");
    }
}