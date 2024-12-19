app.post('/propiedades/agregar-imagen/:id', upload.array('imagen', 3), async (req, res) => {
    // Verificar si se subieron archivos
    if (req.files && req.files.length > 0) {
        console.log('Archivos subidos:', req.files);

        try {
            // Obtener el ID de la propiedad donde se agregarán las imágenes
            const propiedadID = req.params.id;

            // Validación de tipo de archivo (solo imágenes)
            for (let file of req.files) {
                const fileExtension = file.mimetype.split('/')[0];
                if (fileExtension !== 'image') {
                    return res.status(400).send('Solo se permiten imágenes');
                }
            }

            // Insertar cada imagen en la tabla 'imagenes'
            for (let file of req.files) {
                // Aquí guardamos el nombre del archivo en la tabla 'imagenes'
                await db.query(
                    'INSERT INTO imagenes (propiedad_id, imagen) VALUES (?, ?)',
                    [propiedadID, file.filename]
                );
            }

            console.log('Imágenes guardadas en la base de datos');

            // Redirigir después de guardar las imágenes
            res.redirect(`/propiedades/editar/${propiedadID}`);
        } catch (error) {
            console.log('Error al guardar en la base de datos:', error);
            res.status(500).send('Hubo un error al guardar las imágenes en la base de datos');
        }
    } else {
        console.log('No se han subido imágenes');
        res.status(400).send('No se han subido imágenes. Por favor, asegúrate de seleccionar imágenes antes de enviar.');
    }
});
