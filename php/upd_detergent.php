<?php

session_start();
// If not Login exit
if (!isset($_SESSION['userId'])) {
    echo json_encode([
        "orc" => ORC::ERROR,
        'message' => 'You are not logged in.'
    ]);
    exit();
}

require_once 'database.php';

// Define variables and set to empty values
$id = $amount = $item = null;

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $id = filter_input(INPUT_POST, "id", FILTER_SANITIZE_NUMBER_INT);
    $item = filter_input(INPUT_POST, "item", FILTER_SANITIZE_STRING);
    $amount = filter_input(INPUT_POST, "amount", FILTER_SANITIZE_NUMBER_INT);
}

$stmt = $db->prepare(
    'UPDATE `detergents` SET `amount` = ?, `item` = ? WHERE `id` = ?'
);

if ($stmt->execute([$amount, $item, $id])) {
    echo json_encode([
        "orc" => ORC::SUCCESS,
        "message" => "Changes was saved successfully.",
    ]);
} else {
    // DB interaction was not successful. Inform user with message.
    echo json_encode([
        "orc"  => ORC::ERROR,
        "message" => "Problem executing statement in DB. Try again later."
    ]);
}
