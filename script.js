/**
 * MONOPOLY ULTIMATE BANKING - DIGITAL BANKING UNIT
 * Offline Digital Terminal Script
 */

(function () {
  'use strict';

  // ==========================================================================
  // PROPERTY DATABASE (Exact UK Monopoly Ultimate Banking Properties)
  // ==========================================================================

  const PROPERTY_DATABASE = [
    // Brown
    { id: 'old_kent_road', name: 'Old Kent Road', group: 'brown', price: 60, rent: 2, mortgage: 30, houseCost: 50 },
    { id: 'whitechapel_road', name: 'Whitechapel Road', group: 'brown', price: 60, rent: 4, mortgage: 30, houseCost: 50 },

    // Light Blue
    { id: 'angel_islington', name: 'The Angel, Islington', group: 'lightblue', price: 100, rent: 6, mortgage: 50, houseCost: 50 },
    { id: 'euston_road', name: 'Euston Road', group: 'lightblue', price: 100, rent: 6, mortgage: 50, houseCost: 50 },
    { id: 'pentonville_road', name: 'Pentonville Road', group: 'lightblue', price: 120, rent: 8, mortgage: 60, houseCost: 50 },

    // Pink
    { id: 'pall_mall', name: 'Pall Mall', group: 'pink', price: 140, rent: 10, mortgage: 70, houseCost: 100 },
    { id: 'whitehall', name: 'Whitehall', group: 'pink', price: 140, rent: 10, mortgage: 70, houseCost: 100 },
    { id: 'northumberland_avenue', name: 'Northumberland Avenue', group: 'pink', price: 160, rent: 12, mortgage: 80, houseCost: 100 },

    // Orange
    { id: 'bow_street', name: 'Bow Street', group: 'orange', price: 180, rent: 14, mortgage: 90, houseCost: 100 },
    { id: 'marlborough_street', name: 'Marlborough Street', group: 'orange', price: 180, rent: 14, mortgage: 90, houseCost: 100 },
    { id: 'vine_street', name: 'Vine Street', group: 'orange', price: 200, rent: 16, mortgage: 100, houseCost: 100 },

    // Red
    { id: 'strand', name: 'Strand', group: 'red', price: 220, rent: 18, mortgage: 110, houseCost: 150 },
    { id: 'fleet_street', name: 'Fleet Street', group: 'red', price: 220, rent: 18, mortgage: 110, houseCost: 150 },
    { id: 'trafalgar_square', name: 'Trafalgar Square', group: 'red', price: 240, rent: 20, mortgage: 120, houseCost: 150 },

    // Yellow
    { id: 'leicester_square', name: 'Leicester Square', group: 'yellow', price: 260, rent: 22, mortgage: 130, houseCost: 150 },
    { id: 'coventry_street', name: 'Coventry Street', group: 'yellow', price: 260, rent: 22, mortgage: 130, houseCost: 150 },
    { id: 'piccadilly', name: 'Piccadilly', group: 'yellow', price: 280, rent: 24, mortgage: 140, houseCost: 150 },

    // Green
    { id: 'regent_street', name: 'Regent Street', group: 'green', price: 300, rent: 26, mortgage: 150, houseCost: 200 },
    { id: 'oxford_street', name: 'Oxford Street', group: 'green', price: 300, rent: 26, mortgage: 150, houseCost: 200 },
    { id: 'bond_street', name: 'Bond Street', group: 'green', price: 320, rent: 28, mortgage: 160, houseCost: 200 },

    // Dark Blue
    { id: 'park_lane', name: 'Park Lane', group: 'darkblue', price: 350, rent: 35, mortgage: 175, houseCost: 200 },
    { id: 'mayfair', name: 'Mayfair', group: 'darkblue', price: 400, rent: 50, mortgage: 200, houseCost: 200 }
  ];

  const PLAYER_TOKENS = {
    car: { id: 'car', name: 'CAR', icon: '🚗' },
    ship: { id: 'ship', name: 'SHIP', icon: '🚢' },
    plane: { id: 'plane', name: 'PLANE', icon: '✈️' },
    helicopter: { id: 'helicopter', name: 'HELICOPTER', icon: '🚁' }
  };

  const STORAGE_KEY = 'monopoly_ultimate_banking_state';

  // ==========================================================================
  // INITIAL GAME STATE
  // ==========================================================================

  let state = {
    gameStarted: false,
    activePlayerIds: [],
    activePlayerId: null,
    players: {},
    properties: {},
    marketEffects: {}, // group -> { type: 'percent'|'flat', value: number }
    transactionLog: []
  };

  // ==========================================================================
  // DOM ELEMENTS
  // ==========================================================================

  const startScreen = document.getElementById('startScreen');
  const mainTerminal = document.getElementById('mainTerminal');
  const startGameBtn = document.getElementById('startGameBtn');
  const startError = document.getElementById('startError');
  
  const playersBanner = document.getElementById('playersBanner');
  const activePlayerDisplay = document.getElementById('activePlayerDisplay');
  const activeMarketEffects = document.getElementById('activeMarketEffects');
  
  const undoBtn = document.getElementById('undoBtn');
  const quickLogBtn = document.getElementById('quickLogBtn');
  const logCount = document.getElementById('logCount');
  const resetGameBtn = document.getElementById('resetGameBtn');
  const clearSaveBtn = document.getElementById('clearSaveBtn');
  const saveStatus = document.getElementById('saveStatus');

  const modalOverlay = document.getElementById('modalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalFooter = document.getElementById('modalFooter');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const toastContainer = document.getElementById('toastContainer');

  // ==========================================================================
  // INITIALIZATION & STATE PERSISTENCE
  // ==========================================================================

  function init() {
    setupEventListeners();
    loadState();

    if (state.gameStarted) {
      showView('mainTerminal');
      renderAll();
    } else {
      showView('startScreen');
    }
  }

  function setupEventListeners() {
    startGameBtn.addEventListener('click', handleStartGame);
    resetGameBtn.addEventListener('click', confirmResetGame);
    clearSaveBtn.addEventListener('click', confirmClearStorage);
    closeModalBtn.addEventListener('click', closeModal);
    undoBtn.addEventListener('click', handleUndoLast);
    quickLogBtn.addEventListener('click', showTransactionLogModal);

    // Modal click outside to close
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    // Action Grid Buttons
    const actionCards = document.querySelectorAll('.action-card');
    actionCards.forEach(card => {
      card.addEventListener('click', () => {
        const action = card.getAttribute('data-action');
        handleActionClick(action);
      });
    });
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        state = JSON.parse(saved);
        updateSaveStatus('SAVED');
      }
    } catch (e) {
      console.warn('localStorage not available, running in-memory.', e);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      updateSaveStatus('SAVED');
    } catch (e) {
      updateSaveStatus('UNSAVED');
    }
  }

  function updateSaveStatus(statusText) {
    if (saveStatus) {
      saveStatus.textContent = statusText;
      saveStatus.style.color = statusText === 'SAVED' ? 'var(--accent-green)' : 'var(--accent-gold)';
    }
  }

  function showView(viewId) {
    if (viewId === 'startScreen') {
      startScreen.classList.remove('hidden');
      mainTerminal.classList.add('hidden');
    } else {
      startScreen.classList.add('hidden');
      mainTerminal.classList.remove('hidden');
    }
  }

  // ==========================================================================
  // GAME SETUP HANDLERS
  // ==========================================================================

  function handleStartGame() {
    const checkboxes = document.querySelectorAll('.player-selection-grid input[type="checkbox"]:checked');
    const selectedIds = Array.from(checkboxes).map(cb => cb.value);

    if (selectedIds.length < 2 || selectedIds.length > 4) {
      startError.classList.remove('hidden');
      return;
    }

    startError.classList.add('hidden');

    // Initialize state
    state.activePlayerIds = selectedIds;
    state.activePlayerId = selectedIds[0];
    state.players = {};
    state.properties = {};
    state.marketEffects = {};
    state.transactionLog = [];
    state.gameStarted = true;

    // Build players
    selectedIds.forEach(id => {
      const token = PLAYER_TOKENS[id];
      state.players[id] = {
        id: token.id,
        name: token.name,
        icon: token.icon,
        balance: 1500,
        inJail: false,
        propertiesOwned: []
      };
    });

    // Build properties database
    PROPERTY_DATABASE.forEach(prop => {
      state.properties[prop.id] = {
        ...prop,
        owner: null,
        mortgaged: false,
        houses: 0,
        hotel: 0
      };
    });

    // Add initial log
    addLogEntry({
      sender: 'BANK',
      receiver: 'ALL PLAYERS',
      amount: 1500,
      type: 'START GAME',
      description: 'Game started with M1,500 for each player.'
    });

  saveState();
showView('mainTerminal');
renderAll();

// Play the money sound when the starting M1,500 is given
const moneySound = new Audio('money.mp3');
moneySound.play().catch(err => {
  console.warn('Could not play money.mp3:', err);
});

showToast('Game Started! Each player received M1,500.', 'success');
  }

  // ==========================================================================
  // RENDERING ENGINE
  // ==========================================================================

  function renderAll() {
    renderPlayersBanner();
    renderActivePlayerDisplay();
    renderMarketEffectsStrip();
    updateLogCount();
  }

  function renderPlayersBanner() {
    playersBanner.innerHTML = '';

    state.activePlayerIds.forEach(id => {
      const player = state.players[id];
      if (!player) return;

      const card = document.createElement('div');
      card.className = `player-tab-card ${id === state.activePlayerId ? 'active-tab' : ''}`;
      card.addEventListener('click', () => {
        state.activePlayerId = id;
        saveState();
        renderAll();
      });

      card.innerHTML = `
        <span class="tab-icon">${player.icon}</span>
        <span class="tab-name">${player.name}</span>
        <span class="tab-balance">M${formatNumber(player.balance)}</span>
        ${player.inJail ? `<span class="tab-jail-tag">IN JAIL</span>` : ''}
      `;

      playersBanner.appendChild(card);
    });
  }

  function renderActivePlayerDisplay() {
    const player = state.players[state.activePlayerId];
    if (!player) return;

    const ownedProps = Object.values(state.properties).filter(p => p.owner === player.id);
    const mortgagedProps = ownedProps.filter(p => p.mortgaged);

    activePlayerDisplay.innerHTML = `
      <div class="active-player-header">
        <div class="active-player-title">
          <span class="active-token-large">${player.icon}</span>
          <div>
            <div class="active-name-large">${player.name}</div>
            ${player.inJail ? `<span class="tab-jail-tag">IN JAIL 🚔</span>` : ''}
          </div>
        </div>
        <div class="active-balance-large">M${formatNumber(player.balance)}</div>
      </div>
      <div class="active-player-stats">
        <div class="stat-chip">Properties Owned: <span>${ownedProps.length}</span></div>
        <div class="stat-chip">Mortgaged: <span>${mortgagedProps.length}</span></div>
        <div class="stat-chip">Status: <span>${player.inJail ? 'In Jail' : 'Active'}</span></div>
      </div>
    `;
  }

  function renderMarketEffectsStrip() {
    const activeGroups = Object.keys(state.marketEffects);

    if (activeGroups.length === 0) {
      activeMarketEffects.classList.add('hidden');
      return;
    }

    activeMarketEffects.classList.remove('hidden');
    let html = `<span class="market-strip-title">📈 ACTIVE MARKET EFFECTS:</span>`;

    activeGroups.forEach(group => {
      const effect = state.marketEffects[group];
      const colorHex = getGroupColor(group);
      const valStr = effect.type === 'percent' 
        ? `${effect.value > 0 ? '+' : ''}${effect.value}%` 
        : `${effect.value > 0 ? '+' : ''}M${effect.value}`;

      html += `
        <div class="effect-badge">
          <span class="effect-color-dot" style="background:${colorHex}"></span>
          <span>${group.toUpperCase()} RENT ${valStr}</span>
          <button class="danger-btn-sm clear-effect-btn" onclick="window.clearMarketEffect('${group}')">CLEAR</button>
        </div>
      `;
    });

    activeMarketEffects.innerHTML = html;
  }

  window.clearMarketEffect = function(group) {
    delete state.marketEffects[group];
    saveState();
    renderAll();
    showToast(`Market effect cleared for ${group.toUpperCase()}`, 'success');
  };

  function updateLogCount() {
    if (logCount) {
      logCount.textContent = state.transactionLog.length;
    }
  }

  // ==========================================================================
  // CORE BANKING LOGIC & CALCULATIONS
  // ==========================================================================

  function calculateRent(propertyId) {
    const prop = state.properties[propertyId];
    if (!prop || !prop.owner || prop.mortgaged) return 0;

    let rent = prop.rent;

    // Houses / Hotel bonus
    if (prop.hotel > 0) {
      rent = prop.rent * 10;
    } else if (prop.houses > 0) {
      rent = prop.rent * (1 + prop.houses * 2);
    } else {
      // Check full color group ownership
      const groupProps = Object.values(state.properties).filter(p => p.group === prop.group);
      const allOwnedBySame = groupProps.every(p => p.owner === prop.owner && !p.mortgaged);
      if (allOwnedBySame) {
        rent = prop.rent * 2;
      }
    }

    // Apply active market modifier
    const effect = state.marketEffects[prop.group];
    if (effect) {
      if (effect.type === 'percent') {
        rent = Math.round(rent * (1 + effect.value / 100));
      } else if (effect.type === 'flat') {
        rent = Math.max(0, rent + effect.value);
      }
    }

    return rent;
  }

  function addLogEntry(entry) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const logItem = {
      id: Date.now() + Math.random(),
      time: timestamp,
      sender: entry.sender,
      receiver: entry.receiver,
      amount: entry.amount,
      type: entry.type,
      description: entry.description || '',
      undoData: entry.undoData || null
    };

    state.transactionLog.unshift(logItem); // newest first
  }

  // ==========================================================================
  // ACTION HANDLERS & MODAL DIALOGS
  // ==========================================================================

  function handleActionClick(action) {
    switch (action) {
      case 'pay-player':
        showPayPlayerModal();
        break;
      case 'pay-rent':
        showPayRentModal();
        break;
      case 'pass-go':
        handlePassGo();
        break;
      case 'property-buy':
        showPropertyModal();
        break;
      case 'auction':
        showAuctionModal();
        break;
      case 'bank-payment':
        showBankPaymentModal();
        break;
      case 'pay-bank':
        showPayBankModal();
        break;
      case 'location-flight':
        showLocationFlightModal();
        break;
      case 'market-events':
        showMarketEventsModal();
        break;
      case 'taxes':
        showTaxesModal();
        break;
      case 'credit-interest':
        showCreditInterestModal();
        break;
      case 'jail':
        showJailModal();
        break;
      case 'mortgage':
        showMortgageModal();
        break;
      case 'buildings':
        showBuildingsModal();
        break;
      case 'view-log':
        showTransactionLogModal();
        break;
      default:
        console.warn('Unknown action:', action);
    }
  }

  // 1. PAY PLAYER
  function showPayPlayerModal() {
    const sender = state.players[state.activePlayerId];
    const otherPlayers = state.activePlayerIds
      .filter(id => id !== state.activePlayerId)
      .map(id => state.players[id]);

    if (otherPlayers.length === 0) {
      showToast('No other players in game!', 'error');
      return;
    }

    openModal({
      title: '💳 PAY PLAYER',
      bodyHTML: `
        <div class="form-group">
          <label class="form-label">SENDER:</label>
          <div class="valueHighlight">${sender.icon} ${sender.name} (Balance: M${formatNumber(sender.balance)})</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="receiverSelect">RECEIVER:</label>
          <select id="receiverSelect" class="form-select">
            ${otherPlayers.map(p => `<option value="${p.id}">${p.icon} ${p.name} (M${formatNumber(p.balance)})</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="transferAmount">AMOUNT (M):</label>
          <input type="number" id="transferAmount" class="form-input" placeholder="e.g. 200" min="1" max="${sender.balance}">
        </div>

        <div class="modal-preview-box">
          <div class="preview-row">
            <span>Sender New Balance:</span>
            <span id="senderPreview" class="preview-negative">M${formatNumber(sender.balance)}</span>
          </div>
          <div class="preview-row">
            <span>Receiver New Balance:</span>
            <span id="receiverPreview" class="preview-change">--</span>
          </div>
        </div>
      `,
      confirmText: 'CONFIRM PAYMENT',
      onConfirm: () => {
        const receiverId = document.getElementById('receiverSelect').value;
        const amount = parseInt(document.getElementById('transferAmount').value, 10);

        if (isNaN(amount) || amount <= 0) {
          showToast('Please enter a valid positive amount.', 'error');
          return false;
        }

        if (amount > sender.balance) {
          showToast('Insufficient funds!', 'error');
          return false;
        }

        const receiver = state.players[receiverId];

        // Execute transfer
        sender.balance -= amount;
        receiver.balance += amount;

        addLogEntry({
          sender: `${sender.icon} ${sender.name}`,
          receiver: `${receiver.icon} ${receiver.name}`,
          amount: amount,
          type: 'PAY PLAYER',
          undoData: {
            type: 'BALANCE_TRANSFER',
            p1: sender.id,
            p1Change: amount,
            p2: receiver.id,
            p2Change: -amount
          }
        });

        saveState();
        renderAll();
        showToast(`Paid M${formatNumber(amount)} to ${receiver.name}`, 'success');
        return true;
      }
    });

    // Dynamic live preview
    const amountInput = document.getElementById('transferAmount');
    const receiverSelect = document.getElementById('receiverSelect');
    const senderPreview = document.getElementById('senderPreview');
    const receiverPreview = document.getElementById('receiverPreview');

    const updatePreview = () => {
      const amt = parseInt(amountInput.value, 10) || 0;
      const rec = state.players[receiverSelect.value];
      senderPreview.textContent = `M${formatNumber(Math.max(0, sender.balance - amt))}`;
      receiverPreview.textContent = `M${formatNumber(rec.balance + amt)}`;
    };

    amountInput.addEventListener('input', updatePreview);
    receiverSelect.addEventListener('change', updatePreview);
  }

  // 2. PASS GO
  function handlePassGo() {
    const player = state.players[state.activePlayerId];
    if (!player) return;

    player.balance += 200;
  const moneySound = new Audio('money.mp3');
  moneySound.play().catch(err => {
    console.warn('Could not play money.mp3:', err);
  });

    addLogEntry({
      sender: 'BANK',
      receiver: `${player.icon} ${player.name}`,
      amount: 200,
      type: 'PASS GO',
      description: 'Passed GO salary payment.',
      undoData: {
        type: 'BALANCE_TRANSFER',
        p1: player.id,
        p1Change: -200
      }
    });

    saveState();
    renderAll();
    showToast(`+M200 PASS GO collected for ${player.name}!`, 'success');
  }

  // 3. PAY RENT
  function showPayRentModal() {
    const payer = state.players[state.activePlayerId];
    const propertiesWithOwners = Object.values(state.properties).filter(p => p.owner && p.owner !== payer.id);

    if (propertiesWithOwners.length === 0) {
      showToast('No opponent-owned properties on board!', 'error');
      return;
    }

    openModal({
      title: '🏠 PAY RENT',
      bodyHTML: `
        <div class="form-group">
          <label class="form-label">PAYING PLAYER:</label>
          <div class="valueHighlight">${payer.icon} ${payer.name} (M${formatNumber(payer.balance)})</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="rentPropSelect">SELECT LANDED PROPERTY:</label>
          <select id="rentPropSelect" class="form-select">
            ${propertiesWithOwners.map(p => {
              const owner = state.players[p.owner];
              const rent = calculateRent(p.id);
              return `<option value="${p.id}">${p.name} (${groupToName(p.group)}) - Owner: ${owner ? owner.name : 'Unknown'} [Rent: M${formatNumber(rent)}]</option>`;
            }).join('')}
          </select>
        </div>

        <div class="modal-preview-box" id="rentDetailsBox">
          <!-- Filled dynamically -->
        </div>

        <div class="form-group">
          <label class="form-label" for="rentAmountInput">CONFIRM RENT AMOUNT (M):</label>
          <input type="number" id="rentAmountInput" class="form-input" min="0">
        </div>
      `,
      confirmText: 'TRANSFER RENT',
      onConfirm: () => {
        const propId = document.getElementById('rentPropSelect').value;
        const rentAmt = parseInt(document.getElementById('rentAmountInput').value, 10);

        if (isNaN(rentAmt) || rentAmt < 0) {
          showToast('Invalid rent amount.', 'error');
          return false;
        }

        if (rentAmt > payer.balance) {
          showToast('Insufficient funds to pay rent!', 'error');
          return false;
        }

        const prop = state.properties[propId];
        const owner = state.players[prop.owner];

        payer.balance -= rentAmt;
        owner.balance += rentAmt;

        addLogEntry({
          sender: `${payer.icon} ${payer.name}`,
          receiver: `${owner.icon} ${owner.name}`,
          amount: rentAmt,
          type: 'PAY RENT',
          description: `Rent for ${prop.name}`,
          undoData: {
            type: 'BALANCE_TRANSFER',
            p1: payer.id,
            p1Change: rentAmt,
            p2: owner.id,
            p2Change: -rentAmt
          }
        });

        saveState();
        renderAll();
        showToast(`Paid M${formatNumber(rentAmt)} rent for ${prop.name} to ${owner.name}`, 'success');
        return true;
      }
    });

    const propSelect = document.getElementById('rentPropSelect');
    const detailsBox = document.getElementById('rentDetailsBox');
    const rentInput = document.getElementById('rentAmountInput');

    const updateRentInfo = () => {
      const prop = state.properties[propSelect.value];
      const owner = state.players[prop.owner];
      const calculated = calculateRent(prop.id);
      rentInput.value = calculated;

      const effect = state.marketEffects[prop.group];
      let effectText = 'None';
      if (effect) {
        effectText = effect.type === 'percent' ? `${effect.value > 0 ? '+' : ''}${effect.value}%` : `+M${effect.value}`;
      }

      detailsBox.innerHTML = `
        <div class="preview-row">
          <span>Property Owner:</span>
          <span style="color:var(--accent-gold); font-weight:bold">${owner ? owner.icon + ' ' + owner.name : 'None'}</span>
        </div>
        <div class="preview-row">
          <span>Active Market Effect:</span>
          <span>${effectText}</span>
        </div>
        <div class="preview-row">
          <span>Calculated Rent:</span>
          <span class="preview-change">M${formatNumber(calculated)}</span>
        </div>
      `;
    };

    propSelect.addEventListener('change', updateRentInfo);
    updateRentInfo();
  }

  // 4. PROPERTY PURCHASE & MANAGEMENT
  function showPropertyModal() {
    const player = state.players[state.activePlayerId];

    openModal({
      title: '📜 PROPERTY MANAGEMENT',
      bodyHTML: `
        <div class="form-group">
          <label class="form-label">SELECTED PLAYER:</label>
          <div class="valueHighlight">${player.icon} ${player.name} (Balance: M${formatNumber(player.balance)})</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="propSelect">SELECT PROPERTY:</label>
          <select id="propSelect" class="form-select">
            ${PROPERTY_DATABASE.map(p => {
              const liveProp = state.properties[p.id];
              const owner = liveProp.owner ? state.players[liveProp.owner] : null;
              const ownerStr = owner ? `Owned by ${owner.name}` : 'UNOWNED';
              return `<option value="${p.id}">${p.name} (${groupToName(p.group)}) - M${p.price} [${ownerStr}]</option>`;
            }).join('')}
          </select>
        </div>

        <div id="propertyCardDetails" class="modal-preview-box">
          <!-- Rendered dynamically -->
        </div>

        <div class="form-group" id="buyPriceGroup">
          <label class="form-label" for="customBuyPrice">PURCHASE PRICE (M):</label>
          <input type="number" id="customBuyPrice" class="form-input">
        </div>
      `,
      confirmText: 'BUY PROPERTY',
      onConfirm: () => {
        const propId = document.getElementById('propSelect').value;
        const prop = state.properties[propId];
        const price = parseInt(document.getElementById('customBuyPrice').value, 10);

        if (prop.owner) {
          showToast('Property is already owned!', 'error');
          return false;
        }

        if (isNaN(price) || price < 0) {
          showToast('Invalid purchase price.', 'error');
          return false;
        }

        if (price > player.balance) {
          showToast('Insufficient funds to buy property!', 'error');
          return false;
        }

        player.balance -= price;
        prop.owner = player.id;

        addLogEntry({
          sender: `${player.icon} ${player.name}`,
          receiver: 'BANK',
          amount: price,
          type: 'PROPERTY PURCHASE',
          description: `Bought ${prop.name}`,
          undoData: {
            type: 'PROPERTY_BUY',
            playerId: player.id,
            propertyId: prop.id,
            amount: price
          }
        });

        saveState();
        renderAll();
        showToast(`Purchased ${prop.name} for M${formatNumber(price)}!`, 'success');
        return true;
      }
    });

    const propSelect = document.getElementById('propSelect');
    const detailsBox = document.getElementById('propertyCardDetails');
    const priceInput = document.getElementById('customBuyPrice');
    const confirmBtn = modalFooter.querySelector('.primary-btn');

    const updateCardView = () => {
      const prop = state.properties[propSelect.value];
      const owner = prop.owner ? state.players[prop.owner] : null;
      priceInput.value = prop.price;

      const groupHex = getGroupColor(prop.group);

      detailsBox.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
          <div style="width:16px; height:16px; background:${groupHex}; border-radius:3px;"></div>
          <strong style="font-size:1.1rem; color:var(--text-main);">${prop.name}</strong>
        </div>
        <div class="preview-row"><span>Color Group:</span><span>${groupToName(prop.group)}</span></div>
        <div class="preview-row"><span>Base Rent:</span><span>M${prop.rent}</span></div>
        <div class="preview-row"><span>Mortgage Value:</span><span>M${prop.mortgage}</span></div>
        <div class="preview-row"><span>House Cost:</span><span>M${prop.houseCost}</span></div>
        <div class="preview-row">
          <span>Current Owner:</span>
          <span style="font-weight:bold; color:${owner ? 'var(--accent-gold)' : 'var(--accent-green)'}">
            ${owner ? owner.icon + ' ' + owner.name : 'UNOWNED (AVAILABLE)'}
          </span>
        </div>
      `;

      if (owner) {
        confirmBtn.style.display = 'none';
        priceInput.disabled = true;
      } else {
        confirmBtn.style.display = 'inline-flex';
        priceInput.disabled = false;
      }
    };

    propSelect.addEventListener('change', updateCardView);
    updateCardView();
  }

  // 5. AUCTION SYSTEM
  function showAuctionModal() {
    const unownedProps = Object.values(state.properties).filter(p => !p.owner);

    if (unownedProps.length === 0) {
      showToast('All properties are owned!', 'error');
      return;
    }

    let currentAuction = {
      propertyId: unownedProps[0].id,
      highestBid: 10,
      highestBidderId: null,
      passedPlayers: []
    };

    openModal({
      title: '🔨 LIVE PROPERTY AUCTION',
      bodyHTML: `
        <div class="form-group">
          <label class="form-label" for="auctionPropSelect">SELECT PROPERTY TO AUCTION:</label>
          <select id="auctionPropSelect" class="form-select">
            ${unownedProps.map(p => `<option value="${p.id}">${p.name} (Val: M${p.price})</option>`).join('')}
          </select>
        </div>

        <div id="auctionDisplayCard" class="auction-card-box">
          <!-- Rendered dynamically -->
        </div>

        <div class="form-group">
          <label class="form-label">SELECT BIDDER:</label>
          <select id="bidderSelect" class="form-select">
            ${state.activePlayerIds.map(id => {
              const p = state.players[id];
              return `<option value="${p.id}">${p.icon} ${p.name} (M${formatNumber(p.balance)})</option>`;
            }).join('')}
          </select>
        </div>

        <div class="bid-buttons-row">
          <button id="bidPlus10" class="sec-btn">+M10</button>
          <button id="bidPlus50" class="sec-btn">+M50</button>
          <button id="bidPlus100" class="sec-btn">+M100</button>
          <button id="passBidBtn" class="danger-btn-sm">PASS</button>
        </div>
      `,
      confirmText: 'END AUCTION & ASSIGN',
      onConfirm: () => {
        if (!currentAuction.highestBidderId) {
          showToast('No bids placed in auction!', 'error');
          return false;
        }

        const prop = state.properties[currentAuction.propertyId];
        const winner = state.players[currentAuction.highestBidderId];
        const bid = currentAuction.highestBid;

        if (bid > winner.balance) {
          showToast(`${winner.name} cannot afford the winning bid!`, 'error');
          return false;
        }

        winner.balance -= bid;
        prop.owner = winner.id;

        addLogEntry({
          sender: `${winner.icon} ${winner.name}`,
          receiver: 'BANK',
          amount: bid,
          type: 'AUCTION WIN',
          description: `Won ${prop.name} at auction`,
          undoData: {
            type: 'PROPERTY_BUY',
            playerId: winner.id,
            propertyId: prop.id,
            amount: bid
          }
        });

        saveState();
        renderAll();
        showToast(`Auction Won! ${winner.name} acquired ${prop.name} for M${formatNumber(bid)}`, 'success');
        return true;
      }
    });

    const propSelect = document.getElementById('auctionPropSelect');
    const displayCard = document.getElementById('auctionDisplayCard');
    const bidderSelect = document.getElementById('bidderSelect');

    const renderAuctionCard = () => {
      const prop = state.properties[currentAuction.propertyId];
      const bidder = currentAuction.highestBidderId ? state.players[currentAuction.highestBidderId] : null;

      displayCard.innerHTML = `
        <div class="auction-property-name">${prop.name}</div>
        <div style="font-size:0.8rem; color:var(--text-muted)">LIST PRICE: M${prop.price}</div>
        <div style="margin-top:8px; font-size:0.85rem; color:var(--text-muted)">CURRENT HIGHEST BID</div>
        <div class="auction-bid-amount">M${formatNumber(currentAuction.highestBid)}</div>
        <div class="auction-bidder-name">${bidder ? bidder.icon + ' ' + bidder.name : 'NO BIDS YET'}</div>
      `;
    };

    propSelect.addEventListener('change', () => {
      currentAuction.propertyId = propSelect.value;
      currentAuction.highestBid = 10;
      currentAuction.highestBidderId = null;
      renderAuctionCard();
    });

    const placeBid = (addAmt) => {
      const bidderId = bidderSelect.value;
      const bidder = state.players[bidderId];
      const newBid = currentAuction.highestBid + addAmt;

      if (newBid > bidder.balance) {
        showToast(`${bidder.name} cannot afford M${formatNumber(newBid)}`, 'error');
        return;
      }

      currentAuction.highestBid = newBid;
      currentAuction.highestBidderId = bidderId;
      renderAuctionCard();
      showToast(`${bidder.name} bid M${formatNumber(newBid)}!`, 'success');
    };

    document.getElementById('bidPlus10').addEventListener('click', () => placeBid(10));
    document.getElementById('bidPlus50').addEventListener('click', () => placeBid(50));
    document.getElementById('bidPlus100').addEventListener('click', () => placeBid(100));

    document.getElementById('passBidBtn').addEventListener('click', () => {
      const bidder = state.players[bidderSelect.value];
      showToast(`${bidder.name} passed.`, 'error');
    });

    renderAuctionCard();
  }

  // 6. BANK PAYMENT (Bank -> Player)
  function showBankPaymentModal() {
    const player = state.players[state.activePlayerId];

    openModal({
      title: '🏦 BANK PAYMENT (BANK → PLAYER)',
      bodyHTML: `
        <div class="form-group">
          <label class="form-label">RECEIVING PLAYER:</label>
          <div class="valueHighlight">${player.icon} ${player.name} (Balance: M${formatNumber(player.balance)})</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="bankPayAmt">AMOUNT FROM BANK (M):</label>
          <input type="number" id="bankPayAmt" class="form-input" placeholder="e.g. 150" min="1">
        </div>

        <div class="form-group">
          <label class="form-label" for="bankPayNote">REASON / NOTE (OPTIONAL):</label>
          <input type="text" id="bankPayNote" class="form-input" placeholder="e.g. Card reward, Event reward">
        </div>
      `,
      confirmText: 'RECEIVE BANK PAYMENT',
      onConfirm: () => {
        const amt = parseInt(document.getElementById('bankPayAmt').value, 10);
        const note = document.getElementById('bankPayNote').value.trim();

        if (isNaN(amt) || amt <= 0) {
          showToast('Please enter a valid amount.', 'error');
          return false;
        }

        player.balance += amt;

        addLogEntry({
          sender: 'BANK',
          receiver: `${player.icon} ${player.name}`,
          amount: amt,
          type: 'BANK PAYMENT',
          description: note || 'Received payment from Bank',
          undoData: {
            type: 'BALANCE_TRANSFER',
            p1: player.id,
            p1Change: -amt
          }
        });

        saveState();
        renderAll();
        showToast(`Received M${formatNumber(amt)} from Bank!`, 'success');
        return true;
      }
    });
  }

  // 7. PAY BANK (Player -> Bank)
  function showPayBankModal() {
    const player = state.players[state.activePlayerId];

    openModal({
      title: '💸 PAY BANK (PLAYER → BANK)',
      bodyHTML: `
        <div class="form-group">
          <label class="form-label">PAYING PLAYER:</label>
          <div class="valueHighlight">${player.icon} ${player.name} (Balance: M${formatNumber(player.balance)})</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="payBankAmt">AMOUNT TO PAY BANK (M):</label>
          <input type="number" id="payBankAmt" class="form-input" placeholder="e.g. 100" min="1" max="${player.balance}">
        </div>

        <div class="form-group">
          <label class="form-label" for="payBankNote">REASON / NOTE (OPTIONAL):</label>
          <input type="text" id="payBankNote" class="form-input" placeholder="e.g. Fine, Repairs, Penalty">
        </div>
      `,
      confirmText: 'PAY TO BANK',
      onConfirm: () => {
        const amt = parseInt(document.getElementById('payBankAmt').value, 10);
        const note = document.getElementById('payBankNote').value.trim();

        if (isNaN(amt) || amt <= 0) {
          showToast('Please enter a valid amount.', 'error');
          return false;
        }

        if (amt > player.balance) {
          showToast('Insufficient funds!', 'error');
          return false;
        }

        player.balance -= amt;

        addLogEntry({
          sender: `${player.icon} ${player.name}`,
          receiver: 'BANK',
          amount: amt,
          type: 'PAY BANK',
          description: note || 'Paid fee to Bank',
          undoData: {
            type: 'BALANCE_TRANSFER',
            p1: player.id,
            p1Change: amt
          }
        });

        saveState();
        renderAll();
        showToast(`Paid M${formatNumber(amt)} to Bank`, 'success');
        return true;
      }
    });
  }

  // 8. LOCATION FLIGHT (Pay M100 fee to fly to space)
  function showLocationFlightModal() {
    const player = state.players[state.activePlayerId];

    openModal({
      title: '✈️ LOCATION / FLIGHT SPACE',
      bodyHTML: `
        <div class="form-group">
          <label class="form-label">PASSENGER:</label>
          <div class="valueHighlight">${player.icon} ${player.name} (Balance: M${formatNumber(player.balance)})</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="flightDestSelect">DESTINATION PROPERTY:</label>
          <select id="flightDestSelect" class="form-select">
            ${PROPERTY_DATABASE.map(p => `<option value="${p.id}">${p.name} (${groupToName(p.group)})</option>`).join('')}
          </select>
        </div>

        <div class="modal-preview-box">
          <div class="preview-row"><span>FLIGHT FEE:</span><span class="preview-negative">M100</span></div>
          <div class="preview-row"><span>NEW BALANCE:</span><span class="preview-change">M${formatNumber(Math.max(0, player.balance - 100))}</span></div>
        </div>
      `,
      confirmText: 'CONFIRM FLIGHT (M100)',
      onConfirm: () => {
        if (player.balance < 100) {
          showToast('Insufficient funds for flight fee (M100)!', 'error');
          return false;
        }

        const destId = document.getElementById('flightDestSelect').value;
        const prop = state.properties[destId];

        player.balance -= 100;

        addLogEntry({
          sender: `${player.icon} ${player.name}`,
          receiver: 'BANK',
          amount: 100,
          type: 'LOCATION FLIGHT',
          description: `Flew to ${prop.name}`,
          undoData: {
            type: 'BALANCE_TRANSFER',
            p1: player.id,
            p1Change: 100
          }
        });

        saveState();
        renderAll();
        showToast(`${player.name} flew to ${prop.name} for M100!`, 'success');
        return true;
      }
    });
  }

  // 9. EVENT SPACES / MARKET EFFECTS
  function showMarketEventsModal() {
    const groups = [
      { id: 'brown', name: 'Brown' },
      { id: 'lightblue', name: 'Light Blue' },
      { id: 'pink', name: 'Pink' },
      { id: 'orange', name: 'Orange' },
      { id: 'red', name: 'Red' },
      { id: 'yellow', name: 'Yellow' },
      { id: 'green', name: 'Green' },
      { id: 'darkblue', name: 'Dark Blue' }
    ];

    openModal({
      title: '📈 EVENT SPACE - MARKET MODIFIERS',
      bodyHTML: `
        <p style="font-size:0.85rem; color:var(--text-muted);">Physical Event cards alter neighbourhood rents. Select a group and enter the modifier.</p>

        <div class="form-group">
          <label class="form-label" for="marketGroupSelect">COLOR GROUP / NEIGHBOURHOOD:</label>
          <select id="marketGroupSelect" class="form-select">
            ${groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="modTypeSelect">MODIFIER TYPE:</label>
          <select id="modTypeSelect" class="form-select">
            <option value="percent">Percentage (% Rent Change)</option>
            <option value="flat">Flat Amount (M Rent Change)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="modValueInput">MODIFIER VALUE (+ / -):</label>
          <input type="number" id="modValueInput" class="form-input" placeholder="e.g. 20 for +20%, -10 for -10%">
        </div>
      `,
      confirmText: 'APPLY MARKET EFFECT',
      onConfirm: () => {
        const group = document.getElementById('marketGroupSelect').value;
        const type = document.getElementById('modTypeSelect').value;
        const val = parseInt(document.getElementById('modValueInput').value, 10);

        if (isNaN(val)) {
          showToast('Please enter a valid numeric value.', 'error');
          return false;
        }

        state.marketEffects[group] = { type, value: val };

        addLogEntry({
          sender: 'EVENT SPACE',
          receiver: `${group.toUpperCase()} GROUP`,
          amount: val,
          type: 'MARKET EFFECT',
          description: `Rent modifier ${val > 0 ? '+' : ''}${val}${type === 'percent' ? '%' : 'M'}`
        });

        saveState();
        renderAll();
        showToast(`Market effect set for ${group.toUpperCase()}`, 'success');
        return true;
      }
    });
  }

  // 10. TAXES
  function showTaxesModal() {
    const player = state.players[state.activePlayerId];

    openModal({
      title: '🧾 INCOME TAX SPACE',
      bodyHTML: `
        <div class="form-group">
          <label class="form-label">TAXPAYER:</label>
          <div class="valueHighlight">${player.icon} ${player.name} (Balance: M${formatNumber(player.balance)})</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="taxAmtInput">INCOME TAX AMOUNT (M):</label>
          <input type="number" id="taxAmtInput" class="form-input" value="200" min="1" max="${player.balance}">
        </div>
      `,
      confirmText: 'PAY INCOME TAX',
      onConfirm: () => {
        const amt = parseInt(document.getElementById('taxAmtInput').value, 10);

        if (isNaN(amt) || amt <= 0 || amt > player.balance) {
          showToast('Invalid tax amount or insufficient funds.', 'error');
          return false;
        }

        player.balance -= amt;

        addLogEntry({
          sender: `${player.icon} ${player.name}`,
          receiver: 'BANK',
          amount: amt,
          type: 'INCOME TAX',
          description: 'Paid Income Tax',
          undoData: {
            type: 'BALANCE_TRANSFER',
            p1: player.id,
            p1Change: amt
          }
        });

        saveState();
        renderAll();
        showToast(`Paid M${formatNumber(amt)} Income Tax`, 'success');
        return true;
      }
    });
  }

  // 11. CREDIT CARD INTEREST
  function showCreditInterestModal() {
    const player = state.players[state.activePlayerId];

    openModal({
      title: '💳 CREDIT CARD INTEREST',
      bodyHTML: `
        <div class="form-group">
          <label class="form-label">DEBTOR:</label>
          <div class="valueHighlight">${player.icon} ${player.name} (Balance: M${formatNumber(player.balance)})</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="interestAmtInput">INTEREST CHARGE (M):</label>
          <input type="number" id="interestAmtInput" class="form-input" placeholder="e.g. 100" min="1" max="${player.balance}">
        </div>
      `,
      confirmText: 'PAY CREDIT INTEREST',
      onConfirm: () => {
        const amt = parseInt(document.getElementById('interestAmtInput').value, 10);

        if (isNaN(amt) || amt <= 0 || amt > player.balance) {
          showToast('Invalid interest charge or insufficient funds.', 'error');
          return false;
        }

        player.balance -= amt;

        addLogEntry({
          sender: `${player.icon} ${player.name}`,
          receiver: 'BANK',
          amount: amt,
          type: 'CREDIT CARD INTEREST',
          description: 'Interest on Credit Card Debt',
          undoData: {
            type: 'BALANCE_TRANSFER',
            p1: player.id,
            p1Change: amt
          }
        });

        saveState();
        renderAll();
        showToast(`Paid M${formatNumber(amt)} Credit Card Interest`, 'success');
        return true;
      }
    });
  }

  // 12. JAIL SYSTEM
  function showJailModal() {
    const player = state.players[state.activePlayerId];

    openModal({
      title: '🚔 JAIL SYSTEM',
      bodyHTML: `
        <div class="form-group">
          <label class="form-label">PLAYER:</label>
          <div class="valueHighlight">${player.icon} ${player.name}</div>
          <div style="font-size:0.9rem; color:var(--text-muted)">Current Status: <strong style="color:${player.inJail ? 'var(--accent-red)' : 'var(--accent-green)'}">${player.inJail ? 'IN JAIL 🚔' : 'FREE / JUST VISITING'}</strong></div>
        </div>

        <div class="form-group" style="display:flex; flex-direction:column; gap:10px;">
          ${player.inJail ? `
            <button id="payBailBtn" class="primary-btn">PAY BAIL (M50)</button>
            <button id="releaseFreeBtn" class="sec-btn">RELEASE WITHOUT PAYMENT</button>
          ` : `
            <button id="sendToJailBtn" class="danger-btn">SEND TO JAIL</button>
          `}
        </div>
      `,
      hideConfirmBtn: true
    });

    const payBailBtn = document.getElementById('payBailBtn');
    const releaseFreeBtn = document.getElementById('releaseFreeBtn');
    const sendToJailBtn = document.getElementById('sendToJailBtn');

    if (payBailBtn) {
      payBailBtn.addEventListener('click', () => {
        if (player.balance < 50) {
          showToast('Insufficient funds for M50 Bail!', 'error');
          return;
        }
        player.balance -= 50;
        player.inJail = false;
		
		const jailSound = new Audio('jail.mp3');
jailSound.play().catch(err => {
  console.warn('Could not play jail.mp3:', err);
});

        addLogEntry({
          sender: `${player.icon} ${player.name}`,
          receiver: 'BANK',
          amount: 50,
          type: 'JAIL BAIL',
          description: 'Paid M50 Jail Bail',
          undoData: {
            type: 'JAIL_STATUS',
            playerId: player.id,
            prevJail: true,
            bailPaid: 50
          }
        });

        saveState();
        closeModal();
        renderAll();
        showToast(`${player.name} paid M50 bail and was released!`, 'success');
      });
    }

    if (releaseFreeBtn) {
      releaseFreeBtn.addEventListener('click', () => {
        player.inJail = false;
        addLogEntry({
          sender: 'JAIL',
          receiver: `${player.icon} ${player.name}`,
          amount: 0,
          type: 'JAIL RELEASE',
          description: 'Released without payment'
        });
        saveState();
        closeModal();
        renderAll();
        showToast(`${player.name} released from Jail!`, 'success');
      });
    }

    if (sendToJailBtn) {
      sendToJailBtn.addEventListener('click', () => {
        player.inJail = true;
		const jailSound = new Audio('jail.mp3');
jailSound.play().catch(err => {
  console.warn('Could not play jail.mp3:', err);
});
        addLogEntry({
          sender: 'BOARD',
          receiver: `${player.icon} ${player.name}`,
          amount: 0,
          type: 'GO TO JAIL',
          description: 'Sent to Jail'
        });
        saveState();
        closeModal();
        renderAll();
        showToast(`${player.name} marked as IN JAIL!`, 'error');
      });
    }
  }

  // 13. MORTGAGES
  function showMortgageModal() {
    const player = state.players[state.activePlayerId];
    const ownedProps = Object.values(state.properties).filter(p => p.owner === player.id);

    if (ownedProps.length === 0) {
      showToast('You do not own any properties!', 'error');
      return;
    }

    openModal({
      title: '🏦 MORTGAGE / UNMORTGAGE',
      bodyHTML: `
        <div class="form-group">
          <label class="form-label">PROPERTY OWNER:</label>
          <div class="valueHighlight">${player.icon} ${player.name}</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="mortPropSelect">SELECT OWNED PROPERTY:</label>
          <select id="mortPropSelect" class="form-select">
            ${ownedProps.map(p => `<option value="${p.id}">${p.name} - [${p.mortgaged ? 'MORTGAGED' : 'ACTIVE'}]</option>`).join('')}
          </select>
        </div>

        <div id="mortDetailsBox" class="modal-preview-box">
          <!-- Rendered dynamically -->
        </div>

        <div style="display:flex; gap:10px; margin-top:10px;">
          <button id="doMortgageBtn" class="primary-btn" style="flex:1;">MORTGAGE PROPERTY</button>
          <button id="doUnmortgageBtn" class="sec-btn" style="flex:1;">UNMORTGAGE PROPERTY</button>
        </div>
      `,
      hideConfirmBtn: true
    });

    const mortPropSelect = document.getElementById('mortPropSelect');
    const mortDetailsBox = document.getElementById('mortDetailsBox');
    const doMortgageBtn = document.getElementById('doMortgageBtn');
    const doUnmortgageBtn = document.getElementById('doUnmortgageBtn');

    const updateMortInfo = () => {
      const prop = state.properties[mortPropSelect.value];
      const unmortgageCost = Math.round(prop.mortgage * 1.1);

      mortDetailsBox.innerHTML = `
        <div class="preview-row"><span>Status:</span><span class="${prop.mortgaged ? 'badge-mortgaged' : 'badge-active'}">${prop.mortgaged ? 'MORTGAGED' : 'ACTIVE'}</span></div>
        <div class="preview-row"><span>Mortgage Value (Payout):</span><span class="preview-change">+M${prop.mortgage}</span></div>
        <div class="preview-row"><span>Unmortgage Cost (Fee):</span><span class="preview-negative">M${unmortgageCost}</span></div>
      `;

      if (prop.mortgaged) {
        doMortgageBtn.style.display = 'none';
        doUnmortgageBtn.style.display = 'inline-flex';
      } else {
        doMortgageBtn.style.display = 'inline-flex';
        doUnmortgageBtn.style.display = 'none';
      }
    };

    mortPropSelect.addEventListener('change', updateMortInfo);
    updateMortInfo();

    doMortgageBtn.addEventListener('click', () => {
      const prop = state.properties[mortPropSelect.value];
      prop.mortgaged = true;
      player.balance += prop.mortgage;

      addLogEntry({
        sender: 'BANK',
        receiver: `${player.icon} ${player.name}`,
        amount: prop.mortgage,
        type: 'MORTGAGE',
        description: `Mortgaged ${prop.name}`,
        undoData: {
          type: 'MORTGAGE_TOGGLE',
          propertyId: prop.id,
          playerId: player.id,
          payout: prop.mortgage
        }
      });

      saveState();
      closeModal();
      renderAll();
      showToast(`Mortgaged ${prop.name} for +M${prop.mortgage}`, 'success');
    });

    doUnmortgageBtn.addEventListener('click', () => {
      const prop = state.properties[mortPropSelect.value];
      const cost = Math.round(prop.mortgage * 1.1);

      if (player.balance < cost) {
        showToast('Insufficient funds to unmortgage!', 'error');
        return;
      }

      prop.mortgaged = false;
      player.balance -= cost;

      addLogEntry({
        sender: `${player.icon} ${player.name}`,
        receiver: 'BANK',
        amount: cost,
        type: 'UNMORTGAGE',
        description: `Unmortgaged ${prop.name}`,
        undoData: {
          type: 'MORTGAGE_TOGGLE',
          propertyId: prop.id,
          playerId: player.id,
          payout: -cost
        }
      });

      saveState();
      closeModal();
      renderAll();
      showToast(`Unmortgaged ${prop.name} for M${cost}`, 'success');
    });
  }

  // 14. HOUSES & HOTELS
  function showBuildingsModal() {
    const player = state.players[state.activePlayerId];
    const ownedProps = Object.values(state.properties).filter(p => p.owner === player.id && !p.mortgaged);

    if (ownedProps.length === 0) {
      showToast('You have no active owned properties to develop!', 'error');
      return;
    }

    openModal({
      title: '🏘️ HOUSES & HOTELS',
      bodyHTML: `
        <div class="form-group">
          <label class="form-label">DEVELOPER:</label>
          <div class="valueHighlight">${player.icon} ${player.name} (Balance: M${formatNumber(player.balance)})</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="bldPropSelect">SELECT PROPERTY:</label>
          <select id="bldPropSelect" class="form-select">
            ${ownedProps.map(p => `<option value="${p.id}">${p.name} (${p.houses} Houses, ${p.hotel ? '1 Hotel' : 'No Hotel'})</option>`).join('')}
          </select>
        </div>

        <div id="bldDetailsBox" class="modal-preview-box">
          <!-- Dynamic details -->
        </div>

        <div class="bid-buttons-row" style="margin-top:10px;">
          <button id="addHouseBtn" class="primary-btn">+ BUY HOUSE</button>
          <button id="addHotelBtn" class="primary-btn">+ BUY HOTEL</button>
          <button id="sellBldBtn" class="danger-btn-sm">SELL DEVELOPMENT</button>
        </div>
      `,
      hideConfirmBtn: true
    });

    const propSelect = document.getElementById('bldPropSelect');
    const detailsBox = document.getElementById('bldDetailsBox');

    const updateBldInfo = () => {
      const prop = state.properties[propSelect.value];
      detailsBox.innerHTML = `
        <div class="preview-row"><span>House Cost:</span><span>M${prop.houseCost} each</span></div>
        <div class="preview-row"><span>Current Houses:</span><span class="preview-change">${prop.houses} / 4</span></div>
        <div class="preview-row"><span>Current Hotel:</span><span class="preview-change">${prop.hotel ? '1 HOTEL 🏨' : 'NONE'}</span></div>
      `;
    };

    propSelect.addEventListener('change', updateBldInfo);
    updateBldInfo();

    document.getElementById('addHouseBtn').addEventListener('click', () => {
      const prop = state.properties[propSelect.value];
      if (prop.hotel > 0 || prop.houses >= 4) {
        showToast('Max houses reached! Buy a hotel instead.', 'error');
        return;
      }
      if (player.balance < prop.houseCost) {
        showToast('Insufficient funds for house!', 'error');
        return;
      }

      player.balance -= prop.houseCost;
      prop.houses += 1;

      addLogEntry({
        sender: `${player.icon} ${player.name}`,
        receiver: 'BANK',
        amount: prop.houseCost,
        type: 'BUY HOUSE',
        description: `Bought house on ${prop.name}`
      });

      saveState();
      updateBldInfo();
      renderAll();
      showToast(`House built on ${prop.name}!`, 'success');
    });

    document.getElementById('addHotelBtn').addEventListener('click', () => {
      const prop = state.properties[propSelect.value];
      if (prop.hotel > 0) {
        showToast('Hotel already built on this property!', 'error');
        return;
      }
      if (player.balance < prop.houseCost) {
        showToast('Insufficient funds for hotel!', 'error');
        return;
      }

      player.balance -= prop.houseCost;
      prop.houses = 0;
      prop.hotel = 1;

      addLogEntry({
        sender: `${player.icon} ${player.name}`,
        receiver: 'BANK',
        amount: prop.houseCost,
        type: 'BUY HOTEL',
        description: `Built hotel on ${prop.name}`
      });

      saveState();
      updateBldInfo();
      renderAll();
      showToast(`Hotel built on ${prop.name}!`, 'success');
    });

    document.getElementById('sellBldBtn').addEventListener('click', () => {
      const prop = state.properties[propSelect.value];
      const refund = Math.round(prop.houseCost / 2);

      if (prop.hotel > 0) {
        prop.hotel = 0;
        prop.houses = 4;
        player.balance += refund;
        showToast(`Hotel converted to 4 houses (+M${refund})`, 'success');
      } else if (prop.houses > 0) {
        prop.houses -= 1;
        player.balance += refund;
        showToast(`Sold 1 house (+M${refund})`, 'success');
      } else {
        showToast('No buildings to sell!', 'error');
        return;
      }

      addLogEntry({
        sender: 'BANK',
        receiver: `${player.icon} ${player.name}`,
        amount: refund,
        type: 'SELL BUILDING',
        description: `Sold development on ${prop.name}`
      });

      saveState();
      updateBldInfo();
      renderAll();
    });
  }

  // 15. TRANSACTION LOG MODAL
  function showTransactionLogModal() {
    openModal({
      title: '📜 TRANSACTION HISTORY LOG',
      bodyHTML: `
        <div class="log-list">
          ${state.transactionLog.length === 0 ? '<p style="color:var(--text-muted); text-align:center;">No transactions logged yet.</p>' : ''}
          ${state.transactionLog.map(item => `
            <div class="log-item">
              <div class="log-item-header">
                <span>${item.time} - ${item.type}</span>
                <span>${item.sender} → ${item.receiver}</span>
              </div>
              <div class="log-item-body">
                <span class="log-desc">${item.description || ''}</span>
                <span class="log-amount">M${formatNumber(item.amount)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      `,
      confirmText: 'CLEAR LOG',
      confirmIsDanger: true,
      onConfirm: () => {
        if (confirm('Clear the entire transaction history log?')) {
          state.transactionLog = [];
          saveState();
          renderAll();
          showToast('Transaction log cleared.', 'success');
          return true;
        }
        return false;
      }
    });
  }

  // 16. UNDO LAST TRANSACTION
  function handleUndoLast() {
    if (state.transactionLog.length === 0) {
      showToast('No transactions to undo!', 'error');
      return;
    }

    const last = state.transactionLog[0];

    if (!confirm(`Undo last transaction?\n\nType: ${last.type}\nSender: ${last.sender}\nReceiver: ${last.receiver}\nAmount: M${formatNumber(last.amount)}`)) {
      return;
    }

    const removed = state.transactionLog.shift(); // Remove last entry

    // Reverse undoData if exists
    if (removed.undoData) {
      const data = removed.undoData;
      if (data.type === 'BALANCE_TRANSFER') {
        if (data.p1 && state.players[data.p1]) {
          state.players[data.p1].balance += data.p1Change;
        }
        if (data.p2 && state.players[data.p2]) {
          state.players[data.p2].balance += data.p2Change;
        }
      } else if (data.type === 'PROPERTY_BUY') {
        if (state.players[data.playerId]) {
          state.players[data.playerId].balance += data.amount;
        }
        if (state.properties[data.propertyId]) {
          state.properties[data.propertyId].owner = null;
        }
      } else if (data.type === 'MORTGAGE_TOGGLE') {
        if (state.properties[data.propertyId]) {
          const p = state.properties[data.propertyId];
          p.mortgaged = !p.mortgaged;
        }
        if (state.players[data.playerId]) {
          state.players[data.playerId].balance -= data.payout;
        }
      } else if (data.type === 'JAIL_STATUS') {
        if (state.players[data.playerId]) {
          state.players[data.playerId].inJail = data.prevJail;
          if (data.bailPaid) {
            state.players[data.playerId].balance += data.bailPaid;
          }
        }
      }
    }

    saveState();
    renderAll();
    showToast(`Undid transaction: ${last.type}`, 'success');
  }

  // 17. RESET & CLEAR STORAGE
  function confirmResetGame() {
    if (confirm('RESET GAME?\n\nThis will erase the current game state and return to player selection.')) {
      localStorage.removeItem(STORAGE_KEY);
      state.gameStarted = false;
      showView('startScreen');
      showToast('Game reset.', 'success');
    }
  }

  function confirmClearStorage() {
    if (confirm('CLEAR SAVED GAME?\n\nThis permanently erases local data.')) {
      localStorage.removeItem(STORAGE_KEY);
      state.gameStarted = false;
      showView('startScreen');
      showToast('Saved game cleared.', 'success');
    }
  }

  // ==========================================================================
  // MODAL & TOAST HELPERS
  // ==========================================================================

  function openModal(options) {
    modalTitle.textContent = options.title || 'ACTION';
    modalBody.innerHTML = options.bodyHTML || '';
    modalFooter.innerHTML = '';

    if (!options.hideConfirmBtn) {
      const confirmBtn = document.createElement('button');
      confirmBtn.className = options.confirmIsDanger ? 'danger-btn' : 'primary-btn';
      confirmBtn.textContent = options.confirmText || 'CONFIRM';
      confirmBtn.addEventListener('click', () => {
        if (options.onConfirm) {
          const success = options.onConfirm();
          if (success !== false) {
            closeModal();
          }
        } else {
          closeModal();
        }
      });
      modalFooter.appendChild(confirmBtn);
    }

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'sec-btn';
    cancelBtn.textContent = 'CANCEL';
    cancelBtn.addEventListener('click', closeModal);
    modalFooter.appendChild(cancelBtn);

    modalOverlay.classList.remove('hidden');
  }

  function closeModal() {
    modalOverlay.classList.add('hidden');
  }

  function showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // ==========================================================================
  // UTILITY FUNCTIONS
  // ==========================================================================

  function formatNumber(num) {
    return (num || 0).toLocaleString();
  }

  function groupToName(group) {
    const map = {
      brown: 'Brown',
      lightblue: 'Light Blue',
      pink: 'Pink',
      orange: 'Orange',
      red: 'Red',
      yellow: 'Yellow',
      green: 'Green',
      darkblue: 'Dark Blue'
    };
    return map[group] || group;
  }

  function getGroupColor(group) {
    const map = {
      brown: '#8b4513',
      lightblue: '#38bdf8',
      pink: '#ec4899',
      orange: '#f97316',
      red: '#ef4444',
      yellow: '#eab308',
      green: '#22c55e',
      darkblue: '#2563eb'
    };
    return map[group] || '#cccccc';
  }

  // Run on page load
  document.addEventListener('DOMContentLoaded', init);

})();
