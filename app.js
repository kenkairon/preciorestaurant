// npm init -y
//npm install express
//npm install handlebars
//se importa el módulo de Express, que es un framework para crear aplicaciones web en Node.js.
const express = require('express');
//se crea una instancia de la aplicación de Express.
const app = express();
//se importa el módulo de Handlebars, que es un motor de plantillas para JavaScript.
const handlebars = require('handlebars');
// se importa el módulo de File System, que es un módulo incorporado de Node.js que permite trabajar con archivos y directorios.
const fs = require('fs');
// se importa el módulo de Path, que es un módulo incorporado de Node.js que proporciona utilidades para trabajar con rutas de archivos y directorios.
const path = require('path');

// Cargar los datos de los precios desde el archivo JSON
const productosPath = path.join(__dirname, 'data', 'precios.json');
const productosJson = fs.readFileSync(productosPath, 'utf-8');
const almuerzos = JSON.parse(productosJson);

// Cargar la plantilla Handlebars desde el archivo "productos.hbs"
const source = fs.readFileSync(path.join(__dirname, 'views', 'productos.hbs'), 'utf8');
//se compila el contenido de productos.hbs como una plantilla Handlebars usando el método compile() del módulo de Handlebars.
// El resultado es una función que puede ser utilizada para renderizar la plantilla con datos.
const compiledTemplate = handlebars.compile(source);

// Cargar la plantilla Handlebars desde el archivo "agregarmenu.hbs"
const sourceAgregarmenu = fs.readFileSync(path.join(__dirname, 'views', 'agregarmenu.hbs'), 'utf8');
const compiledAgregarmenu = handlebars.compile(sourceAgregarmenu);

app.use(express.urlencoded({ extended: true }));

// Ruta para mostrar el formulario de agregado de menús
app.get('/agregar-menu', (req, res) => {
  const html = compiledAgregarmenu();
  res.send(html);

});

// Ruta para agregar un nuevo menú y su precio al archivo JSON
app.post('/agregar-menu', (req, res) => {
  const nuevoMenu = {

    nombre: req.body.nombre,
    precio: req.body.precio
  };

  almuerzos.almuerzos.push(nuevoMenu);
  // método estático convierte un valor de JavaScript en una cadena JSON, reemplazando opcionalmente los valores si se especifica una función de reemplazo
  // u opcionalmente incluyendo solo las propiedades especificadas si se especifica una matriz de reemplazo.
  //la función writeFile se usa para escribir archivos js de forma asíncrona. Las funciones fileName, textToBeWritten, FileEncodingType, Callback se toman como parámetros de entrada. 
  fs.writeFile(productosPath, JSON.stringify(almuerzos), (err) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.redirect('/');
    }
  });
});

// Ruta principal que muestra todas las cards generadas
app.get('/', (req, res) => {
  const cardsHtml = almuerzos.almuerzos.map((producto) => {
    return compiledTemplate({
      nombre: producto.nombre,
      precio: producto.precio
    });
  }).join('\n');

  res.send(cardsHtml);
});


//Eliminar un plato

app.get('/eliminarmenu/:nombrePlato', (req, res) => {
  const nombrePlato = req.params.nombrePlato; // Obtener el nombre del plato desde los parámetros de la ruta

  // Eliminar el plato del archivo JSON
  const index = almuerzos.almuerzos.findIndex(p => p.nombre === nombrePlato);
  if (index !== -1) {
    almuerzos.almuerzos.splice(index, 1);
    fs.writeFile(productosPath, JSON.stringify(almuerzos), (err) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        console.log('Plato eliminado del archivo JSON');
        // Eliminar el archivo JSON si no hay más platos
        if (almuerzos.almuerzos.length === 0) {
          fs.unlink(productosPath, (err) => {
            if (err) {
              console.log(err);
              res.sendStatus(500);
            } else {
              console.log('Archivo JSON eliminado');
              res.redirect('/');
            }
          });
        } else {
          res.redirect('/');
        }
      }
    });
  } else {
    res.sendStatus(404);
  }
});


// Iniciar el servidor en el puerto 3000
app.listen(3008, () => {
  console.log('Servidor iniciado en el puerto 3008');
});
