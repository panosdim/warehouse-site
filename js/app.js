$(function() {
    "use strict";

    var ORC = Object.freeze({
        error: 1,
        success: 2,
        info: 3,
        fail: 4
    });

    var app = {
        alrMessage: $('#alrMessage'),
        frmLogin: $('#frmLogin'),
        sctMain: $('#sctMain'),
        sctLogin: $('#sctLogin'),
        btnLogin: $('#btnLogin'),
        btnLogout: $('#btnLogout')
    };

    /*****************************************************************************
     *
     * Methods to update/refresh the UI
     *
     ****************************************************************************/

    app.displayMessage = function(message, type) {
        app.alrMessage.text(message);
        switch (type) {
            case ORC.error:
                app.alrMessage
                    .removeClass('alert-success alert-info alert-warning')
                    .addClass('alert-danger');
                break;
            case ORC.success:
                app.alrMessage
                    .removeClass('alert-danger alert-info alert-warning')
                    .addClass('alert-success');
                break;
            case ORC.info:
                app.alrMessage
                    .removeClass('alert-danger alert-success alert-warning')
                    .addClass('alert-info');
                break;
            case ORC.fail:
                app.alrMessage
                    .removeClass('alert-danger alert-success alert-info')
                    .addClass('alert-warning');
                break;
            default:
                app.alrMessage
                    .removeClass('alert-danger alert-success alert-warning')
                    .addClass('alert-info');
        }

        app.alrMessage.fadeTo(2000, 500).slideUp(500, function() {
            app.alrMessage.slideUp(500);
        });
    };

    /*****************************************************************************
     *
     * Methods for dealing with the model
     *
     ****************************************************************************/

    app.login = function(event) {
        event.preventDefault();

        var data = JSON.parse(JSON.stringify(app.frmLogin.serializeArray()));
        $.ajax({
            type: 'POST',
            url: 'php/login.php',
            dataType: 'json',
            data: data
        })
            .done(function(result) {
                /** @namespace result.orc */
                if (result.orc === ORC.success) {
                    app.sctMain.toggleClass('d-none');
                    app.sctLogin.toggleClass('d-none');
                }
                app.displayMessage(result.message, result.orc);
            })

            .fail(function(xhr, status, errorThrown) {
                app.displayMessage("Sorry, there was a problem with AJAX!", ORC.error);
                console.log("Error: " + errorThrown);
                console.log("Status: " + status);
                console.dir(xhr);
            });
    };

    app.logout = function(event) {
        event.preventDefault();

        $.ajax({
            type: 'GET',
            url: 'php/logout.php'
        })
            .done(function() {
                app.sctMain.toggleClass('d-none');
                app.sctLogin.toggleClass('d-none');
                app.displayMessage("Logged out successfully.", ORC.info);
            })

            .fail(function(xhr, status, errorThrown) {
                app.displayMessage("Sorry, there was a problem with AJAX!", ORC.error);
                console.log("Error: " + errorThrown);
                console.log("Status: " + status);
                console.dir(xhr);
            });
    };

    app.session = function() {
        $.ajax({
            type: 'GET',
            url: 'php/session.php',
            dataType: 'json'
        })
            .done(function(result) {
                /** @namespace result.loggedIn */
                if (result.loggedIn) {
                    app.sctMain.toggleClass('d-none');
                    app.sctLogin.toggleClass('d-none');
                    app.displayMessage("Welcome back!", ORC.info);
                }
            })

            .fail(function(xhr, status, errorThrown) {
                app.displayMessage("Sorry, there was a problem with AJAX!", ORC.error);
                console.log("Error: " + errorThrown);
                console.log("Status: " + status);
                console.dir(xhr);
            });
    };

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(function() {
                console.log('Service Worker Registered');
            });
    }

    /*****************************************************************************
     *
     * Event listeners for UI elements
     *
     ****************************************************************************/

    app.btnLogin.click(app.login);
    app.btnLogout.click(app.logout);

    /*****************************************************************************
     *
     * Initialize UI
     *
     ****************************************************************************/

    app.alrMessage.hide();
    app.session();
});