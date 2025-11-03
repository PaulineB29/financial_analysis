// Configuration et constantes
const CONFIG = {
    SEUILS: {
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
    },

    // Sélecteurs spécifiques à Investing.com
    INVESTING_SELECTORS: {
        companyName: 'h1[data-test="instrument-header-title"]',
        
        // Données du bilan
        currentAssets: '[data-test="currentAssets"]',
        currentLiabilities: '[data-test="currentLiabilities"]',
        totalDebt: '[data-test="totalDebt"]',
        shareholdersEquity: '[data-test="totalEquity"]',
        cash: '[data-test="cashAndShortTermInvestments"]',
        
        // Données du compte de résultat
        revenue: '[data-test="totalRevenue"]',
        ebit: '[data-test="ebit"]',
        ebitda: '[data-test="ebitda"]',
        netIncome: '[data-test="netIncome"]',
        interestExpense: '[data-test="interestExpense"]',
        
        // Données des flux de trésorerie
        operatingCashFlow: '[data-test="operatingCashFlow"]',
        capitalExpenditures: '[data-test="capitalExpenditure"]',
        
        // Données de marché
        sharePrice: '[data-test="instrument-price-last"]',
        sharesOutstanding: '[data-test="sharesOutstanding"]',
        dividendPerShare: '[data-test="dividendPerShare"]',
        
        // Ratios et croissance
        bookValuePerShare: '[data-test="bookValuePerShare"]',
        epsGrowth: '[data-test="epsGrowth"]',
        revenueGrowth: '[data-test="revenueGrowth"]'
    },

    CATEGORIES: {
        sante: ['currentRatio', 'debtToEquity', 'interestCoverage', 'freeCashFlow'],
        rentabilite: ['roe', 'roic', 'netMargin', 'operatingMargin'],
        evaluation: ['peRatio', 'pegRatio', 'pbRatio', 'pfcfRatio', 'dividendYield', 'evEbitda'],
        croissance: ['revenueGrowth', 'epsGrowth', 'priceVsMA200']
    },

    RATIOS_INVERSES: ['debtToEquity', 'peRatio', 'pegRatio', 'pbRatio', 'pfcfRatio', 'evEbitda']
};

// Utilitaires
const Utils = {
    formatFinancialValue(value, isPercentage = false) {
        if (value === null || isNaN(value)) return null;
        return isPercentage ? value : Math.round(value);
    },

    parseFinancialText(text, isPercentage = false) {
        if (!text) return null;

        let cleanedText = text.trim()
            .replace(/\s+/g, '')
            .replace(/[$,€]/g, '')
            .replace(/%/g, '')
            .replace(/,/g, '.');

        // Gérer les suffixes (K, M, B, T)
        const multiplier = {
            'k': 1000, 'K': 1000,
            'm': 1000000, 'M': 1000000,
            'b': 1000000000, 'B': 1000000000,
            't': 1000000000000, 'T': 1000000000000
        };

        const suffix = cleanedText.slice(-1);
        if (multiplier[suffix]) {
            cleanedText = parseFloat(cleanedText.slice(0, -1)) * multiplier[suffix];
        } else {
            cleanedText = parseFloat(cleanedText);
        }

        return this.formatFinancialValue(cleanedText, isPercentage);
    },

    getVerdict(valeur, seuil, nomRatio) {
        const nomCle = nomRatio.toLowerCase().replace(/[^a-zA-Z]/g, '');
        const estInverse = CONFIG.RATIOS_INVERSES.includes(nomCle);
        
        if (estInverse) {
            if (valeur <= seuil.excellent) return 'Excellent';
            if (valeur <= seuil.bon) return 'Bon';
            return 'Faible';
        }
        
        if (valeur >= seuil.excellent) return 'Excellent';
        if (valeur >= seuil.bon) return 'Bon';
        return 'Faible';
    },

    getClasseVerdict(verdict) {
        const classes = {
            'Excellent': 'ratio-excellent',
            'Bon': 'ratio-good',
            'Faible': 'ratio-bad'
        };
        return classes[verdict] || '';
    },

    showStatus(message, type) {
        const statusDiv = document.getElementById('fetchStatus');
        if (!statusDiv) return;

        statusDiv.textContent = message;
        statusDiv.className = `fetch-status ${type}`;
        
        setTimeout(() => {
            statusDiv.textContent = '';
            statusDiv.className = 'fetch-status';
        }, 5000);
    }
};

