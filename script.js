document.addEventListener('DOMContentLoaded', async () => {
    // Démarrer le serveur
    await startServer();

    // Charger les articles de la boutique
    await loadStoreItems();

    // Slider
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) {
                slide.classList.add('active');
            }
        });
        currentSlide = index;
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    // Gestion des boutons de navigation
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    // Changer automatiquement de slide toutes les 5 secondes
    setInterval(nextSlide, 5000);

    // Menu mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });

    // Fermer le menu mobile quand on clique sur un lien
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });

    // Configuration EmailJS
    emailjs.init('YOUR_PUBLIC_KEY'); // Remplacez YOUR_PUBLIC_KEY par votre clé publique EmailJS

    // Gestion du formulaire de whitelist
    const whitelistForm = document.getElementById('whitelist-form');
    whitelistForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(whitelistForm);
        const data = {
            playerName: formData.get('player-name'),
            email: formData.get('email'),
            message: formData.get('message')
        };

        try {
            const templateParams = {
                to_email: 'solexrpmaroc@gmail.com',
                from_name: data.playerName,
                from_email: data.email,
                message: `Demande de whitelist de ${data.playerName}\n\nEmail: ${data.email}\n\nMessage: ${data.message}`
            };

            await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams);
            
            whitelistForm.reset();
            showNotification('success', 'Merci pour votre demande de whitelist ! Nous vous contacterons bientôt.');
        } catch (error) {
            console.error('Erreur lors de l\'envoi du formulaire:', error);
            showNotification('error', 'Une erreur est survenue lors de l\'envoi du formulaire. Veuillez réessayer.');
        }
    });

    // Fonction pour afficher les notifications
    function showNotification(type, message) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Copier l'IP du serveur
    const connectButton = document.querySelector('.connect-button');
    const serverIp = document.getElementById('server-ip');

    connectButton.addEventListener('click', () => {
        navigator.clipboard.writeText(serverIp.textContent)
            .then(() => {
                const originalText = connectButton.innerHTML;
                connectButton.innerHTML = '<i class="fas fa-check"></i> IP copiée !';
                setTimeout(() => {
                    connectButton.innerHTML = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Erreur lors de la copie:', err);
            });
    });

    // Animations au scroll
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Effet de défilement sur la navigation
    const header = document.querySelector('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll <= 0) {
            header.classList.remove('scrolled');
            return;
        }

        if (currentScroll > lastScroll && !header.classList.contains('scrolled')) {
            header.classList.add('scrolled');
        } else if (currentScroll < lastScroll && header.classList.contains('scrolled')) {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Ajouter une animation de survol aux boutons d'achat
    const buyButtons = document.querySelectorAll('.buy-button');
    buyButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
        });
    });

    // Fonction pour démarrer le serveur
    async function startServer() {
        try {
            // Vérifier si le serveur est déjà démarré
            const response = await fetch('/');
            if (response.ok) {
                // Charger les articles
                await loadStoreItems();
            } else {
                throw new Error('Serveur non démarré');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('error', 'Le serveur ne répond pas. Veuillez démarrer le serveur Node.js.');
        }
    }

    // Fonction pour charger les articles de la boutique
    async function loadStoreItems() {
        try {
            const response = await fetch('/data/store-items.json');
            if (!response.ok) {
                throw new Error('Erreur de serveur');
            }
            const data = await response.json();
            const storeItems = document.querySelector('.store-items');
            
            // Vider la liste
            storeItems.innerHTML = '';

            // Ajouter chaque item
            data.items.forEach(item => {
                const itemElement = createStoreItem(item);
                storeItems.appendChild(itemElement);
            });
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('error', 'Erreur lors du chargement des articles. Vérifiez que le serveur est en cours d\'exécution.');
        }
    }

    // Fonction pour créer un élément de boutique
    function createStoreItem(item) {
        const div = document.createElement('div');
        div.className = 'store-item';
        div.innerHTML = `
            <div class="store-item-content">
                <div class="store-item-icon">
                    <img src="${item.icon}" alt="${item.name}">
                </div>
                <h3>${item.name}</h3>
                <p>${item.price}</p>
                <p>${item.description}</p>
                <button class="buy-button">Acheter</button>
            </div>
        `;
        return div;
    }
});
