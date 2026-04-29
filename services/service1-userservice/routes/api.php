<?php

require_once __DIR__ . '/../Responses/JsonResponse.php';
require_once __DIR__ . '/../modules/roles/Routes.php';
// require_once __DIR__ . '/../Modules/Fakultas/Routes.php';

$modules = [
    // 'fakultas' => 'handleFakultasRoutes',
    // 'mahasiswa' => 'handleMahasiswaRoutes', 
    // 'peminjaman' => 'handlePeminjamanRoutes',
    'role' => 'handleRolesRoutes'
];

$requestUri = $_SERVER['REQUEST_URI'];
$path = trim(parse_url($requestUri, PHP_URL_PATH), '/');
$method = $_SERVER['REQUEST_METHOD'];

// Strip /api/ prefix
if (strpos($path, 'api/') === 0) {
    $path = substr($path, 4);
}

// Extract module and suffix
$pathParts = explode('/', $path);
$moduleName = $pathParts[0] ?? '';
$pathSuffix = ltrim(implode('/', array_slice($pathParts, 1)), '/');

$input = json_decode(file_get_contents('php://input'), true) ?: [];

if (isset($modules[$moduleName])) {
    $moduleDir = ucfirst($moduleName);
    $handler = $modules[$moduleName];
    $handler($pathSuffix, $method, $input);
} else {
    JsonResponse::error('Module not found: ' . $moduleName, 404);
}
?>

