const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
    res.send("Pagina Principal")
})

router.get('/posts', (req, res) => {
    res.send("Pagina de Posts")
})

router.get("/categorias", (req, res) => {
    res.render("admin/categorias")
})

router.get("/categorias/add", (req, res) => { 
    res.render("admin/addcategorias")
})

module.exports = router