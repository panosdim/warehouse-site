<?php

session_start();
// If not Login exit
if (!isset($_SESSION['userId'])) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'You are not logged in.'
    ]);
    exit();
}

require_once 'database.php';

// Find the movies of the specific user id
$stmt = $db->prepare(
    'SELECT * FROM food ORDER BY `exp_date` ASC'
);

if ($stmt->execute()) {
    $query = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($query !== false) {
        echo json_encode([
            "orc" => ORC::SUCCESS,
            "data"   => $query,
        ]);
    } else {
        // No measures found for user.
        echo json_encode([
            "orc"  => ORC::FAIL,
            "message" => "Fail to retrieve results from DB. Try again later.",
        ]);
    }
} else {
    // DB interaction was not successful. Inform user with message.
    echo json_encode([
        "orc"  => ORC::ERROR,
        "message" => "Problem executing statement in DB. Try again later.",
    ]);
}
