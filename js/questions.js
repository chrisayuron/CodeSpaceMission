const LEVELS = [
    {
        id: 1,
        name: "HTML Básico",
        description: "Etiquetas fundamentales de HTML",
        color: "#e44d26",
        questions: [
            {
                text: "¿Qué significa HTML?",
                options: [
                    "Hyper Text Markup Language",
                    "Home Tool Markup Language",
                    "Hyper Transfer Mode Language",
                    "High Text Machine Language"
                ],
                correct: 0,
                explanation: "HTML significa Hyper Text Markup Language (Lenguaje de Marcado de Hipertexto)."
            },
            {
                text: "¿Cuál es la etiqueta para crear un párrafo?",
                options: ["<paragraph>", "<p>", "<text>", "<para>"],
                correct: 1,
                explanation: "La etiqueta <p> se usa para crear párrafos en HTML."
            },
            {
                text: "¿Qué etiqueta crea un enlace?",
                options: ["<link>", "<a>", "<href>", "<url>"],
                correct: 1,
                explanation: "La etiqueta <a> (anchor) crea enlaces con el atributo href."
            },
            {
                text: "¿Qué hace la etiqueta <img>?",
                options: [
                    "Crea un enlace a una imagen",
                    "Inserta una imagen en la página",
                    "Crea un contenedor de imagen",
                    "Descarga una imagen"
                ],
                correct: 1,
                explanation: "La etiqueta <img> inserta una imagen. Es un elemento vacío que usa src."
            },
            {
                text: "¿Qué etiqueta crea una lista desordenada?",
                options: ["<ol>", "<ul>", "<li>", "<list>"],
                correct: 1,
                explanation: "<ul> crea listas desordenadas (con viñetas)."
            },
            {
                text: "¿Qué etiqueta crea el encabezado más importante?",
                options: ["<h6>", "<h1>", "<header>", "<head>"],
                correct: 1,
                explanation: "<h1> es el encabezado de mayor jerarquía. De h1 a h6."
            }
        ]
    },
    {
        id: 2,
        name: "HTML Intermedio",
        description: "Estructura y elementos semánticos",
        color: "#f06529",
        questions: [
            {
                text: "¿Cuál es la estructura básica de un documento HTML?",
                options: [
                    "html → head → body",
                    "head → body → html",
                    "body → html → head",
                    "html → body → head"
                ],
                correct: 0,
                explanation: "La estructura es: <!DOCTYPE html>, <html>, <head>, <body>."
            },
            {
                text: "¿Qué diferencia hay entre <strong> y <b>?",
                options: [
                    "No hay diferencia",
                    "<strong> tiene significado semántico, <b> solo es visual",
                    "<b> es más grande que <strong>",
                    "<strong> es obsoleto"
                ],
                correct: 1,
                explanation: "<strong> indica importancia semántica, <b> solo aplica estilo visual."
            },
            {
                text: "¿Qué etiqueta crea una tabla?",
                options: ["<table>", "<grid>", "<tab>", "<data>"],
                correct: 0,
                explanation: "La etiqueta <table> crea tablas. Se usa con <tr>, <td> y <th>."
            },
            {
                text: "¿Qué hace la etiqueta <br>?",
                options: [
                    "Crea un borde",
                    "Inserta un salto de línea",
                    "Crea un espacio",
                    "Cierra un párrafo"
                ],
                correct: 1,
                explanation: "<br> inserta un salto de línea (break). Es un elemento vacío."
            },
            {
                text: "¿Qué etiqueta crea un botón?",
                options: ["<button>", "<input>", "<click>", "<action>"],
                correct: 0,
                explanation: "<button> crea un botón. También se puede usar <input type='button'>."
            },
            {
                text: "¿Cómo se comenta en HTML?",
                options: [
                    "// comentario",
                    "/* comentario */",
                    "<!-- comentario -->",
                    "** comentario **"
                ],
                correct: 2,
                explanation: "Los comentarios en HTML se escriben entre <!-- y -->."
            }
        ]
    },
    {
        id: 3,
        name: "CSS Básico",
        description: "Selectores y propiedades fundamentales",
        color: "#2965f1",
        questions: [
            {
                text: "¿Qué es CSS?",
                options: [
                    "Computer Style Sheets",
                    "Cascading Style Sheets",
                    "Creative Style System",
                    "Colorful Style Sheets"
                ],
                correct: 1,
                explanation: "CSS significa Cascading Style Sheets (Hojas de Estilo en Cascada)."
            },
            {
                text: "¿Cómo seleccionas un elemento con id='titulo'?",
                options: [".titulo", "#titulo", "titulo", "*titulo"],
                correct: 1,
                explanation: "El selector # se usa para seleccionar elementos por id."
            },
            {
                text: "¿Cómo seleccionas elementos con class='boton'?",
                options: ["#boton", ".boton", "boton", "@boton"],
                correct: 1,
                explanation: "El selector . (punto) se usa para seleccionar por class."
            },
            {
                text: "¿Qué propiedad cambia el color de texto?",
                options: ["text-color", "font-color", "color", "foreground"],
                correct: 2,
                explanation: "La propiedad 'color' establece el color del texto."
            },
            {
                text: "¿Qué propiedad cambia el tamaño de la fuente?",
                options: ["text-size", "font-size", "font-style", "text-font"],
                correct: 1,
                explanation: "La propiedad 'font-size' controla el tamaño del texto."
            },
            {
                text: "¿Qué propiedad cambia el tipo de letra?",
                options: ["font-style", "font-family", "text-font", "typeface"],
                correct: 1,
                explanation: "font-family define la familia tipográfica."
            }
        ]
    },
    {
        id: 4,
        name: "CSS Intermedio",
        description: "Box model y layout",
        color: "#264de4",
        questions: [
            {
                text: "¿Qué diferencia hay entre margin y padding?",
                options: [
                    "No hay diferencia",
                    "Margin es exterior, padding es interior",
                    "Margin es interno, padding es externo",
                    "Ambos son externos"
                ],
                correct: 1,
                explanation: "Margin = espacio exterior. Padding = espacio interior."
            },
            {
                text: "¿Qué es el modelo de caja (box model)?",
                options: [
                    "Un modelo para crear cajas",
                    "Contenido + Padding + Border + Margin",
                    "Una forma de maquetar",
                    "Un contenedor HTML"
                ],
                correct: 1,
                explanation: "El box model: contenido → padding → border → margin."
            },
            {
                text: "¿Qué valor de display crea un elemento de bloque?",
                options: ["inline", "block", "flex", "none"],
                correct: 1,
                explanation: "display: block hace que ocupe todo el ancho y salte de línea."
            },
            {
                text: "¿Qué propiedad centra un elemento horizontalmente?",
                options: [
                    "text-align: center",
                    "margin: 0 auto",
                    "display: center",
                    "position: center"
                ],
                correct: 1,
                explanation: "margin: 0 auto centra un elemento de bloque."
            },
            {
                text: "¿Qué propiedad cambia el fondo?",
                options: ["background-color", "bg-color", "background", "color-bg"],
                correct: 2,
                explanation: "La propiedad 'background' (o 'background-color') cambia el fondo."
            },
            {
                text: "¿Qué propiedad separa el espacio entre letras?",
                options: ["word-spacing", "letter-spacing", "text-spacing", "char-spacing"],
                correct: 1,
                explanation: "letter-spacing controla el espacio entre caracteres."
            }
        ]
    },
    {
        id: 5,
        name: "CSS Avanzado",
        description: "Posicionamiento y responsive",
        color: "#0d1117",
        questions: [
            {
                text: "¿Qué diferencia hay entre <em> y <i>?",
                options: [
                    "No hay diferencia",
                    "<em> tiene énfasis semántico, <i> solo es visual",
                    "<i> es más grande",
                    "<em> es obsoleto"
                ],
                correct: 1,
                explanation: "<em> indica énfasis semántico, <i> solo estilo visual."
            },
            {
                text: "¿Qué hace 'position: absolute'?",
                options: [
                    "Fija el elemento",
                    "Posiciona relativo al contenedor posicionado más cercano",
                    "Centra el elemento",
                    "Hace el elemento fijo"
                ],
                correct: 1,
                explanation: "absolute se posiciona相对于 el contenedor posicionado más cercano."
            },
            {
                text: "¿Qué position hace fijo un elemento al hacer scroll?",
                options: ["absolute", "relative", "fixed", "static"],
                correct: 2,
                explanation: "position: fixed mantiene el elemento en la misma posición."
            },
            {
                text: "¿Qué es responsive design?",
                options: [
                    "Un tipo de diseño rápido",
                    "Diseño que se adapta a diferentes pantallas",
                    "Un framework de CSS",
                    "Un tipo de maquetación"
                ],
                correct: 1,
                explanation: "Responsive design usa media queries para adaptarse a cualquier dispositivo."
            },
            {
                text: "¿Cómo vinculas un archivo CSS externo?",
                options: [
                    "<style src='style.css'>",
                    "<link rel='stylesheet' href='style.css'>",
                    "<css href='style.css'>",
                    "<stylesheet>style.css</stylesheet>"
                ],
                correct: 1,
                explanation: "Se usa <link rel='stylesheet' href='style.css'> en el <head>."
            },
            {
                text: "¿Qué es ':hover' en CSS?",
                options: [
                    "Cuando el mouse está sobre un elemento",
                    "Cuando se hace clic",
                    "Cuando la página carga",
                    "Cuando se hace scroll"
                ],
                correct: 0,
                explanation: ":hover aplica estilos cuando el cursor está sobre el elemento."
            }
        ]
    }
];
