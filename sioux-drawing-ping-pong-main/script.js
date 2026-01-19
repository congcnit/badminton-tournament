// Team member data organized by tiers with unique IDs
const teamMembersByTier = {
    chicken: [
        { id: 'chicken_1', name: "Quyen Phan", image: "images/Quyen Phan.png" },
        { id: 'chicken_2', name: "Khoa Le", image: "images/Khoa Le.png" },
        { id: 'chicken_3', name: "Khoa Nguyen", image: "images/Khoa Nguyen.png" },
        { id: 'chicken_4', name: "Dung Huynh", image: "images/Dung Huynh.png" },
        { id: 'chicken_5', name: "Yen Dang", image: "images/Yen Dang.png" },
        { id: 'chicken_6', name: "Duc Vo", image: "images/Duc Vo.png" }
    ],
    hawk: [
        { id: 'hawk_1', name: "Thanh Dang", image: "images/Thanh Dang.png" },
        { id: 'hawk_2', name: "Linh Pham", image: "images/Linh Pham.png" },
        { id: 'hawk_3', name: "Sang Truong", image: "images/Sang Truong.png" },
        { id: 'hawk_4', name: "Han Ho", image: "images/Han Ho.png" },
        { id: 'hawk_5', name: "Tri Phan", image: "images/Tri Phan.png" },
        { id: 'hawk_6', name: "Nhat Tran", image: "images/Nhat Tran.png" }
    ],
    eagle: [
        { id: 'eagle_1', name: "Cuong Phan", image: "images/Cuong Phan.png" },
        { id: 'eagle_2', name: "Khanh Huynh", image: "images/Khanh Huynh.png" },
        { id: 'eagle_3', name: "Son Huynh", image: "images/Son Huynh.png" },
        { id: 'eagle_4', name: "Cuong Nguyen", image: "images/Cuong Nguyen.png" },
        { id: 'eagle_5', name: "Lam Nguyen", image: "images/Lam Nguyen.png" },
        { id: 'eagle_6', name: "Ha Trinh", image: "images/Ha Trinh.png" }
    ],
    phoenix: [
        { id: 'phoenix_1', name: "Hoan Hoang", image: "images/Hoan Hoang.png" },
        { id: 'phoenix_2', name: "Cong Nguyen", image: "images/Cong Nguyen.png" },
        { id: 'phoenix_3', name: "Minh Van", image: "images/Minh Van.png" },
        { id: 'phoenix_4', name: "Khuong Hoang", image: "images/Khuong Hoang.png" },
        { id: 'phoenix_5', name: "Vu Truong", image: "images/Vu Truong.png" },
        { id: 'phoenix_6', name: "Thanh Vo", image: "images/Thanh Vo.png" }
    ]
};

// Flatten all team members for game logic
const teamMembers = Object.values(teamMembersByTier).flat();

// Game state
let availableMembers = [...teamMembers];
let selectedMembers = [];
let currentTier = 'chicken';
let tables = {
    a: { couples: [], count: 0 },
    b: { couples: [], count: 0 },
    c: { couples: [], count: 0 }
};

// DOM elements
const tierButtons = document.querySelectorAll('.tab-button');
const tierPanels = document.querySelectorAll('.tier-panel');
const shuffleBtn = document.getElementById('shuffle-btn');
const resetBtn = document.getElementById('reset-btn');
const clearSelectionBtn = document.getElementById('clear-selection-btn');
const tableModal = document.getElementById('table-modal');
const matchModal = document.getElementById('match-modal');
const closeModalBtn = document.getElementById('close-modal');
const matchesCount = document.getElementById('matches-count');
const remainingCount = document.getElementById('remaining-count');
const selectedCount = document.getElementById('selected-count');

// Initialize the game
function initGame() {
    updateStats();
    renderAllTierGrids();
    updateTableCounts();
    setupTabSwitching();
}

// Setup tab switching
function setupTabSwitching() {
    tierButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tier = button.dataset.tier;
            switchTier(tier);
        });
    });
}

