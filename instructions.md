# Instructions pour Investing.com

## Configuration requise

L'application est maintenant configurée pour fonctionner avec **Investing.com**.

## Comment utiliser :

1. **Obtenir le lien** : Allez sur investing.com, cherchez une entreprise et copiez l'URL de sa page de résumé financier
   - Exemple: `https://www.investing.com/equities/apple-computer-inc-financial-summary`

2. **Coller le lien** : Collez le lien dans le champ "Lien Investing.com"

3. **Sélectionner la période** : Choisissez si les données sont annuelles ou trimestrielles

4. **Récupérer les données** : Cliquez sur "Récupérer les données financières"

## Fonctionnalités :

- ✅ Récupération automatique du nom de l'entreprise
- ✅ Extraction des données financières principales
- ✅ Calcul automatique du NOPAT
- ✅ Gestion des différentes devises et formats
- ✅ Conversion automatique des suffixes (K, M, B)

## Limitations connues :

1. **Protection CORS** : Investing.com a une protection stricte, nécessite un proxy
2. **Structure variable** : Les sélecteurs peuvent changer si Investing.com modifie son design
3. **Données manquantes** : Certaines données peuvent ne pas être disponibles selon l'entreprise

## Résolution des problèmes :

### Si la récupération échoue :

1. **Vérifiez le lien** : Assurez-vous que c'est une page de résumé financier d'Investing.com
2. **Proxy temporaire** : L'application utilise un service proxy public qui peut être limité
3. **Sélecteurs** : Les sélecteurs peuvent nécessiter une mise à jour si Investing.com change son HTML

### Pour mettre à jour les sélecteurs :

Ouvrez les outils de développement du navigateur sur la page Investing.com et inspectez les éléments pour trouver les nouveaux sélecteurs.

## Exemples de liens valides :

- Apple: `https://www.investing.com/equities/apple-computer-inc-financial-summary`
- Microsoft: `https://www.investing.com/equities/microsoft-corp-financial-summary`
- Tesla: `https://www.investing.com/equities/tesla-motors-financial-summary`

## Notes importantes :

- Les données sont fournies à titre indicatif
- Vérifiez toujours les données avec les sources officielles
- L'outil est éducatif et ne constitue pas un conseil en investissement
