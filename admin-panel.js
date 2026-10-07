const propertyList = document.getElementById("property-list");
const addPropertyButton = document.getElementById("add-property-button");
const cancelPropertyButton = document.getElementById("cancel-property-button");
const propertyFormContainer = document.getElementById("property-form-container");
const propertyForm = document.getElementById("property-form");
const propertyFormTitle = document.getElementById("property-form-title");

const titleInput = document.getElementById("title");
const priceInput = document.getElementById("price");
const locationInput = document.getElementById("location");
const bedroomsInput = document.getElementById("bedrooms");
const bathroomsInput = document.getElementById("bathrooms");
const priorityInput = document.getElementById("priority");

const waterInput = document.getElementById("water");
const electricityInput = document.getElementById("electricity");
const deedsInput = document.getElementById("deeds");
const debtInput = document.getElementById("debt");

const descriptionInput = document.getElementById("description");

const propertyImagesInput = document.getElementById("property-images");
const imageUploadMessage = document.getElementById("image-upload-message");
const propertyImagesPreview = document.getElementById("property-images-preview");
const selectedImagesCount = document.getElementById("selected-images-count");

const formMessage = document.getElementById("form-message");

let editingPropertyId = null;
let selectedFiles = [];


/* =========================================================
   PRECIO
   ========================================================= */

function formatPrice(value) {
    const numbers = String(value || "").replace(/\D/g, "");

    if (!numbers) {
        return "";
    }

    return "$" + Number(numbers).toLocaleString("en-US");
}

function getPriceNumber(value) {
    return String(value || "").replace(/\D/g, "");
}

priceInput.addEventListener("input", () => {
    priceInput.value = formatPrice(priceInput.value);
});


/* =========================================================
   IMÁGENES SELECCIONADAS
   ========================================================= */

function updateSelectedImagesCount() {
    if (!selectedImagesCount) {
        return;
    }

    if (selectedFiles.length === 0) {
        selectedImagesCount.textContent =
            "Ninguna fotografía seleccionada";

        return;
    }

    if (selectedFiles.length === 1) {
        selectedImagesCount.textContent =
            "1 fotografía seleccionada";

        return;
    }

    selectedImagesCount.textContent =
        `${selectedFiles.length} fotografías seleccionadas`;
}


function renderSelectedImagesPreview() {
    propertyImagesPreview.innerHTML = "";

    selectedFiles.forEach((file, index) => {

        const reader = new FileReader();

        reader.onload = (event) => {

            const previewItem =
                document.createElement("div");

            previewItem.className =
                "image-preview-item";

            previewItem.innerHTML = `
                <img
                    src="${event.target.result}"
                    alt="Vista previa"
                >

                <button
                    type="button"
                    class="delete-image-button"
                    data-selected-index="${index}"
                >
                    Eliminar
                </button>
            `;

            propertyImagesPreview.appendChild(
                previewItem
            );
        };

        reader.readAsDataURL(file);
    });
}


propertyImagesInput.addEventListener("change", () => {

    selectedFiles =
        Array.from(propertyImagesInput.files);

    updateSelectedImagesCount();
    renderSelectedImagesPreview();

    if (selectedFiles.length > 0) {

        imageUploadMessage.textContent =
            "Las fotografías se subirán al guardar la propiedad.";

    } else {

        imageUploadMessage.textContent = "";
    }
});


propertyImagesPreview.addEventListener(
    "click",
    (event) => {

        const button =
            event.target.closest(
                ".delete-image-button"
            );

        if (!button) {
            return;
        }

        const index =
            Number(button.dataset.selectedIndex);

        if (Number.isNaN(index)) {
            return;
        }

        selectedFiles.splice(index, 1);

        updateSelectedImagesCount();
        renderSelectedImagesPreview();

        if (selectedFiles.length === 0) {
            imageUploadMessage.textContent = "";
        }
    }
);


/* =========================================================
   MOSTRAR / OCULTAR FORMULARIO
   ========================================================= */

addPropertyButton.addEventListener(
    "click",
    () => {

        editingPropertyId = null;

        propertyForm.reset();

        /*
         * B es la prioridad predeterminada.
         */
        priorityInput.value = "B";

        selectedFiles = [];

        propertyImagesInput.value = "";

        propertyImagesPreview.innerHTML = "";

        imageUploadMessage.textContent = "";

        updateSelectedImagesCount();

        propertyFormTitle.textContent =
            "Agregar propiedad";

        formMessage.textContent = "";

        propertyFormContainer.classList.add(
            "active"
        );
    }
);


