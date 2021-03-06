<?php

session_start();
// If not Login exit
if (!isset($_SESSION['userId'])) {
    echo json_encode([
        "orc"  => ORC::ERROR,
        'message' => 'You are not logged in.'
    ]);
    exit();
}

require_once 'database.php';

// Define variables and set to empty values
$amount = $item = $exp_date = $box = null;

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $item = filter_input(INPUT_POST, "item", FILTER_SANITIZE_STRING);
    $amount = filter_input(INPUT_POST, "amount", FILTER_SANITIZE_NUMBER_INT);
    $exp_date = filter_input(INPUT_POST, "expDate", FILTER_SANITIZE_STRING);
    $box = filter_input(INPUT_POST, "box", FILTER_SANITIZE_NUMBER_INT);
}

// Insert movie in the table
$stmt = $db->prepare(
    'INSERT INTO `food` (`item`, `amount`, `exp_date`, `box`) VALUES (?, ?, ?, ?)'
);

if ($exp_date === '') {
    $exp_date = null;
}

if ($stmt->execute([$item, $amount, $exp_date, $box])) {
    echo json_encode([
        "orc" => ORC::SUCCESS,
        "message" => "Food was added successfully."
    ]);
} else {
    // DB interaction was not successful. Inform user with message.
    echo json_encode([
        "orc"  => ORC::ERROR,
        "message" => "Problem executing statement in DB. Try again later."
    ]);
}