// Seuils de référence pour l'analyse
const SEUILS = {
    // Santé Financière
    currentRatio: { bon: 1.5, excellent: 2.0 },
    debtToEquity: { bon: 0.5, excellent: 0.3 },
    interestCoverage: { bon: 5, excellent: 8 },
    freeCashFlow: { bon: 0, excellent: 0 }, // Doit être positif
    
    // Rentabilité
    roe: { bon: 0.15, excellent: 0.20 },
    roic: { bon: 0.12, excellent: 0.15 },
    netMargin: { bon: 0.10, excellent: 0.15 },
    operatingMargin: { bon: 0.15, excellent: 0.20 },
    
    // Évaluation
    peRatio: { bon: 15, excellent: 12 },
    pegRatio: { bon: 1, excellent: 0.8 },
    pbRatio: { bon: 1.5, excellent: 1.2 },
    pfcfRatio: { bon: 20, excellent: 15 },
    dividendYield: { bon: 0.02, excellent: 0.03 }, // 2-3%
    evEbitda: { bon: 12, excellent: 8 },
    
    // Croissance
    revenueGrowth: { bon: 0.08, excellent: 0.12 }, // 8-12%
    epsGrowth: { bon: 0.10, excellent: 0.15 }, // 10-15%
    priceVsMA200: { bon: 0, excellent: 0 } // Prix > MM200
};

function lancerAnalyse() {
    // Récupérer toutes les valeurs des inputs
    const inputs = getInputValues();
    
    // Calculer tous les ratios
    const ratios = calculerRatios(inputs);
    
    // Afficher les résultats
    afficherResultats(inputs.companyName, ratios);
    
    // Générer la conclusion
    genererConclusion(ratios);
}

function getInputValues() {
    return {
        // Santé Financière
        currentAssets: parseFloat(document.getElementById('currentAssets').value) || 0,
        currentLiabilities: parseFloat(document.getElementById('currentLiabilities').value) || 0,
        totalDebt: parseFloat(document.getElementById('totalDebt').value) || 0,
        shareholdersEquity: parseFloat(document.getElementById('shareholdersEquity').value) || 0,
        ebit: parseFloat(document.getElementById('ebit').value) || 0,
        interestExpense: parseFloat(document.getElementById('interestExpense').value) || 0,
        operatingCashFlow: parseFloat(document.getElementById('operatingCashFlow').value) || 0,
        capitalExpenditures: parseFloat(document.getElementById('capitalExpenditures').value) || 0,
        
        // Rentabilité
        netIncome: parseFloat(document.getElementById('netIncome').value) || 0,
        revenue: parseFloat(document.getElementById('revenue').value) || 0,
        nopat: parseFloat(document.getElementById('nopat').value) || 0,
        
        // Évaluation
        sharePrice: parseFloat(document.getElementById('sharePrice').value) || 0,
        sharesOutstanding: parseFloat(document.getElementById('sharesOutstanding').value) || 0,
        bookValuePerShare: parseFloat(document.getElementById('bookValuePerShare').value) || 0,
        dividendPerShare: parseFloat(document.getElementById('dividendPerShare').value) || 0,
        epsGrowth: parseFloat(document.getElementById('epsGrowth').value) || 0,
        ebitda: parseFloat(document.getElementById('ebitda').value) || 0,
        cash: parseFloat(document.getElementById('cash').value) || 0,
        
        // Croissance
        revenueGrowth: parseFloat(document.getElementById('revenueGrowth').value) || 0,
        previousEPS: parseFloat(document.getElementById('previousEPS').value) || 0,
        priceVsMA200: parseFloat(document.getElementById('priceVsMA200').value) || 0,
        
        companyName: document.getElementById('companyName').value || "Entreprise sans nom"
    };
}

