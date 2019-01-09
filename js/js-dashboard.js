/**
 * ----------- Logical Functionality -----------
 */

/**
 * General Variables.
 */

var userData = {};
var clientsForTable = 0; //Esta es la cantidad de elementos por hoja
var headers = {};
var url;

/**
 * Functionality when the page is loaded.
 */

window.addEventListener("load", init);

/**
 * This function validates if a session exists and put the functionality of each graphic element of the system.
 */

function init() {
    // ----------- Functionality -----------

    if (!localStorage.getItem('token')) {
        window.location = 'index.html';
    }

    if (localStorage.getItem('type') == 0) {
        window.location = 'administration.html';
    }

    document.getElementById('generate-report').addEventListener('click', generateReport);
    document.getElementById('close-session').addEventListener('click', closeSession);

    document.getElementById('options-search-input').addEventListener('keyup', searchBorrower);
    document.getElementById('go-to-page').addEventListener('click', function() {
        var totalPages = document.getElementById("total-pages");
        var optionsGoPageInput = document.getElementById("options-go-page-input");

        if (parseInt(optionsGoPageInput.value) > parseInt(totalPages.textContent)) {
            optionsGoPageInput.value = totalPages.textContent;
        }

        getBorrowers(putClientsInTable);
    });

    document.getElementById("client-details-tabs-general-information").addEventListener('click', tabsInteraction);
    document.getElementById("client-details-tabs-contact-information").addEventListener('click', tabsInteraction);
    document.getElementById("client-details-tabs-agreements").addEventListener('click', tabsInteraction);

    initializeData();

    // ----------- User Experience -----------
    //Search Input
    document.getElementById("options-search-icon").addEventListener("click", function() {
        document.getElementById("options-search-input").focus();
    });
    document.getElementById("options-search-input").addEventListener("focusin", function() {
        document.getElementById("options-search-input").placeholder = "";
    });
    document.getElementById("options-search-input").addEventListener("focusout", function() {
        document.getElementById("options-search-input").placeholder = "Búsqueda de Cliente";
    });
    //Go Page Input
    document.getElementById("options-go-page-input").addEventListener("focusin", function() {
        document.getElementById("options-go-page-input").placeholder = "";
    });
    document.getElementById("options-go-page-input").addEventListener("focusout", function() {
        document.getElementById("options-go-page-input").placeholder = "#";
    });

    //Contact Information
    document.getElementById("client-details-contact-box-new-phone-button").addEventListener("click", openFormNewPhone);

    //Start session call window
    document.getElementById("call-validation-cancel").addEventListener("click", closeSessionCall);
    document.getElementById("call-validation-not-located").addEventListener("click", notLocatedSessionCall);
    document.getElementById("call-validation-located").addEventListener("click", locatedSessionCall);

    //Session call window
    document.getElementById("payment-proposal-plus").addEventListener("click", showPaymentProposal);
    document.getElementById("payment-proposal-minus").addEventListener("click", showPaymentProposal);
    document.getElementById("finish-call-session-button").addEventListener("click", finishCallSession);

    let cardToggles = document.getElementsByClassName('card-toggle');
    for (let i = 0; i < cardToggles.length; i++) {
        cardToggles[i].addEventListener('click', function(cardContent) {
            cardContent.currentTarget.parentElement.parentElement.childNodes[3].classList.toggle('is-hidden');
        });
    }


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
    clientsForTable = getElementsForTable();
    url = `https://walletapi.herokuapp.com/borrower/`;
    getBorrowers(putClientsInTable);
    getRegions(putRegionsInDropdown);
}

/**
 * This function returns the borrowers depending on the space available in the table
 */

function getBorrowers(callback) {
    var page = parseInt(document.getElementById('options-go-page-input').value);
    if (isNaN(page)) {
        page = 1;
    }
    axios.get(url + `${page}/${clientsForTable}`,
        headers).then((response) => {
        document.getElementById('actual-page').textContent = String(page).padStart(3, '0');
        if (response.data.code != 0) {
            document.getElementById('total-pages').textContent = String(response.data.numPages).padStart(3, '0');
        }
        callback(response.data);
    }).catch((error) => {
        console.log(error);
    });
}

/**
 * This function returns the borrowers depending on the space available in the table and the search input filter.
 */

function searchBorrower() {
    id = document.getElementById('options-search-input').value;
    if (id.length > 0) {
        document.getElementById("navbar-regions-dropdown-item").classList.add("is-hidden");
    } else {
        document.getElementById("navbar-regions-dropdown-item").classList.remove("is-hidden");
    }

    if (id != '') {
        url = `https://walletapi.herokuapp.com/borrower/search/${id}/`;
        getBorrowers(putClientsInTable);
    } else {
        url = `https://walletapi.herokuapp.com/borrower/`;
        getBorrowers(putClientsInTable);
    }
}

/**
 * This function returns the borrowers depending on the space available in the table and the checked regions filter in the dropdown.
 */

function filterBorrowersByRegion() {

    var optionsGoPageInput = document.getElementById("options-go-page-input");
    optionsGoPageInput.value = "";

    var idRegionsArray = document.querySelectorAll("input:checked.inputRegion");
    var idRegionsArray = [].map.call(idRegionsArray, element => element.value);

    if (idRegionsArray.length > 0) {
        idRegionsArray = idRegionsArray.join("-");
        url = `https://walletapi.herokuapp.com/borrower/${idRegionsArray}/`;
        getBorrowers(putClientsInTable);
    } else {
        url = `https://walletapi.herokuapp.com/borrower/`;
        getBorrowers(putClientsInTable);
    }
}

/**
 * This function returns all available regions.
 */

function getRegions(callback) {
    axios.get("https://walletapi.herokuapp.com/borrower/regions",
        headers).then((response) => {
        callback(response.data)
    }).catch((error) => {
        console.log(error);
    });
}

/**
 * This function returns an specific borrow selected from the table.
 */

