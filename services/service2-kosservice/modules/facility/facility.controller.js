const facilityService = require("./facility.service.js");

const facilityController = {
  async listFacilities(req, res, next) {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
      const result = await facilityService.listFacilities({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
      });

      res.status(200).json({
        success: true,
        message: "Berhasil mendapatkan daftar facility",
        data: result.data,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  },

  async getFacility(req, res, next) {
    try {
      const { id } = req.params;
      const facility = await facilityService.getFacility(parseInt(id));

      res.status(200).json({
        success: true,
        message: "Berhasil mendapatkan detail facility",
        data: facility,
      });
    } catch (err) {
      next(err);
    }
  },

  async createFacility(req, res, next) {
    try {
      const facility = await facilityService.createFacility(req.body);

      res.status(201).json({
        success: true,
        message: "Facility berhasil dibuat",
        data: facility,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateFacility(req, res, next) {
    try {
      const { id } = req.params;
      const facility = await facilityService.updateFacility(parseInt(id), req.body);

      res.status(200).json({
        success: true,
        message: "Facility berhasil diperbarui",
        data: facility,
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteFacility(req, res, next) {
    try {
      const { id } = req.params;
      await facilityService.deleteFacility(parseInt(id));

      res.status(200).json({
        success: true,
        message: "Facility berhasil dihapus",
      });
    } catch (err) {
      next(err);
    }
  },

  async getFacilitiesByKos(req, res, next) {
    try {
      const { kosId } = req.params;
      const facilities = await facilityService.getFacilitiesByKos(parseInt(kosId));

      res.status(200).json({
        success: true,
        message: "Berhasil mendapatkan fasilitas kos",
        data: facilities,
      });
    } catch (err) {
      next(err);
    }
  },

  async addFacilityToKos(req, res, next) {
    try {
      const facilities = await facilityService.addFacilityToKos(req.body);

      res.status(200).json({
        success: true,
        message: "Fasilitas berhasil ditambahkan ke kos",
        data: facilities,
      });
    } catch (err) {
      next(err);
    }
  },

  async removeFacilityFromKos(req, res, next) {
    try {
      const { kosId, facilityId } = req.params;
      await facilityService.removeFacilityFromKos(parseInt(kosId), parseInt(facilityId));

      res.status(200).json({
        success: true,
        message: "Fasilitas berhasil dihapus dari kos",
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = facilityController;