function calculerRatios(inputs) {
    const marketCap = inputs.sharePrice * inputs.sharesOutstanding;
    const enterpriseValue = marketCap + inputs.totalDebt - inputs.cash;
    const currentEPS = inputs.netIncome / inputs.sharesOutstanding;
    const peRatio = inputs.sharePrice / currentEPS;
    
    return {
        // Santé Financière
        currentRatio: inputs.currentAssets / inputs.currentLiabilities,
        debtToEquity: inputs.totalDebt / inputs.shareholdersEquity,
        interestCoverage: inputs.ebit / inputs.interestExpense,
        freeCashFlow: inputs.operatingCashFlow - inputs.capitalExpenditures,
        
        // Rentabilité
        roe: inputs.netIncome / inputs.shareholdersEquity,
        roic: inputs.nopat / (inputs.totalDebt + inputs.shareholdersEquity),
        netMargin: inputs.netIncome / inputs.revenue,
        operatingMargin: inputs.ebit / inputs.revenue,
        
        // Évaluation
        peRatio: peRatio,
        pegRatio: peRatio / inputs.epsGrowth,
        pbRatio: inputs.sharePrice / inputs.bookValuePerShare,
        pfcfRatio: marketCap / (inputs.operatingCashFlow - inputs.capitalExpenditures),
        dividendYield: inputs.dividendPerShare / inputs.sharePrice,
        evEbitda: enterpriseValue / inputs.ebitda,
        
        // Croissance
        revenueGrowth: inputs.revenueGrowth / 100,
        epsGrowth: inputs.epsGrowth / 100,
        priceVsMA200: inputs.priceVsMA200 / 100
    };
}

function afficherResultats(companyName, ratios) {
    document.getElementById('resultsCompanyName').textContent = companyName;
    
    const tableHTML = `
        <table class="ratio-table">
            <thead>
                <tr>
                    <th>Catégorie</th>
                    <th>Ratio</th>
                    <th>Valeur Calculée</th>
                    <th>Seuil "Bon"</th>
                    <th>Verdict</th>
                </tr>
            </thead>
            <tbody>
                ${genererLignesTableau(ratios)}
            </tbody>
        </table>
    `;
    
    document.getElementById('resultsTable').innerHTML = tableHTML;
    document.getElementById('resultsSection').style.display = 'block';
}

function genererLignesTableau(ratios) {
    const categories = {
        "Santé Financière": [
            { nom: "Current Ratio", valeur: ratios.currentRatio, seuil: SEUILS.currentRatio, format: (v) => v.toFixed(2) },
            { nom: "Dette/Capitaux Propres", valeur: ratios.debtToEquity, seuil: SEUILS.debtToEquity, format: (v) => v.toFixed(2) },
            { nom: "Couverture des Intérêts", valeur: ratios.interestCoverage, seuil: SEUILS.interestCoverage, format: (v) => v.toFixed(1) },
            { nom: "Free Cash Flow (€)", valeur: ratios.freeCashFlow, seuil: SEUILS.freeCashFlow, format: (v) => v.toLocaleString('fr-FR') }
        ],
        "Rentabilité": [
            { nom: "ROE", valeur: ratios.roe, seuil: SEUILS.roe, format: (v) => (v * 100).toFixed(1) + "%" },
            { nom: "ROIC", valeur: ratios.roic, seuil: SEUILS.roic, format: (v) => (v * 100).toFixed(1) + "%" },
            { nom: "Marge Nette", valeur: ratios.netMargin, seuil: SEUILS.netMargin, format: (v) => (v * 100).toFixed(1) + "%" },
            { nom: "Marge d'Exploitation", valeur: ratios.operatingMargin, seuil: SEUILS.operatingMargin, format: (v) => (v * 100).toFixed(1) + "%" }
        ],
        "Évaluation": [
            { nom: "P/E Ratio", valeur: ratios.peRatio, seuil: SEUILS.peRatio, format: (v) => v.toFixed(1) },
            { nom: "PEG Ratio", valeur: ratios.pegRatio, seuil: SEUILS.pegRatio, format: (v) => v.toFixed(2) },
            { nom: "P/B Ratio", valeur: ratios.pbRatio, seuil: SEUILS.pbRatio, format: (v) => v.toFixed(2) },
            { nom: "P/FCF Ratio", valeur: ratios.pfcfRatio, seuil: SEUILS.pfcfRatio, format: (v) => v.toFixed(1) },
            { nom: "Rendement Dividende", valeur: ratios.dividendYield, seuil: SEUILS.dividendYield, format: (v) => (v * 100).toFixed(2) + "%" },
            { nom: "EV/EBITDA", valeur: ratios.evEbitda, seuil: SEUILS.evEbitda, format: (v) => v.toFixed(1) }
        ],
        "Croissance": [
            { nom: "Croissance CA", valeur: ratios.revenueGrowth, seuil: SEUILS.revenueGrowth, format: (v) => (v * 100).toFixed(1) + "%" },
            { nom: "Croissance BPA", valeur: ratios.epsGrowth, seuil: SEUILS.epsGrowth, format: (v) => (v * 100).toFixed(1) + "%" },
            { nom: "Prix vs MM200", valeur: ratios.priceVsMA200, seuil: SEUILS.priceVsMA200, format: (v) => (v * 100).toFixed(1) + "%" }
        ]
    };

    let html = '';
    
    for (const [categorie, ratiosCategorie] of Object.entries(categories)) {
        // Ligne de catégorie
        html += `<tr class="category-row"><td colspan="5"><strong>${categorie}</strong></td></tr>`;
        
        // Lignes de ratios
        ratiosCategorie.forEach(ratio => {
            const valeurFormatee = ratio.format(ratio.valeur);
            const seuilFormate = ratio.seuil.bon;
            const verdict = getVerdict(ratio.valeur, ratio.seuil, ratio.nom);
            const classe = getClasseVerdict(verdict);
            
            html += `
                <tr class="${classe}">
                    <td>${categorie}</td>
                    <td>${ratio.nom}</td>
                    <td>${valeurFormatee}</td>
                    <td>${seuilFormate}</td>
                    <td><strong>${verdict}</strong></td>
                </tr>
            `;
        });
    }
    
    return html;
}

