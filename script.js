/* =========================================================
   JI BIENES RAÍCES
   SISTEMA DE PROPIEDADES
   ========================================================= */


/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

// Número de WhatsApp de JI Bienes Raíces
const whatsappNumber = "525583182642";

const paperworkWhatsappNumber = "525525087099";

/* =========================================================
   CONTENEDOR DE PROPIEDADES
   ========================================================= */

const propertyList = document.getElementById("property-list");


/* =========================================================
   FUNCIONES AUXILIARES
   ========================================================= */

/*
   Convierte cualquier valor en texto seguro para mostrarlo
   dentro de HTML.
*/

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/*
   Abre WhatsApp con un mensaje preparado.
*/

function openWhatsApp(message) {

    const whatsappURL =
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(
        whatsappURL,
        "_blank",
        "noopener,noreferrer"
    );
}
/*
   Abre el WhatsApp para trámites
   con un número diferente.
*/

function openPaperworkWhatsApp(message) {

    const whatsappURL =
        `https://wa.me/${paperworkWhatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(
        whatsappURL,
        "_blank",
        "noopener,noreferrer"
    );
}

/* =========================================================
   CARGAR PROPIEDADES
   ========================================================= */

if (propertyList) {

    fetch("/api/properties")

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    `Error HTTP ${response.status}`
                );

            }

            return response.json();

        })

        .then(properties => {

            /*
               Verificar que la respuesta sea un arreglo.
            */

            if (!Array.isArray(properties)) {

                throw new Error(
                    "La respuesta del servidor no tiene un formato válido."
                );

            }


            /*
               Si no existen propiedades.
            */

            if (properties.length === 0) {

                propertyList.innerHTML = `

                    <div class="no-properties">

                        <h3>
                            Actualmente no tenemos propiedades disponibles.
                        </h3>

                        <p>
                            Estamos trabajando para ofrecerte
                            nuevas opciones próximamente.
                        </p>

                    </div>

                `;

                return;
            }


            /*
               Crear tarjeta para cada propiedad.
            */

            properties.forEach(property => {

                createPropertyCard(property);

            });

        })

        .catch(error => {

            console.error(
                "Error al cargar las propiedades:",
                error
            );


            propertyList.innerHTML = `

                <div class="no-properties">

                    <h3>
                        No pudimos cargar las propiedades.
                    </h3>

                    <p>
                        Por favor, intenta nuevamente
                        en unos momentos.
                    </p>

                </div>

            `;

        });

}


/* =========================================================
   CREAR TARJETA DE PROPIEDAD
   ========================================================= */

function createPropertyCard(property) {

    const card =
        document.createElement("article");


    /*
       Obtener imágenes.
    */

    const images =
        Array.isArray(property.images)
            ? property.images.filter(Boolean)
            : [];


    /*
       Primera imagen.
    */

    const firstImage =
        images.length > 0
            ? images[0]
            : "";


    /*
       Servicios.
    */

    const services =
        property.services &&
        typeof property.services === "object"
            ? property.services
            : {};


    /*
       Valores seguros.
    */

    const title =
        escapeHTML(
            property.title || "Propiedad disponible"
        );


    const price =
        escapeHTML(
            property.price || "Precio disponible"
        );


    const location =
        escapeHTML(
            property.location || "Ubicación no especificada"
        );


    const bedrooms =
        escapeHTML(
            property.bedrooms ?? "N/D"
        );


    const bathrooms =
        escapeHTML(
            property.bathrooms ?? "N/D"
        );


    /*
       Crear tarjeta.
    */

    card.innerHTML = `

        <div class="property-image-container">

            ${
                firstImage

                    ? `

                        <img
                            src="${escapeHTML(firstImage)}"
                            alt="${title}"
                            loading="lazy"
                        >

                      `

                    : `

                        <div class="no-property-image">
                            Sin fotografía disponible
                        </div>

                      `
            }

        </div>


        <div class="property-info">

            <h3>
                ${title}
            </h3>


            <p class="price">
                ${price}
            </p>


            <p>
                📍 ${location}
            </p>


            <p>
                ${bedrooms} habitaciones
                ·
                ${bathrooms} baños
            </p>


            <button
                class="details-button"
                type="button"
            >
                Ver información de la propiedad
            </button>


            <div class="property-details">

                <p>
                    ${
                        services.water
                            ? "✓ Servicio de agua"
                            : "✕ Servicio de agua"
                    }
                </p>


                <p>
                    ${
                        services.electricity
                            ? "✓ Servicio de luz"
                            : "✕ Servicio de luz"
                    }
                </p>


                <p>
                    ${
                        services.deeds
                            ? "✓ Escrituras"
                            : "✕ Escrituras"
                    }
                </p>


                <p>
                    ${
                        services.debt
                            ? "⚠ Tiene adeudo"
                            : "✓ Sin adeudo"
                    }
                </p>

            </div>


            <button
                class="whatsapp-button"
                type="button"
            >
                💬 Solicitar información
            </button>

        </div>

    `;


    /* =====================================================
       ELEMENTOS DE LA TARJETA
       ===================================================== */

    const detailsButton =
        card.querySelector(
            ".details-button"
        );


    const whatsappButton =
        card.querySelector(
            ".whatsapp-button"
        );


    const propertyImage =
        card.querySelector(
            ".property-image-container"
        );


    /* =====================================================
       ABRIR INFORMACIÓN
       ===================================================== */

    if (detailsButton) {

        detailsButton.addEventListener(
            "click",
            () => {

                openPropertyModal(property);

            }
        );

    }


    /* =====================================================
       ABRIR GALERÍA AL TOCAR IMAGEN
       ===================================================== */

    if (propertyImage) {

        propertyImage.addEventListener(
            "click",
            () => {

                openPropertyModal(property);

            }
        );

    }


    /* =====================================================
       CONTACTAR POR WHATSAPP
       ===================================================== */

    if (whatsappButton) {

        whatsappButton.addEventListener(
            "click",
            () => {

                const message =
                    `Hola, me interesa recibir información sobre la propiedad "${property.title || "disponible"}". ¿Podrían ayudarme con más información?`;

                openWhatsApp(message);

            }
        );

    }


    /* =====================================================
       AGREGAR TARJETA
       ===================================================== */

    propertyList.appendChild(card);

}


/* =========================================================
   MODAL DE PROPIEDAD
   ========================================================= */

function openPropertyModal(property) {

    let currentImage = 0;


    /* =====================================================
       IMÁGENES
       ===================================================== */

    const images =
        Array.isArray(property.images)
            ? property.images.filter(Boolean)
            : [];


    /* =====================================================
       SERVICIOS
       ===================================================== */

    const services =
        property.services &&
        typeof property.services === "object"
            ? property.services
            : {};


    /* =====================================================
       DATOS SEGUROS
       ===================================================== */

    const title =
        escapeHTML(
            property.title || "Propiedad disponible"
        );


    const price =
        escapeHTML(
            property.price || "Precio disponible"
        );


    const location =
        escapeHTML(
            property.location || "Ubicación no especificada"
        );


    const bedrooms =
        escapeHTML(
            property.bedrooms ?? "N/D"
        );


    const bathrooms =
        escapeHTML(
            property.bathrooms ?? "N/D"
        );


    const description =
        escapeHTML(
            property.description || ""
        );


    /* =====================================================
       CREAR MODAL
       ===================================================== */

    const modal =
        document.createElement("div");


    modal.className =
        "property-modal";


    modal.innerHTML = `

        <div class="modal-content">


            <!-- Cerrar -->

            <button
                class="close-modal"
                type="button"
                aria-label="Cerrar"
            >
                ×
            </button>


            <!-- Galería -->

            <div class="modal-gallery">


                <button
                    class="gallery-button previous"
                    type="button"
                    aria-label="Imagen anterior"
                >
                    ‹
                </button>


                ${
                    images.length > 0

                        ? `

                            <img
                                class="modal-image"
                                src="${escapeHTML(images[0])}"
                                alt="${title}"
                            >

                          `

                        : `

                            <div class="no-modal-image">
                                Sin fotografías disponibles
                            </div>

                          `
                }


                <button
                    class="gallery-button next"
                    type="button"
                    aria-label="Imagen siguiente"
                >
                    ›
                </button>


            </div>


            <!-- Contador -->

            ${
                images.length > 1

                    ? `

                        <div class="gallery-counter">

                            <span
                                class="current-image-number"
                            >
                                1
                            </span>

                            / ${images.length}

                        </div>

                      `

                    : ""
            }


            <!-- Información -->

            <div class="modal-info">


                <h2>
                    ${title}
                </h2>


                <p class="modal-price">
                    ${price}
                </p>


                <p>
                    📍 ${location}
                </p>


                <p>
                    ${bedrooms}
                    habitaciones
                    ·
                    ${bathrooms}
                    baños
                </p>


                <!-- Servicios -->

                <div class="modal-services">


                    <p>
                        ${
                            services.water
                                ? "✓ Servicio de agua"
                                : "✕ Servicio de agua"
                        }
                    </p>


                    <p>
                        ${
                            services.electricity
                                ? "✓ Servicio de luz"
                                : "✕ Servicio de luz"
                        }
                    </p>


                    <p>
                        ${
                            services.deeds
                                ? "✓ Escrituras"
                                : "✕ Escrituras"
                        }
                    </p>


                    <p>
                        ${
                            services.debt
                                ? "⚠ Tiene adeudo"
                                : "✓ Sin adeudo"
                        }
                    </p>


                </div>


                <!-- Descripción -->

                ${
                    description

                        ? `

                            <p class="modal-description">
                                ${description}
                            </p>

                          `

                        : ""
                }


                <!-- WhatsApp -->

                <button
                    class="modal-whatsapp"
                    type="button"
                >
                    💬 Solicitar información
                </button>


            </div>

        </div>

    `;


    /* =====================================================
       AGREGAR MODAL AL DOCUMENTO
       ===================================================== */

    document.body.appendChild(modal);


    /* =====================================================
       ELEMENTOS DEL MODAL
       ===================================================== */

    const modalImage =
        modal.querySelector(
            ".modal-image"
        );


    const previousButton =
        modal.querySelector(
            ".previous"
        );


    const nextButton =
        modal.querySelector(
            ".next"
        );


    const closeButton =
        modal.querySelector(
            ".close-modal"
        );


    const modalWhatsapp =
        modal.querySelector(
            ".modal-whatsapp"
        );


    const counter =
        modal.querySelector(
            ".current-image-number"
        );


    /* =====================================================
       ACTUALIZAR IMAGEN
       ===================================================== */

    function updateImage() {

        if (
            !modalImage ||
            images.length === 0
        ) {

            return;

        }


        modalImage.src =
            images[currentImage];


        if (counter) {

            counter.textContent =
                currentImage + 1;

        }

    }


    /* =====================================================
       OCULTAR FLECHAS SI SOLO EXISTE UNA IMAGEN
       ===================================================== */

    if (
        images.length <= 1 &&
        previousButton &&
        nextButton
    ) {

        previousButton.style.display =
            "none";

        nextButton.style.display =
            "none";

    }


    /* =====================================================
       IMAGEN ANTERIOR
       ===================================================== */

    if (previousButton) {

        previousButton.addEventListener(
            "click",
            () => {

                if (images.length <= 1) {

                    return;

                }


                currentImage--;


                if (currentImage < 0) {

                    currentImage =
                        images.length - 1;

                }


                updateImage();

            }
        );

    }


    /* =====================================================
       IMAGEN SIGUIENTE
       ===================================================== */

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            () => {

                if (images.length <= 1) {

                    return;

                }


                currentImage++;


                if (
                    currentImage >=
                    images.length
                ) {

                    currentImage = 0;

                }


                updateImage();

            }
        );

    }


    /* =====================================================
       SWIPE EN MÓVILES
       ===================================================== */

    let touchStartX = 0;

    let touchEndX = 0;


    if (modalImage) {

        modalImage.addEventListener(
            "touchstart",
            event => {

                touchStartX =
                    event.changedTouches[0].screenX;

            }
        );


        modalImage.addEventListener(
            "touchend",
            event => {

                if (images.length <= 1) {

                    return;

                }


                touchEndX =
                    event.changedTouches[0].screenX;


                const difference =
                    touchStartX -
                    touchEndX;


                if (
                    Math.abs(difference) < 50
                ) {

                    return;

                }


                /* Deslizar hacia la izquierda */

                if (difference > 0) {

                    currentImage++;


                    if (
                        currentImage >=
                        images.length
                    ) {

                        currentImage = 0;

                    }

                }


                /* Deslizar hacia la derecha */

                else {

                    currentImage--;


                    if (currentImage < 0) {

                        currentImage =
                            images.length - 1;

                    }

                }


                updateImage();

            }
        );

    }


    /* =====================================================
       CERRAR MODAL
       ===================================================== */

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {

                modal.remove();

            }
        );

    }


    /* =====================================================
       CERRAR HACIENDO CLIC FUERA
       ===================================================== */

    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                modal.remove();

            }

        }
    );


    /* =====================================================
       CERRAR CON LA TECLA ESC
       ===================================================== */

    function handleEscape(event) {

        if (event.key === "Escape") {

            modal.remove();

            document.removeEventListener(
                "keydown",
                handleEscape
            );

        }

    }


    document.addEventListener(
        "keydown",
        handleEscape
    );


    /* =====================================================
       WHATSAPP DESDE EL MODAL
       ===================================================== */

    if (modalWhatsapp) {

        modalWhatsapp.addEventListener(
            "click",
            () => {

                const message =
                    `Hola, me interesa recibir información sobre la propiedad "${property.title || "disponible"}". ¿Podrían ayudarme con más información?`;

                openWhatsApp(message);

            }
        );

    }

}


/* =========================================================
   CONTACTO PARA PROPIETARIOS
   ========================================================= */

const ownerContactButton =
    document.getElementById(
        "owner-contact-button"
    );


const ownerContactMenu =
    document.getElementById(
        "owner-contact-menu"
    );


const ownerWhatsappButton =
    document.getElementById(
        "owner-whatsapp-button"
    );


/* =========================================================
   ABRIR / CERRAR CONTACTO
   ========================================================= */

if (
    ownerContactButton &&
    ownerContactMenu
) {

    ownerContactButton.addEventListener(
        "click",
        () => {

            ownerContactMenu.classList.toggle(
                "active"
            );

        }
    );

}


/* =========================================================
   WHATSAPP PARA VENDEDORES
   ========================================================= */

if (ownerWhatsappButton) {

    ownerWhatsappButton.addEventListener(
        "click",
        () => {

            const message =
                "Hola, tengo una propiedad que me interesa vender. Me gustaría recibir información sobre el proceso.";

            openWhatsApp(message);

        }
    );

}/* =========================================================
   WHATSAPP PARA TRÁMITES
   ========================================================= */

const paperworkWhatsappButton =
    document.getElementById(
        "paperwork-whatsapp-button"
    );


if (paperworkWhatsappButton) {

    paperworkWhatsappButton.addEventListener(
        "click",
        () => {

            const message =
                "Hola, necesito ayuda con un trámite relacionado con una propiedad. Me gustaría recibir información.";

            openPaperworkWhatsApp(message);

        }
    );

}
