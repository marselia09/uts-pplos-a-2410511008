const { handlequery } = require("../../config/database.js");
const facilityConfig = require("./facility.config.js");

const facilityRepository = {
  async findAll({ page = 1, limit = 10, search = "" }) {
    const offset = (page - 1) * limit;
    let query = `SELECT * FROM ${facilityConfig.tableName}`;
    let countQuery = `SELECT COUNT(*) as total FROM ${facilityConfig.tableName}`;
    const params = [];

    if (search) {
      query += ` WHERE name LIKE ?`;
      countQuery += ` WHERE name LIKE ?`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const rows = await handlequery(query, params);
    const countResult = await handlequery(countQuery, search ? [`%${search}%`] : []);

    return {
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    };
  },

  async findById(id) {
    const rows = await handlequery(
      `SELECT * FROM ${facilityConfig.tableName} WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async create(data) {
    const result = await handlequery(
      `INSERT INTO ${facilityConfig.tableName} (name, desc) VALUES (?, ?)`,
      [data.name, data.desc]
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    const fields = [];
    const values = [];

    if (data.name !== undefined) {
      fields.push("name = ?");
      values.push(data.name);
    }
    if (data.desc !== undefined) {
      fields.push("desc = ?");
      values.push(data.desc);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    await handlequery(
      `UPDATE ${facilityConfig.tableName} SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
    return this.findById(id);
  },

  async delete(id) {
    const result = await handlequery(
      `DELETE FROM ${facilityConfig.tableName} WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  },

  async findByKosId(kosId) {
    const rows = await handlequery(
      `SELECT f.* FROM ${facilityConfig.tableName} f
       INNER JOIN kos_facility kf ON f.id = kf.facilityId
       WHERE kf.kosId = ?
       ORDER BY f.name`,
      [kosId]
    );
    return rows;
  },

  async addFacilityToKos(kosId, facilityId) {
    const result = await handlequery(
      `INSERT INTO kos_facility (kosId, facilityId) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE createdAt = createdAt`,
      [kosId, facilityId]
    );
    return result.affectedRows > 0;
  },

  async removeFacilityFromKos(kosId, facilityId) {
    const result = await handlequery(
      `DELETE FROM kos_facility WHERE kosId = ? AND facilityId = ?`,
      [kosId, facilityId]
    );
    return result.affectedRows > 0;
  },

  async setFacilitiesForKos(kosId, facilityIds) {
    await handlequery(`DELETE FROM kos_facility WHERE kosId = ?`, [kosId]);
    
    if (facilityIds.length > 0) {
      const values = facilityIds.map(fid => `(${kosId}, ${fid})`).join(", ");
      await handlequery(
        `INSERT INTO kos_facility (kosId, facilityId) VALUES ${values}`
      );
    }
    return true;
  },
};

module.exports = facilityRepository;