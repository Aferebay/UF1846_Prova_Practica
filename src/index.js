const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
process.loadEnvFile(); 
const PORT = process.env.PORT || 4000;

// agregue los estaticos porque me no me estaba leyendo los css ni las imagenes a sugerencia de Ferran
app.use(express.static(path.join(__dirname,"../public")));

const ebooksPath = path.join(__dirname, '../data/ebooks.json');

let ebooksData;

// Esto es por si falla la lectura del archivo
try {
    const data = fs.readFileSync(ebooksPath, 'utf8');
    ebooksData = JSON.parse(data);
} catch (err) {
    console.error('Error al leer el archivo ebooks.json:', err);
    process.exit(1);
}

// Solucion ruta raiz 1 punto
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

//Solucion ruta api 1 punto
app.get('/api', (req, res) => {
    const authors = ebooksData.map(book => ({
        autor_apellido: book.autor_apellido,
        autor_nombre: book.autor_nombre,
        obras: book.obras
    })).sort((a, b) => a.autor_apellido.localeCompare(b.autor_apellido));
    res.json(authors);
});

//solucion ruta /api/apellido/ 1 punto 
app.get('/api/apellido/:apellido', (req, res) => {
    const authors = ebooksData.filter(book => book.autor_apellido.toLowerCase() === req.params.apellido.toLowerCase());
    if (authors.length > 0) {
        res.json(authors);
    } else {
        res.status(404).json({ message: 'Autor no encontrado' });
    }
});

// solucion ruta : nombre y apellido completo 1 punto
app.get('/api/nombre_apellido/:nombre/:apellido', (req, res) => {
    const nombre = req.params.nombre.toLowerCase();
    const apellido = req.params.apellido.toLowerCase();
    const authors = ebooksData.filter(book => 
        book.autor_nombre.toLowerCase() === nombre &&
        book.autor_apellido.toLowerCase() === apellido
    );

    if (authors.length > 0) {
        res.json(authors);
    } else {
        res.status(404).json({ message: 'Autor no encontrado' });
    }
});

// solucion ruta : nombre y apellido parcial 1 punto
app.get('/api/nombre/:nombre', (req, res) => {
    const nombre = req.params.nombre.toLowerCase();
    const apellidoPartial = req.query.apellido;

    if (!apellidoPartial) {
        return res.status(400).json({ message: 'Falta el parámetro apellido' });
    }

    const authors = ebooksData.filter(book =>
        book.autor_nombre.toLowerCase() === nombre &&
        book.autor_apellido.toLowerCase().startsWith(apellidoPartial.toLowerCase())
    );

    if (authors.length > 0) {
        res.json(authors);
    } else {
        res.status(404).json({ message: 'Autor no encontrado' });
    }
});

// Filtrar por año 1 punto
app.get('/api/edicion/:year', (req, res) => {
    const year = parseInt(req.params.year);
    const booksByYear = ebooksData.flatMap(book => 
        book.obras.filter(work => work.edicion === year)
    );

    if (booksByYear.length > 0) {
        res.json(booksByYear);
    } else {
        res.status(404).json({ message: `No tenemos obras editadas en ${year}` });
    }
});


// Solucion ruta pantalla error
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
});

// Iniciar el servidor sin punto pero necesario :-)
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
