<?php

require_once __DIR__ . '/../responses/JsonResponse.php';

class AuthMiddleware {
    private static $JWT_SECRET = 'change-me-in-env';

    private static function base64UrlDecode($data) {
        $remainder = strlen($data) % 4;
        if ($remainder) {
            $data .= str_repeat('=', 4 - $remainder);
        }
        $data = str_replace(['-', '_'], ['+', '/'], $data);
        return base64_decode($data);
    }

    public static function verifyToken($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new Exception('Format token tidak valid', 401);
        }

        $header = json_decode(self::base64UrlDecode($parts[0]), true);
        $payload = json_decode(self::base64UrlDecode($parts[1]), true);
        $signature = $parts[2];

        if (!isset($payload['type']) || $payload['type'] !== 'access') {
            throw new Exception('Tipe token tidak valid', 401);
        }

        if (isset($payload['exp']) && $payload['exp'] < time()) {
            throw new Exception('Token sudah expired', 401);
        }

        return $payload;
    }

    public static function authMiddleware() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        if (empty($authHeader) || !str_starts_with($authHeader, 'Bearer ')) {
            JsonResponse::error('Authorization header dengan Bearer token diperlukan', 401);
            return false;
        }

        $token = substr($authHeader, 7);

        try {
            $payload = self::verifyToken($token);
            $_REQUEST['auth_user'] = [
                'id' => (int)$payload['sub'],
                'email' => $payload['email'] ?? null,
                'username' => $payload['username'] ?? null,
                'role' => $payload['role'] ?? 'user',
            ];
            return true;
        } catch (Exception $e) {
            JsonResponse::error($e->getMessage(), $e->getCode() ?: 401);
            return false;
        }
    }

    public static function requireSuperadmin() {
        $user = $_REQUEST['auth_user'] ?? null;
        if (!$user || ($user['role'] !== 'Superadmin' && $user['role'] !== 'Pemilik')) {
            JsonResponse::error('Hanya superadmin/pemilik yang dapat melakukan aksi ini', 403);
            return false;
        }
        return true;
    }

    public static function isSuperadmin($role) {
        return $role === 'Superadmin';
    }

    public static function isPemilik($role) {
        return $role === 'Pemilik';
    }

    public static function getCurrentUser() {
        return $_REQUEST['auth_user'] ?? null;
    }
}