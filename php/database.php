<?php

// Connect to MySQL server
// TODO: Update with server settings
define('DB_USER', 'root');
define('DB_PASS', 'test!123');
define('DB_DSN', 'mysql:host=localhost;dbname=stockroo_warehouse;charset=utf8');

// Create PDO object
$db = new PDO(
    DB_DSN,
    DB_USER,
    DB_PASS
);