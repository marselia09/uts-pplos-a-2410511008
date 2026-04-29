<?php

require_once 'Service.php';
require_once 'Validator.php';
require_once __DIR__ . '/../../Responses/JsonResponse.php';

class RolesController {
    private $service;
    private $validator;

    public function __construct() {
        $this->service = new RolesService();
        $this->validator = new RolesValidator();
    }

    public function index($page = 1, $limit = 10) {
        try {
            $result = $this->service->getAll((int)$page, (int)$limit);
            JsonResponse::success($result['data'], 'Role ditemukan', $result['pagination']);
        } catch (Exception $e) {
            JsonResponse::error($e->getMessage(), 500);
        }
    }

    public function store($input) {
        try {
            $this->validator->validateStore($input);
            $newRole = $this->service->create($input);
            JsonResponse::created($newRole ?? [], 'Role berhasil dibuat');
        } catch (Exception $e) {
            JsonResponse::error($e->getMessage(), 400);
        }
    }

    public function show($id) {
        try {
            $this->validator->validateId($id);
            $role = $this->service->findById($id);
            if (!$role) {
                JsonResponse::notFound('Role', $id);
            }
            JsonResponse::success($role, 'Berhasil mengambil data');
        } catch (Exception $e) {
            JsonResponse::error($e->getMessage(), 400);
        }
    }

    public function update($input, $id) {
        try {
            $this->validator->validateId($id);
            $this->validator->validateUpdate($input);
            $updated = $this->service->update($id, $input);
            JsonResponse::updated($updated);
        } catch (Exception $e) {
            JsonResponse::error($e->getMessage(), 400);
        }
    }

    public function destroy($id) {
        try {
            $this->validator->validateId($id);
            $this->service->delete($id);
            JsonResponse::deleted('Role berhasil dihapus');
        } catch (Exception $e) {
            JsonResponse::error($e->getMessage(), 400);
        }
    }
}
?>

