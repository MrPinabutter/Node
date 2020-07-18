const express = require('express');
const mongoose = require('mongoose')
const router = express.Router();
require("../models/Categoria")
const Categoria = mongoose.model("categorias")


router.get('/', (req, res) => {
    res.send("Pagina Principal")
})

router.get('/posts', (req, res) => {
    res.send("Pagina de Posts")
})

router.get("/categorias", (req, res) => {
    res.render("admin/categorias")
})

router.post("/categorias/nova", (req, res) => {
    const novaCategoria = {
        nome: req.body.nome,
        slug: req.body.slug
    }

    new Categoria(novaCategoria)
    .save()
    .then(() => console.log("Sucesso ao enviar"))
    .catch((err) => console.log("Erro ao enviar: " + err))
})

router.get("/categorias/add", (req, res) => { 
    res.render("admin/addcategorias")
})

module.exports = router