function getBorrower(idClient) {
    var borrowerInfo = {}

    axios.all([
        axios.get(`https://walletapi.herokuapp.com/borrower/search/${idClient}/1/1`,
            headers),
        axios.get(`https://walletapi.herokuapp.com/phone/${idClient}`,
            headers),
        axios.get(`https://walletapi.herokuapp.com/payment/${idClient}`,
            headers),
        axios.get(`https://walletapi.herokuapp.com/session/${idClient}`,
            headers),
    ]).then(axios.spread((resBo, resPh, resPa, resSe) => {
        borrowerInfo.data = resBo.data.message[0];
        borrowerInfo.phones = resPh.data.message;
        borrowerInfo.payments = resPa.data.message;
        borrowerInfo.sessions = resSe.data.message;

        //toLocaleString Configurations For Date
        var options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        //General Information

        // -- Personal Information --

        var generalInformation = borrowerInfo.data;
        var paymentsInformation = borrowerInfo.payments;
        var phonesInformation = borrowerInfo.phones;
        var sessionsInformation = borrowerInfo.sessions;

        var idClientGI = document.getElementById("client-details-information-id");
        var clientRegionGI = document.getElementById("client-detail-information-region");
        var clientRFCGI = document.getElementById("client-detail-information-rfc");
        var clientNameGI = document.getElementById("client-detail-information-name");

        idClientGI.textContent = generalInformation.borrowerId;
        clientRegionGI.textContent = generalInformation.borrowerRegion;
        clientRFCGI.textContent = generalInformation.borrowerRFC;
        clientNameGI.textContent = generalInformation.borrowerName;

        // -- Debt Information --

        balanceGI = document.getElementById("client-detail-information-balance");
        interestGI = document.getElementById("client-detail-information-interest");
        daysDelayGI = document.getElementById("client-detail-days-delay");
        lastPaymentGI = document.getElementById("client-detail-information-last-payment");
        totalBalanceGI = document.getElementById("client-detail-total-balance");

        balanceGI.textContent = '$ ' + (generalInformation.borrowerBalance).toLocaleString('en-US', {
            style: 'decimal',
            minimumFractionDigits: 2
        });
        interestGI.textContent = '$ ' + (generalInformation.borrowerInterest).toLocaleString('en-US', {
            style: 'decimal',
            minimumFractionDigits: 2
        });

        var actualDate = new Date();
        var lastPaymentDate = new Date(generalInformation.lastPaymentDate);
        var result = Math.abs(actualDate - lastPaymentDate) / 1000;
        var days = Math.floor(result / 86400);
        daysDelayGI.textContent = days;

        lastPaymentGI.textContent = lastPaymentDate.toLocaleDateString("es-MX", options);
        totalBalanceGI.textContent = '$ ' + (generalInformation.borrowerBalance + generalInformation.borrowerInterest).toLocaleString('en-US', {
            style: 'decimal',
            minimumFractionDigits: 2
        });

        // -- Contact --

        lastContactGI = document.getElementById("client-detail-last-contact");

        if (phonesInformation.length > 0) {

            var lastPhoneModified = "";

            //Getting not null phoneModified
            for (var phone of phonesInformation) {
                if (phone.phoneModified != null) {
                    lastPhoneModified = new Date(phone.phoneModified);
                    break;
                }
            };

            //Getting the last contact date
            if (lastPhoneModified != "") {
                phonesInformation.forEach(function(phone) {
                    var phoneModified = new Date(phone.phoneModified);
                    if (phoneModified > lastPhoneModified) {
                        lastPhoneModified = phoneModified;
                    }
                });
                lastContactGI.textContent = lastPhoneModified.toLocaleDateString("es-MX", options);
            } else {
                lastContactGI.textContent = "Sin intento de contacto";
            }
        } else {
            lastContactGI.textContent = "Sin intento de contacto";
        }

        //Contact Information

        removeChildElements("client-details-contact-container-active");
        removeChildElements("client-details-contact-container-inactive");

        // -- Active Phones --

        phonesInformation.forEach(function(phone) {
            var containerGeneralCard = "";

            if (phone.phoneStatus === 1) {
                containerGeneralCard = document.getElementById("client-details-contact-container-active");
            } else {
                containerGeneralCard = document.getElementById("client-details-contact-container-inactive");
            }

            //General card
            var divGeneralCard = document.createElement("div");
            divGeneralCard.classList.add("card");
            divGeneralCard.classList.add("is-fullwidth");
            divGeneralCard.classList.add("card-phone");
            containerGeneralCard.appendChild(divGeneralCard);

            //Header general card
            var divGeneralCardHeader = document.createElement("header");
            divGeneralCardHeader.classList.add("card-header");
            divGeneralCard.appendChild(divGeneralCardHeader);

            //Columns header general card
            var divGeneralCardHeaderColumns = document.createElement("div");
            divGeneralCardHeaderColumns.classList.add("columns");
            divGeneralCardHeaderColumns.classList.add("card-header-columns")
            divGeneralCardHeader.appendChild(divGeneralCardHeaderColumns);

            //Open icon general card
            var openIconContainerGeneralCard = document.createElement("a");
            openIconContainerGeneralCard.classList.add("card-header-icon");
            openIconContainerGeneralCard.classList.add("card-toggle");
            openIconContainerGeneralCard.addEventListener("click", function() {
                this.parentElement.parentElement.childNodes[1].classList.toggle('is-hidden');
            });
            divGeneralCardHeader.appendChild(openIconContainerGeneralCard);

            var openIconGeneralCard = document.createElement("i");
            openIconGeneralCard.classList.add("fa");
            openIconGeneralCard.classList.add("fa-angle-down");
            openIconContainerGeneralCard.appendChild(openIconGeneralCard);

            //Column from columns header general card
            var divColumn = "";
            var fieldData = "";
            var fieldDataText = "";
            var fieldName = "";
            var fieldNameText = "";

            //Phone number
            divColumn = document.createElement("div");
            divColumn.classList.add("column");
            divColumn.classList.add("is-3");
            divGeneralCardHeaderColumns.appendChild(divColumn);

            fieldData = document.createElement("p");
            fieldData.classList.add("content-field-info");
            fieldDataText = document.createTextNode(phone.phone);
            fieldData.appendChild(fieldDataText);
            divColumn.appendChild(fieldData);

            fieldName = document.createElement("p");
            fieldName.classList.add("content-field-name");
            fieldName.classList.add("has-text-grey");
            fieldNameText = document.createTextNode("Número Telefónico")
            fieldName.appendChild(fieldNameText);
            divColumn.appendChild(fieldName);

            //Unreached Phone
            divColumn = document.createElement("div");
            divColumn.classList.add("column");
            divColumn.classList.add("is-3");
            divGeneralCardHeaderColumns.appendChild(divColumn);

            fieldData = document.createElement("p");
            fieldData.classList.add("content-field-info");
            fieldDataText = document.createTextNode(phone.unreached);
            fieldData.appendChild(fieldDataText);
            divColumn.appendChild(fieldData);

            fieldName = document.createElement("p");
            fieldName.classList.add("content-field-name");
            fieldName.classList.add("has-text-grey");
            fieldNameText = document.createTextNode("Intentos de Contacto")
            fieldName.appendChild(fieldNameText);
            divColumn.appendChild(fieldName);

            //Last contact date
            divColumn = document.createElement("div");
            divColumn.classList.add("column");
            divColumn.classList.add("is-3");
            divGeneralCardHeaderColumns.appendChild(divColumn);

            fieldData = document.createElement("p");
            fieldData.classList.add("content-field-info");

            var lastContactDate = new Date(phone.phoneModified);

            if (phone.phoneModified != null) {
                fieldDataText = document.createTextNode(lastContactDate.toLocaleDateString("es-MX", options));
            } else {
                fieldDataText = document.createTextNode("Sin intento de contacto");
            }
            fieldData.appendChild(fieldDataText);
            divColumn.appendChild(fieldData);

            fieldName = document.createElement("p");
            fieldName.classList.add("content-field-name");
            fieldName.classList.add("has-text-grey");
            fieldNameText = document.createTextNode("Fecha Última Llamada")
            fieldName.appendChild(fieldNameText);
            divColumn.appendChild(fieldName);

            //Action phone

            if (phone.phoneStatus === 1) {
                divColumn = document.createElement("div");
                divColumn.classList.add("column");
                divColumn.classList.add("is-3");
                divGeneralCardHeaderColumns.appendChild(divColumn);

                var divContainerIconsPhone = document.createElement("div");
                divContainerIconsPhone.classList.add("client-details-contact-make-call");
                divColumn.appendChild(divContainerIconsPhone);

                var spanIconMakeCall = document.createElement("a");
                spanIconMakeCall.classList.add("icon");
                spanIconMakeCall.classList.add("has-text-primary");
                spanIconMakeCall.id = phone.phoneId;
                spanIconMakeCall.setAttribute("href", "tel:" + phone.phone)
                spanIconMakeCall.addEventListener("click", startSessionCall);
                divContainerIconsPhone.appendChild(spanIconMakeCall);

                var iconMakeCall = document.createElement("i");
                iconMakeCall.classList.add("fas");
                iconMakeCall.classList.add("fa-phone");
                spanIconMakeCall.appendChild(iconMakeCall);

                var spanIconMakeCallName = document.createElement("span");
                spanIconMakeCallName.classList.add("content-field-name");
                spanIconMakeCallName.classList.add("has-text-grey");
                divContainerIconsPhone.appendChild(spanIconMakeCallName);

                var spanIconMakeCallNameText = document.createTextNode("Acciones");
                spanIconMakeCallName.appendChild(spanIconMakeCallNameText);
            } else {

            }

            //Container general card

            divGeneralCardContainer = document.createElement("div");
            divGeneralCardContainer.classList.add("card-content");
            divGeneralCardContainer.classList.add("is-hidden");
            divGeneralCard.appendChild(divGeneralCardContainer);

            divGeneralCardContainerContent = document.createElement("div");
            divGeneralCardContainerContent.classList.add("content");
            divGeneralCardContainer.appendChild(divGeneralCardContainerContent);

            divGeneralCardContainerContentColumnsFirst = document.createElement("div");
            divGeneralCardContainerContentColumnsFirst.classList.add("columns");
            divGeneralCardContainerContent.appendChild(divGeneralCardContainerContentColumnsFirst);

            divGeneralCardContainerContentColumnsSecond = document.createElement("div");
            divGeneralCardContainerContentColumnsSecond.classList.add("columns");
            divGeneralCardContainerContent.appendChild(divGeneralCardContainerContentColumnsSecond);

            //Creation date
            divColumn = document.createElement("div");
            divColumn.classList.add("column");
            divColumn.classList.add("is-4");
            divGeneralCardContainerContentColumnsFirst.appendChild(divColumn);

            var creationDate = new Date(phone.phoneDate);

            fieldData = document.createElement("p");
            fieldData.classList.add("content-field-info");
            fieldDataText = document.createTextNode(creationDate.toLocaleDateString("es-MX", options));
            fieldData.appendChild(fieldDataText);
            divColumn.appendChild(fieldData);

            fieldName = document.createElement("p");
            fieldName.classList.add("content-field-name");
            fieldName.classList.add("has-text-grey");
            fieldNameText = document.createTextNode("Fecha Creación")
            fieldName.appendChild(fieldNameText);
            divColumn.appendChild(fieldName);

            //Employe creation
            divColumn = document.createElement("div");
            divColumn.classList.add("column");
            divColumn.classList.add("is-4");
            divGeneralCardContainerContentColumnsFirst.appendChild(divColumn);

            fieldData = document.createElement("p");
            fieldData.classList.add("content-field-info");
            fieldDataText = document.createTextNode((String(phone.userId)).padStart(6, '0'));
            fieldData.appendChild(fieldDataText);
            divColumn.appendChild(fieldData);

            fieldName = document.createElement("p");
            fieldName.classList.add("content-field-name");
            fieldName.classList.add("has-text-grey");
            fieldNameText = document.createTextNode("Empleado Creación")
            fieldName.appendChild(fieldNameText);
            divColumn.appendChild(fieldName);

            //Phone comment
            divColumn = document.createElement("div");
            divColumn.classList.add("column");
            divColumn.classList.add("is-12");
            divGeneralCardContainerContentColumnsSecond.appendChild(divColumn);

            fieldData = document.createElement("p");
            fieldData.classList.add("content-field-info");
            fieldDataText = document.createTextNode(phone.phoneDescription);
            fieldData.appendChild(fieldDataText);
            divColumn.appendChild(fieldData);

            fieldName = document.createElement("p");
            fieldName.classList.add("content-field-name");
            fieldName.classList.add("has-text-grey");
            fieldNameText = document.createTextNode("Método de Obtención")
            fieldName.appendChild(fieldNameText);
            divColumn.appendChild(fieldName);
        });

        //Session Call

        // -- Debt information --

        var balanceSC = document.getElementById("session-call-balance");
        var interestSC = document.getElementById("session-call-interests");
        var daysDelaySC = document.getElementById("session-call-days-delay");
        var lastPaymentSC = document.getElementById("session-call-last-payment");
        var totalBalanceSC = document.getElementById("session-call-total-balance");

        balanceSC.textContent = '$ ' + (generalInformation.borrowerBalance).toLocaleString('en-US', {
            style: 'decimal',
            minimumFractionDigits: 2
        });
        interestSC.textContent = '$ ' + (generalInformation.borrowerInterest).toLocaleString('en-US', {
            style: 'decimal',
            minimumFractionDigits: 2
        });

        var actualDate = new Date();
        var lastPaymentDate = new Date(generalInformation.lastPaymentDate);
        var result = Math.abs(actualDate - lastPaymentDate) / 1000;
        var days = Math.floor(result / 86400);
        daysDelaySC.textContent = days;

        lastPaymentSC.textContent = lastPaymentDate.toLocaleDateString("es-MX", options);
        totalBalanceSC.textContent = '$ ' + (generalInformation.borrowerBalance + generalInformation.borrowerInterest).toLocaleString('en-US', {
            style: 'decimal',
            minimumFractionDigits: 2
        });
        totalBalanceSC.setAttribute("value", parseFloat(generalInformation.borrowerBalance) + parseFloat(generalInformation.borrowerInterest));

        getBranchesByRegion(generalInformation.borrowerRegion);

        //Agreements
        clientDetailsAgreementsContainer = document.getElementById("client-details-agreements-content");
        removeChildElements("client-details-agreements-content");
        clientDetailsAgreementsCount = 1;

        if (paymentsInformation == "Sin acuerdos") {
            paymentsInformation = [];
        }

        paymentsInformation.forEach(function(payment) {
            //Agreement Number
            divColumns = document.createElement("div");
            divColumns.classList.add("columns");
            clientDetailsAgreementsContainer.appendChild(divColumns);

            divColumn = document.createElement("div");
            divColumn.classList.add("column");
            divColumn.classList.add("is-4");
            divColumns.appendChild(divColumn);

            fieldName = document.createElement("p");
            fieldName.classList.add("content-field-name");
            fieldName.classList.add("has-text-primary");
            fieldNameText = document.createTextNode("Acuerdo " + clientDetailsAgreementsCount);
            fieldName.appendChild(fieldNameText);
            divColumn.appendChild(fieldName);

            //Agreement Information
            divColumns = document.createElement("div");
            divColumns.classList.add("columns");
            clientDetailsAgreementsContainer.appendChild(divColumns);

            // -- Agreement Employe --

            divColumn = document.createElement("div");
            divColumn.classList.add("column");
            divColumn.classList.add("is-3");
            divColumns.appendChild(divColumn);

            fieldData = document.createElement("p");
            fieldData.classList.add("content-field-info");
            fieldDataText = document.createTextNode(String(payment.userId).padStart(6, '0'));
            fieldData.appendChild(fieldDataText);
            divColumn.appendChild(fieldData);

            fieldName = document.createElement("p");
            fieldName.classList.add("content-field-name");
            fieldName.classList.add("has-text-grey");
            fieldNameText = document.createTextNode("Empleado");
            fieldName.appendChild(fieldNameText);
            divColumn.appendChild(fieldName);

            // -- Agreement Date --

            divColumn = document.createElement("div");
            divColumn.classList.add("column");
            divColumn.classList.add("is-3");
            divColumns.appendChild(divColumn);

            fieldData = document.createElement("p");
            fieldData.classList.add("content-field-info");

            var agreementDate = new Date(payment.paymentDate);

            fieldDataText = document.createTextNode(agreementDate.toLocaleDateString("es-MX", options));
            fieldData.appendChild(fieldDataText);
            divColumn.appendChild(fieldData);

            fieldName = document.createElement("p");
            fieldName.classList.add("content-field-name");
            fieldName.classList.add("has-text-grey");
            fieldNameText = document.createTextNode("Fecha de Acuerdo");
            fieldName.appendChild(fieldNameText);
            divColumn.appendChild(fieldName);

            // -- Agreement Instalments --

            divColumn = document.createElement("div");
            divColumn.classList.add("column");
            divColumn.classList.add("is-3");
            divColumns.appendChild(divColumn);

            fieldData = document.createElement("p");
            fieldData.classList.add("content-field-info");

            if (payment.instalments > 1) {
                fieldDataText = document.createTextNode(payment.instalments + " meses");
            } else {
                fieldDataText = document.createTextNode(payment.instalments + " mes");
            }

            fieldData.appendChild(fieldDataText);
            divColumn.appendChild(fieldData);

            fieldName = document.createElement("p");
            fieldName.classList.add("content-field-name");
            fieldName.classList.add("has-text-grey");
            fieldNameText = document.createTextNode("Plazo a Meses");
            fieldName.appendChild(fieldNameText);
            divColumn.appendChild(fieldName);

            // -- Agreement Total Balance --

            divColumn = document.createElement("div");
            divColumn.classList.add("column");
            divColumn.classList.add("is-3");
            divColumns.appendChild(divColumn);

            fieldData = document.createElement("p");
            fieldData.classList.add("content-field-info");
            fieldDataText = document.createTextNode('$ ' + (generalInformation.borrowerBalance + generalInformation.borrowerInterest).toLocaleString('en-US', {
                style: 'decimal',
                minimumFractionDigits: 2
            }));
            fieldData.appendChild(fieldDataText);
            divColumn.appendChild(fieldData);

            fieldName = document.createElement("p");
            fieldName.classList.add("content-field-name");
            fieldName.classList.add("has-text-grey");
            fieldNameText = document.createTextNode("Saldo Total");
            fieldName.appendChild(fieldNameText);
            divColumn.appendChild(fieldName);

            //Payments Information

            // -- Payments Title --
            divColumns = document.createElement("div");
            divColumns.classList.add("columns");
            clientDetailsAgreementsContainer.appendChild(divColumns);

            divColumn = document.createElement("div");
            divColumn.classList.add("column");
            divColumn.classList.add("is-4");
            divColumns.appendChild(divColumn);

            fieldName = document.createElement("p");
            fieldName.classList.add("content-field-name");
            fieldName.classList.add("has-text-grey");
            fieldNameText = document.createTextNode("Desglose de Pagos");
            fieldName.appendChild(fieldNameText);
            divColumn.appendChild(fieldName);

            // -- Payments --
            divColumns = document.createElement("div");
            divColumns.classList.add("columns");
            divColumns.classList.add("is-multiline");
            clientDetailsAgreementsContainer.appendChild(divColumns);

            var porpousePaymentsAmounts = calculatePayments(parseFloat(generalInformation.borrowerBalance) + parseFloat(generalInformation.borrowerInterest), payment.instalments);
            var porpousePaymentsColumns = document.getElementById("porpouse-payments-columns");
            var porpousePaymentsCount = 1;

            porpousePaymentsAmounts.forEach(function(amount) {
                //Month
                divColumn = document.createElement("div");
                divColumn.classList.add("column");
                divColumn.classList.add("is-2");
                divColumns.appendChild(divColumn);

                fieldData = document.createElement("p");
                fieldData.classList.add("content-field-info");
                fieldDataText = document.createTextNode("$ " + (amount).toLocaleString('en-US', {
                    style: 'decimal',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }));
                fieldData.appendChild(fieldDataText);
                divColumn.appendChild(fieldData);

                fieldName = document.createElement("p");
                fieldName.classList.add("content-field-name");
                fieldName.classList.add("has-text-grey");
                fieldNameText = document.createTextNode("Mes " + porpousePaymentsCount);
                fieldName.appendChild(fieldNameText);
                divColumn.appendChild(fieldName);

                porpousePaymentsCount += 1;
            });

            //Branches Information

            // -- Branches --
            divColumns = document.createElement("div");
            divColumns.classList.add("columns");
            clientDetailsAgreementsContainer.appendChild(divColumns);

            divColumn = document.createElement("div");
            divColumn.classList.add("column");
            divColumn.classList.add("is-4");
            divColumns.appendChild(divColumn);

            fieldData = document.createElement("p");
            fieldData.classList.add("content-field-info");
            fieldDataText = document.createTextNode(payment.branchName);
            fieldData.appendChild(fieldDataText);
            divColumn.appendChild(fieldData);

            fieldName = document.createElement("p");
            fieldName.classList.add("content-field-name");
            fieldName.classList.add("has-text-grey");
            fieldNameText = document.createTextNode(payment.branchAddress);
            fieldName.appendChild(fieldNameText);
            divColumn.appendChild(fieldName);

            clientDetailsAgreementsCount += 1;
        });

        //Comments
        clientDetailsCommentsContainer = document.getElementById("client-details-comments-content");
        removeChildElements("client-details-comments-content");
        clientDetailsCommentsCount = 1;

        sessionsInformation.forEach(function(session) {
            //Comment
            divColumns = document.createElement("div");
            divColumns.classList.add("columns");
            divColumns.classList.add("is-multiline");
            clientDetailsCommentsContainer.appendChild(divColumns);

            // -- Comment Title --

            divColumn = document.createElement("div");
            divColumn.classList.add("column");
            divColumn.classList.add("is-12");
            divColumns.appendChild(divColumn);

            fieldName = document.createElement("p");
            fieldName.classList.add("content-field-name");
            fieldName.classList.add("has-text-primary");
            fieldNameText = document.createTextNode("Comentario " + clientDetailsCommentsCount);
            fieldName.appendChild(fieldNameText);
            divColumn.appendChild(fieldName);

            // -- Comment Employe --

            divColumn = document.createElement("div");
            divColumn.classList.add("column");
            divColumn.classList.add("is-4");
            divColumns.appendChild(divColumn);

            fieldData = document.createElement("p");
            fieldData.classList.add("content-field-info");
            fieldDataText = document.createTextNode(String(session.userId).padStart(6, '0'));
            fieldData.appendChild(fieldDataText);
            divColumn.appendChild(fieldData);

            fieldName = document.createElement("p");
            fieldName.classList.add("content-field-name");
            fieldName.classList.add("has-text-grey");
            fieldNameText = document.createTextNode("Empleado");
            fieldName.appendChild(fieldNameText);
            divColumn.appendChild(fieldName);

            // -- Comment Date --

            divColumn = document.createElement("div");
            divColumn.classList.add("column");
            divColumn.classList.add("is-4");
            divColumns.appendChild(divColumn);

            fieldData = document.createElement("p");
            fieldData.classList.add("content-field-info");

            var commentDate = new Date(session.sessionTimestamp);

            fieldDataText = document.createTextNode(commentDate.toLocaleDateString("es-MX", options));
            fieldData.appendChild(fieldDataText);
            divColumn.appendChild(fieldData);

            fieldName = document.createElement("p");
            fieldName.classList.add("content-field-name");
            fieldName.classList.add("has-text-grey");
            fieldNameText = document.createTextNode("Fecha de Acuerdo");
            fieldName.appendChild(fieldNameText);
            divColumn.appendChild(fieldName);

            // -- Comment Client --

            divColumn = document.createElement("div");
            divColumn.classList.add("column");
            divColumn.classList.add("is-12");
            divColumns.appendChild(divColumn);

            fieldData = document.createElement("p");
            fieldData.classList.add("content-field-info");
            fieldDataText = document.createTextNode(session.sessionComment);
            fieldData.appendChild(fieldDataText);
            divColumn.appendChild(fieldData);

            fieldName = document.createElement("p");
            fieldName.classList.add("content-field-name");
            fieldName.classList.add("has-text-grey");
            fieldNameText = document.createTextNode("Comentario de la Sesión");
            fieldName.appendChild(fieldNameText);
            divColumn.appendChild(fieldName);

            clientDetailsCommentsCount += 1;
        });
    })).catch((error) => {
        console.log(error);
    });
}

