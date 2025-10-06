const socket = io();
let currentRoom = null;
let currentPlayer = null;
let hasAnsweredThisRound = false; // ✅ Controla se já respondeu na rodada
let currentRound = 0;

// Elementos da DOM
const elements = {
    menu: document.getElementById('menu'),
    createScreen: document.getElementById('createScreen'),
    joinScreen: document.getElementById('joinScreen'),
    waitingRoom: document.getElementById('waitingRoom'),
    gameScreen: document.getElementById('gameScreen'),
    resultsScreen: document.getElementById('resultsScreen'),
    
    // Botões menu
    createBtn: document.getElementById('createBtn'),
    joinBtn: document.getElementById('joinBtn'),
    
    // Tela criar
    createForm: document.getElementById('createForm'),
    hostName: document.getElementById('hostName'),
    difficulty: document.getElementById('difficulty'),
    
    // Tela entrar
    joinForm: document.getElementById('joinForm'),
    playerName: document.getElementById('playerName'),
    roomCode: document.getElementById('roomCode'),
    
    // Sala de espera
    roomCodeDisplay: document.getElementById('roomCodeDisplay'),
    playersList: document.getElementById('playersList'),
    startBtn: document.getElementById('startBtn'),
    backBtn: document.getElementById('backBtn'),
    
    // Jogo
    roundInfo: document.getElementById('roundInfo'),
    emojisDisplay: document.getElementById('emojisDisplay'),
    answerInput: document.getElementById('answerInput'),
    submitBtn: document.getElementById('submitBtn'),
    timer: document.getElementById('timer'),
    playersScores: document.getElementById('playersScores'),
    
    // Resultados
    finalScores: document.getElementById('finalScores'),
    winnerName: document.getElementById('winnerName'),
    playAgainBtn: document.getElementById('playAgainBtn')
};

// Navegação
elements.createBtn.addEventListener('click', () => showScreen('createScreen'));
elements.joinBtn.addEventListener('click', () => showScreen('joinScreen'));
elements.backBtn.addEventListener('click', () => {
    socket.disconnect();
    socket.connect();
    showScreen('menu');
});

// Formulários
elements.createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const playerName = elements.hostName.value.trim();
    const difficulty = elements.difficulty.value;
    
    if (playerName) {
        currentPlayer = playerName;
        socket.emit('createRoom', { playerName, difficulty });
    }
});

elements.joinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const playerName = elements.playerName.value.trim();
    const roomCode = elements.roomCode.value.trim().toUpperCase();
    
    if (playerName && roomCode) {
        currentPlayer = playerName;
        socket.emit('joinRoom', { playerName, roomCode });
    }
});

// Iniciar jogo
elements.startBtn.addEventListener('click', () => {
    socket.emit('startGame', currentRoom);
});

// Submeter resposta
elements.submitBtn.addEventListener('click', submitAnswer);
elements.answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitAnswer();
});

function submitAnswer() {
    if (hasAnsweredThisRound) {
        console.log('Já respondeu nesta rodada');
        return;
    }
    
    const answer = elements.answerInput.value.trim();
    if (!answer) return;
    
    hasAnsweredThisRound = true;
    elements.answerInput.disabled = true;
    elements.submitBtn.disabled = true;
    
    socket.emit('submitAnswer', {
        answer: answer,
        roomCode: currentRoom,
        timestamp: Date.now()
    });
}

// Socket events
socket.on('roomCreated', (data) => {
    currentRoom = data.roomCode;
    showScreen('waitingRoom');
    elements.roomCodeDisplay.textContent = currentRoom;
});

socket.on('roomJoined', (data) => {
    currentRoom = data.roomCode;
    showScreen('waitingRoom');
    elements.roomCodeDisplay.textContent = currentRoom;
});

socket.on('error', (data) => {
    alert(data.message);
});

socket.on('playersUpdate', (data) => {
    updatePlayersList(data.players);
    
    // Mostrar/ocultar botão iniciar se for host
    const isHost = data.players.find(p => p.id === socket.id)?.isHost;
    elements.startBtn.style.display = isHost ? 'block' : 'none';
});

socket.on('gameStarted', () => {
    showScreen('gameScreen');
    hasAnsweredThisRound = false; // ✅ Reset flag de resposta
});

