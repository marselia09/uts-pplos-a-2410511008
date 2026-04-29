<?php

function getDB() {
    $host = getenv('DB_HOST') ?: 'localhost';
    $port = getenv('DB_PORT') ?: 3306;
    $dbname = getenv('DB_NAME') ?: 'sistem_koskosan_db';
    $user = getenv('DB_USER') ?: 'root';
    $pass = getenv('DB_PASS') ?: '';
    
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
    try {
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
        $pdo->exec("SET SESSION sql_mode = ''");
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['message' => 'DB Connection failed', 'error' => $e->getMessage()]);
        exit;
    }
}

?>

