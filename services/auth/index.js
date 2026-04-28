const app = require("./app.js");

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Service 1 (Auth Service) is running on port ${PORT}`);
});
