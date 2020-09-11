const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');

const app = express();

require('./config/passport')(passport);

//DB Config
const db = require('./config/keys').mongodb.URI
mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(console.log('DB connected...'))
    .catch(err => console.log(err));

//Middleware
app.use(express.json());
app.use(cors());
app.use(passport.initialize());

const port = process.env.PORT || 8000;

//routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/careers', require('./routes/api/careers'));

app.listen(port, () => console.log('Server started on port' + port));