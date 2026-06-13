document.addEventListener('DOMContentLoaded', async () => {
    const productGrid = document.getElementById('productGrid');

    if (productGrid) {
        try {
            const response = await api.get('/products/featured');

            if (response.data && response.data.products && response.data.products.length > 0) {
                productGrid.innerHTML = response.data.products.map((product, i) => `
                    <div class="col-md-4 col-lg-3 fade-in" style="animation-delay: ${i * 0.1}s">
                        <div class="glass-card product-card h-100">
                            <img src="${product.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop'}"
                                 alt="${product.name}"
                                 loading="lazy"
                                 class="card-img-top">
                            <div class="card-body p-3">
                                <span class="badge bg-primary mb-2">${product.category_name || 'General'}</span>
                                <h5 class="fw-bold mb-2">${product.name}</h5>
                                <p class="text-muted small mb-3">${product.description ? product.description.substring(0, 80) + '...' : ''}</p>
                                <div class="d-flex justify-content-between align-items-center">
                                    <span class="fs-5 fw-bold text-accent">${Number(product.price).toLocaleString()} RWF</span>
                                    <a href="/products.html" class="btn btn-sm btn-primary">View</a>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
            } else {
                productGrid.innerHTML = `
                    <div class="text-center w-100 py-5">
                        <i class="bi bi-box-seam display-1 text-muted mb-3" style="display:block;"></i>
                        <p class="text-muted">No products available yet. Check back soon!</p>
                        <a href="/products.html" class="btn btn-primary mt-2">Browse All</a>
                    </div>
                `;
            }
        } catch (err) {
            productGrid.innerHTML = `
                <div class="text-center w-100 py-5">
                    <i class="bi bi-exclamation-triangle display-1 text-muted mb-3" style="display:block;"></i>
                    <p class="text-muted">Unable to load products right now.</p>
                    <a href="/products.html" class="btn btn-primary mt-2">Browse All</a>
                </div>
            `;
        }
    }
});
