const cartButton = document.querySelector("[data-cart-button]");
const closeCartButton = document.querySelector("[data-close-button]");
const clearCartButton = document.querySelector("[data-clear-button]");
const cartAmount = document.querySelector("[data-cart-amount]");
const cartTotal = document.querySelector("[data-cart-total]");
const productsWrapper = document.querySelector("[data-products-wrapper]");
const cartsWrapper = document.querySelector("[data-carts-wrapper]");
const cartDOM = document.querySelector(".cart");
const overlay = document.querySelector(".overlay");

let cart = [];
let buttonsDOM = [];
// PRODUCTS CLASS
class Products {
    async getProducts() {
        try {
            const respone = await fetch("./js/products.json");
            const data = await respone.json();
            let products = data.items;
            products = products.map((product) => {
                const { id } = product.sys;
                const { title, price } = product.fields;
                const image = product.fields.image.fields.file.url;

                return { id, title, price, image };
            });
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}

// DISPLAY CLASS
class UI {
    // DISPLAY PRODUCTS
    displayProducts(products) {
        products.forEach((product) => {
            productsWrapper.innerHTML += `
            <div class="products__product-item">
                <div class="products__product-img-wrapper">
                    <img
                        class="products__product-img"
                        src="${product.image}"
                        alt="${product.title}"
                    />
                    <button class="products__product-btn" data-id=${product.id} data-product-btn  >
                        <i class="fas fa-shopping-cart"></i>
                        Add to cart
                    </button>
                </div>
                <h3 class="products__product-title">${product.title}</h3>
                <h3 class="products__product-price">$<span>${product.price}</span></h3>
            </div>
            `;
        });
    }

    getButtons() {
        const buttons = [...document.querySelectorAll("[data-product-btn]")];
        buttonsDOM = buttons;
        buttons.forEach((button) => {
            const id = button.dataset.id;
            const inCart = cart.find((item) => item.id === id);
            if (inCart) {
                button.innerText = "In Cart";
                button.disabled = true;
            }

            button.addEventListener("click", (e) => {
                e.target.innerText = "In Cart";
                e.target.disabled = true;
                // GET PRODUCTS FROM PRODUCTS
                const cartItem = { ...Storage.getProduct(id), amount: 1 };
                // ADD PRODUCT TO THE CART
                cart = [...cart, cartItem];
                // SAVE THE CART IN LOCAL STORAGE
                Storage.saveCart(cart);
                // SET CART VALUES
                this.setCartValues(cart);
                // DISPLAY CART ITEM
                this.displayCartItem(cartItem);
                // SHOW THE CART
                // this.displayCart();
            });
        });
    }

    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map((item) => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartAmount.innerText = itemsTotal;
    }

    // DISPLAY CART ITEM
    displayCartItem(item) {
        cartsWrapper.innerHTML += `
        <div class="cart__cart-item">
            <div class="cart__cart-item-img-wrapper">
                <img
                    class="cart__cart-item-img"
                    src="${item.image}"
                    alt=""
                />
            </div>
            <div>
                <h3 class="cart__cart-item-title">${item.title}</h3>
                <h4 class="cart__cart-item-price">$ <span>${item.price}</span></h4>
                <p class="cart__cart-item-remove" data-id=${item.id}>remove</p>
            </div>
            <div>
                <div class="cart__chevron-up" >
                    <i class="fas fa-chevron-up" data-id=${item.id}></i>
                </div>
                <div class="cart__cart-item-amount">${item.amount}</div>
                <div class="cart__chevron-down" >
                    <i class="fas fa-chevron-down" data-id=${item.id}></i>
                </div>
            </div>
        </div>
        `;
    }

    // SETUP APP
    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
    }

    // POPULATE CART
    populateCart(cart) {
        cart.forEach((item) => {
            this.displayCartItem(item);
        });
    }

    // CART LOGIC
    cartLogic() {
        clearCartButton.addEventListener("click", () => {
            this.clearCart();
        });

        cartsWrapper.addEventListener("click", (e) => {
            if (e.target.classList.contains("cart__cart-item-remove")) {
                let removeItem = e.target;
                let id = removeItem.dataset.id;
                cartsWrapper.removeChild(
                    removeItem.parentElement.parentElement,
                );
                this.removeItem(id);
            } else if (e.target.classList.contains("fa-chevron-up")) {
                let addAmount = e.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find((item) => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.parentElement.nextElementSibling.innerText =
                    tempItem.amount;
            } else if (e.target.classList.contains("fa-chevron-down")) {
                let lowerAmount = e.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find((item) => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart)
                    this.setCartValues(cart)
                    lowerAmount.parentElement.previousElementSibling.innerText =
                    tempItem.amount;
                } else {
                    cartsWrapper.removeChild(
                        lowerAmount.parentElement.parentElement.parentElement,
                    );
                    this.removeItem(id);
                }
            }
        });
    }

    // CLEAR CART
    clearCart() {
        let cartItems = cart.map((item) => item.id);
        cartItems.forEach((id) => this.removeItem(id));
        while (cartsWrapper.lastElementChild) {
            cartsWrapper.lastElementChild.remove();
        }
        this.hideCart();
    }
    // REMOVE ITEM
    removeItem(id) {
        cart = cart.filter((item) => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>
        Add to cart`;
        button.disabled = false;
    }

    getSingleButton(id) {
        return buttonsDOM.find((button) => button.dataset.id === id);
    }
    // DISPLAY CART
    displayCart() {
        cartDOM.classList.add("active");
        overlay.classList.add("active");
    }

    // HIDE CART
    hideCart() {
        cartDOM.classList.remove("active");
        overlay.classList.remove("active");
    }
}

// LOCAL STORAGE
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }

    static getProduct(id) {
        const products = JSON.parse(localStorage.getItem("products"));
        return products.find((product) => product.id === id);
    }

    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    static getCart() {
        return localStorage.getItem("cart")
            ? JSON.parse(localStorage.getItem("cart"))
            : [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    ui.setupAPP();

    cartButton.addEventListener("click", ui.displayCart);
    closeCartButton.addEventListener("click", ui.hideCart);

    products
        .getProducts()
        .then((products) => {
            Storage.saveProducts(products);
            ui.displayProducts(products);
        })
        .then(() => {
            ui.getButtons();
            ui.cartLogic();
        });
});
