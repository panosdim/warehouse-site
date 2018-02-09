$(function() {
    "use strict";

    Date.prototype.getMonthYear = function() {
        var month = this.getMonth() + 1;
        if (Number(month) < 10)
            month = '0' + month;
        return month + '-' + this.getFullYear();
    };

    Date.prototype.toISO8601 = function() {
        return this.getFullYear() + '-' +
            ('0' + (this.getMonth() + 1)).slice(-2) + '-' +
            ('0' + this.getDate()).slice(-2);
    };

    var ORC = Object.freeze({
        error: 1,
        success: 2,
        info: 3,
        fail: 4
    });

    var app = {
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
        var msg_type;
        switch (type) {
            case ORC.error:
                msg_type = 'danger';
                break;
            case ORC.success:
                msg_type = 'success';
                break;
            case ORC.info:
                msg_type = 'info';
                break;
            case ORC.fail:
                msg_type = 'warning';
                break;
            default:
                msg_type = 'info';
        }

        $.notify(
            {
                message: message
            },
            {
                type: msg_type,
                placement: {
                    from: "bottom",
                    align: "center"
                }
            });
    };

    app.displayFood = function() {
        var i = app.food.length;
        var tbody = app.tblFood.find('tbody');
        tbody.empty();
        var frag = document.createDocumentFragment();
        var now = new Date();
        var nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        // Construct the table body as fragment
        while (i--) {
            /** @namespace app.food[i].exp_date */
            var date = new Date(app.food[i].exp_date);

            /** @namespace app.food[i].box */
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

            /** @namespace app.food[i].exp_date */
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

    app.addFood = function() {
        var data = JSON.parse(JSON.stringify(app.frmFood.serializeArray()));
        var date = $('#expDate').datepicker('getDate');
        if (date !== null) {
            data[1].value = date.toISO8601();
        }

        $.ajax({
            type: 'POST',
            url: 'php/add_food.php',
            dataType: 'json',
            data: data
        })
            .done(function(result) {
                /** @namespace result.orc */
                if (result.orc === ORC.success) {
                    app.foodModal.modal('hide');
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

    app.delFood = function(id) {
        $.ajax({
            type: 'POST',
            url: 'php/del_food.php',
            dataType: 'json',
            data: {id: id}
        })
            .done(function(result) {
                /** @namespace result.orc */
                if (result.orc === ORC.success) {
                    app.foodModal.modal('hide');
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

    app.updFood = function(id) {
        var data = JSON.parse(JSON.stringify(app.frmFood.serializeArray()));
        var date = $('#expDate').datepicker('getDate');
        if (date !== null) {
            data[1].value = date.toISO8601();
        }
        data.push({name: "id", value: id});

        $.ajax({
            type: 'POST',
            url: 'php/upd_food.php',
            dataType: 'json',
            data: data
        })
            .done(function(result) {
                /** @namespace result.orc */
                if (result.orc === ORC.success) {
                    app.foodModal.modal('hide');
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

        var id = app.btnSaveFood.data('id');
        app.frmFood.addClass('was-validated');
        if (app.frmFood[0].checkValidity() === true) {
            if (id) {
                app.updFood(id);
            } else {
                app.addFood();
            }
        }
    });

    app.btnDeleteFood.click(function(event) {
        event.preventDefault();

        app.delFood(app.btnDeleteFood.data('id'));
    });

    app.tblFood.click(function(event) {
        var row = $(event.target).closest('tr');
        var id = row.data('id');
        var date = row.data('date');
        $('#item').val(row.find('td:eq(0)').text());
        if (date !== null) {
            $('#expDate').datepicker('update', new Date(date));
        }
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

    app.btnDeleteFood.hide();
    $('#expDate').datepicker({
        format: "mm/yyyy",
        startView: 1,
        minViewMode: 1,
        autoclose: true,
        todayHighlight: true
    });
    app.foodModal.on('hidden.bs.modal', function() {
        $('#item').val('');
        $('#expDate').datepicker('update', '');
        $('#amount').val('');
        $('#box').val('1');
        app.frmFood.removeClass('was-validated');
    });

    $.notifyDefaults({
        delay: 2000
    });

    app.session();
});