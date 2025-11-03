// Ajouter cette fonction pour gérer les onglets
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Retirer active de tous
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Activer l'onglet cliqué
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab') + '-tab';
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Appeler l'initialisation des onglets au chargement
document.addEventListener('DOMContentLoaded', initTabs);

// Seuils et configuration
const SEUILS = {
    currentRatio: { bon: 1.5, excellent: 2.0 },
    debtToEquity: { bon: 0.5, excellent: 0.3 },
    interestCoverage: { bon: 5, excellent: 8 },
    freeCashFlow: { bon: 0, excellent: 100000 },
    
    roe: { bon: 0.15, excellent: 0.20 },
    roic: { bon: 0.12, excellent: 0.15 },
    netMargin: { bon: 0.10, excellent: 0.15 },
    operatingMargin: { bon: 0.15, excellent: 0.20 },
    
    peRatio: { bon: 15, excellent: 12 },
    pegRatio: { bon: 1, excellent: 0.8 },
    pbRatio: { bon: 1.5, excellent: 1.2 },
    pfcfRatio: { bon: 20, excellent: 15 },
    dividendYield: { bon: 0.02, excellent: 0.03 },
    evEbitda: { bon: 12, excellent: 8 },
    
    revenueGrowth: { bon: 0.08, excellent: 0.12 },
    epsGrowth: { bon: 0.10, excellent: 0.15 },
    priceVsMA200: { bon: 0, excellent: 0.05 }
};