function getVerdict(valeur, seuil, nomRatio) {
    // Logique spéciale pour certains ratios où "moins est mieux"
    const ratiosInverses = ['debtToEquity', 'peRatio', 'pegRatio', 'pbRatio', 'pfcfRatio', 'evEbitda'];
    
    if (ratiosInverses.includes(nomRatio.toLowerCase().replace(/[^a-zA-Z]/g, ''))) {
        if (valeur <= seuil.excellent) return 'EXCELLENT';
        if (valeur <= seuil.bon) return 'BON';
        return 'MAUVAIS';
    }
    
    // Logique normale (plus c'est haut, mieux c'est)
    if (valeur >= seuil.excellent) return 'EXCELLENT';
    if (valeur >= seuil.bon) return 'BON';
    return 'MAUVAIS';
}

function getClasseVerdict(verdict) {
    switch(verdict) {
        case 'EXCELLENT': return 'ratio-good';
        case 'BON': return 'ratio-neutral';
        case 'MAUVAIS': return 'ratio-bad';
        default: return '';
    }
}

function genererConclusion(ratios) {
    const bonsRatios = Object.values(ratios).filter(ratio => 
        ratio >= Object.values(SEUILS).find(s => s.bon).bon
    ).length;
    
    const totalRatios = Object.keys(ratios).length;
    const pourcentageBons = (bonsRatios / totalRatios) * 100;
    
    let conclusionHTML = '';
    let conclusionClasse = '';
    
    if (pourcentageBons >= 70) {
        conclusionClasse = 'conclusion-good';
        conclusionHTML = `
            <div class="conclusion ${conclusionClasse}">
                <h3>🚀 ANALYSE POSITIVE - ACTION INTÉRESSANTE</h3>
                <p><strong>${pourcentageBons.toFixed(0)}% des indicateurs sont au vert.</strong></p>
                <p>L'entreprise montre une santé financière solide, une rentabilité correcte et une évaluation raisonnable.</p>
                <p><em>Recommandation : À étudier sérieusement pour un investissement.</em></p>
            </div>
        `;
    } else if (pourcentageBons >= 50) {
        conclusionClasse = 'conclusion-neutral';
        conclusionHTML = `
            <div class="conclusion ${conclusionClasse}">
                <h3>⚠️ ANALYSE MITIGÉE - À APPROFONDIR</h3>
                <p><strong>${pourcentageBons.toFixed(0)}% des indicateurs sont acceptables.</strong></p>
                <p>L'entreprise présente des points forts mais aussi des faiblesses significatives.</p>
                <p><em>Recommandation : Analyser plus en détail les points faibles avant toute décision.</em></p>
            </div>
        `;
    } else {
        conclusionClasse = 'conclusion-bad';
        conclusionHTML = `
            <div class="conclusion ${conclusionClasse}">
                <h3>💀 ANALYSE NÉGATIVE - FUIR</h3>
                <p><strong>Seulement ${pourcentageBons.toFixed(0)}% des indicateurs sont bons.</strong></p>
                <p>L'entreprise présente trop de risques : santé financière fragile, rentabilité faible ou évaluation trop élevée.</p>
                <p><em>Recommandation : Éviter cette action. Il y a de meilleures opportunités sur le marché.</em></p>
            </div>
        `;
    }
    
    document.getElementById('conclusion').innerHTML = conclusionHTML;
}
