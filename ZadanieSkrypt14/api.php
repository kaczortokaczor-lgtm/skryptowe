<?php
    header('Content-Type: application/json; charset=UTF-8');

    if ($_SERVER['REQUEST_METHOD'] !== 'GET')
        {
            http_response_code(405);
            header('Allow: GET');
            echo json_encode(['error' => 'Method Not Allowed']);
            exit;
        }

    $input = file_get_contents(__DIR__ . '/dane.json');
    $dane = json_decode($input, true);
    $output = 
        [
            'status' => 'success',
            'data' => $dane
        ];
    echo json_encode($output, JSON_UNESCAPED_UNICODE);


