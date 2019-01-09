window.onload = init;

var userData = {};
var headers = {};

/**
 * This function validates if a session exists and put the functionality of each graphic element of the system.
 */

function init() {
    if (!localStorage.getItem('token')) {
        window.location = 'index.html';
    }

    if (localStorage.getItem('type') == 1) {
        window.location = 'dashboard.html';
    }

    document.getElementById('close-session').addEventListener('click', closeSession);
    document.getElementById('generate-report').addEventListener('click', function() {
        generateReport(0)
    });
    document.querySelector('#register-user>button').addEventListener('click', addUser);
    document.querySelector('#cancel-update-user>button').addEventListener('click', cancelUpdate);

    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    if ($navbarBurgers.length > 0) {
        $navbarBurgers.forEach(el => {
            el.addEventListener('click', () => {
                const target = el.dataset.target;
                const $target = document.getElementById(target);
                el.classList.toggle('is-active');
                $target.classList.toggle('is-active');
            });
        });
    }

    initializeData();
    getEmployees();
    checkActiveUsers();
}

/**
 * This function gets all the necessary information for deploy on user interface and assign the data to specific global variables.
 */

function initializeData() {
    userData = {
        mail: localStorage.getItem('mail'),
        id: localStorage.getItem('id'),
        name: localStorage.getItem('name'),
        type: localStorage.getItem('type'),
        token: localStorage.getItem('token')
    }
    headers = {
        headers: {
            'Authorization': "bearer " + userData.token
        }
    };
    document.getElementById('employe-id').textContent = userData.id.padStart(6, '0');
}

/**
 * This function gets all employees to deploy on table.
 */

function getEmployees() {
    axios.get(`https://walletapi.herokuapp.com/user/`,
        headers).then((response) => {
        console.log(response.data);
        putEmployeesInTable(response.data);
    }).catch((error) => {
        console.log(error);
    });
}

/**
 * This function gets the current active users.
 */

function checkActiveUsers() {
    setInterval(function() {
        axios.get(`https://walletapi.herokuapp.com/user/`,
            headers).then((response) => {
            console.log(response.data);
            document.getElementById('active-users').textContent = response.data.activeUsers;
        }).catch((error) => {
            console.log(error);
        });
    }, 2000);
}

/**
 * This function puts the employees in the table of the interface user.
 */

function putEmployeesInTable(dataObject) {
    var statusRequest = dataObject.code;
    if (statusRequest === 1) {
        tbodyActual = document.getElementById('tbodyEmployees');

        deleteRowsTable("tbodyEmployees");

        userInformation = dataObject.message;
        userInformation.forEach(function(user) {
            var rowCount = tbodyActual.rows.length;
            var rowClient = tbodyActual.insertRow(rowCount);
            rowClient.addEventListener("click", function() {
                loadInputs(user)
            });
            rowClient.addEventListener("click", selectRowTable);

            //Table's cells
            var cellActualClient = rowClient.insertCell(0);
            var cellIdClient = rowClient.insertCell(1);
            var cellClientName = rowClient.insertCell(2);

            var cellClientAgreement = rowClient.insertCell(3);
            cellClientAgreement.classList.add("has-text-centered");

            //Actual user
            var cellActualClientText = document.createTextNode("");
            cellActualClient.appendChild(cellActualClientText);

            //User Identifier
            var cellIdClientText = document.createTextNode(String(user.userId).padStart(6, '0'));
            cellIdClient.appendChild(cellIdClientText);

            //User Name
            var cellClientNameText = document.createTextNode(user.userName);
            cellClientName.appendChild(cellClientNameText);

            //User report
            var aTag = document.createElement("a");

            var spanIcon = document.createElement("span");
            spanIcon.classList.add("icon");

            var iTag = document.createElement("i");
            iTag.classList.add("far");
            iTag.classList.add("fa-file-alt");

            spanIcon.appendChild(iTag);
            aTag.appendChild(spanIcon);
            aTag.addEventListener('click', function() {
                generateReport(user.userId)
            });
            cellClientAgreement.appendChild(aTag);
        });
    } else {
        console.log("Error en la obtención de los clientes");
    }
}

/**
 * This function deletes all the rows in a tbody.
 */

function deleteRowsTable(tbodyId) {
    var tbodyClients = document.getElementById(tbodyId);
    while (tbodyClients.childNodes.length) {
        tbodyClients.removeChild(tbodyClients.childNodes[0]);
    }
}

/**
 * This function generates the PDF report.
 */

function generateReport(userId) {
    axios.get(`https://walletapi.herokuapp.com/payment/report/${userId}`, headers)
        .then(function(response) {
            if (response.data.code == 0) {
                alert('No hay acuerdos para generar el reporte');
            } else {
                if (userId == 0) {
                    makePDFMensual(response.data.message);
                } else {
                    console.log(response.data.message)
                    makePDFIndividual(response.data.message);
                }
            }
        })
        .catch(function(error) {
            console.log(error)
        });
}

