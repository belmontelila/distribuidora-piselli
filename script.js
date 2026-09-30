let currentList = [];
let carrito = [];
let clienteLogueado = sessionStorage.getItem("clienteLogueado") === "true";

let currentPage = 1;
const productsPerPage = 20;

const products = [];

document.addEventListener('DOMContentLoaded', () => {

    cargarProductosExcel();

    if (clienteLogueado) {

        const pedidosLink = document.getElementById("pedidosLink");

        if (pedidosLink) {
            pedidosLink.style.display = "inline-block";
        }

        const listasLink = document.getElementById("listasLink");

        if (listasLink) {
            listasLink.style.display = "inline-block";
        }
    }

});
      function renderProducts(list = products) {

    const grid = document.getElementById('productsGrid');

    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;

    const pageProducts = list.slice(start, end);

    grid.innerHTML = pageProducts.map(product => `

    <div class="product-card" onclick="showLoginAlert()">

        <div class="product-image">

            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}

            <img src="${getProductImage(product)}"
            class="product-img"
            onerror="this.onerror=null; this.src='img/producto-default.jpg'">

        </div>

        <div class="product-info">

            <div class="product-category">${(product.rubro || "").toUpperCase()}</div>

            <div style="font-size:12px;color:#777;">
            Marca: ${product.marca}
            </div>

            <h3 class="product-name">${product.name}</h3>

            

            <div class="product-footer">

                <span class="product-code">
                COD: ${product.code}
                </span>

            </div>

        </div>

    </div>

    `).join('');

    renderPagination(list.length);

}


        // Filter Products
     function filterProducts(category) {

    currentList = products.filter(product => {

        const rubro = (product.rubro || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        return rubro === category;
    });

    currentPage = 1;

    renderProducts(currentList);

    document.getElementById("catalogo")
        .scrollIntoView({ behavior: "smooth" });
}
           
function filtrarRubro(rubro) {

    const rubroBuscado = String(rubro || "")
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    if (rubroBuscado === "") {

        currentList = products;

    } else {

        currentList = products.filter(product => {

            const rubroProducto = String(product.rubro || "")
                .toLowerCase()
                .trim()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");

            return rubroProducto === rubroBuscado;

        });

    }

    currentPage = 1;

    renderProducts(currentList);

    const catalogo = document.getElementById("catalogo");

    if (catalogo) {
        catalogo.scrollIntoView({
            behavior: "smooth"
        });
    }
}
        // Login Modal
        function openLoginModal() {
            document.getElementById('loginModal').classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeLoginModal(event) {
            if (!event || event.target.id === 'loginModal' || event.target.classList.contains('close-modal')) {
                document.getElementById('loginModal').classList.remove('active');
                document.body.style.overflow = '';
                // Reset form
                document.getElementById('loginForm').reset();
                document.getElementById('loginError').style.display = 'none';
                document.getElementById('successMessage').classList.remove('show');
            }
        }

        // Handle Login
        function handleLogin(e) {

    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const errorDiv = document.getElementById('loginError');
    const successDiv = document.getElementById('successMessage');

    if (username === 'piselli' && password === 'piselli') {

        sessionStorage.setItem("clienteLogueado", "true");

        clienteLogueado = true;

        document.getElementById("pedidosLink").style.display = "inline-block";
        document.getElementById("listasLink").style.display = "inline-block";

        renderProducts();

        errorDiv.style.display = 'none';
        successDiv.classList.add('show');

        setTimeout(() => {

            alert('Bienvenido al sistema de clientes');

            closeLoginModal();

        }, 1000);

    } else {

        errorDiv.style.display = 'block';
        successDiv.classList.remove('show');

    }

}
        // Show Login Alert
        function showLoginAlert() {
            const banner = document.getElementById('alertBanner');
            banner.classList.add('show');
            setTimeout(() => {
                banner.classList.remove('show');
            }, 3000);
        }

        // Scroll to Catalog
        function scrollToCatalog() {
            document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' });
        }

        // Smooth scroll for nav links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Header scroll effect
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.header');
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
            } else {
                header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }
            
            lastScroll = currentScroll;
        });


async function cargarProductosExcel() {

const response = await fetch("productos.xlsx");

const data = await response.arrayBuffer();

const workbook = XLSX.read(data, {type:"array"});

const sheet = workbook.Sheets[workbook.SheetNames[0]];

const json = XLSX.utils.sheet_to_json(sheet);

products.length = 0;

json.forEach((item)=>{

products.push({

id:item.id,
name:item.nombre,
rubro:item.rubro,
marca:item.marca,
code:String(item.codigo),
badge:item.badge || null

});

});

currentList = products;
renderProducts(currentList);
}

function renderPagination(totalProducts){

    const totalPages = Math.ceil(totalProducts / productsPerPage);

    const pagination = document.getElementById("pagination");

    pagination.innerHTML = "";

    // Botón anterior
    if(currentPage > 1){

        pagination.innerHTML += `
        <button onclick="changePage(${currentPage - 1})">
        ⬅
        </button>
        `;

    }

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    // Primera página
    if(startPage > 1){

        pagination.innerHTML += `
        <button onclick="changePage(1)">1</button>
        `;

        if(startPage > 2){
            pagination.innerHTML += `<span>...</span>`;
        }
    }

    // Páginas centrales
    for(let i = startPage; i <= endPage; i++){

        pagination.innerHTML += `
        <button
        onclick="changePage(${i})"
        class="${i === currentPage ? 'active-page' : ''}">
        ${i}
        </button>
        `;

    }

    // Última página
    if(endPage < totalPages){

        if(endPage < totalPages - 1){
            pagination.innerHTML += `<span>...</span>`;
        }

        pagination.innerHTML += `
        <button onclick="changePage(${totalPages})">
        ${totalPages}
        </button>
        `;
    }

    // Botón siguiente
    if(currentPage < totalPages){

        pagination.innerHTML += `
        <button onclick="changePage(${currentPage + 1})">
        ➡
        </button>
        `;
    }
}

function changePage(page){

    currentPage = page;

    renderProducts(currentList);

}


function searchProducts() {

    const input = document.getElementById("searchInput");

    if (!input) return;

    const text = input.value
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    // Si el buscador está vacío, mostrar todos
    if (text === "") {

        currentList = products;
        currentPage = 1;

        renderProducts(currentList);

        return;
    }

    // Buscar por nombre, marca, código o rubro
    currentList = products.filter(product => {

        const nombre = String(product.name || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        const marca = String(product.marca || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        const codigo = String(product.code || "")
            .toLowerCase();

        const rubro = String(product.rubro || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        return (
            nombre.includes(text) ||
            marca.includes(text) ||
            codigo.includes(text) ||
            rubro.includes(text)
        );

    });

    currentPage = 1;

    renderProducts(currentList);
}

function getProductImage(product){ return `img/productos/${product.code}.jpg`; }

function toggleMenu(){

    document
        .querySelector(".nav")
        .classList.toggle("active");

}

window.addEventListener("DOMContentLoaded", () => {

    if(sessionStorage.getItem("clienteLogueado") === "true"){

        document.getElementById("pedidosLink").style.display = "inline-block";

        const listasLink = document.getElementById("listasLink");

        if(listasLink){
            listasLink.style.display = "inline-block";
        }

    }

});

function cerrarSesion(){

    sessionStorage.removeItem("clienteLogueado");

    window.location.href = "index.html";

}