cancelPropertyButton.addEventListener(
    "click",
    () => {

        editingPropertyId = null;

        propertyForm.reset();

        priorityInput.value = "B";

        selectedFiles = [];

        propertyImagesInput.value = "";

        propertyImagesPreview.innerHTML = "";

        imageUploadMessage.textContent = "";

        updateSelectedImagesCount();

        formMessage.textContent = "";

        propertyFormContainer.classList.remove(
            "active"
        );
    }
);


/* =========================================================
   CARGAR PROPIEDADES
   ========================================================= */

async function loadProperties() {

    try {

        const response =
            await fetch(
                "/api/admin/properties"
            );

        if (response.status === 401) {

            window.location.href =
                "/admin.html";

            return;
        }

        if (!response.ok) {

            throw new Error(
                "No se pudieron cargar las propiedades."
            );
        }

        const properties =
            await response.json();

        renderProperties(properties);

    } catch (error) {

        console.error(error);

        propertyList.innerHTML = `
            <p class="error-message">
                Error al cargar las propiedades.
            </p>
        `;
    }
}


/* =========================================================
   MOSTRAR PROPIEDADES
   ========================================================= */

function renderProperties(properties) {

    if (
        !properties ||
        properties.length === 0
    ) {

        propertyList.innerHTML = `
            <p>
                No hay propiedades registradas todavía.
            </p>
        `;

        return;
    }


    propertyList.innerHTML =
        properties.map(property => {

            const images =
                property.images || [];


            const imagesHTML =
                images.length
                    ? `
                        <div class="property-image-gallery">

                            ${images.map(image => `
                                <div class="image-gallery-item">

                                    <img
                                        src="${image}"
                                        alt="Fotografía de propiedad"
                                    >

                                    <div class="image-actions">

                                        <button
                                            type="button"
                                            class="primary-image-button"
                                            data-property-id="${property.id}"
                                            data-image-url="${image}"
                                        >
                                            ⭐ Marcar como principal
                                        </button>

                                        <button
                                            type="button"
                                            class="delete-image-button"
                                            data-property-id="${property.id}"
                                            data-image-url="${image}"
                                        >
                                            Eliminar foto
                                        </button>

                                    </div>

                                </div>
                            `).join("")}

                        </div>
                    `
                    : `
                        <p class="no-images">
                            Esta propiedad todavía no tiene fotografías.
                        </p>
                    `;


            return `
                <article class="property-card">

                    <div class="property-card-header">

                        <div>

                            <h3>
                                ${property.title}
                            </h3>

                            <p class="property-price">
                                ${formatPrice(property.price)}
                            </p>

                            <p>
                                📍 ${property.location}
                            </p>

                            <p>
                                Prioridad:
                                <strong>
                                    ${property.priority || "B"}
                                </strong>
                            </p>

                        </div>


                        <div class="property-actions">

                            <button
                                type="button"
                                class="edit-property-button"
                                data-id="${property.id}"
                            >
                                Editar
                            </button>

                            <button
                                type="button"
                                class="delete-property-button"
                                data-id="${property.id}"
                            >
                                Eliminar
                            </button>

                        </div>

                    </div>


                    <div class="property-details">

                        <span>
                            🛏️ ${property.bedrooms}
                            habitaciones
                        </span>

                        <span>
                            🚿 ${property.bathrooms}
                            baños
                        </span>

                        <span>
                            💧 ${
                                property.water
                                    ? "Agua"
                                    : "Sin agua"
                            }
                        </span>

                        <span>
                            ⚡ ${
                                property.electricity
                                    ? "Electricidad"
                                    : "Sin electricidad"
                            }
                        </span>

                        <span>
                            📜 ${
                                property.deeds
                                    ? "Escrituras"
                                    : "Sin escrituras"
                            }
                        </span>

                        <span>
                            💰 ${
                                property.debt
                                    ? "Con adeudo"
                                    : "Sin adeudo"
                            }
                        </span>

                    </div>


                    ${
                        property.description
                            ? `
                                <p class="property-description">
                                    ${property.description}
                                </p>
                            `
                            : ""
                    }


                    ${imagesHTML}

                </article>
            `;

        }).join("");
}


