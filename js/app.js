$(function() {
    "use strict";

    Date.prototype.getMonthYear = function() {
        var month = this.getMonth() + 1;
        if (Number(month) < 10)
            month = '0' + month;
        return month + '-' + this.getFullYear();
    };

    var ORC = Object.freeze({
        error: 1,
        success: 2,
        info: 3,
        fail: 4
    });

    var app = {
        alrMessage: $('#alrMessage'),
        frmLogin: $('#frmLogin'),
        frmFood: $('#frmFood'),
        sctMain: $('#sctMain'),
        sctLogin: $('#sctLogin'),
        tblFood: $('#tblFood'),
        btnLogin: $('#btnLogin'),
        btnLogout: $('#btnLogout'),
        btnAddFood: $('#btnAddFood'),
        btnDeleteFood: $('#btnDeleteFood'),
        btnSaveFood: $('#btnSaveFood'),
        foodModal: $('#foodModal'),
        modalTitle: $('#modalTitle'),
        food: [],
        detergents: [],
        sanitary: []
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

    app.displayFood = function() {
        var i = app.food.length;
        var tbody = app.tblFood.find('tbody');
        var frag = document.createDocumentFragment();
        var now = new Date();
        var nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        // Construct the table body as fragment
        while (i--) {
            var date = new Date(app.food[i].exp_date);

            var row = $('<tr></tr>')
                .append($('<td></td>').text(app.food[i].item))
                .append($('<td></td>').text(date.getMonthYear()))
                .append($('<td></td>').text(app.food[i].amount))
                .append($('<td></td>').text(app.food[i].box))
                .data('id', app.food[i].id)
                .data('date', app.food[i].exp_date);

            if (date < now) {
                row.addClass('table-danger');
            }

            if (date <= nextMonth) {
                row.addClass('table-warning');
            }

            if (!app.food[i].exp_date) {
                row.find('td:eq(1)').text("Never");
                row
                    .removeClass('table-danger')
                    .removeClass('table-warning')
                    .addClass('table-success');
                $(frag).append(row);
            } else {
                $(frag).prepend(row);
            }
        }
        // Add fragment to table body in DOM
        tbody.append(frag);
    };

    /*****************************************************************************
     *
     * Methods for dealing with the model
     *
     ****************************************************************************/

    app.login = function() {
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
                    app.getFood();
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
                    app.getFood();
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

    app.getFood = function() {
        $.ajax({
            type: 'GET',
            url: 'php/get_food.php',
            dataType: 'json'
        })
            .done(function(result) {
                /** @namespace result.data */
                if (result.orc === ORC.success) {
                    app.food = $.extend([], result.data);
                    app.displayFood();
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

    app.btnLogin.click(function(event) {
        event.preventDefault();

        app.frmLogin.addClass('was-validated');
        if (app.frmLogin[0].checkValidity() === true) {
            app.login();
        }
    });

    app.btnLogout.click(app.logout);

    app.btnAddFood.click(function() {
        app.btnSaveFood.removeData();
        app.btnDeleteFood.hide();
        app.modalTitle.text('Add New Food');
        app.foodModal.modal('show');
    });

    app.btnSaveFood.click(function(event) {
        event.preventDefault();

        app.frmFood.addClass('was-validated');
        if (app.frmFood[0].checkValidity() === true) {
            console.log("VALID");
            app.foodModal.modal('hide');
        }
    });

    app.tblFood.click(function(event) {
        var row = $(event.target).closest('tr');
        var id = row.data('id');
        $('#item').val(row.find('td:eq(0)').text());
        $('#expDate').datepicker('update', new Date(row.data('date')));
        $('#amount').val(row.find('td:eq(2)').text());
        $('#box').val(row.find('td:eq(3)').text());
        app.btnSaveFood.data('id', id);
        app.btnDeleteFood
            .data('id', id)
            .show();
        app.modalTitle.text('Edit Food');
        app.foodModal.modal('show');
    });

    /*****************************************************************************
     *
     * Initialize UI
     *
     ****************************************************************************/

    app.alrMessage.hide();
    app.btnDeleteFood.hide();
    $('#expDate').datepicker({
        format: "mm/yyyy",
        startView: 1,
        minViewMode: 1,
        autoclose: true,
        todayHighlight: true
    });
    app.foodModal.on('hidden.bs.modal', function (e) {
        $('#item').val('');
        $('#expDate').datepicker('update', '');
        $('#amount').val('');
        $('#box').val('1');
    });

    app.session();
});