# Guide de dépannage pour Investing.com

## Si ça ne fonctionne pas :

### 1. Testez d'abord manuellement :
- Allez sur investing.com
- Cherchez une entreprise (ex: Apple)
- Copiez l'URL complète
- Collez-la dans le champ

### 2. Solutions alternatives :

**Option A - Service de scraping professionnel (Recommandé)**
1. Créez un compte sur ScrapingBee.com
2. Obtenez une clé API gratuite (1000 requêtes)
3. Remplacez la clé dans le code :
```javascript
const apiKey = 'VOTRE_CLE_API'; // Dans scrapingBeeMethod()