// Gestion de l'interface utilisateur
const UI = {
    initTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                btn.classList.add('active');
                const tabId = btn.getAttribute('data-tab') + '-tab';
                document.getElementById(tabId)?.classList.add('active');
            });
        });
    },

    initYearSelector() {
        const yearSelect = document.getElementById('dataYear');
        if (!yearSelect) return;

        const currentYear = new Date().getFullYear();
        
        for (let i = currentYear; i >= currentYear - 4; i--) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (i === currentYear) option.selected = true;
            yearSelect.appendChild(option);
        }
    },

    toggleQuarterField() {
        const periodType = document.getElementById('periodType')?.value;
        const quarterField = document.getElementById('quarterField');
        if (!quarterField) return;

        quarterField.style.display = periodType === 'quarterly' ? 'block' : 'none';
    },

    afficherScores(scores) {
        const globalScoreElement = document.getElementById('globalScore');
        const scoreCircle = document.querySelector('.score-circle');
        
        if (globalScoreElement) {
            globalScoreElement.textContent = scores.global + '%';
        }
        if (scoreCircle) {
            scoreCircle.style.background = `conic-gradient(var(--primary) ${scores.global}%, var(--border) ${scores.global}%)`;
        }

        const scoreElements = {
            sante: 'healthScore',
            rentabilite: 'profitabilityScore',
            evaluation: 'valuationScore',
            croissance: 'growthScore'
        };

        Object.entries(scoreElements).forEach(([key, prefix]) => {
            const barElement = document.getElementById(prefix);
            const valueElement = document.getElementById(prefix.replace('Score', 'Value'));
            
            if (barElement) barElement.style.width = scores[key] + '%';
            if (valueElement) valueElement.textContent = scores[key] + '%';
        });
    },

    genererConclusion(scores) {
        const scoreGlobal = scores.global;
        const conclusionElement = document.getElementById('conclusion');
        if (!conclusionElement) return;

        let conclusionHTML, conclusionClasse;

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

        conclusionElement.className = `conclusion-card ${conclusionClasse}`;
        conclusionElement.innerHTML = conclusionHTML;
    }
};

// Gestion des données financières
const FinancialData = {
    getInputValues() {
        const periodType = document.getElementById('periodType')?.value || 'annual';
        const year = document.getElementById('dataYear')?.value || new Date().getFullYear();
        const quarter = document.getElementById('dataQuarter')?.value || 'Q1';
        
        const periodDisplay = periodType === 'quarterly' 
            ? `${quarter} ${year}` 
            : `année ${year}`;

        const fields = [
            'currentAssets', 'currentLiabilities', 'totalDebt', 'shareholdersEquity',
            'ebit', 'interestExpense', 'operatingCashFlow', 'capitalExpenditures',
            'netIncome', 'revenue', 'nopat', 'sharePrice', 'sharesOutstanding',
            'bookValuePerShare', 'dividendPerShare', 'epsGrowth', 'ebitda', 'cash',
            'revenueGrowth', 'previousEPS', 'priceVsMA200'
        ];

        const data = {
            companyName: document.getElementById('companyName')?.value || "Entreprise sans nom",
            periodType,
            year,
            quarter,
            periodDisplay
        };

        fields.forEach(field => {
            const element = document.getElementById(field);
            data[field] = element ? parseFloat(element.value) || 0 : 0;
        });

        return data;
    },

    calculerRatios(inputs) {
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
    },

    calculerScores(ratios) {
        const scores = {};

        for (const [categorie, indicateurs] of Object.entries(CONFIG.CATEGORIES)) {
            let scoreCategorie = 0;
            let totalPoids = 0;

            indicateurs.forEach(indicateur => {
                const valeur = ratios[indicateur];
                const seuil = CONFIG.SEUILS[indicateur];
                const poids = 1;

                let score = 0;
                const estInverse = CONFIG.RATIOS_INVERSES.includes(indicateur);

                if (estInverse) {
                    score = valeur <= seuil.excellent ? 100 : valeur <= seuil.bon ? 70 : 30;
                } else {
                    score = valeur >= seuil.excellent ? 100 : valeur >= seuil.bon ? 70 : 30;
                }

                scoreCategorie += score * poids;
                totalPoids += poids;
            });

            scores[categorie] = Math.round(scoreCategorie / totalPoids);
        }

        scores.global = Math.round(
            (scores.sante + scores.rentabilite + scores.evaluation + scores.croissance) / 4
        );

        return scores;
    }
};

