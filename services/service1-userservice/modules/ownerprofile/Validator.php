<?php

class OwnerProfileValidator {
    public static function validateStore($data) {
        $errors = [];
        
        $hasAuthData = !empty($data['username']) && !empty($data['email']) && !empty($data['password']);
        $hasAuthId = !empty($data['authId']);
        
        if (!$hasAuthData && !$hasAuthId) {
            $errors[] = 'Field username, email, password atau authId wajib diisi';
        }
        
        if ($hasAuthData) {
            if (strlen($data['username'] ?? '') > 50) {
                $errors[] = 'Username tidak boleh lebih dari 50 karakter';
            }
            
            if (!filter_var($data['email'] ?? '', FILTER_VALIDATE_EMAIL)) {
                $errors[] = 'Format email tidak valid';
            }
            
            if (strlen($data['password'] ?? '') < 6) {
                $errors[] = 'Password minimal 6 karakter';
            }
        }
        
        if ($hasAuthId) {
            if (!is_numeric($data['authId']) || $data['authId'] <= 0) {
                $errors[] = 'authId harus berupa angka positif';
            }
        }
        
        if (empty($data['firstname'] ?? '')) {
            $errors[] = 'Field firstname wajib diisi';
        }
        if (strlen($data['firstname'] ?? '') > 191) {
            $errors[] = 'Firstname tidak boleh lebih dari 191 karakter';
        }
        
        if (empty($data['lastname'] ?? '')) {
            $errors[] = 'Field lastname wajib diisi';
        }
        if (strlen($data['lastname'] ?? '') > 191) {
            $errors[] = 'Lastname tidak boleh lebih dari 191 karakter';
        }
        
        if (!empty($data['phone'] ?? '')) {
            if (!preg_match('/^[+]?[0-9]{10,15}$/', $data['phone'])) {
                $errors[] = 'Phone number format tidak valid';
            }
        }
        
        if (!empty($data['pictures'] ?? '')) {
            if (strlen($data['pictures']) > 191) {
                $errors[] = 'Pictures tidak boleh lebih dari 191 karakter';
            }
        }
        
        if (!empty($errors)) {
            JsonResponse::validationError($errors);
        }
    }

    public static function validateUpdate($data) {
        $hasFields = isset($data['firstname']) || isset($data['lastname']) || 
                    isset($data['phone']) || isset($data['pictures']);
        if (!$hasFields) {
            throw new Exception('Minimal satu field harus diupdate');
        }
        
        if (isset($data['firstname']) && strlen($data['firstname']) > 191) {
            throw new Exception('Firstname tidak boleh lebih dari 191 karakter');
        }
        if (isset($data['lastname']) && strlen($data['lastname']) > 191) {
            throw new Exception('Lastname tidak boleh lebih dari 191 karakter');
        }
        if (isset($data['pictures']) && strlen($data['pictures']) > 191) {
            throw new Exception('Pictures tidak boleh lebih dari 191 karakter');
        }
    }

    public static function validateId($id) {
        if (!is_numeric($id) || $id <= 0) {
            throw new Exception('ID harus berupa angka positif');
        }
    }

    public static function validateAuthId($authId) {
        if (!is_numeric($authId) || $authId <= 0) {
            throw new Exception('authId harus berupa angka positif');
        }
    }
}
?>

