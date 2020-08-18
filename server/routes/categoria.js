const express = require('express');

let { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');


app.get('/categoria', verificaToken, (req, res) => {


    Categoria.find({}, 'descripcion')
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categorias
            })

        });

});

app.get('/categoria/:id', verificaToken, (req, res) => {

    let _id = req.params.id;

    Categoria.findById({ _id: _id })
        .exec((err, categoria) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!categoria) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'No se pudo encontrar la categoría'
                    }
                });
            }

            res.json({
                ok: true,
                categoria
            })
        });

});


app.post('/categoria', verificaToken, (req, res) => {


    let body = req.body;
    let _id = req.usuario._id;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: _id
    });


    categoria.save((err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se pudo guardar la categoría'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });
});

app.put('/categoria/:id', verificaToken, (req, res) => {

    let _id = req.params.id;
    let body = req.body;

    let desCategoria = {
        descripcion: body.descripcion
    }


    Categoria.findByIdAndUpdate(_id, desCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se encontró la categoría'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });
});

app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (req, res) => {

    let _id = req.params.id;

    Categoria.findByIdAndRemove({ _id: _id })
        .exec((err, categoriaEliminada) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!categoriaEliminada) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Categoría no encontrada'
                    }
                });
            }

            res.json({
                ok: true,
                message: 'Categoría eliminada'
            });
        });
});






module.exports = app;