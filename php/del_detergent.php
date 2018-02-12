<?php

session_start();
// If not Logged In exit
if (!isset($_SESSION['userId'])) {
    echo json_encode([
        "orc"  => ORC::ERROR,
        'message' => 'You are not logged in.'
    ]);
    exit();
}

require_once 'database.php';

// Define variables and set to empty values
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $id = filter_input(INPUT_POST, "id", FILTER_SANITIZE_NUMBER_INT);
}
// filter elements for SQL injection
$id = $db->quote($id);

// Delete measurements from the table
$stmt = $db->prepare(
    "DELETE FROM `detergents` WHERE id = $id"
);

if ($stmt->execute()) {
    echo json_encode([
        "orc" => ORC::SUCCESS,
        "message" => "Detergent was deleted successfully.",
    ]);
} else {
    // DB interaction was not successful. Inform user with message.
    echo json_encode([
        "orc"  => ORC::ERROR,
        "message" => "Problem executing statement in DB. Try again later."
    ]);
}