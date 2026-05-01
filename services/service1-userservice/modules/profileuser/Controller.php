<?php

require_once 'Service.php';
require_once 'Validator.php';
require_once __DIR__ . '/../../responses/JsonResponse.php';
require_once __DIR__ . '/../../middlewares/AuthMiddleware.php';

class ProfileUserController {
    private $service;
    private $validator;

    public function __construct() {
        $this->service = new ProfileUserService();
        $this->validator = new ProfileUserValidator();
    }

    private function getCurrentUserRole() {
        $user = AuthMiddleware::getCurrentUser();
        return $user['role'] ?? 'user';
    }

    private function getCurrentUserId() {
        $user = AuthMiddleware::getCurrentUser();
        return $user['id'] ?? null;
    }

    private function canAccessProfile($profile, $action = 'read') {
        $userRole = $this->getCurrentUserRole();
        $currentUserId = $this->getCurrentUserId();
        
        if ($userRole === 'Superadmin' || $userRole === 'Pemilik') {
            return true;
        }
        
        return isset($profile['authId']) && $profile['authId'] == $currentUserId;
    }

    public function index($page = 1, $limit = 10) {
        try {
            if (!AuthMiddleware::authMiddleware()) {
                return;
            }
            $result = $this->service->getAll((int)$page, (int)$limit);
            JsonResponse::success($result['data'], 'Profile ditemukan', $result['pagination']);
        } catch (Exception $e) {
            JsonResponse::error($e->getMessage(), 500);
        }
    }

    public function store($input) {
        try {
            if (!AuthMiddleware::authMiddleware()) {
                return;
            }
            if (!AuthMiddleware::requireSuperadmin()) {
                return;
            }
            $this->validator->validateStore($input);
            
            if (!empty($input['username']) && !empty($input['email']) && !empty($input['password'])) {
                $newProfile = $this->service->createWithAuth($input);
                JsonResponse::created($newProfile ?? [], 'User dan Profile berhasil dibuat');
            } else {
                if (empty($input['authId'])) {
                    JsonResponse::error('authId wajib diisi jika tidak menggunakan username/email/password', 400);
                    return;
                }
                $newProfile = $this->service->create($input);
                JsonResponse::created($newProfile ?? [], 'Profile berhasil dibuat');
            }
        } catch (Exception $e) {
            JsonResponse::error($e->getMessage(), 400);
        }
    }

    public function show($id) {
        try {
            if (!AuthMiddleware::authMiddleware()) {
                return;
            }
            $this->validator->validateId($id);
            $profile = $this->service->findById($id);
            if (!$profile) {
                JsonResponse::notFound('Profile', $id);
                return;
            }
            
            if (!$this->canAccessProfile($profile, 'read')) {
                JsonResponse::error('Access denied to this profile', 403);
                return;
            }
            
            JsonResponse::success($profile, 'Berhasil mengambil data profile');
        } catch (Exception $e) {
            JsonResponse::error($e->getMessage(), 400);
        }
    }

    public function update($input, $id) {
        try {
            if (!AuthMiddleware::authMiddleware()) {
                return;
            }
            $this->validator->validateId($id);
            $this->validator->validateUpdate($input);
            
            $profile = $this->service->findById($id);
            if (!$profile) {
                JsonResponse::notFound('Profile', $id);
                return;
            }
            
            if (!$this->canAccessProfile($profile, 'update')) {
                JsonResponse::error('Access denied to update this profile', 403);
                return;
            }
            
            $updated = $this->service->update($id, $input);
            JsonResponse::updated($updated, 'Profile berhasil diupdate');
        } catch (Exception $e) {
            JsonResponse::error($e->getMessage(), 400);
        }
    }

    public function destroy($id) {
        try {
            if (!AuthMiddleware::authMiddleware()) {
                return;
            }
            if (!AuthMiddleware::requireSuperadmin()) {
                return;
            }
            $this->validator->validateId($id);
            $profile = $this->service->findById($id);
            if (!$profile) {
                JsonResponse::notFound('Profile', $id);
                return;
            }
            
            $this->service->delete($id);
            JsonResponse::deleted('Profile berhasil dihapus');
        } catch (Exception $e) {
            JsonResponse::error($e->getMessage(), 400);
        }
    }
}
?>
