<?php

require_once 'Service.php';
require_once 'Validator.php';
require_once __DIR__ . '/../../Responses/JsonResponse.php';

class OwnerProfileController {
    private $service;
    private $validator;

    public function __construct() {
        $this->service = new OwnerProfileService();
        $this->validator = new OwnerProfileValidator();
    }

    private function getCurrentUserRole() {
        // TODO: Implement real auth check from session/JWT
        // For now, mock based on request (replace with real auth)
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (strpos($authHeader, 'super_admin') !== false) {
            return 'super_admin';
        }
        return 'user'; // default
    }

    private function canAccessProfile($profile, $action = 'read') {
        $userRole = $this->getCurrentUserRole();
        $currentUserId = $_SESSION['auth_id'] ?? 1; // Mock - replace with real session/JWT
        
        if ($userRole === 'super_admin') {
            return true;
        }
        
        return isset($profile['authId']) && $profile['authId'] == $currentUserId;
    }

    public function index($page = 1, $limit = 10) {
        try {
            $result = $this->service->getAll((int)$page, (int)$limit);
            JsonResponse::success($result['data'], 'Owner profile ditemukan', $result['pagination']);
        } catch (Exception $e) {
            JsonResponse::error($e->getMessage(), 500);
        }
    }

    public function store($input) {
        try {
            $this->validator->validateStore($input);
            if ($this->getCurrentUserRole() !== 'super_admin') {
                JsonResponse::error('Only super admin can create owner profiles', 403);
                return;
            }
            $input['authId'] = $input['authId'] ?? 0; // From request
            $this->validator->validateAuthId($input['authId']);
            $newProfile = $this->service->create($input);
            JsonResponse::created($newProfile ?? [], 'Owner profile berhasil dibuat');
        } catch (Exception $e) {
            JsonResponse::error($e->getMessage(), 400);
        }
    }

    public function show($id) {
        try {
            $this->validator->validateId($id);
            $profile = $this->service->findById($id);
            if (!$profile) {
                JsonResponse::notFound('Owner profile', $id);
                return;
            }
            
            if (!$this->canAccessProfile($profile, 'read')) {
                JsonResponse::error('Access denied to this owner profile', 403);
                return;
            }
            
            JsonResponse::success($profile, 'Berhasil mengambil data owner profile');
        } catch (Exception $e) {
            JsonResponse::error($e->getMessage(), 400);
        }
    }

    public function update($input, $id) {
        try {
            $this->validator->validateId($id);
            $this->validator->validateUpdate($input);
            
            $profile = $this->service->findById($id);
            if (!$profile) {
                JsonResponse::notFound('Owner profile', $id);
                return;
            }
            
            if (!$this->canAccessProfile($profile, 'update')) {
                JsonResponse::error('Access denied to update this owner profile', 403);
                return;
            }
            
            $updated = $this->service->update($id, $input);
            JsonResponse::updated($updated, 'Owner profile berhasil diupdate');
        } catch (Exception $e) {
            JsonResponse::error($e->getMessage(), 400);
        }
    }

    public function destroy($id) {
        try {
            $this->validator->validateId($id);
            $profile = $this->service->findById($id);
            if (!$profile) {
                JsonResponse::notFound('Owner profile', $id);
                return;
            }
            
            if ($this->getCurrentUserRole() !== 'super_admin') {
                JsonResponse::error('Only super admin can delete owner profiles', 403);
                return;
            }
            
            $this->service->delete($id);
            JsonResponse::deleted('Owner profile berhasil dihapus');
        } catch (Exception $e) {
            JsonResponse::error($e->getMessage(), 400);
        }
    }
}
?>