// Récupération des données depuis Investing.com
const InvestingScraper = {
    async recupererDonneesFinancieres() {
        const link = document.getElementById('investingLink')?.value;
        const fetchBtn = document.getElementById('fetchDataBtn');
        
        if (!link) {
            Utils.showStatus('Veuillez entrer un lien Investing.com', 'error');
            return;
        }

        if (!link.includes('investing.com')) {
            Utils.showStatus('Le lien doit provenir du site Investing.com', 'error');
            return;
        }

        try {
            this.setFetchButtonState(fetchBtn, true);
            Utils.showStatus('Connexion à Investing.com...', 'loading');

            const html = await this.fetchInvestingData(link);
            const doc = this.parseHTML(html);
            
            this.extractAndFillData(doc);
            Utils.showStatus('Données financières récupérées avec succès!', 'success');
            
        } catch (error) {
            console.error('Erreur lors de la récupération:', error);
            Utils.showStatus(`Erreur: ${error.message}`, 'error');
        } finally {
            this.setFetchButtonState(fetchBtn, false);
        }
    },

    async fetchInvestingData(link) {
        // Investing.com a une protection CORS stricte, on utilise un proxy
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const response = await fetch(proxyUrl + encodeURIComponent(link), {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'fr-FR,fr;q=0.8,en-US;q=0.5,en;q=0.3'
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        return await response.text();
    },

    parseHTML(html) {
        const parser = new DOMParser();
        return parser.parseFromString(html, 'text/html');
    },

    setFetchButtonState(button, isLoading) {
        if (!button) return;

        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Récupération en cours...';
        } else {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-download"></i> Récupérer les données financières';
        }
    },

    extractAndFillData(doc) {
        // Récupérer le nom de l'entreprise
        const companyNameElement = doc.querySelector(CONFIG.INVESTING_SELECTORS.companyName);
        if (companyNameElement) {
            const companyNameInput = document.getElementById('companyName');
            if (companyNameInput) {
                companyNameInput.value = companyNameElement.textContent.trim();
            }
        }

        // Fonction helper pour extraire une donnée
        const extractData = (field, isPercentage = false) => {
            const selector = CONFIG.INVESTING_SELECTORS[field];
            if (!selector) return null;

            const element = doc.querySelector(selector);
            if (!element) return null;

            return Utils.parseFinancialText(element.textContent, isPercentage);
        };

        // Extraire et remplir les données de base
        const financialData = {
            // Données du bilan
            currentAssets: extractData('currentAssets'),
            currentLiabilities: extractData('currentLiabilities'),
            totalDebt: extractData('totalDebt'),
            shareholdersEquity: extractData('shareholdersEquity'),
            cash: extractData('cash'),
            
            // Données du compte de résultat
            revenue: extractData('revenue'),
            ebit: extractData('ebit'),
            ebitda: extractData('ebitda'),
            netIncome: extractData('netIncome'),
            interestExpense: extractData('interestExpense'),
            
            // Données des flux de trésorerie
            operatingCashFlow: extractData('operatingCashFlow'),
            capitalExpenditures: extractData('capitalExpenditures'),
            
            // Données de marché
            sharePrice: extractData('sharePrice'),
            sharesOutstanding: extractData('sharesOutstanding'),
            dividendPerShare: extractData('dividendPerShare'),
            
            // Ratios
            bookValuePerShare: extractData('bookValuePerShare'),
            epsGrowth: extractData('epsGrowth', true),
            revenueGrowth: extractData('revenueGrowth', true)
        };

        // Remplir les champs du formulaire
        Object.entries(financialData).forEach(([field, value]) => {
            const input = document.getElementById(field);
            if (input && value !== null && !isNaN(value)) {
                input.value = value;
            }
        });

        // Calculer le NOPAT (EBIT * (1 - taux d'imposition))
        // Pour une estimation simple, on utilise un taux d'imposition de 25%
        const ebitValue = financialData.ebit;
        if (ebitValue !== null && !isNaN(ebitValue)) {
            const nopatInput = document.getElementById('nopat');
            if (nopatInput) {
                nopatInput.value = Math.round(ebitValue * 0.75);
            }
        }
    }
};

// Fonctions principales de l'application
function lancerAnalyse() {
    const inputs = FinancialData.getInputValues();
    const ratios = FinancialData.calculerRatios(inputs);
    const scores = FinancialData.calculerScores(ratios);
    
    afficherResultats(inputs.companyName, inputs.periodDisplay, ratios, scores);
    UI.afficherScores(scores);
    UI.genererConclusion(scores);
    
    document.getElementById('resultsSection')?.scrollIntoView({ behavior: 'smooth' });
}

function afficherResultats(companyName, periodDisplay, ratios, scores) {
    const companyNameElement = document.getElementById('resultsCompanyName');
    const periodElement = document.getElementById('resultsPeriod');
    const resultsSection = document.getElementById('resultsSection');
    const resultsTable = document.getElementById('resultsTable');
    
    if (companyNameElement) companyNameElement.textContent = companyName;
    if (periodElement) periodElement.textContent = periodDisplay;
    if (resultsTable) resultsTable.innerHTML = genererLignesTableau(ratios);
    if (resultsSection) resultsSection.style.display = 'block';
}

function genererLignesTableau(ratios) {
    const categories = {
        "Santé Financière": [
            { nom: "Current Ratio", valeur: ratios.currentRatio, seuil: CONFIG.SEUILS.currentRatio, format: (v) => v.toFixed(2) },
            { nom: "Dette/Capitaux Propres", valeur: ratios.debtToEquity, seuil: CONFIG.SEUILS.debtToEquity, format: (v) => v.toFixed(2) },
            { nom: "Couverture des Intérêts", valeur: ratios.interestCoverage, seuil: CONFIG.SEUILS.interestCoverage, format: (v) => v.toFixed(1) + "x" },
            { nom: "Free Cash Flow", valeur: ratios.freeCashFlow, seuil: CONFIG.SEUILS.freeCashFlow, format: (v) => v.toLocaleString('fr-FR') + " €" }
        ],
        "Rentabilité": [
            { nom: "ROE", valeur: ratios.roe, seuil: CONFIG.SEUILS.roe, format: (v) => (v * 100).toFixed(1) + "%" },
            { nom: "ROIC", valeur: ratios.roic, seuil: CONFIG.SEUILS.roic, format: (v) => (v * 100).toFixed(1) + "%" },
            { nom: "Marge Nette", valeur: ratios.netMargin, seuil: CONFIG.SEUILS.netMargin, format: (v) => (v * 100).toFixed(1) + "%" },
            { nom: "Marge d'Exploitation", valeur: ratios.operatingMargin, seuil: CONFIG.SEUILS.operatingMargin, format: (v) => (v * 100).toFixed(1) + "%" }
        ],
        "Évaluation": [
            { nom: "P/E Ratio", valeur: ratios.peRatio, seuil: CONFIG.SEUILS.peRatio, format: (v) => v.toFixed(1) },
            { nom: "PEG Ratio", valeur: ratios.pegRatio, seuil: CONFIG.SEUILS.pegRatio, format: (v) => v.toFixed(2) },
            { nom: "P/B Ratio", valeur: ratios.pbRatio, seuil: CONFIG.SEUILS.pbRatio, format: (v) => v.toFixed(2) },
            { nom: "P/FCF Ratio", valeur: ratios.pfcfRatio, seuil: CONFIG.SEUILS.pfcfRatio, format: (v) => v.toFixed(1) },
            { nom: "Rendement Dividende", valeur: ratios.dividendYield, seuil: CONFIG.SEUILS.dividendYield, format: (v) => (v * 100).toFixed(2) + "%" },
            { nom: "EV/EBITDA", valeur: ratios.evEbitda, seuil: CONFIG.SEUILS.evEbitda, format: (v) => v.toFixed(1) }
        ],
        "Croissance": [
            { nom: "Croissance CA", valeur: ratios.revenueGrowth, seuil: CONFIG.SEUILS.revenueGrowth, format: (v) => (v * 100).toFixed(1) + "%" },
            { nom: "Croissance BPA", valeur: ratios.epsGrowth, seuil: CONFIG.SEUILS.epsGrowth, format: (v) => (v * 100).toFixed(1) + "%" },
            { nom: "Prix vs MM200", valeur: ratios.priceVsMA200, seuil: CONFIG.SEUILS.priceVsMA200, format: (v) => (v * 100).toFixed(1) + "%" }
        ]
    };

    let html = '';
    
    for (const [categorie, indicateurs] of Object.entries(categories)) {
        indicateurs.forEach(indicateur => {
            const valeurFormatee = indicateur.format(indicateur.valeur);
            const seuilFormate = indicateur.seuil.bon;
            const verdict = Utils.getVerdict(indicateur.valeur, indicateur.seuil, indicateur.nom);
            const classe = Utils.getClasseVerdict(verdict);
            
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

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    UI.initTabs();
    UI.initYearSelector();
    UI.toggleQuarterField();
    
    // Écouteur pour la touche Entrée sur le lien Investing
    const investingLink = document.getElementById('investingLink');
    if (investingLink) {
        investingLink.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                InvestingScraper.recupererDonneesFinancieres();
            }
        });
    }
});
