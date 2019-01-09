function makePDFIndividual(user) {
    var doc = new jsPDF();
    //Encabezado
    doc.setFontType('helvetica')
    doc.setFontSize(16);
    doc.text(160, 30, getDate());
    doc.setFontType('bold')
    doc.text(20, 30, 'Reporte individual');
    const userId = user[0].userId;
    const userMail = user[0].userMail;
    const userName = user[0].userName;
    doc.setFont('times')
    doc.setFontType('normal')
    doc.setFontSize(12);
    doc.text(20, 40, "Id del cobrador: " + String(userId).padStart(6, '0'));
    doc.text(20, 45, "Correo del cobrador: " + userMail);
    doc.text(20, 50, "Nombre de cobrador: " + userName);
    var lastPosition = 60;
    var cont = 0;
    var page = 1;
    var limit = 2;

    for (const payment in user) {
        var paymentId = user[payment]['paymentId'];
        var addedDate = user[payment]['addedDate'].substring(0, 10);
        var borrowerName = user[payment]['borrowerName'];
        var borrowerRFC = user[payment]['borrowerRFC'];
        var borrowerBalance = user[payment]['borrowerBalance'];
        var instalments = user[payment]['instalments'];
        var branchName = user[payment]['branchName'];
        var branchAddress = user[payment]['branchAddress'];
        doc.setFontType('bold')
        doc.text(20, lastPosition + 10, 'Pago ' + String(paymentId).padStart(6, '0'));
        doc.text(160, lastPosition + 10, 'Fecha ' + addedDate);
        doc.setFontType('normal')
        doc.text(20, lastPosition + 20, 'Nombre: ' + borrowerName);
        doc.text(20, lastPosition + 25, 'RFC: ' + borrowerRFC);
        doc.text(20, lastPosition + 35, 'Balance: ' + borrowerBalance);
        doc.text(20, lastPosition + 40, 'No. de pagos: ' + instalments);
        doc.text(20, lastPosition + 50, 'Nombre de sucursal: ' + branchName);
        doc.text(20, lastPosition + 55, 'Dirección: ' + branchAddress);
        if (page != 1) {
            limit = 3;
        }
        if (cont == limit) {
            doc.addPage();
            lastPosition = 10;
            lastPosition += 10;
            cont = 0;
            page++;
        } else {
            lastPosition += 80;
        }
        cont++;
    }
    doc.save(`Reporte Individual (${String(userId).padStart(6, '0')}) - ${getDate()}.pdf`);
}

function makePDFMensual(user) {
    var doc = new jsPDF();
    //Encabezado
    doc.setFontType('helvetica')
    doc.setFontSize(16);
    doc.text(160, 30, getDate());
    doc.setFontType('bold')
    doc.text(20, 30, 'Reporte mensual');
    doc.setFont('times')
    doc.setFontType('normal')
    doc.setFontSize(12);
    var lastPosition = 50;
    var cont = 0;
    var page = 1;
    var limit = 2;

    for (const payment in user) {
        var paymentId = user[payment]['paymentId'];
        var addedDate = user[payment]['addedDate'].substring(0, 10);
        var borrowerName = user[payment]['borrowerName'];
        var borrowerRFC = user[payment]['borrowerRFC'];
        var borrowerBalance = user[payment]['borrowerBalance'];
        var instalments = user[payment]['instalments'];
        var branchName = user[payment]['branchName'];
        var branchAddress = user[payment]['branchAddress'];
        var username;

        if (username != user[payment]['username']) {
            doc.setFontType('bold')
            doc.setFontSize(14);
            username = user[payment]['username']
            doc.text(20, lastPosition, "Nombre de cobrador: " + username);
        }

        doc.setFontSize(12);
        doc.setFontType('bold')
        doc.text(20, lastPosition + 10, 'Pago ' + String(paymentId).padStart(6, '0'));
        doc.text(160, lastPosition + 10, 'Fecha ' + addedDate);
        doc.setFontType('normal')
        doc.text(20, lastPosition + 20, 'Nombre: ' + borrowerName);
        doc.text(20, lastPosition + 25, 'RFC: ' + borrowerRFC);
        doc.text(20, lastPosition + 35, 'Balance: $' + borrowerBalance + '.00');
        doc.text(20, lastPosition + 40, 'No. de pagos: ' + instalments);
        doc.text(20, lastPosition + 50, 'Nombre de sucursal: ' + branchName);
        doc.text(20, lastPosition + 55, 'Dirección: ' + branchAddress);
        if (page != 1) {
            limit = 3;
        }
        if (cont == limit) {
            doc.addPage();
            lastPosition = 10;
            lastPosition += 10;
            cont = 0;
            page++;
        } else {
            lastPosition += 80;
        }
        cont++;
    }
    doc.save(`Reporte Mensual - ${getDate()}.pdf`);
}

function getDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    var today = dd + '/' + mm + '/' + yyyy;
    return today;
}