const propertyList = document.getElementById("property-list");
const addPropertyButton =
    document.getElementById("add-property-button");

const propertyFormContainer =
    document.getElementById("property-form-container");

const cancelPropertyButton =
    document.getElementById("cancel-property-button");

const propertyForm =
    document.getElementById("property-form");

const propertyImagesInput =
    document.getElementById("property-images");

const uploadImagesButton =
    document.getElementById("upload-images-button");

const propertyImagesPreview =
    document.getElementById("property-images-preview");

const imageUploadMessage =
    document.getElementById("image-upload-message");

const formMessage =
    document.getElementById("form-message");

let editingPropertyId = null;

addPropertyButton.addEventListener("click", () => {

    propertyFormContainer.style.display = "block";

});

cancelPropertyButton.addEventListener("click", () => {

    propertyFormContainer.style.display = "none";

});

async function loadProperties() {

    try {

        const response = await fetch("/api/admin/properties");

        if (response.status === 401) {

            window.location.href = "/admin.html";
            return;
        }

        const properties = await response.json();

        propertyList.innerHTML = "";

        if (properties.length === 0) {

            propertyList.innerHTML = "<p>No hay propiedades registradas.</p>";
            return;
        }

        properties.forEach(property => {
            
        const article = document.createElement("article");
            
article.innerHTML = `
    <h3>${property.title}</h3>
    <p><strong>Precio:</strong> ${property.price}</p>
    <p><strong>Ubicación:</strong> ${property.location}</p>
    <p>
        <strong>Habitaciones:</strong> ${property.bedrooms} |
        <strong>Baños:</strong> ${property.bathrooms}
    </p>
${property.images && property.images.length > 0 ? `
    <div class="property-image-gallery">
        ${property.images.map((image, index) => `
            <div class="property-image-item">
                <img
                    src="${image}"
                    alt="${property.title} - Foto ${index + 1}"
                >
                <button
                    type="button"
                    class="delete-image-button"
                    data-image-url="${image}"
                >
                <button
    type="button"
    class="primary-image-button"
    data-image-url="${image}"
>
    ⭐ Marcar como principal
</button>

<button
    type="button"
    class="delete-image-button"
    data-image-url="${image}"
>
    Eliminar foto
</button>
                    Eliminar foto
                </button>
            </div>
        `).join("")}
    </div>
` : ""}
    <div class="property-actions">
        <button class="edit-property-button">Editar</button>
        <button class="delete-property-button">Eliminar</button>
    </div>
`;

const editButton =
    article.querySelector(".edit-property-button");

editButton.addEventListener("click", () => {

    editingPropertyId = property.id;

    propertyFormContainer.style.display = "block";

    document.getElementById("property-form-title").textContent =
        "Editar propiedad";

    document.getElementById("save-property-button").textContent =
        "Guardar cambios";

    document.getElementById("title").value =
        property.title;

    document.getElementById("price").value =
        property.price;

    document.getElementById("location").value =
        property.location;

    document.getElementById("bedrooms").value =
        property.bedrooms;

    document.getElementById("bathrooms").value =
        property.bathrooms;

    document.getElementById("water").checked =
        Boolean(property.water);

    document.getElementById("electricity").checked =
        Boolean(property.electricity);

    document.getElementById("deeds").checked =
        Boolean(property.deeds);

    document.getElementById("debt").checked =
        Boolean(property.debt);

    document.getElementById("description").value =
        property.description || "";

});
            const deletePropertyButton =
    article.querySelector(".delete-property-button");

deletePropertyButton.addEventListener("click", async () => {

    const confirmed = confirm(
        `¿Seguro que quieres eliminar "${property.title}"?\n\nTambién se eliminarán todas sus fotografías.`
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `/api/admin/properties/${property.id}`,
            {
                method: "DELETE"
            }
        );

        if (response.status === 401) {
            window.location.href = "/admin.html";
            return;
        }

        const result = await response.json();

        if (!response.ok) {
            alert(
                result.error ||
                "No se pudo eliminar la propiedad."
            );
            return;
        }

await loadProperties();

    } catch (error) {

        console.error(error);

        alert(
            "Error: " + error.message
        );
    }

});
            const primaryImageButtons =
    article.querySelectorAll(".primary-image-button");

primaryImageButtons.forEach(button => {

    button.addEventListener("click", async () => {

        const imageUrl =
            button.dataset.imageUrl;

        try {

            const response = await fetch(
                `/api/admin/properties/${property.id}/images/primary`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        image_url: imageUrl
                    })
                }
            );

            if (response.status === 401) {
                window.location.href = "/admin.html";
                return;
            }

            const result =
                await response.json();

            if (!response.ok) {
                alert(
                    result.error ||
                    "No se pudo marcar la fotografía como principal."
                );
                return;
            }

            await loadProperties();

        } catch (error) {

            console.error(error);

            alert(
                "Error de conexión al cambiar la fotografía principal."
            );
        }

    });

});

const deleteImageButtons =
    article.querySelectorAll(".delete-image-button");

