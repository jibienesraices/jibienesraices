const loginForm = document.getElementById("login-form");
const message = document.getElementById("message");

if (loginForm && message) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const passwordInput = document.getElementById("password");

        if (!passwordInput) {
            message.textContent = "Error: no se encontró el campo de contraseña.";
            return;
        }

        const password = passwordInput.value;

        message.textContent = "Comprobando...";

        try {
            const response = await fetch("/api/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    password: password
                })
            });

            const contentType = response.headers.get("content-type") || "";

            let data = null;

            if (contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const text = await response.text();

                console.error(
                    "El servidor no devolvió JSON.",
                    "Status:",
                    response.status,
                    "Respuesta:",
                    text
                );

                message.textContent =
                    `Error del servidor (${response.status}).`;
                return;
            }

            if (response.ok && data.success) {
                message.textContent = "Acceso correcto";
                window.location.href = "/admin-panel.html";
            } else {
                message.textContent =
                    data.message || "Contraseña incorrecta.";
            }

        } catch (error) {
            console.error("Error al iniciar sesión:", error);

            message.textContent =
                "Error de conexión con el servidor.";
        }
    });
}
