import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";
dotenv.config();

//async function return promis that why we r using then catch
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8080, () =>
      console.log(`Listening on port ${process.env.PORT}`)
    );
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });
