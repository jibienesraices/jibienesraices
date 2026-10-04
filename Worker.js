```javascript
async function createSessionToken(password) {
    const timestamp = Date.now().toString();

    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(timestamp)
    );

    const signatureArray = Array.from(new Uint8Array(signature));

    const signatureHex = signatureArray
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");

    return `${timestamp}.${signatureHex}`;
}


async function verifySessionToken(token, password) {
    if (!token || !password) return false;

    const parts = token.split(".");

    if (parts.length !== 2) return false;

    const [timestamp, signatureHex] = parts;

    if (!/^\d+$/.test(timestamp)) return false;
    if (!/^[a-fA-F0-9]+$/.test(signatureHex)) return false;
    if (signatureHex.length !== 64) return false;

    const tokenAge = Date.now() - Number(timestamp);

    if (tokenAge > 60 * 60 * 1000 || tokenAge < 0) {
        return false;
    }

    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
    );

    const signatureBytes = new Uint8Array(
        signatureHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    );

    return await crypto.subtle.verify(
        "HMAC",
        key,
        signatureBytes,
        encoder.encode(timestamp)
    );
}


function jsonResponse(data, status = 200, extraHeaders = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            ...extraHeaders
        }
    });
}


function getSessionToken(request) {
    const cookies = request.headers.get("Cookie") || "";

    const sessionCookie = cookies
        .split(";")
        .find(cookie =>
            cookie.trim().startsWith("admin_session=")
        );

    if (!sessionCookie) return null;

    return sessionCookie
        .trim()
        .substring("admin_session=".length);
}


function getPropertyId(url) {
    const parts = url.pathname.split("/");
    return parts[4];
}


export default {

    async fetch(request, env) {

        const url = new URL(request.url);

        /*
        ============================================================
        CONFIGURACIÓN
        ============================================================
        env.DB     -> D1
        env.IMAGES -> R2
        env.ASSETS -> archivos estáticos
        env.ADMIN_PASSWORD -> contraseña del administrador
        ============================================================
        */

        const sessionToken = getSessionToken(request);

        const isAuthenticated = await verifySessionToken(
            sessionToken,
            env.ADMIN_PASSWORD
        );

        console.log("JI Bienes Raíces:", {
            method: request.method,
            path: url.pathname,
            authenticated: isAuthenticated
        });


        /*
        ============================================================
        PANEL ADMINISTRATIVO
        ============================================================
        */

        if (
            url.pathname === "/admin-panel.html" &&
            !isAuthenticated
        ) {
            return Response.redirect(
                `${url.origin}/admin.html`,
                302
            );
        }


        /*
        ============================================================
        LOGIN ADMINISTRADOR
        ============================================================
        */

        if (
            url.pathname === "/api/admin/login" &&
            request.method === "POST"
        ) {

            try {

                const body = await request.json();

                if (
                    !body ||
                    typeof body.password !== "string"
                ) {
                    return jsonResponse(
                        {
                            success: false,
                            message: "Contraseña requerida"
                        },
                        400
                    );
                }


                if (body.password === env.ADMIN_PASSWORD) {

                    const token =
                        await createSessionToken(
                            env.ADMIN_PASSWORD
                        );

                    return jsonResponse(
                        {
                            success: true
                        },
                        200,
                        {
                            "Set-Cookie":
                                `admin_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`
                        }
                    );
                }


                return jsonResponse(
                    {
                        success: false,
                        message: "Contraseña incorrecta"
                    },
                    401
                );

            } catch (error) {

                console.error(
                    "Error en login:",
                    error
                );

                return jsonResponse(
                    {
                        success: false,
                        message: "Solicitud inválida"
                    },
                    400
                );
            }
        }


        /*
        ============================================================
        API ADMIN - OBTENER PROPIEDADES
        ============================================================
        */

        if (
            url.pathname === "/api/admin/properties" &&
            request.method === "GET"
        ) {

            if (!isAuthenticated) {
                return jsonResponse(
                    {
                        error: "No autorizado"
                    },
                    401
                );
            }


            const { results: properties } =
                await env.DB
                    .prepare(
                        "SELECT * FROM properties ORDER BY id DESC"
                    )
                    .all();


            const { results: images } =
                await env.DB
                    .prepare(
                        "SELECT * FROM property_images ORDER BY property_id, sort_order"
                    )
                    .all();


            const formattedProperties =
                properties.map(property => {

                    const propertyImages =
                        images
                            .filter(
                                image =>
                                    image.property_id === property.id
                            )
                            .map(
                                image =>
                                    image.image_url
                            );


                    return {
                        id: property.id,
                        title: property.title,
                        price: property.price,
                        location: property.location,
                        bedrooms: property.bedrooms,
                        bathrooms: property.bathrooms,
                        water: Boolean(property.water),
                        electricity: Boolean(property.electricity),
                        deeds: Boolean(property.deeds),
                        debt: Boolean(property.debt),
                        description: property.description,
                        created_at: property.created_at,
                        images: propertyImages
                    };

                });


            return jsonResponse(
                formattedProperties
            );
        }


        /*
        ============================================================
        API ADMIN - CREAR PROPIEDAD
        ============================================================
        */

        if (
            url.pathname === "/api/admin/properties" &&
            request.method === "POST"
        ) {

            if (!isAuthenticated) {
                return jsonResponse(
                    {
                        error: "No autorizado"
                    },
                    401
                );
            }


            try {

                const body = await request.json();


                const result =
                    await env.DB
                        .prepare(`
                            INSERT INTO properties (
                                title,
                                price,
                                location,
                                bedrooms,
                                bathrooms,
                                water,
                                electricity,
                                deeds,
                                debt,
                                description
                            )
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `)
                        .bind(
                            body.title,
                            body.price,
                            body.location,
                            body.bedrooms,
                            body.bathrooms,
                            body.water ? 1 : 0,
                            body.electricity ? 1 : 0,
                            body.deeds ? 1 : 0,
                            body.debt ? 1 : 0,
                            body.description
                        )
                        .run();


                return jsonResponse(
                    {
                        success: true,
                        id: result.meta.last_row_id
                    }
                );

            } catch (error) {

                console.error(
                    "Error creando propiedad:",
                    error
                );

                return jsonResponse(
                    {
                        error: "No se pudo crear la propiedad"
                    },
                    500
                );
            }
        }


        /*
        ============================================================
        API ADMIN - MARCAR IMAGEN COMO PRINCIPAL
        ============================================================
        */

        if (
            url.pathname.startsWith(
                "/api/admin/properties/"
            ) &&
            url.pathname.endsWith("/images/primary") &&
            request.method === "PUT"
        ) {

            if (!isAuthenticated) {
                return jsonResponse(
                    {
                        error: "No autorizado"
                    },
                    401
                );
            }


            const propertyId =
                getPropertyId(url);


            const body =
                await request.json();


            const imageUrl =
                body.image_url;


            if (!imageUrl) {
                return jsonResponse(
                    {
                        error: "Falta la imagen"
                    },
                    400
                );
            }


            const image =
                await env.DB
                    .prepare(`
                        SELECT id
                        FROM property_images
                        WHERE property_id = ?
                        AND image_url = ?
                    `)
                    .bind(
                        propertyId,
                        imageUrl
                    )
                    .first();


            if (!image) {
                return jsonResponse(
                    {
                        error: "La imagen no existe"
                    },
                    404
                );
            }


            const { results: images } =
                await env.DB
                    .prepare(`
                        SELECT id
                        FROM property_images
                        WHERE property_id = ?
                        ORDER BY sort_order, id
                    `)
                    .bind(propertyId)
                    .all();


            const orderedImages = [
                image,
                ...images.filter(
                    img =>
                        img.id !== image.id
                )
            ];


            for (
                let i = 0;
                i < orderedImages.length;
                i++
            ) {

                await env.DB
                    .prepare(`
                        UPDATE property_images
                        SET sort_order = ?
                        WHERE id = ?
                    `)
                    .bind(
                        i,
                        orderedImages[i].id
                    )
                    .run();
            }


            return jsonResponse({
                success: true
            });
        }


        /*
        ============================================================
        API ADMIN - ELIMINAR IMAGEN
        ============================================================
        */

        if (
            url.pathname.startsWith(
                "/api/admin/properties/"
            ) &&
            url.pathname.endsWith("/images") &&
            request.method === "DELETE"
        ) {

            if (!isAuthenticated) {
                return jsonResponse(
                    {
                        error: "No autorizado"
                    },
                    401
                );
            }


            const propertyId =
                getPropertyId(url);


            const body =
                await request.json();


            const imageUrl =
                body.image_url;


            if (!imageUrl) {
                return jsonResponse(
                    {
                        error: "Falta la imagen"
                    },
                    400
                );
            }


            const image =
                await env.DB
                    .prepare(`
                        SELECT id, image_url
                        FROM property_images
                        WHERE property_id = ?
                        AND image_url = ?
                    `)
                    .bind(
                        propertyId,
                        imageUrl
                    )
                    .first();


            if (!image) {
                return jsonResponse(
                    {
                        error: "La imagen no existe"
                    },
                    404
                );
            }


            const imageKey =
                image.image_url.replace(
                    "/api/images/",
                    ""
                );


            await env.IMAGES.delete(
                imageKey
            );


            await env.DB
                .prepare(`
                    DELETE FROM property_images
                    WHERE id = ?
                `)
                .bind(image.id)
                .run();


            return jsonResponse({
                success: true
            });
        }


        /*
        ============================================================
        API ADMIN - ACTUALIZAR PROPIEDAD
        ============================================================
        */

        if (
            url.pathname.startsWith(
                "/api/admin/properties/"
            ) &&
            request.method === "PUT"
        ) {

            if (!isAuthenticated) {
                return jsonResponse(
                    {
                        error: "No autorizado"
                    },
                    401
                );
            }


            const id =
                url.pathname.split("/").pop();


            try {

                const body =
                    await request.json();


                const result =
                    await env.DB
                        .prepare(`
                            UPDATE properties SET
                                title = ?,
                                price = ?,
                                location = ?,
                                bedrooms = ?,
                                bathrooms = ?,
                                water = ?,
                                electricity = ?,
                                deeds = ?,
                                debt = ?,
                                description = ?
                            WHERE id = ?
                        `)
                        .bind(
                            body.title,
                            body.price,
                            body.location,
                            body.bedrooms,
                            body.bathrooms,
                            body.water ? 1 : 0,
                            body.electricity ? 1 : 0,
                            body.deeds ? 1 : 0,
                            body.debt ? 1 : 0,
                            body.description,
                            id
                        )
                        .run();


                return jsonResponse({
                    success: true,
                    changes: result.meta.changes
                });

            } catch (error) {

                console.error(
                    "Error actualizando propiedad:",
                    error
                );

                return jsonResponse(
                    {
                        error: "No se pudo actualizar la propiedad"
                    },
                    500
                );
            }
        }


        /*
        ============================================================
        API ADMIN - ELIMINAR PROPIEDAD
        ============================================================
        */

        if (
            url.pathname.startsWith(
                "/api/admin/properties/"
            ) &&
            request.method === "DELETE" &&
            !url.pathname.endsWith("/images")
        ) {

            if (!isAuthenticated) {
                return jsonResponse(
                    {
                        error: "No autorizado"
                    },
                    401
                );
            }


            const propertyId =
                getPropertyId(url);


            const property =
                await env.DB
                    .prepare(`
                        SELECT id
                        FROM properties
                        WHERE id = ?
                    `)
                    .bind(propertyId)
                    .first();


            if (!property) {
                return jsonResponse(
                    {
                        error: "La propiedad no existe"
                    },
                    404
                );
            }


            const { results: images } =
                await env.DB
                    .prepare(`
                        SELECT image_url
                        FROM property_images
                        WHERE property_id = ?
                    `)
                    .bind(propertyId)
                    .all();


            for (const image of images) {

                const imageKey =
                    image.image_url.replace(
                        "/api/images/",
                        ""
                    );

                await env.IMAGES.delete(
                    imageKey
                );
            }


            await env.DB
                .prepare(`
                    DELETE FROM property_images
                    WHERE property_id = ?
                `)
                .bind(propertyId)
                .run();


            await env.DB
                .prepare(`
                    DELETE FROM properties
                    WHERE id = ?
                `)
                .bind(propertyId)
                .run();


            return jsonResponse({
                success: true
            });
        }


        /*
        ============================================================
        API ADMIN - SUBIR IMAGEN
        ============================================================
        */

        if (
            url.pathname.startsWith(
                "/api/admin/properties/"
            ) &&
            url.pathname.endsWith("/images") &&
            request.method === "POST"
        ) {

            if (!isAuthenticated) {
                return jsonResponse(
                    {
                        error: "No autorizado"
                    },
                    401
                );
            }


            const propertyId =
                getPropertyId(url);


            const property =
                await env.DB
                    .prepare(`
                        SELECT id
                        FROM properties
                        WHERE id = ?
                    `)
                    .bind(propertyId)
                    .first();


            if (!property) {
                return jsonResponse(
                    {
                        error: "La propiedad no existe"
                    },
                    404
                );
            }


            const contentType =
                request.headers.get(
                    "Content-Type"
                ) || "";


            if (
                !contentType.startsWith(
                    "image/"
                )
            ) {
                return jsonResponse(
                    {
                        error: "El archivo debe ser una imagen"
                    },
                    400
                );
            }


            const imageId =
                crypto.randomUUID();


            const extension =
                contentType.split("/")[1] ||
                "jpg";


            const imageKey =
                `properties/${propertyId}/${imageId}.${extension}`;


            const file =
                await request.arrayBuffer();


            await env.IMAGES.put(
                imageKey,
                file,
                {
                    httpMetadata: {
                        contentType
                    }
                }
            );


            const currentImages =
                await env.DB
                    .prepare(`
                        SELECT COUNT(*) AS total
                        FROM property_images
                        WHERE property_id = ?
                    `)
                    .bind(propertyId)
                    .first();


            const sortOrder =
                Number(
                    currentImages?.total || 0
                );


            const imageUrl =
                `/api/images/${imageKey}`;


            await env.DB
                .prepare(`
                    INSERT INTO property_images (
                        property_id,
                        image_url,
                        sort_order
                    )
                    VALUES (?, ?, ?)
                `)
                .bind(
                    propertyId,
                    imageUrl,
                    sortOrder
                )
                .run();


            return jsonResponse({
                success: true,
                image_url: imageUrl
            });
        }


        /*
        ============================================================
        API PÚBLICA - OBTENER IMAGEN DESDE R2
        ============================================================
        */

        if (
            url.pathname.startsWith(
                "/api/images/"
            ) &&
            request.method === "GET"
        ) {

            const imageKey =
                url.pathname.substring(
                    "/api/images/".length
                );


            if (!imageKey) {
                return new Response(
                    "Imagen no encontrada",
                    {
                        status: 404
                    }
                );
            }


            const image =
                await env.IMAGES.get(
                    imageKey
                );


            if (!image) {
                return new Response(
                    "Imagen no encontrada",
                    {
                        status: 404
                    }
                );
            }


            const headers = new Headers();

            image.writeHttpMetadata(
                headers
            );


            headers.set(
                "Cache-Control",
                "public, max-age=31536000, immutable"
            );


            headers.set(
                "ETag",
                image.httpEtag
            );


            return new Response(
                image.body,
                {
                    headers
                }
            );
        }


        /*
        ============================================================
        API PÚBLICA - PROPIEDADES
        ============================================================
        */

        if (
            url.pathname ===
            "/api/properties" &&
            request.method === "GET"
        ) {

            const {
                results: properties
            } =
                await env.DB
                    .prepare(
                        "SELECT * FROM properties ORDER BY id DESC"
                    )
                    .all();


            const {
                results: images
            } =
                await env.DB
                    .prepare(
                        "SELECT * FROM property_images ORDER BY property_id, sort_order"
                    )
                    .all();


            const formattedProperties =
                properties.map(property => {

                    const propertyImages =
                        images
                            .filter(
                                img =>
                                    img.property_id ===
                                    property.id
                            )
                            .map(
                                img =>
                                    img.image_url
                            );


                    return {

                        id: property.id,

                        title: property.title,

                        price: property.price,

                        location:
                            property.location,

                        bedrooms:
                            property.bedrooms,

                        bathrooms:
                            property.bathrooms,

                        description:
                            property.description,

                        images:
                            propertyImages,

                        services: {

                            water:
                                Boolean(
                                    property.water
                                ),

                            electricity:
                                Boolean(
                                    property.electricity
                                ),

                            deeds:
                                Boolean(
                                    property.deeds
                                ),

                            debt:
                                Boolean(
                                    property.debt
                                )
                        }
                    };
                });


            return jsonResponse(
                formattedProperties
            );
        }


        /*
        ============================================================
        ARCHIVOS DEL SITIO
        ============================================================
        */

        return env.ASSETS.fetch(
            request
        );
    }
};
```
