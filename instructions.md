# Instructions pour la récupération des données

## Configuration nécessaire

1. **Proxy CORS** : L'application utilise un proxy pour contourner les restrictions CORS
2. **Sélecteurs** : Les sélecteurs CSS doivent être adaptés à la structure actuelle d'Investir.fr

## Comment utiliser :

1. Collez le lien complet de la page de l'entreprise sur Investir.fr
2. Sélectionnez l'année et le type de période (annuelle/trimestrielle)
3. Cliquez sur "Récupérer les données financières"
4. Les champs se rempliront automatiquement

## Résolution des problèmes :

Si la récupération échoue :
- Vérifiez que le lien est valide
- Actualisez les sélecteurs dans `INVESTIR_SELECTORS`
- Utilisez les outils de développement pour inspecter la structure HTML
