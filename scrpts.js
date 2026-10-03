/* =========================================================
   J-I BIENES RAÍCES
   SISTEMA DE PROPIEDADES
   ========================================================= */


/* =========================================================
   CONFIGURACIÓN
   ========================================================= */

// Número de WhatsApp de J-I Bienes Raíces
const whatsappNumber = "525583182642";


/* =========================================================
   CONTENEDOR DE PROPIEDADES
   ========================================================= */

const propertyList =
    document.getElementById("property-list");


/* =========================================================
   CARGAR PROPIEDADES
   ========================================================= */

fetch("/api/properties")

    .then(response => {

        if (!response.ok) {
            throw new Error(
                "No se pudieron cargar las propiedades."
            );
        }

        return response.json();

    })

    .then(properties => {

        /* Si no existen propiedades */

        if (!properties || properties.length === 0) {

            propertyList.innerHTML = `
                <div class="no-properties">
                    <h3>Actualmente no tenemos propiedades disponibles.</h3>
                    <p>
                        Estamos trabajando para ofrecerte
                        nuevas opciones próximamente.
                    </p>
                </div>
            `;

            return;
        }


        /* Crear tarjeta para cada propiedad */

        properties.forEach(property => {

            const card =
                document.createElement("article");


            /* Primera imagen */

            const firstImage =
                property.images &&
                property.images.length > 0
                    ? property.images[0]
                    : "";


            /* Crear tarjeta */

            card.innerHTML = `

                <div class="property-image-container">

                    ${
                        firstImage

                            ? `
                                <img
                                    src="${firstImage}"
                                    alt="${property.title}"
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
                        ${property.title}
                    </h3>


                    <p class="price">
                        ${property.price}
                    </p>


                    <p>
                        📍 ${property.location}
                    </p>


                    <p>
                        ${property.bedrooms} habitaciones
                        ·
                        ${property.bathrooms} baños
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
                                property.services.water
                                    ? "✓ Servicio de agua"
                                    : "✕ Servicio de agua"
                            }
                        </p>


                        <p>
                            ${
                                property.services.electricity
                                    ? "✓ Servicio de luz"
                                    : "✕ Servicio de luz"
                            }
                        </p>


                        <p>
                            ${
                                property.services.deeds
                                    ? "✓ Escrituras"
                                    : "✕ Escrituras"
                            }
                        </p>


                        <p>
                            ${
                                property.services.debt
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


            /* =================================================
               BOTONES
               ================================================= */

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


            /* Abrir información */

            detailsButton.addEventListener(
                "click",
                () => {

                    openPropertyModal(property);

                }
            );


            /* Abrir galería al tocar imagen */

            propertyImage.addEventListener(
                "click",
                () => {

                    openPropertyModal(property);

                }
            );


            /* Contactar por WhatsApp */

            whatsappButton.addEventListener(
                "click",
                () => {

                    const message =
                        `Hola, me interesa recibir información sobre la propiedad "${property.title}". ¿Podrían ayudarme con más información?`;

                    const whatsappURL =
                        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

                    window.open(
                        whatsappURL,
                        "_blank"
                    );

                }
            );


            /* Agregar tarjeta */

            propertyList.appendChild(card);

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


/* =========================================================
   MODAL DE PROPIEDAD
   ========================================================= */

function openPropertyModal(property) {

    let currentImage = 0;


    /* Imágenes */

    const images =
        property.images &&
        property.images.length > 0

            ? property.images

            : [];


    /* Crear modal */

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
                                src="${images[0]}"
                                alt="${property.title}"
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

                            /
                            ${images.length}

                        </div>
                      `

                    : ""
            }


            <!-- Información -->

            <div class="modal-info">


                <h2>
                    ${property.title}
                </h2>


                <p class="modal-price">
                    ${property.price}
                </p>


                <p>
                    📍 ${property.location}
                </p>


                <p>
                    ${property.bedrooms}
                    habitaciones
                    ·
                    ${property.bathrooms}
                    baños
                </p>


                <!-- Servicios -->

                <div class="modal-services">


                    <p>
                        ${
                            property.services.water
                                ? "✓ Servicio de agua"
                                : "✕ Servicio de agua"
                        }
                    </p>


                    <p>
                        ${
                            property.services.electricity
                                ? "✓ Servicio de luz"
                                : "✕ Servicio de luz"
                        }
                    </p>


                    <p>
                        ${
                            property.services.deeds
                                ? "✓ Escrituras"
                                : "✕ Escrituras"
                        }
                    </p>


                    <p>
                        ${
                            property.services.debt
                                ? "⚠ Tiene adeudo"
                                : "✓ Sin adeudo"
                        }
                    </p>


                </div>


                <!-- Descripción -->

                ${
                    property.description

                        ? `
                            <p class="modal-description">
                                ${property.description}
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


    /* Agregar modal */

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
       CONTROL TÁCTIL
       ===================================================== */

    let touchStartX = 0;

    let touchEndX = 0;


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

    if (images.length <= 1) {

        previousButton.style.display =
            "none";

        nextButton.style.display =
            "none";

    }


    /* =====================================================
       IMAGEN ANTERIOR
       ===================================================== */

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


    /* =====================================================
       IMAGEN SIGUIENTE
       ===================================================== */

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


    /* =====================================================
       SWIPE EN MÓVILES
       ===================================================== */

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


                    if (
                        currentImage < 0
                    ) {

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

    closeButton.addEventListener(
        "click",
        () => {

            modal.remove();

        }
    );


    /* Cerrar haciendo clic fuera */

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
       WHATSAPP DESDE EL MODAL
       ===================================================== */

    modalWhatsapp.addEventListener(
        "click",
        () => {

            const message =
                `Hola, me interesa recibir información sobre la propiedad "${property.title}". ¿Podrían ayudarme con más información?`;


            const whatsappURL =
                `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;


            window.open(
                whatsappURL,
                "_blank"
            );

        }
    );

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

ownerContactButton.addEventListener(
    "click",
    () => {

        ownerContactMenu.classList.toggle(
            "active"
        );

    }
);


/* =========================================================
   WHATSAPP PARA VENDEDORES
   ========================================================= */

ownerWhatsappButton.addEventListener(
    "click",
    () => {

        const message =
            "Hola, tengo una propiedad que me interesa vender. Me gustaría recibir información sobre el proceso.";


        const whatsappURL =
            `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;


        window.open(
            whatsappURL,
            "_blank"
        );

    }
);
