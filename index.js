import express from 'express';
import csurf from 'csurf';
import cookieParser from 'cookie-parser';
import usuarioRoutes from './routes/usuarioRoutes.js';
import propiedadesRoutes from './routes/propiedadesRoutes.js';
import appRoutes from './routes/appRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import db from './config/db.js';
import bodyParser from 'body-parser';
import upload from './middleware/subirImagen.js';  // Importar el middleware de multer

// Crear la app
const app = express();

// Habilitar lectura de datos de formularios
app.use(express.urlencoded({ extended: true }));

// Habilitar cookie Parser
app.use(cookieParser());

// Habilitar CSRF
app.use(csurf({ cookie: true }));

// Conexión a la base de datos
try {
    await db.authenticate();
    await db.sync();  // Sincronizar las tablas
    console.log('Conexión a la base de datos exitosa!!!');
} catch (error) {
    console.log('Error al conectar con la base de datos:', error);
}

// Habilitar Pug como motor de plantillas
app.set('view engine', 'pug');
app.set('views', './views');

// Carpeta pública para servir archivos estáticos (como imágenes)
app.use(express.static('public'));

// Rutas de la aplicación
app.use('/', appRoutes);
app.use('/auth', usuarioRoutes);
app.use('/', propiedadesRoutes);
app.use('/api', apiRoutes);

// Ruta para manejar la subida de imágenes de múltiples archivos
app.post('/propiedades/agregar-imagen/:id', upload.array('imagen', 3), async (req, res) => {
    // Verificar si se subieron archivos
    if (req.files && req.files.length > 0) {
        console.log('Archivos subidos:', req.files);

        try {
            // Obtener el ID de la propiedad donde se agregarán las imágenes
            const propiedadID = req.params.id;

            // Obtener las rutas de las imágenes subidas
            const imagenesSubidas = req.files.map(file => file.filename);  // Solo los nombres de los archivos

            console.log('Imágenes a guardar en la base de datos:', imagenesSubidas);

            // Insertar cada imagen en la tabla 'imagenes'
            for (let imagen of imagenesSubidas) {
                await db.query(
                    'INSERT INTO imagenes (propiedad_id, imagen) VALUES (?, ?)',
                    [propiedadID, imagen]
                );
            }

            console.log('Imágenes guardadas en la tabla imagenes');
            res.redirect(`/propiedades/editar/${propiedadID}`);
        } catch (error) {
            console.log('Error al guardar en la base de datos:', error);
            res.status(500).send('Error al guardar las imágenes');
        }
    } else {
        console.log('No se han subido imágenes');
        res.status(400).send('No se han subido imágenes');
    }
});

// Definir un puerto y arrancar el proyecto
const port = 3001;
app.listen(port, () => {
    console.log(`El servidor está funcionando en el puerto ${port}`);
});
