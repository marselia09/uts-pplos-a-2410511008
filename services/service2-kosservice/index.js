const app = require("./app.js");

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Service 2 (Kos Service) is running on port ${PORT}`);
});
