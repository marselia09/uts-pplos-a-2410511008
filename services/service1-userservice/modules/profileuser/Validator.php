<?php

class RolesValidator {
    public static function validateStore($data) {
        $errors = [];
        if (empty($data['name'] ?? '')) {
            $errors[] = 'Field name  wajib diisi';
        }
        if (strlen($data['name'] ?? '') > 100) {
            $errors[] = 'Name tidak boleh lebih dari 100 karakter';
        }
        
        if (empty($data['description'] ?? '')) {
            $errors[] = 'Field description wajib diisi';
        }
        
        if (!empty($errors)) {
            throw new Exception(implode('; ', $errors));
        }
    }

    public static function validateUpdate($data) {
        $hasFields = isset($data['name']) || isset($data['description']);
        if (!$hasFields) {
            throw new Exception('Minimal satu field harus diupdate (name atau description)');
        }
        
        if (isset($data['name']) && strlen($data['name']) > 100) {
            throw new Exception('Name tidak boleh lebih dari 100 karakter');
        }
    }

    public static function validateId($id) {
        if (!is_numeric($id) || $id <= 0) {
            throw new Exception('ID harus berupa angka positif');
        }
    }
}
?>
