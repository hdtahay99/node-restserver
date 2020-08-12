require('./config/config');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(require('./routes/usuario'))


mongoose
    .connect(process.env.URLDB, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true
    })
    .then((result) => console.log('Base de datos ONLINE'))
    .catch((err) => console.log(err));



app.listen(process.env.PORT, () => {

    console.log('Servidor levantado en http://localhost:3000');

});