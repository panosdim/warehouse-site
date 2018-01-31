var app = {
    alrMessage: $('#alrMessage'),
    frmLogin: $('#frmLogin'),
    sctMain: $('#sctMain'),
    sctLogin: $('#sctLogin'),
    btnLogin: $('#btnLogin'),
    displayMessage: function(message, type) {
        app.alrMessage.text(message);
        if (type === 'error') {
            app.alrMessage
                .removeClass('alert-success')
                .addClass('alert-danger');
        } else {
            app.alrMessage
                .removeClass('alert-danger')
                .addClass('alert-success');
        }

        app.alrMessage.fadeTo(2000, 500).slideUp(500, function() {
            app.alrMessage.slideUp(500);
        });
    },
    login: function(event) {
        event.preventDefault();

        var data = JSON.parse(JSON.stringify(app.frmLogin.serializeArray()));
        $.ajax({
            type: 'POST',
            url: 'php/login.php',
            dataType: 'json',
            data: data
        })
            .done(function(result) {
                if (result.status === 'success') {
                    app.displayMessage(result.message, result.status);
                    app.sctMain.toggleClass('d-none');
                    app.sctLogin.toggleClass('d-none');
                } else {
                    app.displayMessage(result.message, result.status);
                }
            })

            .fail(function(xhr, status, errorThrown) {
                alert("Sorry, there was a problem! Please reload page.");
                console.log("Error: " + errorThrown);
                console.log("Status: " + status);
                console.dir(xhr);
            });
    }
};
$(function() {
    app.alrMessage.hide();
    app.btnLogin.click(app.login);
});