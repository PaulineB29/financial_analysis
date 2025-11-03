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
        companyName: 'h1',
        
        // Bilan
        totalAssets: '.financial-section .balance-sheet td:contains("Total Assets") + td',
        currentAssets: '.financial-section .balance-sheet td:contains("Total Current Assets") + td',
        currentLiabilities: '.financial-section .balance-sheet td:contains("Total Current Liabilities") + td',
        totalDebt: '.financial-section .balance-sheet td:contains("Total Debt") + td, .financial-section .balance-sheet td:contains("Long Term Debt") + td',
        shareholdersEquity: '.financial-section .balance-sheet td:contains("Total Equity") + td, .financial-section .balance-sheet td:contains("Stockholders Equity") + td',
        cash: '.financial-section .balance-sheet td:contains("Cash") + td, .financial-section .balance-sheet td:contains("Cash & Equivalents") + td',
        
        // Compte de résultat
        revenue: '.financial-section .income-statement td:contains("Total Revenue") + td, .financial-section .income-statement td:contains("Revenue") + td',
        ebit: '.financial-section .income-statement td:contains("Operating Income") + td, .financial-section .income-statement td:contains("EBIT") + td',
        ebitda: '.financial-section .income-statement td:contains("EBITDA") + td',
        netIncome: '.financial-section .income-statement td:contains("Net Income") + td',
        interestExpense: '.financial-section .income-statement td:contains("Interest Expense") + td',
        
        // Flux de trésorerie
        operatingCashFlow: '.financial-section .cash-flow td:contains("Operating Cash Flow") + td, .financial-section .cash-flow td:contains("Cash from Operations") + td',
        capitalExpenditures: '.financial-section .cash-flow td:contains("Capital Expenditures") + td',
        
        // Données de marché (sur la page principale)
        sharePrice: '#last_last',
        marketCap: '.inlineblock span:contains("Market Cap") + span',
        
        // Ratios
        peRatio: '.summary div:contains("P/E Ratio") + span',
        eps: '.summary div:contains("EPS") + span',
        dividendYield: '.summary div:contains("Dividend Yield") + span'
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
            Utils.showStatus('Tentative de connexion à Investing.com...', 'loading');

            // Essayer différentes méthodes
            const data = await this.tryMultipleMethods(link);
            
            if (data) {
                this.fillFormWithData(data);
                Utils.showStatus('Données récupérées avec succès!', 'success');
            } else {
                Utils.showStatus('Impossible de récupérer les données automatiquement. Veuillez les saisir manuellement.', 'info');
            }
            
        } catch (error) {
            console.error('Erreur lors de la récupération:', error);
            Utils.showStatus(`Erreur: ${error.message}`, 'error');
        } finally {
            this.setFetchButtonState(fetchBtn, false);
        }
    },

    async tryMultipleMethods(link) {
        // Méthode 1: API ScrapingBee (plus fiable)
        try {
            const data = await this.scrapingBeeMethod(link);
            if (data) return data;
        } catch (e) {
            console.log('Méthode ScrapingBee échouée:', e);
        }

        // Méthode 2: Proxy classique
        try {
            const data = await this.proxyMethod(link);
            if (data) return data;
        } catch (e) {
            console.log('Méthode proxy échouée:', e);
        }

        return null;
    },

    async scrapingBeeMethod(link) {
        // Utiliser ScrapingBee (service payant mais fiable)
        const apiKey = ''; // À configurer si vous avez un compte
        if (!apiKey) throw new Error('Clé API ScrapingBee non configurée');
        
        const response = await fetch(
            `https://app.scrapingbee.com/api/v1/?api_key=${apiKey}&url=${encodeURIComponent(link)}&render_js=false`
        );
        
        if (!response.ok) throw new Error('ScrapingBee error');
        
        const html = await response.text();
        return this.parseHTMLAndExtractData(html);
    },

    async proxyMethod(link) {
        // Essayer différents proxies publics
        const proxies = [
            'https://api.allorigins.win/raw?url=',
            'https://cors-anywhere.herokuapp.com/',
            'https://corsproxy.io/?'
        ];

        for (const proxy of proxies) {
            try {
                const response = await fetch(proxy + encodeURIComponent(link), {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    },
                    timeout: 10000
                });

                if (response.ok) {
                    const html = await response.text();
                    return this.parseHTMLAndExtractData(html);
                }
            } catch (e) {
                console.log(`Proxy ${proxy} échoué:`, e);
                continue;
            }
        }
        
        throw new Error('Tous les proxies ont échoué');
    },

    parseHTMLAndExtractData(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Méthode améliorée d'extraction
        const data = this.extractDataWithFallbacks(doc);
        
        // Vérifier si on a récupéré des données significatives
        const hasValidData = Object.values(data).some(value => value !== null && value !== 0);
        
        return hasValidData ? data : null;
    },

    extractDataWithFallbacks(doc) {
        const data = {};

        // Extraire le nom de l'entreprise
        data.companyName = this.extractCompanyName(doc);

        // Extraire les données financières avec différentes méthodes
        data.revenue = this.extractFinancialData(doc, ['Revenue', 'Total Revenue', 'Sales']);
        data.netIncome = this.extractFinancialData(doc, ['Net Income', 'Net Profit']);
        data.ebit = this.extractFinancialData(doc, ['EBIT', 'Operating Income']);
        data.ebitda = this.extractFinancialData(doc, ['EBITDA']);
        data.totalAssets = this.extractFinancialData(doc, ['Total Assets']);
        data.currentAssets = this.extractFinancialData(doc, ['Current Assets', 'Total Current Assets']);
        data.currentLiabilities = this.extractFinancialData(doc, ['Current Liabilities', 'Total Current Liabilities']);
        data.totalDebt = this.extractFinancialData(doc, ['Total Debt', 'Long Term Debt']);
        data.shareholdersEquity = this.extractFinancialData(doc, ['Total Equity', 'Stockholders Equity']);
        data.cash = this.extractFinancialData(doc, ['Cash', 'Cash & Equivalents']);
        data.operatingCashFlow = this.extractFinancialData(doc, ['Operating Cash Flow', 'Cash from Operations']);
        data.capitalExpenditures = this.extractFinancialData(doc, ['Capital Expenditures']);
        
        // Données de marché
        data.sharePrice = this.extractSharePrice(doc);
        data.marketCap = this.extractMarketCap(doc);
        data.peRatio = this.extractRatio(doc, ['P/E Ratio', 'P/E']);
        data.eps = this.extractRatio(doc, ['EPS', 'Earnings Per Share']);
        data.dividendYield = this.extractRatio(doc, ['Dividend Yield', 'Yield']);

        return data;
    },

    extractCompanyName(doc) {
        // Plusieurs méthodes pour trouver le nom
        const selectors = [
            'h1',
            '.instrument-header_title__2r7Xy',
            '.text-2xl.font-bold',
            '[data-test="instrument-header-title"]'
        ];

        for (const selector of selectors) {
            const element = doc.querySelector(selector);
            if (element && element.textContent.trim()) {
                return element.textContent.trim();
            }
        }

        return null;
    },

    extractFinancialData(doc, keywords) {
        // Chercher dans les tables financières
        const tables = doc.querySelectorAll('table');
        
        for (const table of tables) {
            const rows = table.querySelectorAll('tr');
            
            for (const row of rows) {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 2) {
                    const label = cells[0].textContent.trim();
                    
                    // Vérifier si le label correspond à un des keywords
                    if (keywords.some(keyword => 
                        label.toLowerCase().includes(keyword.toLowerCase()))) {
                        
                        // Prendre la dernière valeur (la plus récente)
                        const valueCell = cells[cells.length - 1];
                        return Utils.parseFinancialText(valueCell.textContent);
                    }
                }
            }
        }
        
        return null;
    },

    extractSharePrice(doc) {
        const selectors = [
            '#last_last',
            '[data-test="instrument-price-last"]',
            '.text-5xl.font-bold',
            '.instrument-price_instrument-price__3uw25'
        ];

        for (const selector of selectors) {
            const element = doc.querySelector(selector);
            if (element) {
                return Utils.parseFinancialText(element.textContent);
            }
        }
        
        return null;
    },

    extractMarketCap(doc) {
        return this.extractRatio(doc, ['Market Cap', 'Market Capitalization']);
    },

    extractRatio(doc, keywords) {
        // Chercher dans les divs de ratio/summary
        const elements = doc.querySelectorAll('div, span');
        
        for (const element of elements) {
            const text = element.textContent.trim();
            if (keywords.some(keyword => 
                text.toLowerCase().includes(keyword.toLowerCase()))) {
                
                // Trouver l'élément frère ou parent contenant la valeur
                const valueElement = element.nextElementSibling || 
                                   element.parentElement.querySelector('span:last-child');
                
                if (valueElement) {
                    return Utils.parseFinancialText(valueElement.textContent);
                }
            }
        }
        
        return null;
    },

    fillFormWithData(data) {
        // Remplir le nom de l'entreprise
        if (data.companyName) {
            const companyNameInput = document.getElementById('companyName');
            if (companyNameInput) companyNameInput.value = data.companyName;
        }

        // Mapper les données aux champs du formulaire
        const fieldMap = {
            currentAssets: 'currentAssets',
            currentLiabilities: 'currentLiabilities', 
            totalDebt: 'totalDebt',
            shareholdersEquity: 'shareholdersEquity',
            cash: 'cash',
            revenue: 'revenue',
            ebit: 'ebit',
            ebitda: 'ebitda',
            netIncome: 'netIncome',
            operatingCashFlow: 'operatingCashFlow',
            capitalExpenditures: 'capitalExpenditures',
            sharePrice: 'sharePrice'
        };

        Object.entries(fieldMap).forEach(([dataKey, fieldId]) => {
            const value = data[dataKey];
            const input = document.getElementById(fieldId);
            
            if (input && value !== null && !isNaN(value)) {
                input.value = value;
            }
        });

        // Calculer les valeurs dérivées
        this.calculateDerivedValues(data);
    },

    calculateDerivedValues(data) {
        // Estimer le nombre d'actions si marketCap et sharePrice sont disponibles
        if (data.marketCap && data.sharePrice && data.sharePrice > 0) {
            const sharesOutstanding = data.marketCap / data.sharePrice;
            const sharesInput = document.getElementById('sharesOutstanding');
            if (sharesInput) sharesInput.value = Math.round(sharesOutstanding);
        }

        // Calculer le book value per share
        if (data.shareholdersEquity && data.marketCap && data.sharePrice) {
            const shares = data.marketCap / data.sharePrice;
            const bookValuePerShare = data.shareholdersEquity / shares;
            const bvpsInput = document.getElementById('bookValuePerShare');
            if (bvpsInput) bvpsInput.value = Math.round(bookValuePerShare * 100) / 100;
        }

        // Estimer le NOPAT (EBIT * 0.75 pour 25% d'impôt)
        if (data.ebit) {
            const nopatInput = document.getElementById('nopat');
            if (nopatInput) nopatInput.value = Math.round(data.ebit * 0.75);
        }

        // Remplir le P/E ratio si disponible
        if (data.peRatio) {
            const peInput = document.getElementById('peRatio');
            if (peInput) peInput.value = data.peRatio;
        }
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
    
    // Mettre à jour le placeholder du champ lien
    const investingLink = document.getElementById('investingLink');
    if (investingLink) {
        investingLink.placeholder = "https://www.investing.com/equities/...";
        investingLink.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                InvestingScraper.recupererDonneesFinancieres();
            }
        });
    }
});
