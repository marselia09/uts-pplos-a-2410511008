const facilityConfig = require("./facility.config.js");

const createFacility = (data) => {
  if (!data.name || typeof data.name !== "string") {
    throw { statusCode: 400, message: "Nama facility wajib diisi" };
  }

  return {
    name: data.name.trim(),
    desc: data.desc?.trim() || null,
  };
};

const updateFacility = (data) => {
  const updateData = {};

  if (data.name !== undefined) {
    if (typeof data.name !== "string" || !data.name.trim()) {
      throw { statusCode: 400, message: "Nama facility tidak valid" };
    }
    updateData.name = data.name.trim();
  }

  if (data.desc !== undefined) {
    updateData.desc = data.desc?.trim() || null;
  }

  return updateData;
};

const addFacilityToKos = (data) => {
  if (!data.kosId) {
    throw { statusCode: 400, message: "kosId wajib diisi" };
  }

  if (!data.facilityId && (!data.facilityIds || !Array.isArray(data.facilityIds))) {
    throw { statusCode: 400, message: "facilityId atau facilityIds wajib diisi" };
  }

  return {
    kosId: parseInt(data.kosId),
    facilityIds: data.facilityIds 
      ? data.facilityIds.map(id => parseInt(id))
      : [parseInt(data.facilityId)]
  };
};

const facilityIdParam = (value) => {
  const id = parseInt(value);
  if (isNaN(id) || id <= 0) {
    throw { statusCode: 400, message: "ID facility tidak valid" };
  }
  return id;
};

module.exports = {
  createFacility,
  updateFacility,
  addFacilityToKos,
  facilityIdParam,
};