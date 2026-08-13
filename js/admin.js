import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// ========================================
// EMAIL DEL ADMINISTRADOR
// ========================================

const ADMIN_EMAIL = "belmontelila@gmail.com";


// ========================================
// ELEMENTOS
// ========================================

const loginAdmin =
    document.getElementById("loginAdmin");

const panelAdmin =
    document.getElementById("panelAdmin");

const adminLoginForm =
    document.getElementById("adminLoginForm");

const adminLoginError =
    document.getElementById("adminLoginError");

const clientesPendientes =
    document.getElementById("clientesPendientes");

const clientesActivos =
    document.getElementById("clientesActivos");

const clientesContainer =
    document.getElementById("clientesContainer");

const cargando =
    document.getElementById("cargando");

const cerrarSesion =
    document.getElementById("cerrarSesion");

const mensajeAdmin =
    document.getElementById("mensajeAdmin");


// ========================================
// LOGIN ADMINISTRADOR
// ========================================

adminLoginForm.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();

        adminLoginError.style.display = "none";


        const email =
            document
                .getElementById("adminEmail")
                .value
                .trim();


        const password =
            document
                .getElementById("adminPassword")
                .value;


        // Comprobar que sea el email autorizado

        if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {

            mostrarLoginError(
                "Este email no tiene permisos de administrador."
            );

            return;
        }


        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        } catch (error) {

            console.error(error);


            if (
                error.code ===
                "auth/invalid-credential"
            ) {

                mostrarLoginError(
                    "Email o contraseña incorrectos."
                );

            } else {

                mostrarLoginError(
                    "No se pudo iniciar sesión."
                );

            }

        }

    }
);


// ========================================
// COMPROBAR SESIÓN
// ========================================

onAuthStateChanged(
    auth,
    async (usuario) => {

        if (!usuario) {

            mostrarLogin();

            return;
        }


        // Comprobar que sea el administrador

        if (
            usuario.email.toLowerCase() !==
            ADMIN_EMAIL.toLowerCase()
        ) {

            await signOut(auth);

            mostrarLoginError(
                "Esta cuenta no tiene permisos de administrador."
            );

            mostrarLogin();

            return;
        }


        // Administrador autorizado

        mostrarPanel();

        cargarClientes();

    }
);


// ========================================
// MOSTRAR LOGIN
// ========================================

function mostrarLogin() {

    loginAdmin.style.display =
        "block";

    panelAdmin.style.display =
        "none";

}


// ========================================
// MOSTRAR PANEL
// ========================================

function mostrarPanel() {

    loginAdmin.style.display =
        "none";

    panelAdmin.style.display =
        "block";

}


// ========================================
// CARGAR CLIENTES
// ========================================

async function cargarClientes() {

    try {

        cargando.style.display =
            "block";

        clientesContainer.style.display =
            "none";


        const snapshot =
            await getDocs(
                collection(db, "clientes")
            );


        clientesPendientes.innerHTML =
            "";

        clientesActivos.innerHTML =
            "";


        let cantidadPendientes = 0;
        let cantidadActivos = 0;


        snapshot.forEach(
            (clienteDoc) => {

                const cliente =
                    clienteDoc.data();


                if (
                    cliente.estado ===
                    "pendiente"
                ) {

                    clientesPendientes.innerHTML +=
                        crearClientePendiente(
                            clienteDoc.id,
                            cliente
                        );

                    cantidadPendientes++;

                }


                if (
                    cliente.estado ===
                    "activo"
                ) {

                    clientesActivos.innerHTML +=
                        crearClienteActivo(
                            clienteDoc.id,
                            cliente
                        );

                    cantidadActivos++;

                }

            }
        );


        if (cantidadPendientes === 0) {

            clientesPendientes.innerHTML = `

                <div
                    style="
                        background:white;
                        padding:20px;
                        border-radius:10px;
                    "
                >

                    No hay clientes pendientes.

                </div>

            `;

        }


        if (cantidadActivos === 0) {

            clientesActivos.innerHTML = `

                <div
                    style="
                        background:white;
                        padding:20px;
                        border-radius:10px;
                    "
                >

                    No hay clientes activos.

                </div>

            `;

        }


        cargando.style.display =
            "none";

        clientesContainer.style.display =
            "block";


    } catch (error) {

        console.error(error);

        cargando.style.display =
            "none";

        mostrarMensaje(
            "No se pudieron cargar los clientes."
        );

    }

}


// ========================================
// CLIENTE PENDIENTE
// ========================================

