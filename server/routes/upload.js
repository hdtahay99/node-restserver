const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');

const path = require('path');

app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    let _id = req.params.id;

    if (!req.files || Object.keys(req.files).length === 0) {

        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningún archivo'
            }
        });

    }

    //Validar tipo
    let tiposValidas = ['productos', 'usuarios'];

    if (tiposValidas.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos de archivos son solo para ' + tiposValidas.join(', '),
                tipo
            }
        });
    }


    let archivo = req.files.archivo;

    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];

    //Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
                ext: extension
            }
        });
    }

    //Cambiar nombre al archivo

    let nombreArchivo = `${_id}-${new Date().getMilliseconds()}.${extension}`;


    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });

        if (tipo == 'usuarios') {
            imagenUsuario(_id, res, nombreArchivo);

        } else if (tipo == 'productos') {
            imagenProducto(_id, res, nombreArchivo);
        }


    });

});

const imagenUsuario = (id, res, nombreArchivo) => {

    Usuario.findById(id, (err, usuarioDB) => {

        if (err) {
            borrarArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });

        }


        if (!usuarioDB) {
            borrarArchivo(nombreArchivo, 'usuarios');
            return res.json(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });

        }
        borrarArchivo(usuarioDB.img, 'usuarios');


        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioUpdate) => {
            if (err) {

                return res.status(500).json({
                    ok: false,
                    err
                });

            }

            res.json({
                ok: true,
                Usuario: usuarioUpdate,
                img: nombreArchivo
            })
        });


    });
}

const imagenProducto = (id, res, nombreArchivo) => {

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            borrarArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            borrarArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }

        borrarArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;

        productoDB.save((err, productoUpdate) => {
            if (err) {

                return res.status(500).json({
                    ok: false,
                    err
                });

            }

            res.json({
                ok: true,
                producto: productoUpdate,
                img: nombreArchivo
            })
        });



    });

}

const borrarArchivo = (nombreImage, tipo) => {

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImage}`);

    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }

}

module.exports = app;