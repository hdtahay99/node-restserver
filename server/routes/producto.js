const express = require('express');
let { verificaToken } = require('../middlewares/autenticacion');

let app = express();

let Producto = require('../models/producto');


app.get('/producto', verificaToken, (req, res) => {
    //trae todos los productos
    //populate: usuario categoría
    //paginación

    let desde = req.query.desde || 0;
    desde = Number(desde);


    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Producto.count({ disponible: true }, (err, total) => {

                return res.json({
                    ok: true,
                    productos,
                    total
                })

            });

        });

});


app.get('/producto/:id', verificaToken, (req, res) => {
    //trae un producto por id
    //populate: usuario categoría

    let _id = req.params.id;

    Producto.findById({ _id: _id })
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No se pudo encontrar el producto'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            })
        });

});

app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });

        });
});


app.post('/producto', verificaToken, (req, res) => {
    //grabar usuario
    //grabar una categoría

    let usuario = req.usuario._id;
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion || 'sin descripción',
        categoria: body.categoria,
        usuario: usuario
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Ocurrió un error al almacenar el producto'
                }
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        })
    });




});


app.put('/producto/:id', verificaToken, (req, res) => {
    //actualizar producto por id

    let _id = req.params.id;

    let body = req.body;

    Producto.findByIdAndUpdate(_id, body, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se encontró el producto'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        })
    });

});

app.delete('/producto/:id', verificaToken, (req, res) => {

    let _id = req.params.id;

    let cambiaEstado = {
        disponible: false
    };

    Producto.findByIdAndUpdate(_id, cambiaEstado, { new: true }, (err, productoBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoBorrado
        });


    });



})


module.exports = app;