socket.on('startRound', (data) => {
    console.log('Rodada iniciada:', data.roundNumber);
    currentRound = data.roundNumber;
    hasAnsweredThisRound = false; // ✅ Reset flag de resposta
    
    // Atualizar UI
    elements.roundInfo.textContent = `Rodada ${data.roundNumber}/${data.totalRounds}`;
    elements.emojisDisplay.textContent = data.movie.currentEmojis;
    elements.answerInput.value = '';
    elements.answerInput.disabled = false;
    elements.submitBtn.disabled = false;
    
    // Iniciar timer visual
    startTimer(15);
});

socket.on('roundEnd', (data) => {
    console.log('Rodada finalizada:', data.roundNumber);
    elements.answerInput.disabled = true;
    elements.submitBtn.disabled = true;
    elements.emojisDisplay.textContent = '⌛ Rodada finalizada...';
});

socket.on('answerResult', (data) => {
    if (data.correct) {
        showParticles();
        elements.emojisDisplay.innerHTML = `✅ Correto! +${data.points} pontos<br>🎬 ${data.movieTitle}`;
        elements.emojisDisplay.classList.add('correct');
    } else {
        elements.emojisDisplay.textContent = '❌ Tente novamente!';
        elements.emojisDisplay.classList.add('shake');
        setTimeout(() => {
            elements.emojisDisplay.classList.remove('shake');
        }, 500);
    }
});

socket.on('gameEnd', (data) => {
    showScreen('resultsScreen');
    displayFinalResults(data.players, data.winner);
});

socket.on('hostLeft', () => {
    alert('O host saiu da sala!');
    showScreen('menu');
});

// Funções auxiliares
function showScreen(screenName) {
    // Esconder todas as telas
    Object.values(elements).forEach(element => {
        if (element && element.classList && typeof element.classList === 'object') {
            if (['menu', 'createScreen', 'joinScreen', 'waitingRoom', 'gameScreen', 'resultsScreen'].includes(element.id)) {
                element.classList.remove('active');
            }
        }
    });
    
    // Mostrar tela atual
    if (elements[screenName]) {
        elements[screenName].classList.add('active');
    }
}

function updatePlayersList(players) {
    elements.playersList.innerHTML = players.map(player => `
        <div class="player-item ${player.isHost ? 'host' : ''}">
            <span class="player-name">${player.name} ${player.isHost ? '👑' : ''}</span>
            <span class="player-score">${player.score} pts</span>
        </div>
    `).join('');
    
    // Atualizar também no jogo
    elements.playersScores.innerHTML = players.map(player => `
        <div class="score-item ${player.name === currentPlayer ? 'current-player' : ''}">
            <span>${player.name}</span>
            <span>${player.score} pts</span>
        </div>
    `).join('');
}

function startTimer(seconds) {
    let timeLeft = seconds;
    elements.timer.textContent = timeLeft;
    elements.timer.style.width = '100%';
    
    const timerInterval = setInterval(() => {
        timeLeft--;
        elements.timer.textContent = timeLeft;
        elements.timer.style.width = `${(timeLeft / seconds) * 100}%`;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
        }
    }, 1000);
}

function displayFinalResults(players, winner) {
    const sortedPlayers = players.sort((a, b) => b.score - a.score);
    
    elements.finalScores.innerHTML = sortedPlayers.map((player, index) => `
        <div class="final-score-item ${player.id === winner.id ? 'winner' : ''}">
            <div class="player-rank">#${index + 1}</div>
            <div class="player-info">
                <span class="player-name">${player.name} ${player.id === winner.id ? '👑' : ''}</span>
                <span class="player-score">${player.score} pontos</span>
            </div>
        </div>
    `).join('');
    
    elements.winnerName.textContent = winner.name;
}

function showParticles() {
    const particles = document.createElement('div');
    particles.className = 'particles';
    particles.innerHTML = Array.from({length: 20}, () => 
        `<div class="particle" style="
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 1}s;
        ">🎉</div>`
    ).join('');
    
    document.body.appendChild(particles);
    setTimeout(() => particles.remove(), 2000);
}

// Inicialização
showScreen('menu');