<?php

require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../responses/JsonResponse.php';

class ownerprofileService {
    private $pdo;

    public function __construct() {
        $this->pdo = getDB();
    }

    public function getAll($page = 1, $limit = 10) {
        $offset = ($page - 1) * $limit;
        
        // Get total count
        $countStmt = $this->pdo->query('SELECT COUNT(*) FROM `ownerprofile`');
        $total = $countStmt->fetchColumn();
        
        // Get paginated data
        $stmt = $this->pdo->query("SELECT * FROM `ownerprofile` ORDER BY `id` LIMIT $limit OFFSET $offset");
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

    public function getByAuthId($authId) {
        $stmt = $this->pdo->prepare('SELECT * FROM `ownerprofile` WHERE `authId` = ?');
        $stmt->execute([$authId]);
        return $stmt->fetch();
    }

    public function findById($id) {
        $stmt = $this->pdo->prepare('SELECT * FROM `ownerprofile` WHERE `id` = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function create($data) {
        $stmt = $this->pdo->prepare('INSERT INTO `ownerprofile` (`firstname`, `lastname`, `phone`, `pictures`, `authId`) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([
            $data['firstname'], 
            $data['lastname'], 
            $data['phone'] ?? null, 
            $data['pictures'] ?? null,
            $data['authId']
        ]);
        $newId = $this->pdo->lastInsertId();
        return $this->findById($newId);
    }

    public function createWithAuth($data) {
        $this->pdo->beginTransaction();
        
        try {
            $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT);
            $roleId = 2;
            
            $stmt = $this->pdo->prepare('INSERT INTO `auth` (`username`, `email`, `password`, `roleId`) VALUES (?, ?, ?, ?)');
            $stmt->execute([
                $data['username'],
                $data['email'],
                $hashedPassword,
                $roleId
            ]);
            $authId = $this->pdo->lastInsertId();
            
            $stmt = $this->pdo->prepare('INSERT INTO `ownerprofile` (`firstname`, `lastname`, `phone`, `pictures`, `authId`) VALUES (?, ?, ?, ?, ?)');
            $stmt->execute([
                $data['firstname'],
                $data['lastname'],
                $data['phone'] ?? null,
                $data['pictures'] ?? null,
                $authId
            ]);
            $profileId = $this->pdo->lastInsertId();
            
            $this->pdo->commit();
            
            return $this->findById($profileId);
        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    public function update($id, $data) {
        $existing = $this->findById($id);
        if (!$existing) {
            throw new Exception('ownerprofile not found');
        }
        
        $updates = [];
        $params = [];
        if (isset($data['firstname'])) {
            $updates[] = 'firstname = ?';
            $params[] = $data['firstname'];
        }
        if (isset($data['lastname'])) {
            $updates[] = 'lastname = ?';
            $params[] = $data['lastname'];
        }
        if (isset($data['phone'])) {
            $updates[] = 'phone = ?';
            $params[] = $data['phone'];
        }
        if (isset($data['pictures'])) {
            $updates[] = 'pictures = ?';
            $params[] = $data['pictures'];
        }
        
        if (empty($updates)) {
            throw new Exception('No fields to update');
        }
        
        $params[] = $id;
        $sql = 'UPDATE `ownerprofile` SET ' . implode(', ', $updates) . ', `updatedAt` = CURRENT_TIMESTAMP WHERE `id` = ?';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        
        return $this->findById($id);
    }

    public function delete($id) {
        $existing = $this->findById($id);
        if (!$existing) {
            throw new Exception('ownerprofile not found');
        }
        
        $stmt = $this->pdo->prepare('DELETE FROM `ownerprofile` WHERE `id` = ?');
        $stmt->execute([$id]);
        return true;
    }
}
?>