/**
 * This function add a new phone to the database.
 */

function addPhone() {
    var idClient = document.getElementById("client-details-information-id").textContent;
    var phone = document.getElementById("client-contact-information-phone").value;
    var description = document.getElementById("client-contact-information-description").value;

    if (phone != "" && description != "") {
        axios.post("https://walletapi.herokuapp.com/phone", {
            borrowerId: idClient,
            phone: phone,
            description: description
        }, headers).then((response) => {
            console.log(response.data);
            closeFormNewPhone();
            getBorrower(idClient);
        }).catch((error) => {
            console.log(error);
        });
    } else {
        alert("Complete los campos");
    }
}

/**
 * This function adds a call attempt.
 */

function notLocatedSessionCall() {
    var idClient = document.getElementById("client-details-information-id").textContent;
    var idPhone = (document.getElementById("call-validation-not-located").parentNode).id;

    axios.patch(`https://walletapi.herokuapp.com/phone/${idPhone}/1`, {},
        headers).then((response) => {
        console.log(response.data);
        closeSessionCall();
        getBorrower(idClient);
    }).catch((error) => {
        console.log(error);
    });
}

/**
 * This function starts session call.
 */

function locatedSessionCall() {
    var idClient = document.getElementById("client-details-information-id").textContent;
    var idPhone = (document.getElementById("call-validation-located").parentNode).id;

    axios.patch(`https://walletapi.herokuapp.com/phone/${idPhone}/2`, {},
        headers).then((response) => {
        console.log(response.data);
        closeSessionCall();
        getBorrower(idClient);
        openSessionCall();
    }).catch((error) => {
        console.log(error);
    });
}

