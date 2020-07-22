const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")


router.get('/', (req, res) => {
    res.send("Pagina Principal")
})

router.get("/categorias", (req, res) => {
    Categoria.find().sort({date:'desc'}).then((categorias) => {
        res.render("admin/categorias", {categorias: categorias.map(category => category.toJSON())})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar")
        res.redirect("/admin")
    })
    
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
        .then(() => {
            req.flash("success_msg", "Categoria criada com sucesso!")
            res.redirect("/admin/categorias")
        })
        .catch((err) => {
            req.flash("error_msg", "Erro ao criar categoria")
            res.redirect("/admin/categorias"+ err)
        })
    }

   
})

router.get("/categorias/add", (req, res) => { 
    res.render("admin/addcategorias")
})

router.get("/categorias/edit/:id", (req, res) => {
    Categoria.findOne({_id:req.params.id}).then((categoria) => {
        res.render("admin/editcategorias", {categoria:categoria.toJSON()})
    }).catch(err => {
        req.flash("error_msg", "Esta categoria não existe")
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/edit", (req, res) => {
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
        Categoria.findOne({_id:req.body.id}).then((categoria) => {
            res.render("admin/editcategorias", {categoria:categoria.toJSON(), erros:erros})
        }).catch(err => {
            req.flash("error_msg", "Esta categoria não existe")
            res.redirect("/admin/categorias")
        })
    }else{
        Categoria.findOne({_id: req.body.id}).then((categoria) => {

            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso!")
                res.redirect("/admin/categorias")
            }).catch(err => {
                req.flash("error_msg", "Houve um erro ao editar categoria, tente novamente!")
                req.redirect("/admin/categorias")
            })

        }).catch(err => {
            req.flash("error_msg", "Houve um erro ao editar categoria")
            res.redirect("/admin/categorias")
        })
    }
})

router.post("/categorias/deletar", (req, res) => {
    Categoria.remove({_id:req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch(err => {
        req.flash("error_msg", "Houve um erro ao deletar categoria, tente novamente!")
        res.redirect("/admin/categorias")
    })
})

router.get("/postagens", (req, res) => {
    Postagem.find().populate("categoria").sort({date: "desc"}).then((postagens) => {
        res.render("admin/postagens", {postagens: postagens.map(postagem => postagem.toJSON())})
    }).catch(err => {
        req.flash("error_msg", "Houve um erro ao listar postagens")
        res.redirect("/admin")
    })
})

router.get("/postagens/add", (req, res) => {
    Categoria.find().lean().then(categorias => {
        res.render("admin/addpostagem", {categorias: categorias})
    }).catch(err => { 
        req.flash("erros_msg", "houve um erro ao carregar o formulário")
        res.redirect("/admin")
    })
})

router.post("/postagens/nova", (req, res) => {
    
    var erros = []

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: "Titulo inválido"})
    }
    
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }
    
    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: "Descrição inválida"})
    }

    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: "Conteúdo inválido"})
    }
    
    if(req.body.titulo.length < 2){
        erros.push({texto:"Titulo muito curto"})
    }

    if(req.body.categoria == 0){
        erros.push("Categoria inválida, registre uma categoria")
    }

    if(erros.length > 0){
        res.render("admin/addpostagem", {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem)
        .save()
        .then(() => {
            req.flash("success_msg", "Postagem criada com sucesso!")
            res.redirect("/admin/postagens")
        })
        .catch((err) => {
            req.flash("error_msg", "Erro ao criar uma postagem, tente novamente!" + err)
            res.redirect("/admin/postagens")
        })
    }
})

router.get("/postagens/edit/:id", (req, res) => {

    Postagem.findOne({_id:req.params.id}).then((postagem) => {      // Encontrando postagens e categorias de forma aninhada

        Categoria.find().then(categorias => {
            res.render("admin/editpostagens", {categorias: categorias.map(categoria => categoria.toJSON()), postagem: postagem.toJSON()})

        }).catch(err => {
            req.flash("error_msg", "Houve um erro ao listar categorias")
            res.redirect("/admin/postagens")
        })

    }).catch(err => {
        req.flash("error_msg", "Houve um erro ao carregar o formulario de edição")
        res.redirect("/admin/postagens")
    })

})

router.post("/postagens/edit", (req, res) => {
    
    erros = []

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: "Titulo inválido"})
    }
    
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }
    
    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: "Descrição inválida"})
    }

    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: "Conteúdo inválido"})
    }
    
    if(req.body.titulo.length < 2){
        erros.push({texto:"Titulo muito curto"})
    }

    if(req.body.categoria == 0){
        erros.push("Categoria inválida, registre uma categoria")
    }

    if(erros.length > 0){
        res.render("admin/editpostagem", {erros: erros})
    }else{

        Postagem.findOne({_id: req.body.id})
        .then(postagem => {
            postagem.titulo = req.body.titulo,
            postagem.slug = req.body.slug,
            postagem.descricao = req.body.descricao,
            postagem.conteudo = req.body.conteudo,
            postagem.categoria = req.body.categoria

            postagem.save().then(() => {
                req.flash("success_msg", "Postagem salva com sucesso!")
                res.redirect("/admin/postagens")
            }).catch(err => {
                req.flash("error_msg", "Erro interno")
                res.redirect("/admin/postagens")
            })
        })
        .catch(err => {
            req.flash("error_msg", "Houve um erro ao salvar edição de postagem")
            res.redirect("/admin/postagens")
        })
    }

})


module.exports = router