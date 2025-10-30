const express = require('express');
const cookieParser = require('cookie-parser');
const errorMiddelware = require('./middlerware/error')
const cors = require('cors');
const app = express();

// route imports 

const userRoute = require("./routes/userRoutes")
const courseRoute = require("./routes/courseRoutes")
const quesRoute = require('./routes/quespaperRoutes')
const SavedRoute = require('./routes/savedRoutes')

app.use(cors());
app.use(express.json())
app.use(cookieParser())

app.use("/diginotes", userRoute);
app.use("/diginotes", courseRoute);
app.use("/diginotes", quesRoute);
app.use("/diginotes", SavedRoute);

// Middlerware for error 

app.use(errorMiddelware);

module.exports = app