/* =========================================================
   EDITAR PROPIEDAD
   ========================================================= */

propertyList.addEventListener(
    "click",
    async (event) => {

        const editButton =
            event.target.closest(
                ".edit-property-button"
            );

        if (!editButton) {
            return;
        }

        const propertyId =
            editButton.dataset.id;


        try {

            const response =
                await fetch(
                    "/api/admin/properties"
                );


            if (!response.ok) {

                throw new Error(
                    "No se pudieron obtener las propiedades."
                );
            }


            const properties =
                await response.json();


            const property =
                properties.find(
                    item =>
                        String(item.id) ===
                        String(propertyId)
                );


            if (!property) {

                alert(
                    "No se encontró la propiedad."
                );

                return;
            }


            editingPropertyId =
                property.id;


            titleInput.value =
                property.title || "";


            priceInput.value =
                formatPrice(property.price);


            locationInput.value =
                property.location || "";


            bedroomsInput.value =
                property.bedrooms || 0;


            bathroomsInput.value =
                property.bathrooms || 0;


            priorityInput.value =
                property.priority || "B";


            waterInput.checked =
                Boolean(property.water);


            electricityInput.checked =
                Boolean(
                    property.electricity
                );


            deedsInput.checked =
                Boolean(property.deeds);


            debtInput.checked =
                Boolean(property.debt);


            descriptionInput.value =
                property.description || "";


            selectedFiles = [];

            propertyImagesInput.value = "";

            propertyImagesPreview.innerHTML = "";

            imageUploadMessage.textContent = "";

            updateSelectedImagesCount();


            propertyFormTitle.textContent =
                "Editar propiedad";


            formMessage.textContent = "";


            propertyFormContainer.classList.add(
                "active"
            );


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });


        } catch (error) {

            console.error(error);

            alert(
                "Ocurrió un error al cargar la propiedad."
            );
        }
    }
);


/* =========================================================
   ELIMINAR PROPIEDAD
   ========================================================= */

propertyList.addEventListener(
    "click",
    async (event) => {

        const deleteButton =
            event.target.closest(
                ".delete-property-button"
            );


        if (!deleteButton) {
            return;
        }


        const propertyId =
            deleteButton.dataset.id;


        const confirmed =
            confirm(
                "¿Seguro que quieres eliminar esta propiedad?"
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await fetch(
                    `/api/admin/properties/${propertyId}`,
                    {
                        method: "DELETE"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "No se pudo eliminar la propiedad."
                );
            }


            await loadProperties();


        } catch (error) {

            console.error(error);

            alert(
                "No se pudo eliminar la propiedad."
            );
        }
    }
);


/* =========================================================
   MARCAR IMAGEN COMO PRINCIPAL
   ========================================================= */

propertyList.addEventListener(
    "click",
    async (event) => {

        const primaryButton =
            event.target.closest(
                ".primary-image-button"
            );


        if (!primaryButton) {
            return;
        }


        const propertyId =
            primaryButton.dataset.propertyId;


        const imageUrl =
            primaryButton.dataset.imageUrl;


        try {

            const response =
                await fetch(
                    `/api/admin/properties/${propertyId}/images/primary`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            image_url:
                                imageUrl
                        })
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "No se pudo marcar la imagen como principal."
                );
            }


            await loadProperties();


        } catch (error) {

            console.error(error);

            alert(
                "No se pudo marcar la imagen como principal."
            );
        }
    }
);


/* =========================================================
   ELIMINAR IMAGEN
   ========================================================= */

propertyList.addEventListener(
    "click",
    async (event) => {

        const deleteImageButton =
            event.target.closest(
                ".delete-image-button"
            );


        if (!deleteImageButton) {
            return;
        }


        /*
         * Si tiene data-selected-index significa
         * que todavía no se ha subido.
         */

        if (
            deleteImageButton.dataset.selectedIndex !==
            undefined
        ) {
            return;
        }


        const propertyId =
            deleteImageButton.dataset.propertyId;


        const imageUrl =
            deleteImageButton.dataset.imageUrl;


        const confirmed =
            confirm(
                "¿Seguro que quieres eliminar esta fotografía?"
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await fetch(
                    `/api/admin/properties/${propertyId}/images`,
                    {
                        method: "DELETE",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            image_url:
                                imageUrl
                        })
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "No se pudo eliminar la fotografía."
                );
            }


            await loadProperties();


        } catch (error) {

            console.error(error);

            alert(
                "No se pudo eliminar la fotografía."
            );
        }
    }
);