/**
 * This function returns all available regions.
 */

function getBranchesByRegion(idRegionForBranches) {
    axios.get(`https://walletapi.herokuapp.com/payment/branches/${idRegionForBranches}`,
        headers).then((response) => {

        branchesColumns = document.getElementById("branches-columns");
        removeChildElements("branches-columns");

        branchesRegions = response.data.message;

        branchesRegions.forEach(function(branch) {
            divColumn = document.createElement("div");
            divColumn.classList.add("column");
            divColumn.classList.add("is-4");
            divColumn.classList.add("branch-option");
            divColumn.id = branch.branchId;
            divColumn.addEventListener("click", selectBranch);
            branchesColumns.appendChild(divColumn);

            fieldData = document.createElement("p");
            fieldData.classList.add("content-field-info");
            fieldDataText = document.createTextNode(branch.branchName);
            fieldData.appendChild(fieldDataText);
            divColumn.appendChild(fieldData);

            fieldName = document.createElement("p");
            fieldName.classList.add("content-field-name");
            fieldNameText = document.createTextNode(branch.branchAddress)
            fieldName.appendChild(fieldNameText);
            divColumn.appendChild(fieldName);
        });

    }).catch((error) => {
        console.log(error);
    });
}

/**
 * This function finishes the call session
 */

