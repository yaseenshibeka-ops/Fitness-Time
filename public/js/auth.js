document.addEventListener('DOMContentLoaded', () => {
    
    // Register Logic
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const phone = document.getElementById('phone').value;
            const errorMessage = document.getElementById('errorMessage');

            try {
                const response = await api.post('/auth/register', { fullName, email, password, phone });
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                window.location.href = '/profile.html';
            } catch (error) {
                errorMessage.textContent = error.message || 'Registration failed';
                errorMessage.classList.remove('d-none');
            }
        });
    }

    // Login Logic
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('errorMessage');

            try {
                const response = await api.post('/auth/login', { email, password });
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                if(response.data.user.role === 'admin') {
                    window.location.href = '/admin/dashboard.html';
                } else {
                    window.location.href = '/profile.html';
                }
            } catch (error) {
                errorMessage.textContent = error.message || 'Login failed';
                errorMessage.classList.remove('d-none');
            }
        });
    }

    // Logout Logic
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login.html';
        });
    }

    // Update UI based on auth state (for navbars)
    const updateNavAuthState = () => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        const authLinks = document.getElementById('authLinks');
        
        if (authLinks) {
            if (token && user) {
                const adminLink = user.role === 'admin' ? `<li><a class="dropdown-item" href="/admin/dashboard.html">Admin Dashboard</a></li>` : '';
                authLinks.innerHTML = `
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
                            ${user.fullName}
                        </a>
                        <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="navbarDropdown">
                            <li><a class="dropdown-item" href="/profile.html">My Profile</a></li>
                            <li><a class="dropdown-item" href="/orders.html">My Orders</a></li>
                            ${adminLink}
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="#" id="logoutBtnNav">Logout</a></li>
                        </ul>
                    </li>
                `;

                document.getElementById('logoutBtnNav').addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login.html';
                });

            } else {
                authLinks.innerHTML = `
                    <li class="nav-item"><a class="nav-link" href="/login.html">Login</a></li>
                    <li class="nav-item"><a class="btn btn-primary ms-2" href="/register.html">Sign Up</a></li>
                `;
            }
        }
    };

    updateNavAuthState();
});