/* =========================================================
   GUARDAR PROPIEDAD
   ========================================================= */

propertyForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        formMessage.textContent =
            "Guardando propiedad.";

        formMessage.className = "";


        const price =
            getPriceNumber(
                priceInput.value
            );


        if (!price) {

            formMessage.textContent =
                "Introduce un precio válido.";

            return;
        }


        const propertyData = {

            title:
                titleInput.value.trim(),

            price:
                price,

            location:
                locationInput.value.trim(),

            bedrooms:
                Number(
                    bedroomsInput.value
                ) || 0,

            bathrooms:
                Number(
                    bathroomsInput.value
                ) || 0,

            priority:
                priorityInput.value,

            water:
                waterInput.checked
                    ? 1
                    : 0,

            electricity:
                electricityInput.checked
                    ? 1
                    : 0,

            deeds:
                deedsInput.checked
                    ? 1
                    : 0,

            debt:
                debtInput.checked
                    ? 1
                    : 0,

            description:
                descriptionInput.value.trim()
        };


        try {

            let response;
            let propertyId;


            /* =================================================
               CREAR
               ================================================= */

            if (!editingPropertyId) {

                response =
                    await fetch(
                        "/api/admin/properties",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body:
                                JSON.stringify(
                                    propertyData
                                )
                        }
                    );

            }


            /* =================================================
               EDITAR
               ================================================= */

            else {

                response =
                    await fetch(
                        `/api/admin/properties/${editingPropertyId}`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body:
                                JSON.stringify(
                                    propertyData
                                )
                        }
                    );
            }


            if (!response.ok) {

                const errorText =
                    await response.text();


                throw new Error(
                    errorText ||
                    "No se pudo guardar la propiedad."
                );
            }


            const result =
                await response.json();


            propertyId =
                editingPropertyId ||
                result.id;


            /* =================================================
               SUBIR FOTOGRAFÍAS A R2
               ================================================= */

            if (
                selectedFiles.length > 0
            ) {

                imageUploadMessage.textContent =
                    "Subiendo fotografías...";


                for (
                    const file
                    of selectedFiles
                ) {

                    const formData =
                        new FormData();


                    formData.append(
                        "image",
                        file
                    );


                    const imageResponse =
                        await fetch(
                            `/api/admin/properties/${propertyId}/images`,
                            {
                                method: "POST",
                                body:
                                    formData
                            }
                        );


                    if (
                        !imageResponse.ok
                    ) {

                        const imageError =
                            await imageResponse.text();


                        throw new Error(
                            imageError ||
                            "No se pudo subir una fotografía."
                        );
                    }
                }


                imageUploadMessage.textContent =
                    "Fotografías subidas correctamente.";
            }


            formMessage.textContent =
                "Propiedad guardada correctamente.";


            formMessage.className =
                "success-message";


            /* =================================================
               LIMPIAR FORMULARIO
               ================================================= */

            propertyForm.reset();

            priorityInput.value = "B";

            editingPropertyId = null;

            selectedFiles = [];

            propertyImagesInput.value = "";

            propertyImagesPreview.innerHTML = "";

            updateSelectedImagesCount();

            propertyFormTitle.textContent =
                "Agregar propiedad";


            await loadProperties();


            setTimeout(() => {

                propertyFormContainer.classList.remove(
                    "active"
                );

                formMessage.textContent = "";

                imageUploadMessage.textContent = "";

            }, 1000);


        } catch (error) {

            console.error(error);

            formMessage.textContent =
                error.message ||
                "Ocurrió un error al guardar la propiedad.";

            formMessage.className =
                "error-message";
        }

    }
);


/* =========================================================
   CERRAR SESIÓN
   ========================================================= */

const logoutButton =
    document.getElementById(
        "logout-button"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                window.location.href =
                    "/admin.html";

            } catch (error) {

                console.error(error);

                window.location.href =
                    "/admin.html";
            }

        }
    );
}


/* =========================================================
   INICIO
   ========================================================= */

loadProperties();
