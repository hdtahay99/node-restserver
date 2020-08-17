require('./config/config');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// habilitar la carpeta public

app.use(express.static(path.resolve(__dirname, '../public')));


// Configuración global de rutas
app.use(require('./routes/index'));



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