deleteImageButtons.forEach(button => {

    button.addEventListener("click", async () => {

        const imageUrl =
            button.dataset.imageUrl;

        try {

            const response = await fetch(
                `/api/admin/properties/${property.id}/images`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        image_url: imageUrl
                    })
                }
            );

            if (response.status === 401) {
                window.location.href = "/admin.html";
                return;
            }

            const result = await response.json();

            if (!response.ok) {
                alert(
                    result.error ||
                    "No se pudo eliminar la fotografía."
                );
                return;
            }

            await loadProperties();

        } catch (error) {

            console.error(error);

            alert(
                "Error de conexión al eliminar la fotografía."
            );
        }

    });

});
            propertyList.appendChild(article);

        });

    } catch (error) {

        console.error("Error al cargar propiedades:", error);

        propertyList.innerHTML =
            "<p>No se pudieron cargar las propiedades.</p>";
    }
}

loadProperties();
propertyForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    formMessage.textContent =
        "Guardando propiedad...";

    const property = {

        title: document.getElementById("title").value,
        price: document.getElementById("price").value,
        location: document.getElementById("location").value,

        bedrooms: Number(
            document.getElementById("bedrooms").value
        ),

        bathrooms: Number(
            document.getElementById("bathrooms").value
        ),

        water: document.getElementById("water").checked,
        electricity: document.getElementById("electricity").checked,
        deeds: document.getElementById("deeds").checked,
        debt: document.getElementById("debt").checked,

        description:
            document.getElementById("description").value
    };

    const files = propertyImagesInput.files;

    try {

        let response;

        /*
         * CREAR PROPIEDAD
         */
        if (editingPropertyId === null) {

            response = await fetch(
                "/api/admin/properties",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(property)
                }
            );

        /*
         * EDITAR PROPIEDAD
         */
        } else {

            response = await fetch(
                `/api/admin/properties/${editingPropertyId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(property)
                }
            );

        }

        if (response.status === 401) {

            window.location.href = "/admin.html";
            return;
        }

        if (!response.ok) {

            const result = await response.json();

            formMessage.textContent =
                result.error ||
                "No se pudo guardar la propiedad.";

            return;
        }

        /*
         * OBTENER EL ID DE LA PROPIEDAD
         */
        const result = await response.json();

        const propertyId =
            editingPropertyId !== null
                ? editingPropertyId
                : result.id;

        /*
         * SUBIR FOTOGRAFÍAS
         */
        if (files.length > 0) {

            imageUploadMessage.textContent =
                "Subiendo fotografías...";

            for (const file of files) {

                const imageResponse = await fetch(
                    `/api/admin/properties/${propertyId}/images`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": file.type
                        },
                        body: file
                    }
                );

                const imageResult =
                    await imageResponse.json();

                if (!imageResponse.ok) {

                    formMessage.textContent =
                        "La propiedad se guardó, pero hubo un problema al subir una fotografía.";

                    imageUploadMessage.textContent =
                        imageResult.error ||
                        "No se pudo subir una fotografía.";

                    await loadProperties();

                    return;
                }
            }

            imageUploadMessage.textContent =
                "Fotografías subidas correctamente.";

        } else {

            imageUploadMessage.textContent = "";
        }

        /*
         * TODO TERMINADO
         */
        formMessage.textContent =
            "Propiedad y fotografías guardadas correctamente.";

        editingPropertyId = null;

        propertyForm.reset();

        propertyImagesInput.value = "";

        propertyImagesPreview.innerHTML = "";

        document.getElementById("bedrooms").value = 0;
        document.getElementById("bathrooms").value = 0;

        await loadProperties();

    } catch (error) {

        console.error(error);

        formMessage.textContent =
            "Error al guardar la propiedad.";
    }

});
uploadImagesButton.addEventListener("click", async () => {
    if (editingPropertyId === null) {
        imageUploadMessage.textContent =
            "Primero guarda la propiedad y después podrás subir fotografías.";
        return;
    }

    const files = propertyImagesInput.files;

    propertyImagesPreview.innerHTML = "";

for (const file of files) {

    const reader = new FileReader();

    reader.onload = () => {

        const previewItem = document.createElement("div");

        previewItem.className = "image-preview-item";

        previewItem.innerHTML = `
            <img src="${reader.result}" alt="Vista previa">
            <p>${file.name}</p>
        `;

        propertyImagesPreview.appendChild(previewItem);
    };

    reader.readAsDataURL(file);
}

    if (files.length === 0) {
        imageUploadMessage.textContent =
            "Selecciona al menos una fotografía.";
        return;
    }

    imageUploadMessage.textContent = "Subiendo fotografías...";

    try {
        for (const file of files) {
            const response = await fetch(
                `/api/admin/properties/${editingPropertyId}/images`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": file.type
                    },
                    body: file
                }
            );

            const result = await response.json();

            if (!response.ok) {
                imageUploadMessage.textContent =
                    "Error: " + (result.error || "No se pudo subir la fotografía.");
                return;
            }
        }

        imageUploadMessage.textContent =
            "Fotografías subidas correctamente.";

        propertyImagesInput.value = "";

        await loadProperties();

    } catch (error) {
        console.error(error);
        imageUploadMessage.textContent =
            "Error de conexión al subir las fotografías.";
    }
});
