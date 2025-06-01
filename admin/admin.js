document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginContainer = document.getElementById('login-container');
    const adminContent = document.getElementById('admin-content');
    const addItemBtn = document.getElementById('add-item-btn');
    const addItemModal = document.getElementById('add-item-modal');
    const addItemForm = document.getElementById('add-item-form');
    const itemsList = document.getElementById('items-list');

    // Vérifier si l'utilisateur est déjà connecté
    const token = localStorage.getItem('adminToken');
    if (token) {
        showAdminContent();
        loadItems();
    }

    // Gestion du formulaire de connexion
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:8000/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Erreur d\'authentification');
            }

            if (data.success) {
                localStorage.setItem('adminToken', data.token);
                showAdminContent();
                loadItems();
                showNotification('success', 'Connecté avec succès !');
            } else {
                showNotification('error', data.error || 'Email ou mot de passe incorrect');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('error', 'Erreur lors de la connexion: ' + error.message);
        }
    });

    // Fonction pour afficher le contenu admin
    function showAdminContent() {
        loginContainer.style.display = 'none';
        adminContent.style.display = 'flex';
    }

    // Gestion du bouton d'ajout
    addItemBtn.addEventListener('click', () => {
        addItemModal.style.display = 'block';
    });

    // Fermer le modal en cliquant en dehors
    window.addEventListener('click', (e) => {
        if (e.target === addItemModal) {
            addItemModal.style.display = 'none';
        }
    });

    // Gestion du formulaire d'ajout
    addItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newItem = {
            id: Date.now(), // Utilisation de timestamp comme ID unique
            name: document.getElementById('name').value,
            price: document.getElementById('price').value,
            icon: document.getElementById('icon').value,
            description: document.getElementById('description').value,
            type: document.getElementById('type').value
        };

        try {
            // Charger les items existants
            const response = await fetch('http://localhost:8000/data/store-items.json');
            const data = await response.json();

            // Ajouter le nouvel item
            data.items.push(newItem);

            // Sauvegarder les items mis à jour
            await saveItems(data);

            // Mettre à jour l'affichage
            loadItems();

            // Fermer le modal
            addItemModal.style.display = 'none';

            // Réinitialiser le formulaire
            addItemForm.reset();

            showNotification('success', 'Article ajouté avec succès !');
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('error', 'Erreur lors de l\'ajout de l\'article: ' + error.message);
        }
    });

    // Fonction pour charger les items
    async function loadItems() {
        try {
            const response = await fetch('http://localhost:8000/data/store-items.json');
            const data = await response.json();

            // Vider la liste
            itemsList.innerHTML = '';

            // Ajouter chaque item
            data.items.forEach(item => {
                const itemCard = createItemCard(item);
                itemsList.appendChild(itemCard);
            });
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('error', 'Erreur lors du chargement des articles: ' + error.message);
        }
    }

    // Fonction pour créer une carte d'article
    function createItemCard(item) {
        const div = document.createElement('div');
        div.className = 'item-card';
        div.innerHTML = `
            <img src="${item.icon}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p class="price">${item.price}</p>
            <p>${item.description}</p>
            <div class="item-actions">
                <button class="action-btn edit" onclick="editItem(${item.id})">
                    <i class="fas fa-edit"></i> Modifier
                </button>
                <button class="action-btn delete" onclick="deleteItem(${item.id})">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            </div>
        `;
        return div;
    }

    // Fonction pour sauvegarder les items
    async function saveItems(data) {
        try {
            const response = await fetch('http://localhost:8000/data/store-items.json', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la sauvegarde');
            }
        } catch (error) {
            console.error('Erreur:', error);
            throw error;
        }
    }

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
});
