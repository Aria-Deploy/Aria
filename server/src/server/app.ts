import express from "express";
const apiRoutes = require("./routes/api");
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json())

app.use("/api", apiRoutes);

app.listen(5000, () => {
  console.log("Server Running");
});