function finishCallSession() {
    var borrowerId = document.getElementById("client-details-information-id").textContent;

    var instalments = document.getElementById("actual-porpouse-payments").getAttribute("value");
    var mail = document.getElementById("payment-proposal-mail").value;
    var totalBalance = document.getElementById("session-call-total-balance").getAttribute("value");

    if (document.querySelector(".branch-option-selected")) {
        var branchId = document.querySelector(".branch-option-selected").id;
        if (instalments != 0) {
            axios.post("https://walletapi.herokuapp.com/payment", {
                borrowerId: borrowerId,
                branchId: branchId,
                instalments: instalments,
                mail: mail,
                totalBalance: totalBalance
            }, headers).then((response) => {
                alert("Acuerdo Regsitrado Exitosamente");
                commentsCallSession();
            }).catch((error) => {
                console.log(error);
            });
        } else {
            commentsCallSession();
        }
    } else {
        if (instalments > 0) {
            alert("Seleccione una sucursal");
        } else {
            commentsCallSession();
        }
    }
}

/**
 * This function adds the comments to the database
 */

function commentsCallSession() {
    var borrowerId = document.getElementById("client-details-information-id").textContent;
    var comment = document.getElementById("payment-proposal-comment").value;
    axios.post("https://walletapi.herokuapp.com/session", {
        borrowerId: borrowerId,
        comment: comment
    }, headers).then((response) => {

        alert("Sesión Registrada Exitosamente");

        var gridSessionCall = document.getElementById("grid-session-call");
        var gridClientDetails = document.getElementById("grid-client-details");

        gridSessionCall.classList.add("is-hidden");
        gridClientDetails.classList.remove("is-hidden");

        getBorrower(borrowerId);
    }).catch((error) => {
        console.log(error);
    });

    document.getElementById("payment-proposal-comment").value = "";
    document.getElementById("payment-proposal-mail").value = "";
}

