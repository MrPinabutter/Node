// Importações
    const express = require('express');
    const handlebars = require('express-handlebars');
    const app = express();
    const bodyParser = require('body-parser');
    const admin = require('./routes/admin');
    const path = require('path');
    const mongoose = require('mongoose');
    const session = require('express-session');
    const flash = require('connect-flash');
    require("./models/Postagem")
    const Postagem = mongoose.model("postagens")
    require("./models/Categoria")
    const Categoria = mongoose.model("categorias")
    const usuarios = require("./routes/usuario")
    const passport = require("passport")
    require("./config/auth")(passport)

// Configurações
    // Sessão 
        app.use(session({
            secret: "r2d2",
            resave: true,
            saveUninitialized:true
        }))

        app.use(passport.initialize())
        app.use(passport.session())


        app.use(flash())

    // Middleware
        app.use((req, res, next) => {
            // Variável global
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")   // Mensagem de erro do passport
            res.locals.user = req.user || null
            next()
        })

    // BodyParser
        app.use(bodyParser.urlencoded({extended:true}));
        app.use(bodyParser.json());

    // Handlebars 
        app.engine('handlebars', handlebars({defaultLayout: 'main'}));
        app.set('view engine', 'handlebars');

    // Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb://localhost/blogapp", {
            useNewUrlParser: true,
            useUnifiedTopology: true
          })
          .then(() => console.log("Conectado ao mongo"))
          .catch(err => console.log("erro ao se conectar no banco" + err))
          
    // Public 
        app.use(express.static(path.join(__dirname, "public")));
       

// Rotas
    app.get('/', (req, res) =>{
        Postagem.find().populate("categoria").sort({data:"desc"}).then((postagens) => {
            res.render("index", {postagens: postagens.map(postagem => postagem.toJSON())})
        }).catch(err => {
            req.flash("error_msg", "Erro interno")
            res.redirect("/404")
        })
    });

    app.get("/postagem/:slug", (req, res) => {
        Postagem.findOne({slug: req.params.slug}).then((postagem) => {
            if(postagem){
                res.render("post/index", {postagem: postagem.toJSON()})
            }else{
                req.flash("error_msg", "Essa postagem não existe!")
                res.redirect("/")
            }
        }).catch(err => {
            req.flash("error_msg", "Erro interno")
            res.redirect("/")
        })
    })

    app.get('/404', (req, res) => {
        res.send("Error 404, not found")        
    })

    app.get('/categorias', (req, res) => {
        Categoria.find().then((categorias) => {
            res.render("categorias/index", {categorias: categorias.map(categoria => categoria.toJSON())})
        }).catch(err => {
            req.flash("error_msg", "Houve um erro ao carregar categorias")
            res.redirect("/")
        })
    })

    app.get('/categorias/:slug', (req, res) => {
        Categoria.findOne({slug: req.params.slug}).then(categoria => {
            if(categoria){
                Postagem.find({categoria: categoria._id}).then((postagens) => {
                    res.render("categorias/postagens", {postagens: postagens.map((postagem) => postagem.toJSON()), categoria: categoria.toJSON()})
                }).catch(err => {
                    req.flash("erros_msg", "Houve um erro ao listar os posts")
                    res.redirect("/")
                })

            }else{
                req.flash("error_msg", "Esta categoria não existe")
                res.redirect("/")
            }
        }).catch(err => {
            req.flash("error_msg", "Houve um erro ao carregar a página desta categoria")
            res.redirect("/")
        })
    })

    app.use('/admin', admin);

    app.use('/usuarios', usuarios)

// Others
const PORT = 8081
app.listen(PORT, ()=>{
    console.log('Seridor Rodando');
})