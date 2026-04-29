<?php

class JsonResponse {
    public static function success($data = [], $message = 'Success', $pagination = null) {
        http_response_code(200);
        $response = [
            'message' => $message,
            'status' => 'success',
            'data' => $data
        ];
        if ($pagination) {
            $response['pagination'] = $pagination;
        }
        echo json_encode($response, JSON_PRETTY_PRINT);
        exit;
    }

    public static function created($data, $message = 'Created successfully') {
        http_response_code(201);
        echo json_encode([
            'message' => $message,
            'status' => 'success',
            'data' => $data
        ], JSON_PRETTY_PRINT);
        exit;
    }

    public static function updated($data, $message = 'Updated successfully') {
        http_response_code(200);
        echo json_encode([
            'message' => $message,
            'status' => 'success',
            'data' => $data
        ], JSON_PRETTY_PRINT);
        exit;
    }

    public static function deleted($message = 'Deleted successfully') {
        http_response_code(200);
        echo json_encode([
            'message' => $message,
            'status' => 'success',
            'data' => null
        ], JSON_PRETTY_PRINT);
        exit;
    }

    public static function error($message, $code = 400) {
        http_response_code($code);
        echo json_encode([
            'message' => $message,
            'status' => 'error',
            'data' => null
        ], JSON_PRETTY_PRINT);
        exit;
    }

    public static function notFound($entity, $id) {
        self::error("{$entity} dengan id {$id} tidak ditemukan", 404);
    }

    public static function validationError($errors) {
        self::error('Validation failed', 422);
    }
}
?>