/**
 * This function generates the PDF report
 */

function generateReport() {
    axios.get(`https://walletapi.herokuapp.com/payment/report/${userData.id}`, headers)
        .then(function(response) {
            if (response.data.code == 0) {
                alert('No hay acuerdos para generar el reporte');
            } else {
                console.log(response.data.message)
                makePDFIndividual(response.data.message);
            }
        })
        .catch(function(error) {
            console.log(error)
        });
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
 * ----------- Interaction with user interface -----------
 */

/**
 * This function adds one to its input.
 * @param {string} id of the element from which want to obtain height.
 * @returns {number} element's height.
 */

function getHeightElement(idElement) {
    var element = document.getElementById(idElement);
    var elementHeight = element.getBoundingClientRect().height;
    return parseInt(elementHeight);
}

/**
 * This function returns the maximum number of clients that could be displayed on the table
 * @returns {number} maximum number of clients.
 */

function getElementsForTable() {
    // 44 Is the height of table row.
    elementsForTable = (getHeightElement("table-clients-content") / 44);
    // -1 Represent the table's tr that is always present.
    elementsForTable = elementsForTable - 1;
    // Number's floor
    elementsForTable = Math.floor(elementsForTable);
    return parseInt(elementsForTable);
}

/**
 * This function puts the clients in the table of the interface user.
 */

function putClientsInTable(dataObject) {
    var statusRequest = dataObject.code;

    console.log(dataObject);

    if (statusRequest === 1) {
        document.getElementById("level-right-options").classList.remove("is-hidden");

        tbodyActual = document.getElementById("tbodyClients");

        deleteRowsTable("tbodyClients");

        clientsInformation = dataObject.message;
        clientsInformation.forEach(function(client) {
            var rowCount = tbodyActual.rows.length;
            var rowClient = tbodyActual.insertRow(rowCount);
            rowClient.addEventListener("click", getBorrowerFromTable);
            rowClient.addEventListener("click", selectRowTable);

            //Table's cells
            var cellActualClient = rowClient.insertCell(0);
            var cellIdClient = rowClient.insertCell(1);
            var cellClientName = rowClient.insertCell(2);

            var cellClientAgreement = rowClient.insertCell(3);
            cellClientAgreement.classList.add("has-text-centered");

            //Actual Client
            var cellActualClientText = document.createTextNode("");
            cellActualClient.appendChild(cellActualClientText);

            //Client Identifier
            var cellIdClientText = document.createTextNode(client.borrowerId);
            cellIdClient.appendChild(cellIdClientText);

            //Client Name
            var cellClientNameText = document.createTextNode(client.borrowerName);
            cellClientName.appendChild(cellClientNameText);

            //Client Agreement
            var spanIcon = document.createElement("span");
            spanIcon.classList.add("icon");
            spanIcon.classList.add("has-text-weight-light");
            spanIcon.classList.add("has-text-grey");

            var iTag = document.createElement("i");
            iTag.classList.add("fas");

            if (client.paymentAgreement == 0) {
                iTag.classList.add("fa-times");
            } else {
                iTag.classList.add("fa-check");
            }
            spanIcon.appendChild(iTag);
            cellClientAgreement.appendChild(spanIcon);
        });
    } else {
        deleteRowsTable("tbodyClients");
        document.getElementById("level-right-options").classList.add("is-hidden");
    }
}

/**
 * This function get de idClient from a click in a specifit row.
 */

function getBorrowerFromTable() {
    var rowCells = this.cells;
    var idClientCell = rowCells.item(1);
    var idClient = idClientCell.textContent;

    var startContainer = document.getElementById("start-container");
    var gridClientDetails = document.getElementById("grid-client-details");
    var callValidationContainer = document.getElementById("call-validation-container");
    var gridSessionCall = document.getElementById("grid-session-call");

    startContainer.classList.add("is-hidden");
    gridClientDetails.classList.remove("is-hidden");
    callValidationContainer.classList.add("is-hidden");
    gridSessionCall.classList.add("is-hidden");


    getBorrower(idClient);
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
 * This function puts the regions in the dropdown for this porpouse.
 */

function putRegionsInDropdown(dataObject) {
    var statusRequest = dataObject.code;
    if (statusRequest === 1) {
        regionsDropdown = document.getElementById("navbar-regions-dropdown");

        regions = dataObject.message;
        regions.forEach(function(region) {

            var aRegion = document.createElement("a");
            aRegion.classList.add("navbar-item");
            aRegion.classList.add("navbar-item-checkbox");

            var labelRegion = document.createElement("label");
            labelRegion.classList.add("checkbox");
            labelRegion.classList.add("options-regions-checkbox");

            var inputRegion = document.createElement("input");
            inputRegion.classList.add("inputRegion")
            inputRegion.setAttribute("type", "checkbox");
            inputRegion.setAttribute("value", region.borrowerRegion);
            inputRegion.addEventListener("change", filterBorrowersByRegion);

            var spanRegion = document.createElement("span");
            var spanRegionText = document.createTextNode(" Región " + region.borrowerRegion);

            spanRegion.appendChild(spanRegionText);

            labelRegion.appendChild(inputRegion);
            labelRegion.appendChild(spanRegion);

            aRegion.appendChild(labelRegion);

            regionsDropdown.appendChild(aRegion);
        });
    }
}

/**
 * This function does the tabs interaction on the client details section. 
 */

function tabsInteraction() {
    var idTab = this.id;

    var liTab = "";
    var containerData = "";

    var otherliTab = "";
    var otheraTab = "";
    var otherContainerData = "";

    switch (idTab) {
        case "client-details-tabs-general-information":
            liTab = document.getElementById("client-details-tabs-general-information-li");
            liTab.classList.add("is-active");
            this.classList.remove("has-text-grey");
            containerData = document.getElementById("client-details-information-container");
            containerData.classList.remove("is-hidden");

            otherliTab = document.getElementById("client-details-tabs-contact-information-li");
            otherliTab.classList.remove("is-active");
            otheraTab = document.getElementById("client-details-tabs-contact-information");
            otheraTab.classList.add("has-text-grey");
            otherContainerData = document.getElementById("client-details-contact-container");
            otherContainerData.classList.add("is-hidden");

            otherliTab = document.getElementById("client-details-tabs-agreements-li");
            otherliTab.classList.remove("is-active");
            otheraTab = document.getElementById("client-details-tabs-agreements");
            otheraTab.classList.add("has-text-grey");
            otherContainerData = document.getElementById("client-details-agreements-container");
            otherContainerData.classList.add("is-hidden");
            break;
        case "client-details-tabs-contact-information":
            liTab = document.getElementById("client-details-tabs-contact-information-li");
            liTab.classList.add("is-active");
            this.classList.remove("has-text-grey");
            containerData = document.getElementById("client-details-contact-container");
            containerData.classList.remove("is-hidden");

            otherliTab = document.getElementById("client-details-tabs-general-information-li");
            otherliTab.classList.remove("is-active");
            otheraTab = document.getElementById("client-details-tabs-general-information");
            otheraTab.classList.add("has-text-grey");
            otherContainerData = document.getElementById("client-details-information-container");
            otherContainerData.classList.add("is-hidden");

            otherliTab = document.getElementById("client-details-tabs-agreements-li");
            otherliTab.classList.remove("is-active");
            otheraTab = document.getElementById("client-details-tabs-agreements");
            otheraTab.classList.add("has-text-grey");
            otherContainerData = document.getElementById("client-details-agreements-container");
            otherContainerData.classList.add("is-hidden");
            break;
        case "client-details-tabs-agreements":
            liTab = document.getElementById("client-details-tabs-agreements-li");
            liTab.classList.add("is-active");
            this.classList.remove("has-text-grey");
            containerData = document.getElementById("client-details-agreements-container");
            containerData.classList.remove("is-hidden");

            otherliTab = document.getElementById("client-details-tabs-general-information-li");
            otherliTab.classList.remove("is-active");
            otheraTab = document.getElementById("client-details-tabs-general-information");
            otheraTab.classList.add("has-text-grey");
            otherContainerData = document.getElementById("client-details-information-container");
            otherContainerData.classList.add("is-hidden");

            otherliTab = document.getElementById("client-details-tabs-contact-information-li");
            otherliTab.classList.remove("is-active");
            otheraTab = document.getElementById("client-details-tabs-contact-information");
            otheraTab.classList.add("has-text-grey");
            otherContainerData = document.getElementById("client-details-contact-container");
            otherContainerData.classList.add("is-hidden");
            break;
        default:
            // statements_def
            break;
    }
}

/**
 * This function remove all child element from a parent.
 * @param {string} id of the parent element
 */

function removeChildElements(idElement) {
    var parent = document.getElementById(idElement);
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

/**
 * This function open the form to add new phone and change the functions of button.
 */

function openFormNewPhone() {
    var formNewPhone = document.getElementById("client-details-contact-box-new-phone-form");
    formNewPhone.classList.remove("is-hidden");

    var buttonNewPhoneText = document.getElementById("client-details-contact-box-new-phone-button");
    buttonNewPhoneText.removeEventListener("click", openFormNewPhone);
    buttonNewPhoneText.addEventListener("click", addPhone);

    var buttonNewPhoneText = document.getElementById("client-details-contact-box-new-phone-button-p");
    buttonNewPhoneText.textContent = "Guardar Número Telefónico"
}

/**
 * This function client the form to add new phone and change the functions of button.
 */

function closeFormNewPhone() {
    var formNewPhone = document.getElementById("client-details-contact-box-new-phone-form");
    formNewPhone.classList.add("is-hidden");

    var buttonNewPhoneText = document.getElementById("client-details-contact-box-new-phone-button");
    buttonNewPhoneText.addEventListener("click", openFormNewPhone);
    buttonNewPhoneText.removeEventListener("click", addPhone);

    var buttonNewPhoneText = document.getElementById("client-details-contact-box-new-phone-button-p");
    buttonNewPhoneText.textContent = "Agregar Número Telefónico"
}

/**
 * This function open the call status window.
 */

function startSessionCall() {
    var callValidationContainer = document.getElementById("call-validation-container");
    var gridClientDetails = document.getElementById("grid-client-details");

    callValidationContainer.classList.remove("is-hidden");
    gridClientDetails.classList.add("is-hidden");

    var sessionCallNotLocatedButton = document.getElementById("call-validation-not-located");
    (sessionCallNotLocatedButton.parentNode).id = this.id;

    var sessionCallLocatedButton = document.getElementById("call-validation-located");
    (sessionCallLocatedButton.parentNode).id = this.id;
}

/**
 * This function open the call status window.
 */

function openSessionCall() {
    var gridClientDetails = document.getElementById("grid-client-details");
    var gridSessionCall = document.getElementById("grid-session-call");

    gridClientDetails.classList.add("is-hidden");
    gridSessionCall.classList.remove("is-hidden");
}

/**
 * This function close the call status window.
 */

function closeSessionCall() {
    var callValidationContainer = document.getElementById("call-validation-container");
    var gridClientDetails = document.getElementById("grid-client-details");

    callValidationContainer.classList.add("is-hidden");
    gridClientDetails.classList.remove("is-hidden");
}

/**
 * This function show the payment proposal.
 */

function showPaymentProposal() {
    var porpousePayments = ["Sin propuesta de pago", "1 mes", "2 meses", "3 meses", "4 meses", "5 meses", "6 meses", "7 meses", "8 meses", "9 meses", "10 meses", "11 meses", "12 meses"];

    actualPorpousePayment = document.getElementById("actual-porpouse-payments");
    actualPorpousePaymentValue = parseInt(actualPorpousePayment.getAttribute("value"));

    if (this.id == "payment-proposal-plus") {
        actualPorpousePaymentValue += 1;

        if (actualPorpousePaymentValue == 13) {
            actualPorpousePaymentValue = 0;
        }
        actualPorpousePayment.setAttribute("value", actualPorpousePaymentValue);
        actualPorpousePayment.textContent = porpousePayments[actualPorpousePaymentValue];
    }

    if (this.id == "payment-proposal-minus") {
        actualPorpousePaymentValue -= 1;

        if (actualPorpousePaymentValue == -1) {
            actualPorpousePaymentValue = 12;
        }
        actualPorpousePayment.setAttribute("value", actualPorpousePaymentValue);
        actualPorpousePayment.textContent = porpousePayments[actualPorpousePaymentValue];
    }

    //Hidden Branches
    var branchesCard = document.getElementById("branches-card");

    if (actualPorpousePaymentValue == 0) {
        branchesCard.classList.add("is-hidden");
    } else {
        branchesCard.classList.remove("is-hidden");
    }

    var totalBalance = document.getElementById("session-call-total-balance").getAttribute("value");

    var porpousePaymentsAmounts = calculatePayments(totalBalance, actualPorpousePaymentValue);

    var porpousePaymentsColumns = document.getElementById("porpouse-payments-columns");
    removeChildElements("porpouse-payments-columns");

    var porpousePaymentsCount = 1;

    porpousePaymentsAmounts.forEach(function(amount) {
        //Month
        divColumn = document.createElement("div");
        divColumn.classList.add("column");
        divColumn.classList.add("is-2");
        porpousePaymentsColumns.appendChild(divColumn);

        fieldData = document.createElement("p");
        fieldData.classList.add("content-field-info");
        fieldDataText = document.createTextNode("$ " + (amount).toLocaleString('en-US', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }));
        fieldData.appendChild(fieldDataText);
        divColumn.appendChild(fieldData);

        fieldName = document.createElement("p");
        fieldName.classList.add("content-field-name");
        fieldName.classList.add("has-text-grey");
        fieldNameText = document.createTextNode("Mes " + porpousePaymentsCount);
        fieldName.appendChild(fieldNameText);
        divColumn.appendChild(fieldName);

        porpousePaymentsCount += 1;
    });
}

/**
 * This function calculate the payments according to the installments.
 */

function calculatePayments(totalBalance, months) {
    var interest = .16;
    var payments = [];
    var installments = totalBalance / months;

    if (months > 1) {
        payments.push(((totalBalance * interest) / months) + installments)

        for (i = 1; i < months; i++) {
            totalBalance = totalBalance - payments[i - 1];
            payments.push(((totalBalance * interest) / (months)) + installments)
        }
    }
    if (months == 1) {
        payments.push(installments);
    }
    return payments;
}

/**
 * This function select a branch on agreements window.
 */

function selectBranch() {
    var allBranches = document.querySelectorAll(".branch-option");

    allBranches.forEach(function(branch) {
        branch.classList.remove("has-text-grey");
        branch.classList.remove("branch-option-selected");
    });

    this.classList.add("has-text-grey");
    this.classList.add("branch-option-selected");
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