const http = require('http');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const server = http.createServer(async (req, res) => {
    try {
        // Gestion de l'authentification
        if (req.method === 'POST' && req.url === '/auth') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            
            req.on('end', async () => {
                try {
                    const { email, password } = JSON.parse(body);
                    const authConfig = require('./config/auth.json');
                    
                    // Vérifier les identifiants
                    if (email === authConfig.admin.email) {
                        const isValid = await bcrypt.compare(password, authConfig.admin.password);
                        if (isValid) {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true, token: 'admin-token-' + Date.now() }));
                            return;
                        }
                    }
                    
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false }));
                } catch (error) {
                    console.error('Erreur:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Erreur serveur' }));
                }
            });
            return;
        }

        // Gestion des fichiers
        const filePath = path.join(__dirname, req.url === '/' ? '/index.html' : req.url);
        
        // Résolution du chemin pour les fichiers dans le dossier admin
        const adminPath = req.url.startsWith('/admin/') ? path.join(__dirname, req.url) : filePath;
        
        // Vérifier si le fichier existe
        fs.access(adminPath, fs.constants.F_OK, (err) => {
            if (err) {
                res.writeHead(404);
                res.end('File not found');
                return;
            }

            // Lire le fichier
            fs.readFile(adminPath, (err, data) => {
                if (err) {
                    console.error('Erreur lors de la lecture du fichier:', err);
                    res.writeHead(500);
                    res.end('Internal Server Error');
                    return;
                }

                // Déterminer le type MIME
                const ext = path.extname(filePath);
                let contentType = 'text/html';
                
                switch (ext) {
                    case '.js':
                        contentType = 'application/javascript';
                        break;
                    case '.css':
                        contentType = 'text/css';
                        break;
                    case '.json':
                        contentType = 'application/json';
                        break;
                    case '.png':
                    case '.jpg':
                    case '.jpeg':
                        contentType = 'image/jpeg';
                        break;
                }
                
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            });
        });
    } catch (error) {
        console.error('Erreur globale:', error);
        res.writeHead(500);
        res.end('Internal Server Error');
    }
});

const PORT = 8000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
