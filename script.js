// Seuils de référence pour l'analyse
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

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    mettreAJourDevise();
    
    // Écouter les changements de devise
    document.getElementById('currency').addEventListener('change', mettreAJourDevise);
});

// Gestion des onglets
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

// Gestionnaire de devise
function mettreAJourDevise() {
    const devise = document.getElementById('currency').value;
    const symboles = document.querySelectorAll('.currency-symbol');
    
    symboles.forEach(symbole => {
        switch(devise) {
            case 'USD': symbole.textContent = '$'; break;
            case 'GBP': symbole.textContent = '£'; break;
            case 'CHF': symbole.textContent = 'CHF'; break;
            default: symbole.textContent = '€';
        }
    });
}

// Fonction d'import des données
async function importerDonnees() {
    const url = document.getElementById('companyUrl').value;
    const annee = document.getElementById('dataYear').value;
    const devise = document.getElementById('currency').value;
    const statusElement = document.getElementById('importStatus');
    
    if (!url) {
        statusElement.innerHTML = '<div class="status-error"><i class="fas fa-exclamation-triangle"></i> Veuillez coller une URL valide</div>';
        return;
    }

    statusElement.innerHTML = '<div class="status-loading"><i class="fas fa-spinner fa-spin"></i> Import des données en cours...</div>';

    try {
        // Simulation d'import - À remplacer par un vrai service d'API
        const donnees = await simulerImportDonnees(url, annee, devise);
        
        // Pré-remplir les champs
        preRemplirChamps(donnees);
        
        statusElement.innerHTML = `<div class="status-success"><i class="fas fa-check-circle"></i> Données importées avec succès pour ${donnees.nom} (${annee})</div>`;
        
        // Mettre à jour la devise
        mettreAJourDevise();
        
    } catch (erreur) {
        statusElement.innerHTML = `<div class="status-error"><i class="fas fa-exclamation-triangle"></i> Erreur lors de l'import: ${erreur.message}</div>`;
    }
}

// Simulation d'import - À adapter avec une vraie API
async function simulerImportDonnees(url, annee, devise) {
    // Simulation de délai réseau
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Extraire le nom de l'entreprise de l'URL
    let nomEntreprise = "Entreprise Importée";
    if (url.includes('apple')) nomEntreprise = "Apple Inc.";
    if (url.includes('lvmh')) nomEntreprise = "LVMH";
    if (url.includes('airbus')) nomEntreprise = "Airbus";
    if (url.includes('tesla')) nomEntreprise = "Tesla Inc.";
    if (url.includes('microsoft')) nomEntreprise = "Microsoft Corp.";
    
    // Facteur de conversion devise (simulé)
    const tauxConversion = obtenirTauxConversion(devise);
    
    // Données simulées basées sur l'année
    const donneesParAnnee = {
        '2024': {
            nom: nomEntreprise,
            currentAssets: 143566 * tauxConversion,
            currentLiabilities: 145308 * tauxConversion,
            totalDebt: 111088 * tauxConversion,
            shareholdersEquity: 62146 * tauxConversion,
            ebit: 117669 * tauxConversion,
            interestExpense: 2693 * tauxConversion,
            operatingCashFlow: 116995 * tauxConversion,
            capitalExpenditures: 10715 * tauxConversion,
            netIncome: 96995 * tauxConversion,
            revenue: 383285 * tauxConversion,
            nopat: 94000 * tauxConversion,
            sharePrice: 185 * tauxConversion,
            sharesOutstanding: 15550000000,
            bookValuePerShare: 4.00 * tauxConversion,
            dividendPerShare: 0.96 * tauxConversion,
            epsGrowth: 7,
            ebitda: 130000 * tauxConversion,
            cash: 61555 * tauxConversion,
            revenueGrowth: 2,
            previousEPS: 6.10 * tauxConversion,
            priceVsMA200: 5
        },
        '2023': {
            nom: nomEntreprise,
            currentAssets: 135000 * tauxConversion,
            currentLiabilities: 140000 * tauxConversion,
            totalDebt: 120000 * tauxConversion,
            shareholdersEquity: 65000 * tauxConversion,
            ebit: 120000 * tauxConversion,
            interestExpense: 3000 * tauxConversion,
            operatingCashFlow: 110000 * tauxConversion,
            capitalExpenditures: 10000 * tauxConversion,
            netIncome: 100000 * tauxConversion,
            revenue: 383000 * tauxConversion,
            nopat: 95000 * tauxConversion,
            sharePrice: 170 * tauxConversion,
            sharesOutstanding: 16000000000,
            bookValuePerShare: 4.10 * tauxConversion,
            dividendPerShare: 0.96 * tauxConversion,
            epsGrowth: 10,
            ebitda: 130000 * tauxConversion,
            cash: 60000 * tauxConversion,
            revenueGrowth: 2,
            previousEPS: 6.10 * tauxConversion,
            priceVsMA200: 5
        },
        '2022': {
            nom: nomEntreprise,
            currentAssets: 125000 * tauxConversion,
            currentLiabilities: 130000 * tauxConversion,
            totalDebt: 110000 * tauxConversion,
            shareholdersEquity: 60000 * tauxConversion,
            ebit: 110000 * tauxConversion,
            interestExpense: 2500 * tauxConversion,
            operatingCashFlow: 105000 * tauxConversion,
            capitalExpenditures: 9000 * tauxConversion,
            netIncome: 95000 * tauxConversion,
            revenue: 365000 * tauxConversion,
            nopat: 90000 * tauxConversion,
            sharePrice: 150 * tauxConversion,
            sharesOutstanding: 16200000000,
            bookValuePerShare: 3.70 * tauxConversion,
            dividendPerShare: 0.88 * tauxConversion,
            epsGrowth: 8,
            ebitda: 120000 * tauxConversion,
            cash: 55000 * tauxConversion,
            revenueGrowth: 6,
            previousEPS: 5.80 * tauxConversion,
