import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


const formulario = document.getElementById("registroForm");


formulario.addEventListener("submit", async (e) => {

    e.preventDefault();


    // Obtener datos del formulario

    const razonSocial =
        document.getElementById("razonSocial").value.trim();

    const cuit =
        document.getElementById("cuit").value.trim();

    const contacto =
        document.getElementById("contacto").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const telefono =
        document.getElementById("telefono").value.trim();

    const direccion =
        document.getElementById("direccion").value.trim();

    const localidad =
        document.getElementById("localidad").value.trim();

    const provincia =
        document.getElementById("provincia").value.trim();

    const password =
        document.getElementById("password").value;

    const passwordConfirm =
        document.getElementById("passwordConfirm").value;


    const error =
        document.getElementById("registroError");

    const exito =
        document.getElementById("registroExito");


    error.style.display = "none";
    exito.style.display = "none";


    // Comprobar contraseñas

    if (password !== passwordConfirm) {

        error.textContent =
            "Las contraseñas no coinciden.";

        error.style.display = "block";

        return;
    }


    // Normalizar CUIT

    const cuitNormalizado =
        cuit.replace(/\D/g, "");


    try {

        // ========================================
        // 1. CREAR USUARIO EN FIREBASE AUTH
        // ========================================

        const credencial =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        // Obtener UID del usuario creado

        const uid =
            credencial.user.uid;


        console.log("Usuario creado:", uid);


        // ========================================
        // 2. GUARDAR DATOS DEL CLIENTE
        // ========================================

        await setDoc(
            doc(db, "clientes", uid),
            {

                uid: uid,

                razonSocial: razonSocial,

                cuit: cuit,

                contacto: contacto,

                email: email,

                telefono: telefono,

                direccion: direccion,

                localidad: localidad,

                provincia: provincia,

                estado: "pendiente",

                fechaRegistro: new Date()

            }
        );


        // ========================================
        // 3. GUARDAR RELACIÓN CUIT → USUARIO
        // ========================================

        await setDoc(
            doc(
                db,
                "clientesPorCuit",
                cuitNormalizado
            ),
            {

                uid: uid,

                email: email,

                estado: "pendiente"

            }
        );


        // ========================================
        // 4. MOSTRAR ÉXITO
        // ========================================

        exito.innerHTML = `

            <strong>
                ✓ Registro realizado correctamente.
            </strong>

            <br><br>

            Tu solicitud quedó pendiente de aprobación.

            <br>

            Te avisaremos cuando tu cuenta esté habilitada.

        `;

        exito.style.display = "block";


        formulario.reset();


    } catch (errorFirebase) {

        console.error(
            "ERROR DE FIREBASE:",
            errorFirebase
        );


        if (
            errorFirebase.code ===
            "auth/email-already-in-use"
        ) {

            error.textContent =
                "Este email ya está registrado.";

        }

        else if (
            errorFirebase.code ===
            "auth/invalid-email"
        ) {

            error.textContent =
                "El email ingresado no es válido.";

        }

        else if (
            errorFirebase.code ===
            "auth/weak-password"
        ) {

            error.textContent =
                "La contraseña debe tener al menos 6 caracteres.";

        }

        else {

            error.textContent =
                "No se pudo completar el registro. Revisá la consola.";

        }


        error.style.display = "block";

    }

});