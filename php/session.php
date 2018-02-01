<?php

session_start();

if (isset($_SESSION['userId'])) {
    echo json_encode([
        "loggedIn" => true
    ]);
} else {
    echo json_encode([
        "loggedIn" => false
    ]);
}