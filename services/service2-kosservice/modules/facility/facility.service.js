const facilityRepository = require("./facility.repository.js");
const { createFacility, updateFacility, addFacilityToKos } = require("./facility.validator.js");
const kosRepository = require("../kos/kos.repository.js");

const facilityService = {
  async listFacilities({ page, limit, search }) {
    return facilityRepository.findAll({ page, limit, search });
  },

  async getFacility(id) {
    const facility = await facilityRepository.findById(id);
    if (!facility) {
      throw { statusCode: 404, message: "Facility tidak ditemukan" };
    }
    return facility;
  },

  async createFacility(data) {
    const validData = createFacility(data);
    return facilityRepository.create(validData);
  },

  async updateFacility(id, data) {
    await this.getFacility(id);
    const validData = updateFacility(data);
    return facilityRepository.update(id, validData);
  },

  async deleteFacility(id) {
    await this.getFacility(id);
    const deleted = await facilityRepository.delete(id);
    if (!deleted) {
      throw { statusCode: 500, message: "Gagal menghapus facility" };
    }
    return { message: "Facility berhasil dihapus" };
  },

  async getFacilitiesByKos(kosId) {
    const kos = await kosRepository.findById(kosId);
    if (!kos) {
      throw { statusCode: 404, message: "Kos tidak ditemukan" };
    }
    return facilityRepository.findByKosId(kosId);
  },

  async addFacilityToKos(data) {
    const validData = addFacilityToKos(data);
    
    const kos = await kosRepository.findById(validData.kosId);
    if (!kos) {
      throw { statusCode: 404, message: "Kos tidak ditemukan" };
    }

    for (const facilityId of validData.facilityIds) {
      const facility = await facilityRepository.findById(facilityId);
      if (!facility) {
        throw { statusCode: 404, message: `Facility dengan ID ${facilityId} tidak ditemukan` };
      }
    }

    await facilityRepository.setFacilitiesForKos(validData.kosId, validData.facilityIds);
    return facilityRepository.findByKosId(validData.kosId);
  },

  async removeFacilityFromKos(kosId, facilityId) {
    const kos = await kosRepository.findById(kosId);
    if (!kos) {
      throw { statusCode: 404, message: "Kos tidak ditemukan" };
    }

    const facility = await facilityRepository.findById(facilityId);
    if (!facility) {
      throw { statusCode: 404, message: "Facility tidak ditemukan" };
    }

    await facilityRepository.removeFacilityFromKos(kosId, facilityId);
    return { message: "Facility berhasil dihapus dari kos" };
  },
};

module.exports = facilityService;