const clienteLogueado =
sessionStorage.getItem("clienteLogueado")

if(!clienteLogueado){

    alert("Debe iniciar sesión");

    window.location.href = "index.html";
}

let currentPage = 1;
const productsPerPage = 20;

let currentList = [];
let carrito = [];
const products = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarProductosExcel();
});

function getProductImage(product){
    return `img/productos/${product.code}.jpg`;
}
function addToCart(id){

    const product = products.find(p => p.id == id);

    if(!product) return;

    const qtyInput =
    document.getElementById(`qty-${id}`);

    const qty =
    Number(qtyInput.value) || 1;

    const existing =
    carrito.find(p => p.id == id);

    if(existing){

        existing.qty += qty;

    } else {

        carrito.push({

            ...product,

            qty: qty

        });

    }

    renderCart();
}


function renderProducts(list = products) {

    const grid = document.getElementById('productsGrid');

    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;

    const pageProducts = list.slice(start, end);

    grid.innerHTML = pageProducts.map(product => `

<div class="product-card">

    <div class="product-image">

        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}

        <img src="${getProductImage(product)}"
        class="product-img"
        onerror="this.onerror=null; this.src='img/producto-default.jpg'">

    </div>

    <div class="product-info">

        <div class="product-category">
            ${(product.rubro || "").toUpperCase()}
        </div>

        <div style="font-size:12px;color:#777;">
            Marca: ${product.marca}
        </div>

         <div class="product-code">
        COD: ${product.code}
        </div>

        <h3 class="product-name">
            ${product.name}
        </h3>

        <p class="product-description">
            ${product.desc}
        </p>

        <div style="margin-top:10px; font-weight:bold; color:#0f172a;">
            $${product.precio || 0}
        </div>

        <div style="margin-top:12px; display:flex; gap:10px; align-items:center;">

            <input
            type="number"
            id="qty-${product.code}"
            value="1"
            min="1"
            style="
                width:70px;
                padding:8px;
                border-radius:8px;
                border:1px solid #ccc;
            ">

            <button
            class="btn btn-primary"
            onclick="agregarAlCarrito('${product.code}')">

                Agregar

            </button>

        </div>

    </div>

</div>

`).join('');

    renderPagination(list.length);
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

    // Páginas visibles
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

async function cargarProductosExcel() {

    const response = await fetch("productos.xlsx");

    const data = await response.arrayBuffer();

    const workbook = XLSX.read(data, {type:"array"});

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const json = XLSX.utils.sheet_to_json(sheet);

    products.length = 0;

    json.forEach((item)=>{

        products.push({

            id: item.id,
            name: item.nombre,
            rubro: item.rubro,
            marca: item.marca,
            code: String(item.codigo),
            desc: item.descripcion || "",
            badge: item.badge || null

        });

    });

    currentList = products;

    cargarMarcas();
    renderProducts(currentList);
}

function filterByBrand(){

    const marca =
        document.getElementById("brandFilter").value;

    if(marca === ""){

        currentList = products;

    }else{

        currentList = products.filter(
            p => p.marca === marca
        );

    }

    currentPage = 1;

    renderProducts(currentList);

}

function searchProducts() {

    const text = document.getElementById("searchInput")
        .value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    if(text === ""){

        currentList = products;

        currentPage = 1;

        renderProducts(currentList);

        return;
    }

    currentList = products.filter(p => {

        const nombre = (p.name || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        const marca = (p.marca || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        const codigo = String(p.code || "")
            .toLowerCase();

        const descripcion = (p.desc || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        return (
            nombre.includes(text) ||
            marca.includes(text) ||
            codigo.includes(text) ||
            descripcion.includes(text)
        );

    });

    currentPage = 1;

    renderProducts(currentList);
}

function agregarAlCarrito(code){

    const producto = products.find(p => p.code === code);

    if(!producto) return;

    const existente = carrito.find(p => p.code === code);

    if(existente){

        existente.cantidad++;

    } else {

        carrito.push({
            ...producto,
            cantidad: 1
        });

    }

    renderCarrito();
        actualizarContadorCarrito();
}

function renderCarrito(){

    const cart = document.getElementById("cartItems");

    if(carrito.length === 0){

        cart.innerHTML = "<p>El carrito está vacío</p>";

        return;
    }

    cart.innerHTML = carrito.map(item => `

        <div class="cart-item">

            <strong>${item.name}</strong>

            <br>

            Código: ${item.code}

            <br>

            Cantidad: ${item.cantidad}

            <br><br>

            <button onclick="sumarCantidad('${item.code}')">+</button>

            <button onclick="restarCantidad('${item.code}')">-</button>

            <button onclick="eliminarDelCarrito('${item.code}')">

            Eliminar

            </button>

        </div>

        <hr>

    `).join('');
}

function sumarCantidad(code){

    const item = carrito.find(p => p.code === code);

    if(item){

        item.cantidad++;

        renderCarrito();
        actualizarContadorCarrito();
    }
}

function restarCantidad(code){

    const item = carrito.find(p => p.code === code);

    if(item){

        item.cantidad--;

        if(item.cantidad <= 0){

            carrito = carrito.filter(p => p.code !== code);
        }

        renderCarrito();
        actualizarContadorCarrito();
    }
}

function eliminarDelCarrito(code){

    carrito = carrito.filter(p => p.code !== code);

    renderCarrito();
    actualizarContadorCarrito();
}

function actualizarContadorCarrito(){

    const total = carrito.reduce(
        (acc, item) => acc + item.cantidad,
        0
    );

    document.getElementById("cartCount")
    .innerText = total;

    const cart = document.getElementById("cartFloating");

    cart.classList.add("bump");

    setTimeout(() => {

        cart.classList.remove("bump");

    }, 200);

}

function renderCart(){

    const cart =
    document.getElementById("cartItems");

    if(carrito.length === 0){

        cart.innerHTML = `
        <p>Carrito vacío</p>
        `;

        return;
    }

    let total = 0;

    cart.innerHTML = carrito.map(item => {

        const subtotal =
        item.qty * item.price;

        total += subtotal;

        return `

        <div class="cart-item">

            <div>

                <strong>
                ${item.name}
                </strong>

                <div>
                Cantidad: ${item.qty}
                </div>

                <div>
                Precio:
                $${item.price.toLocaleString()}
                </div>

                <div>
                Subtotal:
                $${subtotal.toLocaleString()}
                </div>

            </div>

            <button
            onclick="removeFromCart(${item.id})">

            ❌

            </button>

        </div>

        `;

    }).join('') +

    `

    <div class="cart-total">

        TOTAL:
        $${total.toLocaleString()}

    </div>

    `;
}

function removeFromCart(id){

    carrito =
    carrito.filter(p => p.id != id);

    renderCart();
}

function cargarMarcas(){

    const select = document.getElementById("brandFilter");

    const marcas = [...new Set(
        products
            .map(p => p.marca)
            .filter(m => m)
    )].sort();

    select.innerHTML =
        '<option value="">Todas las marcas</option>';

    marcas.forEach(marca => {

        select.innerHTML += `
        <option value="${marca}">
            ${marca}
        </option>
        `;

    });

}