<?php

require_once 'Controller.php';

function handleProfileUserRoutes($path_suffix, $method, $input = []) {
    $controller = new ProfileUserController();
    
    $page = $_GET['page'] ?? 1;
    $limit = $_GET['limit'] ?? 10;
    
    if ($path_suffix === '' || $path_suffix === 'profile') {
        if ($method === 'GET') {
            $controller->index($page, $limit);
        } elseif ($method === 'POST') {
            $controller->store($input);
        }
    } elseif (preg_match('#^(\\d+)$#', $path_suffix, $matches)) {
        $id = (int)$matches[1];
        switch ($method) {
            case 'GET':
                $controller->show($id);
                break;
            case 'PUT':
                $controller->update($input, $id);
                break;
            case 'DELETE':
                $controller->destroy($id);
                break;
            default:
                JsonResponse::error('Method not allowed', 405);
        }
    } else {
        JsonResponse::error('Route not found', 404);
    }
}
?>
