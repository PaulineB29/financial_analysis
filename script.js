function calculateGraham() {
    // Récupération des valeurs saisies
    const companyName = document.getElementById('companyName').value || "l'entreprise";
    const stockPrice = parseFloat(document.getElementById('stockPrice').value);
    const eps = parseFloat(document.getElementById('eps').value);
    const bookValue = parseFloat(document.getElementById('bookValue').value);
    const growthRate = parseFloat(document.getElementById('growthRate').value) / 100;
    const dividend = parseFloat(document.getElementById('dividend').value) || 0;

    // Validation des données
    if (!stockPrice || !eps || !bookValue || isNaN(growthRate)) {
        alert("Veuillez remplir tous les champs obligatoires");
        return;
    }

    // Calculs selon la méthode Graham
    const intrinsicValue = calculateIntrinsicValue(eps, growthRate);
    const marginSafety = ((intrinsicValue - stockPrice) / intrinsicValue * 100);
    const peRatio = stockPrice / eps;
    const pbRatio = stockPrice / bookValue;
    const dividendYield = (dividend / stockPrice * 100);

    // Affichage des résultats
    displayResults(companyName, intrinsicValue, marginSafety, peRatio, pbRatio, dividendYield);
    
    // Affichage de la section résultats
    document.getElementById('results').style.display = 'block';
}

function calculateIntrinsicValue(eps, growthRate) {
    // Formule de Graham : V = EPS * (8.5 + 2*g)
    // où g est le taux de croissance attendu pour les 7-10 prochaines années
    const grahamFormula = eps * (8.5 + 2 * growthRate * 100);
    
    // Ajustement conservateur : on prend le minimum entre la formule et 20x le EPS
    const conservativeValue = eps * 20;
    
    return Math.min(grahamFormula, conservativeValue);
}

function displayResults(companyName, intrinsicValue, marginSafety, peRatio, pbRatio, dividendYield) {
    // Formatage des valeurs
    document.getElementById('intrinsicValue').textContent = `$${intrinsicValue.toFixed(2)}`;
    document.getElementById('marginSafety').textContent = `${marginSafety.toFixed(1)}%`;
    document.getElementById('peRatio').textContent = peRatio.toFixed(1);
    document.getElementById('pbRatio').textContent = pbRatio.toFixed(1);

    // Application des couleurs selon les critères
    applyColorIndicator('marginSafety', marginSafety, 25, 15);
    applyColorIndicator('peRatio', peRatio, 15, 20, true);
    applyColorIndicator('pbRatio', pbRatio, 1.5, 2.5, true);

    // Génération de la recommandation
    generateRecommendation(companyName, intrinsicValue, marginSafety, peRatio, pbRatio, dividendYield);
    
    // Détails du calcul
    showCalculationDetails(intrinsicValue, marginSafety);
}

function applyColorIndicator(elementId, value, goodThreshold, warningThreshold, reverse = false) {
    const element = document.getElementById(elementId);
    
    if (reverse) {
        // Pour P/E et P/B : plus la valeur est basse, mieux c'est
        if (value <= goodThreshold) {
            element.className = 'value good';
        } else if (value <= warningThreshold) {
            element.className = 'value warning';
        } else {
            element.className = 'value bad';
        }
    } else {
        // Pour marge de sécurité : plus la valeur est haute, mieux c'est
        if (value >= goodThreshold) {
            element.className = 'value good';
        } else if (value >= warningThreshold) {
            element.className = 'value warning';
        } else {
            element.className = 'value bad';
        }
    }
}

function generateRecommendation(companyName, intrinsicValue, marginSafety, peRatio, pbRatio, dividendYield) {
    let recommendation = "";
    let score = 0;

    // Calcul du score basé sur les critères de Graham
    if (marginSafety >= 25) score += 2;
    else if (marginSafety >= 15) score += 1;

    if (peRatio <= 15) score += 2;
    else if (peRatio <= 20) score += 1;

    if (pbRatio <= 1.5) score += 2;
    else if (pbRatio <= 2.5) score += 1;

    // Génération du texte de recommandation
    if (score >= 5) {
        recommendation = `✅ <strong>EXCELLENTE OPPORTUNITÉ</strong> - ${companyName} présente toutes les caractéristiques d'un bon investissement selon Graham. La marge de sécurité est solide et les ratios sont attractifs.`;
    } else if (score >= 3) {
        recommendation = `⚠️ <strong>OPPORTUNITÉ MODÉRÉE</strong> - ${companyName} montre certains signes positifs mais nécessite une analyse plus approfondie. Certains ratios pourraient être améliorés.`;
    } else {
        recommendation = `❌ <strong>NON CONFORME</strong> - ${companyName} ne répond pas aux critères stricts de Graham. Les ratios sont élevés et la marge de sécurité est insuffisante.`;
    }

    // Ajout des détails spécifiques
    recommendation += `<br><br><strong>Points clés :</strong><ul>`;
    recommendation += `<li>Marge de sécurité : ${marginSafety >= 25 ? '✅ Excellente' : marginSafety >= 15 ? '⚠️ Acceptable' : '❌ Insuffisante'}</li>`;
    recommendation += `<li>Ratio P/E : ${peRatio <= 15 ? '✅ Très bon' : peRatio <= 20 ? '⚠️ Acceptable' : '❌ Trop élevé'}</li>`;
    recommendation += `<li>Ratio P/B : ${pbRatio <= 1.5 ? '✅ Très bon' : pbRatio <= 2.5 ? '⚠️ Acceptable' : '❌ Trop élevé'}</li>`;
    recommendation += `</ul>`;

    document.getElementById('recommendationText').innerHTML = recommendation;
}

function showCalculationDetails(intrinsicValue, marginSafety) {
    const details = `
        <p><strong>Méthodologie utilisée :</strong></p>
        <ul>
            <li><strong>Formule de Graham :</strong> V = EPS × (8.5 + 2g) où g est le taux de croissance</li>
            <li><strong>Valeur intrinsèque calculée :</strong> $${intrinsicValue.toFixed(2)}</li>
            <li><strong>Marge de sécurité :</strong> ${marginSafety.toFixed(1)}% (cible minimum: 25%)</li>
            <li><strong>Seuils Graham :</strong> P/E ≤ 15, P/B ≤ 1.5, Marge ≥ 25%</li>
        </ul>
        <p><em>Note : Ce calcul est une estimation. Une analyse plus approfondie est recommandée.</em></p>
    `;
    
    document.getElementById('calculationDetails').innerHTML = details;
}

// Exemple de données pré-remplies pour démonstration
document.addEventListener('DOMContentLoaded', function() {
    // Pré-remplissage avec des valeurs d'exemple
    document.getElementById('companyName').value = "Entreprise Example";
    document.getElementById('stockPrice').value = "120";
    document.getElementById('eps').value = "8.50";
    document.getElementById('bookValue').value = "65.00";
    document.getElementById('growthRate').value = "7.5";
    document.getElementById('dividend').value = "2.50";
});
