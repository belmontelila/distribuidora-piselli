import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const formulario = document.getElementById("loginClienteForm");

const errorDiv = document.getElementById("loginError");

const exitoDiv = document.getElementById("loginExito");


formulario.addEventListener("submit", async (e) => {

    e.preventDefault();

    errorDiv.style.display = "none";
    exitoDiv.style.display = "none";


    const cuit =
        document.getElementById("cuit").value.trim();

    const password =
        document.getElementById("password").value;


    if (!cuit || !password) {

        mostrarError("Completá el CUIT y la contraseña.");

        return;
    }


    try {

        /*
        Buscamos el cliente por CUIT.
        */

        const cuitNormalizado =
    cuit.replace(/\D/g, "");


const clienteRef =
    doc(
        db,
        "clientesPorCuit",
        cuitNormalizado
    );


const clienteSnap =
    await getDoc(clienteRef);


if (!clienteSnap.exists()) {

    mostrarError(
        "El CUIT ingresado no está registrado."
    );

    return;
}


const cliente =
    clienteSnap.data();
        /*
        Comprobamos si la cuenta está aprobada.
        */
       const clienteCompletoRef =
    doc(
        db,
        "clientes",
        cliente.uid
    );


const clienteCompletoSnap =
    await getDoc(clienteCompletoRef);


if (!clienteCompletoSnap.exists()) {

    mostrarError(
        "No se encontraron los datos del cliente."
    );

    return;
}


const clienteCompleto =
    clienteCompletoSnap.data();


if (clienteCompleto.estado !== "activo") {

    mostrarError(
        "Tu cuenta todavía está pendiente de aprobación."
    );

    return;
}

        /*
        Iniciamos sesión con el email
        asociado al cliente.
        */

        await signInWithEmailAndPassword(
            auth,
            cliente.email,
            password
        );


        /*
        Guardamos información básica
        de la sesión.
        */

        sessionStorage.setItem(
            "clienteLogueado",
            "true"
        );

        sessionStorage.setItem(
            "clienteCUIT",
            clienteCompleto.cuit
        );

        sessionStorage.setItem(
            "clienteRazonSocial",
            clienteCompleto.razonSocial
        );


        exitoDiv.textContent =
            "✓ Inicio de sesión exitoso";

        exitoDiv.style.display = "block";


        /*
        Enviamos al catálogo.
        */

        setTimeout(() => {

            window.location.href =
                "index.html";

        }, 1000);


    } catch (error) {

        console.error(error);


        if (
            error.code ===
            "auth/invalid-credential"
        ) {

            mostrarError(
                "CUIT o contraseña incorrectos."
            );

        } else {

            mostrarError(
                "No se pudo iniciar sesión. Intentá nuevamente."
            );

        }

    }

});


function mostrarError(mensaje) {

    errorDiv.textContent = mensaje;

    errorDiv.style.display = "block";

}