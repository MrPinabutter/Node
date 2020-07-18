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
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }

    if(req.body.nome.length < 2){
        erros.push({texto:"Nome da categoria muito curto"})
    }
    
    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
    }else{
        const novaCategoria = {
        nome: req.body.nome,
        slug: req.body.slug
        }

        new Categoria(novaCategoria)
        .save()
        .then(() => res.redirect("/admin/categorias"))
        .catch((err) => console.log("Erro ao enviar: " + err))
    }

   
})

router.get("/categorias/add", (req, res) => { 
    res.render("admin/addcategorias")
})

module.exports = router