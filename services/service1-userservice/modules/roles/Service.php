<?php

require_once __DIR__ . '/../../Config/Database.php';
require_once __DIR__ . '/../../Responses/JsonResponse.php';

class RolesService {
    private $pdo;

    public function __construct() {
        $this->pdo = getDB();
    }

    public function getAll($page = 1, $limit = 10) {
        $offset = ($page - 1) * $limit;
        
        // Get total count
        $countStmt = $this->pdo->query('SELECT COUNT(*) FROM `Role`');
        $total = $countStmt->fetchColumn();
        
        // Get paginated data
        $stmt = $this->pdo->query("SELECT * FROM `Role` ORDER BY `id` LIMIT $limit OFFSET $offset");
        $data = $stmt->fetchAll();
        
        return [
            'data' => $data,
            'pagination' => [
                'current_page' => (int)$page,
                'per_page' => (int)$limit,
                'total' => (int)$total,
                'last_page' => ceil($total / $limit),
                'from' => $offset + 1,
                'to' => min($offset + $limit, $total)
            ]
        ];
    }

    public function findById($id) {
        $stmt = $this->pdo->prepare('SELECT * FROM `Role` WHERE `id` = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function create($data) {
        $stmt = $this->pdo->prepare('INSERT INTO `Role` (`name`, `description`) VALUES (?, ?)');
        $stmt->execute([$data['name'], $data['description']]);
        $newId = $this->pdo->lastInsertId();
        return $this->findById($newId);
    }

    public function update($id, $data) {
        $existing = $this->findById($id);
        if (!$existing) {
            throw new Exception('Role not found');
        }
        
        $updates = [];
        $params = [];
        if (isset($data['name'])) {
            $updates[] = 'name = ?';
            $params[] = $data['name'];
        }
        if (isset($data['description'])) {
            $updates[] = '`description` = ?';
            $params[] = $data['description'];
        }
        
        if (empty($updates)) {
            throw new Exception('No fields to update');
        }
        
        $params[] = $id;
        $sql = 'UPDATE `Role` SET ' . implode(', ', $updates) . ', `updatedAt` = CURRENT_TIMESTAMP WHERE `id` = ?';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        
        return $this->findById($id);
    }

    public function delete($id) {
        $existing = $this->findById($id);
        if (!$existing) {
            throw new Exception('Role not found');
        }
        
        $stmt = $this->pdo->prepare('DELETE FROM `Role` WHERE `id` = ?');
        $stmt->execute([$id]);
        return true;
    }
}
?>