function lancerAnalyse() {
    const inputs = getInputValues();
    const ratios = calculerRatios(inputs);
    const scores = calculerScores(ratios);
    
    afficherResultats(inputs.companyName, ratios, scores);
    afficherScores(scores);
    genererConclusion(scores);
    
    // Scroll vers les résultats
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

function getInputValues() {
    // Même fonction que précédemment
    return {
        currentAssets: parseFloat(document.getElementById('currentAssets').value) || 0,
        currentLiabilities: parseFloat(document.getElementById('currentLiabilities').value) || 0,
        totalDebt: parseFloat(document.getElementById('totalDebt').value) || 0,
        shareholdersEquity: parseFloat(document.getElementById('shareholdersEquity').value) || 0,
        ebit: parseFloat(document.getElementById('ebit').value) || 0,
        interestExpense: parseFloat(document.getElementById('interestExpense').value) || 0,
        operatingCashFlow: parseFloat(document.getElementById('operatingCashFlow').value) || 0,
        capitalExpenditures: parseFloat(document.getElementById('capitalExpenditures').value) || 0,
        
        netIncome: parseFloat(document.getElementById('netIncome').value) || 0,
        revenue: parseFloat(document.getElementById('revenue').value) || 0,
        nopat: parseFloat(document.getElementById('nopat').value) || 0,
        
        sharePrice: parseFloat(document.getElementById('sharePrice').value) || 0,
        sharesOutstanding: parseFloat(document.getElementById('sharesOutstanding').value) || 0,
        bookValuePerShare: parseFloat(document.getElementById('bookValuePerShare').value) || 0,
        dividendPerShare: parseFloat(document.getElementById('dividendPerShare').value) || 0,
        epsGrowth: parseFloat(document.getElementById('epsGrowth').value) || 0,
        ebitda: parseFloat(document.getElementById('ebitda').value) || 0,
        cash: parseFloat(document.getElementById('cash').value) || 0,
        
        revenueGrowth: parseFloat(document.getElementById('revenueGrowth').value) || 0,
        previousEPS: parseFloat(document.getElementById('previousEPS').value) || 0,
        priceVsMA200: parseFloat(document.getElementById('priceVsMA200').value) || 0,
        
        companyName: document.getElementById('companyName').value || "Entreprise sans nom"
    };
}

function calculerRatios(inputs) {
    // Même fonction de calcul que précédemment
    const marketCap = inputs.sharePrice * inputs.sharesOutstanding;
    const enterpriseValue = marketCap + inputs.totalDebt - inputs.cash;
    const currentEPS = inputs.netIncome / inputs.sharesOutstanding;
    const peRatio = inputs.sharePrice / currentEPS;
    
    return {
        currentRatio: inputs.currentAssets / inputs.currentLiabilities,
        debtToEquity: inputs.totalDebt / inputs.shareholdersEquity,
        interestCoverage: inputs.ebit / inputs.interestExpense,
        freeCashFlow: inputs.operatingCashFlow - inputs.capitalExpenditures,
        
        roe: inputs.netIncome / inputs.shareholdersEquity,
        roic: inputs.nopat / (inputs.totalDebt + inputs.shareholdersEquity),
        netMargin: inputs.netIncome / inputs.revenue,
        operatingMargin: inputs.ebit / inputs.revenue,
        
        peRatio: peRatio,
        pegRatio: peRatio / inputs.epsGrowth,
        pbRatio: inputs.sharePrice / inputs.bookValuePerShare,
        pfcfRatio: marketCap / (inputs.operatingCashFlow - inputs.capitalExpenditures),
        dividendYield: inputs.dividendPerShare / inputs.sharePrice,
        evEbitda: enterpriseValue / inputs.ebitda,
        
        revenueGrowth: inputs.revenueGrowth / 100,
        epsGrowth: inputs.epsGrowth / 100,
        priceVsMA200: inputs.priceVsMA200 / 100
    };
}

function calculerScores(ratios) {
    const categories = {
        sante: ['currentRatio', 'debtToEquity', 'interestCoverage', 'freeCashFlow'],
        rentabilite: ['roe', 'roic', 'netMargin', 'operatingMargin'],
        evaluation: ['peRatio', 'pegRatio', 'pbRatio', 'pfcfRatio', 'dividendYield', 'evEbitda'],
        croissance: ['revenueGrowth', 'epsGrowth', 'priceVsMA200']
    };

    const scores = {};

    for (const [categorie, indicateurs] of Object.entries(categories)) {
        let scoreCategorie = 0;
        let totalPoids = 0;

        indicateurs.forEach(indicateur => {
            const valeur = ratios[indicateur];
            const seuil = SEUILS[indicateur];
            const poids = 1; // Tu peux ajuster les poids si nécessaire

            let score = 0;
            const ratiosInverses = ['debtToEquity', 'peRatio', 'pegRatio', 'pbRatio', 'pfcfRatio', 'evEbitda'];
            const estInverse = ratiosInverses.includes(indicateur);

            if (estInverse) {
                if (valeur <= seuil.excellent) score = 100;
                else if (valeur <= seuil.bon) score = 70;
                else score = 30;
            } else {
                if (valeur >= seuil.excellent) score = 100;
                else if (valeur >= seuil.bon) score = 70;
                else score = 30;
            }

            scoreCategorie += score * poids;
            totalPoids += poids;
        });

        scores[categorie] = Math.round(scoreCategorie / totalPoids);
    }

    // Score global (moyenne pondérée)
    scores.global = Math.round(
        (scores.sante + scores.rentabilite + scores.evaluation + scores.croissance) / 4
    );

    return scores;
}

function afficherScores(scores) {
    // Score global
    document.getElementById('globalScore').textContent = scores.global + '%';
    const scoreCircle = document.querySelector('.score-circle');
    scoreCircle.style.background = `conic-gradient(var(--primary) ${scores.global}%, var(--border) ${scores.global}%)`;

    // Scores par catégorie
    document.getElementById('healthScore').style.width = scores.sante + '%';
    document.getElementById('healthValue').textContent = scores.sante + '%';

    document.getElementById('profitabilityScore').style.width = scores.rentabilite + '%';
    document.getElementById('profitabilityValue').textContent = scores.rentabilite + '%';

    document.getElementById('valuationScore').style.width = scores.evaluation + '%';
    document.getElementById('valuationValue').textContent = scores.evaluation + '%';

    document.getElementById('growthScore').style.width = scores.croissance + '%';
    document.getElementById('growthValue').textContent = scores.croissance + '%';
}

function afficherResultats(companyName, ratios, scores) {
    document.getElementById('resultsCompanyName').textContent = companyName;
    
    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Catégorie</th>
                    <th>Indicateur</th>
                    <th>Valeur</th>
                    <th>Seuil</th>
                    <th>Performance</th>
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
            { nom: "Couverture des Intérêts", valeur: ratios.interestCoverage, seuil: SEUILS.interestCoverage, format: (v) => v.toFixed(1) + "x" },
            { nom: "Free Cash Flow", valeur: ratios.freeCashFlow, seuil: SEUILS.freeCashFlow, format: (v) => v.toLocaleString('fr-FR') + " €" }
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
    
    for (const [categorie, indicateurs] of Object.entries(categories)) {
        indicateurs.forEach(indicateur => {
            const valeurFormatee = indicateur.format(indicateur.valeur);
            const seuilFormate = indicateur.seuil.bon;
            const verdict = getVerdict(indicateur.valeur, indicateur.seuil, indicateur.nom);
            const classe = getClasseVerdict(verdict);
            
            html += `
                <tr class="${classe}">
                    <td><strong>${categorie}</strong></td>
                    <td>${indicateur.nom}</td>
                    <td>${valeurFormatee}</td>
                    <td>${seuilFormate}</td>
                    <td>${verdict}</td>
                </tr>
            `;
        });
    }
    
    return html;
}

function getVerdict(valeur, seuil, nomRatio) {
    const ratiosInverses = ['debtToEquity', 'peRatio', 'pegRatio', 'pbRatio', 'pfcfRatio', 'evEbitda'];
    const nomCle = nomRatio.toLowerCase().replace(/[^a-zA-Z]/g, '');
    
    if (ratiosInverses.includes(nomCle)) {
        if (valeur <= seuil.excellent) return 'Excellent';
        if (valeur <= seuil.bon) return 'Bon';
        return 'Faible';
    }
    
    if (valeur >= seuil.excellent) return 'Excellent';
    if (valeur >= seuil.bon) return 'Bon';
    return 'Faible';
}

function getClasseVerdict(verdict) {
    switch(verdict) {
        case 'Excellent': return 'ratio-excellent';
        case 'Bon': return 'ratio-good';
        case 'Faible': return 'ratio-bad';
        default: return '';
    }
}

function genererConclusion(scores) {
    const scoreGlobal = scores.global;
    
    let conclusionHTML = '';
    let conclusionClasse = '';
    
    if (scoreGlobal >= 80) {
        conclusionClasse = 'conclusion-good';
        conclusionHTML = `
            <h3><i class="fas fa-trophy"></i> EXCELLENTE OPPORTUNITÉ</h3>
            <p><strong>Score global: ${scoreGlobal}%</strong> - L'entreprise présente des fondamentaux solides</p>
            <p>✅ Santé financière robuste | ✅ Rentabilité élevée | ✅ Évaluation attractive | ✅ Croissance soutenue</p>
            <p><em>Recommandation: Cette action mérite une place dans votre portefeuille.</em></p>
        `;
    } else if (scoreGlobal >= 65) {
        conclusionClasse = 'conclusion-neutral';
        conclusionHTML = `
            <h3><i class="fas fa-chart-line"></i> OPPORTUNITÉ MODÉRÉE</h3>
            <p><strong>Score global: ${scoreGlobal}%</strong> - L'entreprise a des points forts mais aussi des faiblesses</p>
            <p>⚠️ Analysez les points faibles avant d'investir</p>
            <p><em>Recommandation: À étudier plus en détail, pourrait convenir pour une allocation mineure.</em></p>
        `;
    } else {
        conclusionClasse = 'conclusion-bad';
        conclusionHTML = `
            <h3><i class="fas fa-exclamation-triangle"></i> OPPORTUNITÉ RISQUÉE</h3>
            <p><strong>Score global: ${scoreGlobal}%</strong> - L'entreprise présente trop de risques</p>
            <p>❌ Santé financière fragile | ❌ Rentabilité faible | ❌ Évaluation élevée | ❌ Croissance insuffisante</p>
            <p><em>Recommandation: Éviter cette action. De meilleures opportunités existent sur le marché.</em></p>
        `;
    }
    
    const conclusionElement = document.getElementById('conclusion');
    conclusionElement.className = `conclusion-card ${conclusionClasse}`;
    conclusionElement.innerHTML = conclusionHTML;
}
