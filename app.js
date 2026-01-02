const express = require('express');
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middleware/error')
const cors = require('cors');
const app = express();

// route imports 

const userRoute = require("./routes/userRoutes")
const courseRoute = require("./routes/courseRoutes")
const quesRoute = require('./routes/quespaperRoutes')
const SavedRoute = require('./routes/savedRoutes')
const categoryRoute = require('./routes/categoryRoutes')
const contactRoute = require('./routes/contactRoutes')

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json())
app.use(cookieParser())

app.use("/diginotes", userRoute);
app.use("/diginotes", courseRoute);
app.use("/diginotes", quesRoute);
app.use("/diginotes", SavedRoute);
app.use("/diginotes", categoryRoute);
app.use("/diginotes", contactRoute);

// Middleware for error 

app.use(errorMiddleware);

module.exports = app