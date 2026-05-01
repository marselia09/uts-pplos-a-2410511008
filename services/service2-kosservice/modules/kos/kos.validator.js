const fail = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const nameMaxLen = 191;
const addrMaxLen = 191;
const validGenders = new Set(["PRIA", "WANITA", "MIX"]);

const assertString = (val, name, maxLen) => {
  if (
    !val ||
    typeof val !== "string" ||
    val.trim().length === 0 ||
    val.length > maxLen
  ) {
    fail(`${name} wajib string 1-${maxLen} karakter`);
  }
  return val.trim();
};

const assertGender = (gender) => {
  if (!validGenders.has(gender)) {
    fail(`Gender harus salah satu: ${[...validGenders].join(", ")}`);
  }
  return gender.toUpperCase();
};

const assertId = (idVal, name = "ID") => {
  const id = parseInt(idVal, 10);
  if (isNaN(id) || id <= 0) {
    fail(`${name} harus ID positif`);
  }
  return id;
};

const validateCreateKos = (body) => {
  const name = assertString(body.name, "Nama", nameMaxLen);
  const address = assertString(body.alamat || body.address, "Alamat", addrMaxLen);
  const data = { name, address };
  
  if (body.gender !== undefined) {
    data.gender = assertGender(body.gender);
  }

  return data;
};

const validateUpdateKos = (body) => {
  const data = {};
  if (body.name !== undefined)
    data.name = assertString(body.name, "Nama", nameMaxLen);
  if (body.alamat !== undefined || body.address !== undefined)
    data.address = assertString(body.alamat || body.address, "Alamat", addrMaxLen);
  if (body.gender !== undefined) data.gender = assertGender(body.gender);

  if (Object.keys(data).length === 0) {
    fail("Minimal satu field untuk diupdate");
  }

  return data;
};

const validateKosId = (id) => assertId(id, "Kos ID");

module.exports = {
  fail,
  validateCreateKos,
  validateKosId,
  validateUpdateKos,
};
