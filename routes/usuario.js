const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Usuarios")
const Usuario = mongoose.model("usuarios")
const bcryp = require('bcryptjs')

router.get("/registro", (req, res) => {
    res.render("usuarios/registro")
})

router.post("/registro", (req, res) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto:"Nome inválido"})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto:"Email inválido"})
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto:"Senha inválido"})
    }

    if(req.body.senha.length < 4){
        erros.push({texto:"Senha muito curta"})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto:"As senhas são diferentes, tente novamente"})
    }

    if(erros.length > 0){

        res.render('usuarios/registro', {erros: erros})

    }else{
        // Verificando se o usuário ja está cadastrado no banco
        Usuario.findOne({email:req.body.email}).then((usuario) => {
            if(usuario){
                req.flash("error_msg", "Esse email já foi cadastrado")
                res.redirect("/usuarios/registro")
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha:req.body.senha
                })

                // Encriptando a senha
                bcryp.genSalt(10, (erro, salt) => {
                    bcryp.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash("error_msg", "Houve um erro no salvamento do usuário")
                            res.redirect("/")
                        }

                        novoUsuario.senha = hash

                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Conta registrada com sucesso!")
                            res.redirect("/")
                        }).catch(err => {
                            req.flash("error_msg", "Houve um erro")
                            res.redirect("/usuarios/registro")
                        })

                    })
                })

            }
        }).catch(err => {
            req.flash("erros_msg", "Houve um erro interno, tente novamente!")
            res.redirect("/")
        })
    }
})



module.exports = router