// Switch between tiers
function switchTier(tier) {
    // Update active tab button
    tierButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tier="${tier}"]`).classList.add('active');
    
    // Update active panel
    tierPanels.forEach(panel => panel.classList.remove('active'));
    document.getElementById(`${tier}-panel`).classList.add('active');
    
    currentTier = tier;
}

// Update statistics
function updateStats() {
    const totalMatches = tables.a.count + tables.b.count + tables.c.count;
    matchesCount.textContent = totalMatches;
    remainingCount.textContent = availableMembers.length;
    selectedCount.textContent = selectedMembers.length;
}

// Update table counts
function updateTableCounts() {
    // Update table headers
    document.querySelector('#table-a .table-count').textContent = `${tables.a.count}/4`;
    document.querySelector('#table-b .table-count').textContent = `${tables.b.count}/4`;
    document.querySelector('#table-c .table-count').textContent = `${tables.c.count}/4`;
    
    // Update modal options
    document.getElementById('table-a-option-count').textContent = `${tables.a.count}/4`;
    document.getElementById('table-b-option-count').textContent = `${tables.b.count}/4`;
    document.getElementById('table-c-option-count').textContent = `${tables.c.count}/4`;
    
    // Update table states
    updateTableStates();
}

// Update table states (full/disabled)
function updateTableStates() {
    const tableElements = {
        a: document.getElementById('table-a'),
        b: document.getElementById('table-b'),
        c: document.getElementById('table-c')
    };
    
    const tableOptions = {
        a: document.querySelector('[data-table="a"]'),
        b: document.querySelector('[data-table="b"]'),
        c: document.querySelector('[data-table="c"]')
    };
    
    Object.keys(tables).forEach(tableKey => {
        const table = tables[tableKey];
        const tableElement = tableElements[tableKey];
        const tableOption = tableOptions[tableKey];
        
        // Remove existing classes
        tableElement.classList.remove('full', 'disabled');
        tableOption.classList.remove('disabled');
        
        // Add appropriate classes
        if (table.count >= 4) {
            tableElement.classList.add('full');
            tableOption.classList.add('disabled');
        }
    });
}

// Render all tier grids
function renderAllTierGrids() {
    Object.keys(teamMembersByTier).forEach(tier => {
        renderTierGrid(tier);
    });
}

// Render specific tier grid
function renderTierGrid(tier) {
    const grid = document.getElementById(`${tier}-grid`);
    grid.innerHTML = '';
    
    teamMembersByTier[tier].forEach(member => {
        const memberElement = createTeamMemberElement(member, tier);
        grid.appendChild(memberElement);
    });
}

// Create team member element
function createTeamMemberElement(member, tier) {
    const memberDiv = document.createElement('div');
    memberDiv.className = 'team-member';
    memberDiv.dataset.memberId = member.id;
    memberDiv.dataset.memberTier = tier;
    
    const isSelected = selectedMembers.some(selected => selected.id === member.id);
    const isMatched = !availableMembers.some(available => available.id === member.id);
    
    if (isSelected) memberDiv.classList.add('selected');
    if (isMatched) memberDiv.classList.add('matched');
    
    memberDiv.innerHTML = `
        <div class="member-image">
            <img src="${member.image}" alt="${member.name}">
        </div>
        <div class="member-name">${member.name}</div>
    `;
    
    // Add click handler with unique member reference
    memberDiv.addEventListener('click', () => {
        handleMemberClick(member, memberDiv);
    });
    
    return memberDiv;
}

// Handle member click
function handleMemberClick(member, element) {
    // Don't allow selection if member is already matched
    if (!availableMembers.some(available => available.id === member.id)) {
        return;
    }
    
    const isSelected = selectedMembers.some(selected => selected.id === member.id);
    
    if (isSelected) {
        // Deselect member
        selectedMembers = selectedMembers.filter(selected => selected.id !== member.id);
        updateAllMemberElements(member.id, false);
    } else {
        // Select member (max 2)
        if (selectedMembers.length < 2) {
            selectedMembers.push(member);
            updateAllMemberElements(member.id, true);
            
            // Show table selection when 2 members are selected
            if (selectedMembers.length === 2) {
                setTimeout(() => {
                    showTableSelection();
                }, 300);
            }
        } else {
            // Replace first selection
            const firstSelected = selectedMembers[0];
            selectedMembers.shift();
            updateAllMemberElements(firstSelected.id, false);
            
            selectedMembers.push(member);
            updateAllMemberElements(member.id, true);
        }
    }
    
    updateStats();
}

// Update all member elements with the same ID across all tabs
function updateAllMemberElements(memberId, isSelected) {
    const allMemberElements = document.querySelectorAll(`[data-member-id="${memberId}"]`);
    allMemberElements.forEach(element => {
        if (isSelected) {
            element.classList.add('selected');
        } else {
            element.classList.remove('selected');
        }
    });
}

// Show table selection modal
function showTableSelection() {
    // Update table option counts
    updateTableCounts();
    
    // Show modal with smooth transition
    const modal = tableModal;
    modal.style.display = 'block';
    // Trigger reflow
    modal.offsetHeight;
    modal.classList.add('show');
}

// Assign couple to table
function assignToTable(tableKey) {
    if (selectedMembers.length !== 2) return;
    
    const table = tables[tableKey];
    if (table.count >= 4) return; // Table is full
    
    const [member1, member2] = selectedMembers;
    
    // Remove matched members from available pool
    availableMembers = availableMembers.filter(member => 
        member.id !== member1.id && member.id !== member2.id
    );
    
    // Add couple to table
    const couple = {
        id: Date.now(),
        member1,
        member2,
        timestamp: new Date()
    };
    
    table.couples.push(couple);
    table.count++;
    
    // Clear selection
    selectedMembers = [];
    
    // Update display
    updateStats();
    renderAllTierGrids();
    addCoupleToTable(tableKey, couple);
    updateTableCounts();
    
    // Close table selection modal with smooth transition
    const modal = tableModal;
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
    
    // Show match animation
    showMatchAnimation(member1, member2, tableKey);
}

// Add couple to table display
function addCoupleToTable(tableKey, couple) {
    const tableCouples = document.getElementById(`table-${tableKey}-couples`);
    
    const coupleElement = document.createElement('div');
    coupleElement.className = 'couple';
    coupleElement.innerHTML = `
        <div class="couple-images">
            <div class="couple-image">
                <img src="${couple.member1.image}" alt="${couple.member1.name}">
            </div>
            <div class="couple-image">
                <img src="${couple.member2.image}" alt="${couple.member2.name}">
            </div>
        </div>
        <div class="couple-info">
            <div class="couple-names">${couple.member1.name} & ${couple.member2.name}</div>
        </div>
    `;
    
    tableCouples.appendChild(coupleElement);
    
    // Add animation
    coupleElement.style.opacity = '0';
    coupleElement.style.transform = 'translateY(20px)';
    setTimeout(() => {
        coupleElement.style.transition = 'all 0.5s ease';
        coupleElement.style.opacity = '1';
        coupleElement.style.transform = 'translateY(0)';
    }, 100);
}

// Show match animation
function showMatchAnimation(member1, member2, tableKey) {
    // Update modal content
    document.getElementById('match-person-1').src = member1.image;
    document.getElementById('match-person-2').src = member2.image;
    document.getElementById('match-name-1').textContent = member1.name;
    document.getElementById('match-name-2').textContent = member2.name;
    
    // Show modal with smooth transition
    const modal = matchModal;
    modal.style.display = 'block';
    // Trigger reflow
    modal.offsetHeight;
    modal.classList.add('show');
    
    // Add some fun match messages
    const messages = [
        `These two will make an amazing team on Table ${tableKey.toUpperCase()}!`,
        `Perfect match for Table ${tableKey.toUpperCase()}!`,
        `Table ${tableKey.toUpperCase()} just got stronger!`,
        `Dynamic duo assigned to Table ${tableKey.toUpperCase()}!`,
        `Table ${tableKey.toUpperCase()} power couple!`,
        `Unstoppable team for Table ${tableKey.toUpperCase()}!`,
        `Table ${tableKey.toUpperCase()} dream team!`,
        `Table ${tableKey.toUpperCase()} legends in the making!`
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    document.querySelector('.match-message').textContent = randomMessage;
    
    // Start continuous confetti
    startContinuousConfetti();
}

// Start continuous confetti animation
function startContinuousConfetti() {
    // Create confetti every 200ms (more frequent)
    const confettiInterval = setInterval(() => {
        if (matchModal.style.display === 'none' || !matchModal.classList.contains('show')) {
            clearInterval(confettiInterval);
            return;
        }
        createConfetti();
    }, 200);
    
    // Store the interval ID to clear it when modal closes
    matchModal.dataset.confettiInterval = confettiInterval;
}

// Stop continuous confetti
function stopContinuousConfetti() {
    const intervalId = matchModal.dataset.confettiInterval;
    if (intervalId) {
        clearInterval(parseInt(intervalId));
        matchModal.dataset.confettiInterval = null;
    }
}

// Shuffle team members
function shuffleTeamMembers() {
    // Add shuffle animation to all members
    const members = document.querySelectorAll('.team-member');
    members.forEach(member => {
        member.classList.add('shuffling');
    });
    
    setTimeout(() => {
        // Shuffle the available members array
        for (let i = availableMembers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableMembers[i], availableMembers[j]] = [availableMembers[j], availableMembers[i]];
        }
        
        // Remove shuffle animation and re-render
        members.forEach(member => {
            member.classList.remove('shuffling');
        });
        
        renderAllTierGrids();
    }, 600);
}

// Clear selection
function clearSelection() {
    selectedMembers = [];
    document.querySelectorAll('.team-member.selected').forEach(element => {
        element.classList.remove('selected');
    });
    updateStats();
}

// Reset game
function resetGame() {
    availableMembers = [...teamMembers];
    selectedMembers = [];
    tables = {
        a: { couples: [], count: 0 },
        b: { couples: [], count: 0 },
        c: { couples: [], count: 0 }
    };
    
    // Clear all selections
    document.querySelectorAll('.team-member.selected').forEach(element => {
        element.classList.remove('selected');
    });
    
    // Clear all tables
    document.querySelectorAll('.table-couples').forEach(container => {
        container.innerHTML = '';
    });
    
    updateStats();
    renderAllTierGrids();
    updateTableCounts();
}

// Event listeners
shuffleBtn.addEventListener('click', shuffleTeamMembers);
resetBtn.addEventListener('click', resetGame);
clearSelectionBtn.addEventListener('click', clearSelection);
closeModalBtn.addEventListener('click', () => {
    const modal = matchModal;
    stopContinuousConfetti();
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
});

// Table selection event listeners
document.querySelectorAll('.table-option').forEach(option => {
    option.addEventListener('click', () => {
        const tableKey = option.dataset.table;
        assignToTable(tableKey);
    });
});

// Close modals when clicking outside
tableModal.addEventListener('click', (e) => {
    if (e.target === tableModal) {
        const modal = tableModal;
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            clearSelection();
        }, 300);
    }
});

matchModal.addEventListener('click', (e) => {
    if (e.target === matchModal) {
        const modal = matchModal;
        stopContinuousConfetti();
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyS') {
        shuffleTeamMembers();
    } else if (e.code === 'KeyR') {
        resetGame();
    } else if (e.code === 'Escape') {
        clearSelection();
        tableModal.style.display = 'none';
    }
});

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', initGame);

// Add some fun confetti effect for matches
function createConfetti() {
    const colors = ['#ff6b6b', '#667eea', '#feca57', '#ff9ff3', '#48dbfb'];
    
    for (let i = 0; i < 8; i++) { // Increased to 8 pieces per batch for more crowded effect
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '6px'; // Slightly smaller for more pieces
        confetti.style.height = '6px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '-10px';
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '9999';
        
        document.body.appendChild(confetti);
        
        const animation = confetti.animate([
            { transform: 'translateY(0px) rotate(0deg)', opacity: 1 },
            { transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 1500 + 1500, // Slightly faster animation
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        animation.onfinish = () => {
            if (document.body.contains(confetti)) {
                document.body.removeChild(confetti);
            }
        };
    }
}

// Add confetti to match creation
const originalAssignToTable = assignToTable;
assignToTable = function(tableKey) {
    originalAssignToTable(tableKey);
    setTimeout(createConfetti, 500);
}; 