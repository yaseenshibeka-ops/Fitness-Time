document.addEventListener('DOMContentLoaded', async () => {
    const productsGrid = document.getElementById('productsGrid');
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchInput');
    const cartCount = document.getElementById('cartCount');

    let allProducts = [];

    // Load Categories
    async function loadCategories() {
        try {
            const response = await api.get('/products/categories');
            const categories = response.data.categories;
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.category_id;
                option.textContent = cat.name;
                categoryFilter.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load categories', error);
        }
    }

    // Load Products
    async function loadProducts(categoryId = '', search = '') {
        try {
            productsGrid.innerHTML = `
                <div class="text-center my-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            `;

            let url = '/products';
            const params = new URLSearchParams();
            if (categoryId) params.append('category_id', categoryId);
            if (search) params.append('search', search);
            
            if(params.toString()) {
                url += '?' + params.toString();
            }

            const response = await api.get(url);
            allProducts = response.data.products;
            renderProducts(allProducts);
        } catch (error) {
            productsGrid.innerHTML = `<div class="alert alert-danger">Failed to load products. ${error.message}</div>`;
        }
    }

    // Render Products
    function renderProducts(products) {
        if (products.length === 0) {
            productsGrid.innerHTML = `<div class="col-12 text-center text-muted my-5">No products found.</div>`;
            return;
        }

        productsGrid.innerHTML = products.map(product => `
            <div class="col-md-4 col-lg-3 mb-4">
                <div class="glass-card h-100 d-flex flex-column">
                    <img src="${product.image_url || 'https://via.placeholder.com/400x300?text=FitTrack+Gear'}" class="product-img" alt="${product.name}">
                    <div class="card-body p-3 d-flex flex-column flex-grow-1">
                        <span class="badge bg-secondary mb-2 align-self-start">${product.category_name || 'Gear'}</span>
                        <h5 class="card-title fw-bold text-light">${product.name}</h5>
                        <p class="card-text text-muted small flex-grow-1">${product.description ? product.description.substring(0, 60) + '...' : ''}</p>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <span class="fs-5 fw-bold text-accent">${Number(product.price).toLocaleString()} RWF</span>
                            <button class="btn btn-sm btn-primary add-to-cart-btn" data-id="${product.product_id}">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Attach event listeners to Add to Cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', handleAddToCart);
        });
    }

    // Update Cart Count
    async function updateCartCount() {
        if (!localStorage.getItem('token')) return;
        try {
            const response = await api.get('/cart');
            cartCount.textContent = response.data.cart.summary.totalItems || 0;
        } catch (error) {
            console.error('Failed to get cart count', error);
        }
    }

    // Handle Add to Cart
    async function handleAddToCart(e) {
        if (!localStorage.getItem('token')) {
            window.location.href = '/login.html';
            return;
        }

        const productId = e.target.getAttribute('data-id');
        const btn = e.target;
        const originalText = btn.innerHTML;
        
        try {
            btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
            btn.disabled = true;

            await api.post('/cart/items', { productId: parseInt(productId), quantity: 1 });
            
            // Show toast
            const toastEl = document.getElementById('cartToast');
            const toast = new bootstrap.Toast(toastEl);
            toast.show();

            await updateCartCount();
        } catch (error) {
            alert(error.message || 'Failed to add item to cart');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    // Event Listeners for Filters
    categoryFilter.addEventListener('change', (e) => {
        loadProducts(e.target.value, searchInput.value);
    });

    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            loadProducts(categoryFilter.value, e.target.value);
        }, 500);
    });

    // Initialize
    await loadCategories();
    await loadProducts();
    await updateCartCount();
});
