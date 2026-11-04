// Lógica de la tienda: productos, carrito, modo oscuro y formulario.

// 1. Selección de elementos (querySelector)
// ==========================
const contenedorProductos = document.querySelector("#contenedor-productos");
const listaCarrito = document.querySelector("#lista-carrito");
const totalCarrito = document.querySelector("#total-carrito");
const contadorCarrito = document.querySelector("#contador-carrito");
const btnVaciar = document.querySelector("#btn-vaciar");
const btnFinalizar = document.querySelector("#btn-finalizar");
const btnModo = document.querySelector("#btn-modo");
const formulario = document.querySelector("#formulario");
const mensajeExito = document.querySelector("#mensaje-exito");

// ==========================
// 2. Carrito (se carga desde localStorage)
// ==========================
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// ==========================
// 3. Mostrar productos (map + template strings)
// ==========================
function mostrarProductos() {
  const cards = productos.map((producto) => {
    return `
      <div class="col-12 col-sm-6 col-lg-3">
        <div class="card h-100 shadow-sm">
          <img src="${producto.imagen}" class="card-img-top card-imagen" alt="${producto.nombre}">
          <div class="card-body d-flex flex-column">
            <span class="badge text-bg-secondary align-self-start mb-2">${producto.categoria}</span>
            <h5 class="card-title">${producto.nombre}</h5>
            <p class="card-text text-body-secondary">${producto.descripcion}</p>
            <p class="fw-bold fs-5 mt-auto">$${producto.precio.toLocaleString("es-AR")}</p>
            <button class="btn btn-primary btn-agregar" data-id="${producto.id}">
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    `;
  });

  // join("") para unir todo el array en un solo texto
  contenedorProductos.innerHTML = cards.join("");
}

// ==========================
// 4. Funciones del carrito
// ==========================
function agregarAlCarrito(id) {
  // Busco si el producto ya está en el carrito
  const itemExistente = carrito.find((item) => item.id === id);

  if (itemExistente) {
    // Si ya está, solo le sumo 1 (no se duplica)
    itemExistente.cantidad++;
  } else {
    // Si no está, lo busco en el array de productos y lo agrego con cantidad 1
    const producto = productos.find((p) => p.id === id);
    carrito.push({ ...producto, cantidad: 1 });
  }

  actualizarCarrito();
}

function sumarCantidad(id) {
  const item = carrito.find((i) => i.id === id);
  item.cantidad++;
  actualizarCarrito();
}

function restarCantidad(id) {
  const item = carrito.find((i) => i.id === id);
  item.cantidad--;

  // Si llega a 0, lo saco del carrito
  if (item.cantidad === 0) {
    eliminarItem(id);
    return;
  }
  actualizarCarrito();
}

function eliminarItem(id) {
  carrito = carrito.filter((item) => item.id !== id);
  actualizarCarrito();
}

function vaciarCarrito() {
  carrito = [];
  actualizarCarrito();
}

// ==========================
// 5. Mostrar el carrito en pantalla
// ==========================
function mostrarCarrito() {
  if (carrito.length === 0) {
    listaCarrito.innerHTML = `<p class="text-center text-body-secondary mt-4">Tu carrito está vacío 😢</p>`;
    return;
  }

  listaCarrito.innerHTML = carrito
    .map((item) => {
      return `
        <div class="item-carrito border-bottom py-3">
          <div class="d-flex justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <img src="${item.imagen}" class="img-carrito" alt="${item.nombre}">
              <strong>${item.nombre}</strong>
            </div>
            <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${item.id}">🗑️</button>
          </div>
          <div class="d-flex justify-content-between align-items-center mt-2">
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-secondary btn-restar" data-id="${item.id}">-</button>
              <span class="btn btn-light disabled">${item.cantidad}</span>
              <button class="btn btn-outline-secondary btn-sumar" data-id="${item.id}">+</button>
            </div>
            <span>$${(item.precio * item.cantidad).toLocaleString("es-AR")}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function mostrarTotales() {
  // reduce para sumar el total en plata y la cantidad de items
  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const cantidad = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  totalCarrito.textContent = "$" + total.toLocaleString("es-AR");
  contadorCarrito.textContent = cantidad;
}

// Esta función hace todo junto cada vez que cambia el carrito
function actualizarCarrito() {
  guardarCarrito();
  mostrarCarrito();
  mostrarTotales();
}

// ==========================
// 6. Eventos (delegación de eventos)
// ==========================

// UN SOLO listener en el contenedor de las cards
contenedorProductos.addEventListener("click", (e) => {
  const boton = e.target.closest(".btn-agregar");

  // Si el click no fue en un botón de agregar, no hago nada
  if (!boton) return;

  const id = Number(boton.dataset.id); // dataset devuelve texto, lo paso a número
  agregarAlCarrito(id);
  alert("¡Producto agregado exitosamente!");
});

// Delegación también para los botones dentro del carrito
listaCarrito.addEventListener("click", (e) => {
  const botonSumar = e.target.closest(".btn-sumar");
  const botonRestar = e.target.closest(".btn-restar");
  const botonEliminar = e.target.closest(".btn-eliminar");

  if (botonSumar) {
    sumarCantidad(Number(botonSumar.dataset.id));
  } else if (botonRestar) {
    restarCantidad(Number(botonRestar.dataset.id));
  } else if (botonEliminar) {
    eliminarItem(Number(botonEliminar.dataset.id));
  }
});

btnVaciar.addEventListener("click", vaciarCarrito);

// Botón para finalizar la compra
btnFinalizar.addEventListener("click", () => {
  // Si el carrito está vacío no se puede comprar
  if (carrito.length === 0) {
    alert("Tu carrito está vacío, agregá algún producto primero.");
    return;
  }

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  alert("¡Gracias por tu compra! Total a pagar: $" + total.toLocaleString("es-AR"));

  // Después de comprar, se vacía el carrito
  vaciarCarrito();
});

// ==========================
// 7. Modo oscuro (se guarda en localStorage)
// ==========================
function aplicarModo(modo) {
  // Bootstrap 5.3 cambia los colores con data-bs-theme
  document.documentElement.setAttribute("data-bs-theme", modo);
  btnModo.textContent = modo === "dark" ? "☀️ Claro" : "🌙 Oscuro";
}

btnModo.addEventListener("click", () => {
  const modoActual = document.documentElement.getAttribute("data-bs-theme");
  const nuevoModo = modoActual === "dark" ? "light" : "dark";

  aplicarModo(nuevoModo);
  localStorage.setItem("modo", nuevoModo);
});

// ==========================
// 8. Formulario (validación con Bootstrap)
// ==========================
formulario.addEventListener("submit", (e) => {
  e.preventDefault(); // evita que se recargue la página

  // checkValidity() revisa los required, minlength, type="email", etc.
  if (!formulario.checkValidity()) {
    formulario.classList.add("was-validated");
    return;
  }

  // Si está todo bien, muestro el mensaje y limpio el formulario
  mensajeExito.classList.remove("d-none");
  formulario.reset();
  formulario.classList.remove("was-validated");

  // El mensaje desaparece a los 4 segundos
  setTimeout(() => {
    mensajeExito.classList.add("d-none");
  }, 4000);
});

// ==========================
// 9. Inicio de la página
// ==========================
mostrarProductos();
actualizarCarrito();
aplicarModo(localStorage.getItem("modo") || "light");