/**
 * This function deploy the data from employee on the input to update the information. 
 */

function loadInputs(user) {

    var formInputEmail = document.getElementById("form-input-email");
    var formInputUser = document.getElementById("form-input-user");
    var formInputPassword = document.getElementById("form-input-password");
    var formInputPasswordVerify = document.getElementById("form-input-password-verify");

    var formInputEmailHelp = document.getElementById("form-input-email-help");
    var formInputUserHelp = document.getElementById("form-input-user-help");
    var formInputPasswordHelp = document.getElementById("form-input-password-help");
    var formInputPasswordVerifyHelp = document.getElementById("form-input-password-verify-help");

    formInputEmail.classList.remove("is-danger");
    formInputUser.classList.remove("is-danger");
    formInputPassword.classList.remove("is-danger");
    formInputPasswordVerify.classList.remove("is-danger");

    formInputEmailHelp.classList.add("is-hidden");
    formInputUserHelp.classList.add("is-hidden");
    formInputPasswordHelp.classList.add("is-hidden");
    formInputPasswordVerifyHelp.classList.add("is-hidden");

    var button = document.querySelector('#register-user>button');
    button.textContent = "Actualizar";
    localStorage.setItem('currentUserId', user.userId);

    button.removeEventListener('click', addUser);
    var inputs = document.querySelectorAll('input');

    inputs[0].value = user.userMail;
    inputs[1].value = user.userName;

    button.addEventListener('click', updateUser);
}

/**
 * This function add a new employee to the system.
 */

function addUser() {
    var formInputEmail = document.getElementById("form-input-email");
    var formInputUser = document.getElementById("form-input-user");
    var formInputPassword = document.getElementById("form-input-password");
    var formInputPasswordVerify = document.getElementById("form-input-password-verify");

    var formInputEmailHelp = document.getElementById("form-input-email-help");
    var formInputUserHelp = document.getElementById("form-input-user-help");
    var formInputPasswordHelp = document.getElementById("form-input-password-help");
    var formInputPasswordVerifyHelp = document.getElementById("form-input-password-verify-help");

    formInputEmail.classList.remove("is-danger");
    formInputUser.classList.remove("is-danger");
    formInputPassword.classList.remove("is-danger");
    formInputPasswordVerify.classList.remove("is-danger");

    formInputEmailHelp.classList.add("is-hidden");
    formInputUserHelp.classList.add("is-hidden");
    formInputPasswordHelp.classList.add("is-hidden");
    formInputPasswordVerifyHelp.classList.add("is-hidden");

    var inputs = document.querySelectorAll('input');

    if (inputs[0].value == '' || inputs[1].value == '' || inputs[2].value == '' || inputs[3].value == '') {

        if (!validateEmail(formInputEmail.value)) {
            formInputEmail.classList.add("is-danger");
            formInputEmailHelp.classList.remove("is-hidden");

            formInputEmailHelp.textContent = "Ingrese un correo electrónico";
        }

        if (formInputEmail.value == "") {
            formInputEmail.classList.add("is-danger");
            formInputEmailHelp.classList.remove("is-hidden");

            formInputEmailHelp.textContent = "Este campo es requerido";
        }

        if (formInputUser.value == "") {
            formInputUser.classList.add("is-danger");
            formInputUserHelp.classList.remove("is-hidden");

            formInputUserHelp.textContent = "Este campo es requerido";
        }

        if (formInputPassword.value == "") {
            formInputPassword.classList.add("is-danger");
            formInputPasswordHelp.classList.remove("is-hidden");

            formInputPasswordHelp.textContent = "Este campo es requerido";
        }

        if (formInputPasswordVerify.value == "") {
            formInputPasswordVerify.classList.add("is-danger");
            formInputPasswordVerifyHelp.classList.remove("is-hidden");

            formInputPasswordVerifyHelp.textContent = "Este campo es requerido";
        }
        return;
    }

    if (!validateEmail(formInputEmail.value)) {
        formInputEmail.classList.add("is-danger");
        formInputEmailHelp.classList.remove("is-hidden");

        formInputEmailHelp.textContent = "Ingrese un correo electrónico";
        return;
    }

    if (inputs[2].value != inputs[3].value) {
        formInputPassword.classList.add("is-danger");
        formInputPasswordHelp.classList.remove("is-hidden");

        formInputPasswordHelp.textContent = "Las contraseñas no coinciden";

        formInputPasswordVerify.classList.add("is-danger");
        formInputPasswordVerifyHelp.classList.remove("is-hidden");

        formInputPasswordVerifyHelp.textContent = "Las contraseñas no coinciden";
        return;
    }
    axios.post("https://walletapi.herokuapp.com/user", {
        userMail: inputs[0].value,
        userName: inputs[1].value,
        userPassword: inputs[2].value
    }, headers).then((response) => {
        console.log(response.data);
        getEmployees();
        alert(response.data.message);
    }).catch((error) => {
        console.log(error);
    });

    inputs[0].value = '';
    inputs[1].value = '';
    inputs[2].value = '';
    inputs[3].value = '';
}