function crearClientePendiente(
    uid,
    cliente
) {

    return `

        <div
            style="
                background:white;
                padding:25px;
                border-radius:15px;
                margin:20px 0;
                box-shadow:0 2px 10px rgba(0,0,0,0.08);
            "
        >

            <h3>
                ${cliente.razonSocial || "-"}
            </h3>

            <p>
                <strong>CUIT:</strong>
                ${cliente.cuit || "-"}
            </p>

            <p>
                <strong>Contacto:</strong>
                ${cliente.contacto || "-"}
            </p>

            <p>
                <strong>Email:</strong>
                ${cliente.email || "-"}
            </p>

            <p>
                <strong>Teléfono:</strong>
                ${cliente.telefono || "-"}
            </p>

            <p>
                <strong>Dirección:</strong>
                ${cliente.direccion || "-"}
            </p>

            <p>
                <strong>Localidad:</strong>
                ${cliente.localidad || "-"}
            </p>

            <p>
                <strong>Provincia:</strong>
                ${cliente.provincia || "-"}
            </p>


            <div
                style="
                    display:flex;
                    gap:10px;
                    margin-top:20px;
                    flex-wrap:wrap;
                "
            >

                <button
                    class="btn btn-primary"
                    onclick="aprobarCliente('${uid}')"
                >

                    🟢 Aprobar

                </button>


                <button
                    class="btn btn-outline"
                    onclick="rechazarCliente('${uid}')"
                >

                    🔴 Rechazar

                </button>

            </div>

        </div>

    `;

}


// ========================================
// CLIENTE ACTIVO
// ========================================

function crearClienteActivo(
    uid,
    cliente
) {

    return `

        <div
            style="
                background:white;
                padding:25px;
                border-radius:15px;
                margin:20px 0;
                box-shadow:0 2px 10px rgba(0,0,0,0.08);
            "
        >

            <h3>
                ${cliente.razonSocial || "-"}
            </h3>

            <p>
                <strong>CUIT:</strong>
                ${cliente.cuit || "-"}
            </p>

            <p>
                <strong>Contacto:</strong>
                ${cliente.contacto || "-"}
            </p>

            <p>
                <strong>Email:</strong>
                ${cliente.email || "-"}
            </p>

            <p>
                <strong>Teléfono:</strong>
                ${cliente.telefono || "-"}
            </p>


            <button
                class="btn btn-outline"
                onclick="desactivarCliente('${uid}')"
            >

                🔒 Desactivar

            </button>

        </div>

    `;

}


// ========================================
// APROBAR
// ========================================

window.aprobarCliente =
async function(uid) {

    const confirmar =
        confirm(
            "¿Querés aprobar este cliente?"
        );


    if (!confirmar) {
        return;
    }


    try {

        await updateDoc(
            doc(
                db,
                "clientes",
                uid
            ),
            {
                estado: "activo"
            }
        );


        await cargarClientes();


    } catch (error) {

        console.error(error);

        mostrarMensaje(
            "No se pudo aprobar el cliente."
        );

    }

};


// ========================================
// RECHAZAR
// ========================================

window.rechazarCliente =
async function(uid) {

    const confirmar =
        confirm(
            "¿Querés rechazar este cliente?"
        );


    if (!confirmar) {
        return;
    }


    try {

        await updateDoc(
            doc(
                db,
                "clientes",
                uid
            ),
            {
                estado: "rechazado"
            }
        );


        await cargarClientes();


    } catch (error) {

        console.error(error);

        mostrarMensaje(
            "No se pudo rechazar el cliente."
        );

    }

};


// ========================================
// DESACTIVAR
// ========================================

window.desactivarCliente =
async function(uid) {

    const confirmar =
        confirm(
            "¿Querés desactivar este cliente?"
        );


    if (!confirmar) {
        return;
    }


    try {

        await updateDoc(
            doc(
                db,
                "clientes",
                uid
            ),
            {
                estado: "pendiente"
            }
        );


        await cargarClientes();


    } catch (error) {

        console.error(error);

        mostrarMensaje(
            "No se pudo desactivar el cliente."
        );

    }

};


// ========================================
// CERRAR SESIÓN
// ========================================

cerrarSesion.addEventListener(
    "click",
    async () => {

        await signOut(auth);

        window.location.href =
            "index.html";

    }
);


// ========================================
// ERROR LOGIN
// ========================================

function mostrarLoginError(
    mensaje
) {

    adminLoginError.textContent =
        mensaje;

    adminLoginError.style.display =
        "block";

}


// ========================================
// MENSAJES ADMIN
// ========================================

function mostrarMensaje(
    mensaje
) {

    mensajeAdmin.textContent =
        mensaje;

    mensajeAdmin.style.display =
        "block";

}