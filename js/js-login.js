window.onload = init;

/**
 * This function validates if a session exists and put the functionality of each graphic element of the system.
 */

function init() {
    if (localStorage.getItem('token') && localStorage.getItem('mail')) {
        if (localStorage.getItem('type') == 1) {
            window.location = 'dashboard.html';
        } else {
            window.location = 'administration.html';
        }
    }
    document.querySelector('.section-login-button').addEventListener('click', login);
}

/**
 * This function gives the access to system. 
 */

function login() {

    var loginCorrect = true;

    var loginUserInput = document.getElementById("login-input-user");
    var loginPasswordInput = document.getElementById("login-input-password");

    var loginUserInputHelp = document.getElementById("login-input-user-help");
    var loginPasswordInputHelp = document.getElementById("login-input-password-help");

    loginUserInput.classList.remove("is-danger");
    loginPasswordInput.classList.remove("is-danger");

    loginUserInputHelp.classList.add("is-hidden");
    loginPasswordInputHelp.classList.add("is-hidden");


    if (loginUserInput.value == "") {
        loginCorrect = false;

        loginUserInput.classList.add("is-danger");
        loginUserInputHelp.classList.remove("is-hidden");

        loginUserInputHelp.textContent = "Este campo es requerido";
    }

    if (loginPasswordInput.value == "") {
        loginCorrect = false;

        loginPasswordInput.classList.add("is-danger");
        loginPasswordInputHelp.classList.remove("is-hidden");

        loginPasswordInputHelp.textContent = "Este campo es requerido";
    }

    if (!validateEmail(loginUserInput.value)) {
        loginCorrect = false;

        loginUserInput.classList.add("is-danger");
        loginUserInputHelp.classList.remove("is-hidden");

        loginUserInputHelp.textContent = "Ingrese un correo electrónico";
    }

    if (loginCorrect) {
        data = document.querySelectorAll('input');
        axios.post('https://walletapi.herokuapp.com/login/signIn', {
            userMail: data[0].value,
            userPassword: data[1].value
        }).then(function(response) {
            response = response.data;
            if (response.code == 1) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('mail', response.message.userMail);
                localStorage.setItem('name', response.message.userName);
                localStorage.setItem('id', response.message.userId);
                localStorage.setItem('type', response.message.userType);
                if (response.message.userType == 1) {
                    window.location = 'dashboard.html';
                } else {
                    window.location = 'administration.html';
                }
            } else {
                alert(response.message);
            }
        }).catch(function(error) {
            console.log(error);
        });
    }
}

/**
 * This function validate if text has the e-mail structure.
 * @param {string} email to validate.
 */

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}