/**
 * This function update the data from employee.
 */

function updateUser() {

    var formInputEmail = document.getElementById("form-input-email");
    var formInputUser = document.getElementById("form-input-user");
    var formInputPassword = document.getElementById("form-input-password");
    var formInputPasswordVerify = document.getElementById("form-input-password-verify");

    var formInputEmailHelp = document.getElementById("form-input-email-help");
    var formInputUserHelp = document.getElementById("form-input-user-help");
    var formInputPasswordHelp = document.getElementById("form-input-password-help");
    var formInputPasswordVerifyHelp = document.getElementById("form-input-password-verify-help");

    formInputEmail.classList.remove("is-danger");
    formInputUser.classList.remove("is-danger");
    formInputPassword.classList.remove("is-danger");
    formInputPasswordVerify.classList.remove("is-danger");

    formInputEmailHelp.classList.add("is-hidden");
    formInputUserHelp.classList.add("is-hidden");
    formInputPasswordHelp.classList.add("is-hidden");
    formInputPasswordVerifyHelp.classList.add("is-hidden");

    var inputs = document.querySelectorAll('input');
    if (inputs[0].value == '' || inputs[1].value == '' || inputs[2].value == '' || inputs[3].value == '') {
        if (!validateEmail(formInputEmail.value)) {
            formInputEmail.classList.add("is-danger");
            formInputEmailHelp.classList.remove("is-hidden");

            formInputEmailHelp.textContent = "Ingrese un correo electrónico";
        }

        if (formInputEmail.value == "") {
            formInputEmail.classList.add("is-danger");
            formInputEmailHelp.classList.remove("is-hidden");

            formInputEmailHelp.textContent = "Este campo es requerido";
        }

        if (formInputUser.value == "") {
            formInputUser.classList.add("is-danger");
            formInputUserHelp.classList.remove("is-hidden");

            formInputUserHelp.textContent = "Este campo es requerido";
        }

        if (formInputPassword.value == "") {
            formInputPassword.classList.add("is-danger");
            formInputPasswordHelp.classList.remove("is-hidden");

            formInputPasswordHelp.textContent = "Este campo es requerido";
        }

        if (formInputPasswordVerify.value == "") {
            formInputPasswordVerify.classList.add("is-danger");
            formInputPasswordVerifyHelp.classList.remove("is-hidden");

            formInputPasswordVerifyHelp.textContent = "Este campo es requerido";
        }
        return;
    }

    if (!validateEmail(formInputEmail.value)) {
        formInputEmail.classList.add("is-danger");
        formInputEmailHelp.classList.remove("is-hidden");

        formInputEmailHelp.textContent = "Ingrese un correo electrónico";
        return;
    }

    if (inputs[2].value != inputs[3].value) {
        formInputPassword.classList.add("is-danger");
        formInputPasswordHelp.classList.remove("is-hidden");

        formInputPasswordHelp.textContent = "Las contraseñas no coinciden";

        formInputPasswordVerify.classList.add("is-danger");
        formInputPasswordVerifyHelp.classList.remove("is-hidden");

        formInputPasswordVerifyHelp.textContent = "Las contraseñas no coinciden";
        return;
    }
    axios.put(`https://walletapi.herokuapp.com/user/${localStorage.getItem('currentUserId')}`, {
        userMail: inputs[0].value,
        userName: inputs[1].value,
        userPassword: inputs[2].value
    }, headers).then((response) => {
        console.log(response.data);
        getEmployees();
        cancelUpdate();
        alert(response.data.message);
    }).catch((error) => {
        console.log(error);
    });

    inputs[0].value = '';
    inputs[1].value = '';
    inputs[2].value = '';
    inputs[3].value = '';
}

/**
 * This function cancel the update of data employee.
 */

function cancelUpdate() {
    var button = document.querySelector('#register-user>button');
    button.textContent = "Registrar";
    button.removeEventListener('click', updateUser);
    var inputs = document.querySelectorAll('input');

    inputs[0].value = '';
    inputs[1].value = '';
    inputs[2].value = '';
    inputs[3].value = '';

    button.addEventListener('click', addUser);
}

/**
 * This function close de actual session.
 */

function closeSession() {
    axios.post("https://walletapi.herokuapp.com/login/signOut", {
        userId: userData.id
    }).then((response) => {
        alert(response.data.message);
        localStorage.clear();
        window.location = "index.html";
    }).catch((error) => {
        console.log(error);
    });
}

/**
 * This function validate if text has the e-mail structure.
 * @param {string} email to validate.
 */

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/**
 * This function select add a color to selected row.
 */

function selectRowTable(){

    allRowsTable = document.querySelectorAll("tr");

    allRowsTable.forEach(function(row){
        row.classList.remove("is-selected");
    });

    this.classList.add("is-selected");
}