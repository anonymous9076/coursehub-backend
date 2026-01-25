const express = require('express');
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middleware/error')
const cors = require('cors');
const dotenv = require('dotenv');
const connectDatabase = require('./config/database');

// config 
dotenv.config({ path: 'config/config.env' })
connectDatabase();

const app = express();

// route imports 

const userRoute = require("./routes/userRoutes")
const courseRoute = require("./routes/courseRoutes")
const quesRoute = require('./routes/quespaperRoutes')
const SavedRoute = require('./routes/savedRoutes')
const categoryRoute = require('./routes/categoryRoutes')
const contactRoute = require('./routes/contactRoutes')

app.use(cors({
    origin: ["http://localhost:5173", "https://course-hub-alpha.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res) => {
    res.send("Server is working");
});

app.use("/diginotes", userRoute);
app.use("/diginotes", courseRoute);
app.use("/diginotes", quesRoute);
app.use("/diginotes", SavedRoute);
app.use("/diginotes", categoryRoute);
app.use("/diginotes", contactRoute);

// Middleware for error 

app.use(errorMiddleware);

module.exports = app