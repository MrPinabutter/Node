// Importações
    const express = require('express');
    const handlebars = require('express-handlebars');
    const app = express();
    const bodyParser = require('body-parser');
    const admin = require('./routes/admin');
    const path = require('path')
    const mongoose = require('mongoose');

// Configurações
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
        res.render("admin/index")
    });

    app.get('/posts', (req, res) =>{ 
        res.send("Lista de Posts")
    });

    app.use('/admin', admin);

// Others
const PORT = 8081
app.listen(PORT, ()=>{
    console.log('Seridor Rodando');
})