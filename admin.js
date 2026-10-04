/* =========================================================
   JI BIENES RAÍCES
   INICIO DE SESIÓN DE ADMINISTRACIÓN
   ========================================================= */


/* =========================================================
   ELEMENTOS
   ========================================================= */

const loginForm =
    document.getElementById("login-form");

const message =
    document.getElementById("message");

const passwordInput =
    document.getElementById("password");

const loginButton =
    loginForm.querySelector("button[type='submit']");


/* =========================================================
   INICIO DE SESIÓN
   ========================================================= */

loginForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const password =
            passwordInput.value;


        /* Evitar contraseña vacía */

        if (!password) {

            message.textContent =
                "Introduce tu contraseña.";

            return;
        }


        /* Estado de carga */

        message.textContent =
            "Comprobando...";


        loginButton.disabled =
            true;

        loginButton.textContent =
            "Comprobando...";


        try {

            const response =
                await fetch(
                    "/api/admin/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                password:
                                    password
                            })
                    }
                );


            /* =================================================
               RESPUESTA DEL SERVIDOR
               ================================================= */

            let data = {};

            try {

                data =
                    await response.json();

            } catch {

                data = {};

            }


            /* =================================================
               LOGIN CORRECTO
               ================================================= */

            if (
                response.ok &&
                data.success
            ) {

                message.textContent =
                    "Acceso correcto.";


                loginButton.textContent =
                    "Acceso concedido";


                /*
                 * Pequeña pausa para que el usuario
                 * vea el mensaje antes de entrar.
                 */

                setTimeout(() => {

                    window.location.href =
                        "/admin-panel.html";

                }, 300);


                return;
            }


            /* =================================================
               CONTRASEÑA INCORRECTA
               ================================================= */

            message.textContent =
                data.message ||
                "Contraseña incorrecta.";


            passwordInput.value = "";

            passwordInput.focus();


        } catch (error) {

            console.error(
                "Error de inicio de sesión:",
                error
            );


            message.textContent =
                "Error de conexión con el servidor.";

        } finally {

            /*
             * Si el login fue correcto,
             * dejamos el botón bloqueado mientras
             * se realiza la redirección.
             */

            if (
                !message.textContent.includes(
                    "Acceso correcto"
                )
            ) {

                loginButton.disabled =
                    false;

                loginButton.textContent =
                    "Entrar";

            }

        }

    }
);
