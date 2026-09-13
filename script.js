const USUARIOS = {

    admin: {
        password: "admin123",
        rol: "administrador"
    },

    usuario: {
        password: "usuario123",
        rol: "usuario"
    }

};


const MAX_INTENTOS = 3;

const TIEMPO_BLOQUEO = 60 * 1000;


function obtenerIntentos() {

    return Number(
        localStorage.getItem("intentosSeguridad")
    ) || 0;

}


function obtenerBloqueo() {

    return Number(
        localStorage.getItem("bloqueoSeguridad")
    ) || 0;

}


function guardarIntento() {

    let intentos = obtenerIntentos();

    intentos++;

    localStorage.setItem(
        "intentosSeguridad",
        intentos
    );

    if (intentos >= MAX_INTENTOS) {

        localStorage.setItem(
            "bloqueoSeguridad",
            Date.now() + TIEMPO_BLOQUEO
        );

    }

}


function limpiarIntentos() {

    localStorage.removeItem(
        "intentosSeguridad"
    );

    localStorage.removeItem(
        "bloqueoSeguridad"
    );

}


function estaBloqueado() {

    const bloqueo = obtenerBloqueo();

    if (bloqueo === 0) {

        return false;

    }

    if (Date.now() < bloqueo) {

        return true;

    }

    limpiarIntentos();

    return false;

}


function segundosRestantes() {

    const bloqueo = obtenerBloqueo();

    if (!bloqueo) {

        return 0;

    }

    return Math.ceil(
        (bloqueo - Date.now()) / 1000
    );

}


/* ==========================================
   LOGIN
========================================== */

const formulario =
    document.getElementById("loginForm");


if (formulario) {

    const mensaje =
        document.getElementById("mensaje");

    const boton =
        formulario.querySelector("button");


    function actualizarBloqueo() {

        if (estaBloqueado()) {

            boton.disabled = true;

            mensaje.textContent =
                "🔒 Acceso bloqueado. " +
                "Espera " +
                segundosRestantes() +
                " segundos.";

            mensaje.style.color = "red";

            return true;

        }

        boton.disabled = false;

        return false;

    }


    actualizarBloqueo();


    const intervalo =
        setInterval(function() {

            if (!estaBloqueado()) {

                clearInterval(intervalo);

                boton.disabled = false;

                mensaje.textContent =
                    "Ya puedes volver a intentarlo.";

                mensaje.style.color = "green";

            } else {

                boton.disabled = true;

                mensaje.textContent =
                    "🔒 Acceso bloqueado. " +
                    "Espera " +
                    segundosRestantes() +
                    " segundos.";

                mensaje.style.color = "red";

            }

        }, 1000);


    formulario.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            if (estaBloqueado()) {

                mensaje.textContent =
                    "🔒 Acceso bloqueado. " +
                    "Espera " +
                    segundosRestantes() +
                    " segundos.";

                mensaje.style.color = "red";

                return;

            }


            const usuario =
                document
                    .getElementById("usuario")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value;


            const datosUsuario =
                USUARIOS[usuario];


            if (
                datosUsuario &&
                datosUsuario.password === password
            ) {

                limpiarIntentos();


                localStorage.setItem(
                    "usuarioActual",
                    usuario
                );


                localStorage.setItem(
                    "rolActual",
                    datosUsuario.rol
                );


                window.location.href =
                    "productos.html";


            } else {

                guardarIntento();


                if (estaBloqueado()) {

                    mensaje.textContent =
                        "🔒 Has realizado 3 " +
                        "intentos fallidos. " +
                        "El acceso ha sido bloqueado " +
                        "durante 1 minuto.";

                } else {

                    mensaje.textContent =
                        "❌ Usuario o contraseña " +
                        "incorrectos. Intentos: " +
                        obtenerIntentos() +
                        "/3";

                }

                mensaje.style.color = "red";

            }

        }
    );

}


/* ==========================================
   PRODUCTOS NORMALES
========================================== */

if (
    window.location.pathname.endsWith(
        "productos.html"
    )
) {

    const usuarioActual =
        localStorage.getItem(
            "usuarioActual"
        );


    const rolActual =
        localStorage.getItem(
            "rolActual"
        );


    if (!usuarioActual || !rolActual) {

        window.location.href =
            "login.html";

    } else {

        const bienvenida =
            document.getElementById(
                "bienvenida"
            );


        bienvenida.textContent =
            "Bienvenido, " +
            usuarioActual +
            " | Rol: " +
            rolActual;


        const parametros =
            new URLSearchParams(
                window.location.search
            );


        const codigo =
            parametros.get("codigo");


        if (codigo) {

            const codigoNormalizado =
                codigo.toLowerCase().trim();


            const patronesSospechosos = [

                "' or '1'='1",

                "'or'1'='1",

                "' or 1=1",

                "'or 1=1",

                "or 1=1",

                "union select",

                "drop table",

                "insert into",

                "delete from",

                "update ",

                "--",

                "/*",

                "*/",

                ";"

            ];


            const intentoManipulacion =
                patronesSospechosos.some(
                    function(patron) {

                        return codigoNormalizado
                            .includes(patron);

                    }
                );


            if (intentoManipulacion) {

                /*
                 * ELIMINAMOS EL PARAMETRO
                 * ANTES DE REDIRIGIR.
                 */

                if (
                    rolActual ===
                    "administrador"
                ) {

                    window.location.href =
                        "productooculto.html";

                } else {

                    const alerta =
                        document.getElementById(
                            "alertaSeguridad"
                        );


                    if (alerta) {

                        alerta.style.display =
                            "block";

                        alerta.textContent =
                            "🚫 Intento de acceso " +
                            "no autorizado. " +
                            "Solo el administrador " +
                            "puede acceder a esta sección.";

                    }

                    /*
                     * El usuario normal NO
                     * será enviado a la página
                     * de productos ocultos.
                     */

                    window.history.replaceState(
                        {},
                        document.title,
                        "productos.html"
                    );

                }

            }

        }

    }

}


/* ==========================================
   PRODUCTOS OCULTOS
========================================== */

if (
    window.location.pathname.endsWith(
        "productooculto.html"
    )
) {

    const usuarioActual =
        localStorage.getItem(
            "usuarioActual"
        );


    const rolActual =
        localStorage.getItem(
            "rolActual"
        );


    /*
     * SI NO HAY SESIÓN
     */

    if (!usuarioActual || !rolActual) {

        window.location.href =
            "login.html";

    }


    /*
     * SI ES USUARIO NORMAL
     */

    else if (
        rolActual !==
        "administrador"
    ) {

        alert(
            "🚫 Acceso denegado. " +
            "Solo el administrador puede " +
            "ver los productos ocultos."
        );


        window.location.href =
            "productos.html";

    }


    /*
     * SI ES ADMINISTRADOR
     */

    else {

        const bienvenidaAdmin =
            document.getElementById(
                "bienvenidaAdmin"
            );


        if (bienvenidaAdmin) {

            bienvenidaAdmin.textContent =
                "Administrador: " +
                usuarioActual;

        }

    }

}


/* ==========================================
   CERRAR SESIÓN
========================================== */

const botonCerrar =
    document.getElementById(
        "cerrarSesion"
    );


if (botonCerrar) {

    botonCerrar.addEventListener(
        "click",
        function() {

            localStorage.removeItem(
                "usuarioActual"
            );

            localStorage.removeItem(
                "rolActual"
            );


            window.location.href =
                "login.html";

        }
    );

}