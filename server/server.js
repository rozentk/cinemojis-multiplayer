const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// ✅ CORREÇÃO: Servir arquivos estáticos do diretório public
app.use(express.static(path.join(__dirname, '../public')));

// ✅ CORREÇÃO: Rota para servir o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 🎬 BASE DE DADOS EXPANDIDA - 20 FILMES
const moviesDatabase = [
    {
        title: "Titanic",
        variations: {
            easy: "🚢🧊🌊❤️",
            medium: "👩‍❤️‍👨🎨💎🎶", 
            hard: "💃🚪🛟✍️"
        },
        acceptedAnswers: ["titanic", "o titanic"]
    },
    {
        title: "O Rei Leão",
        variations: {
            easy: "🦁👑🌅🐗",
            medium: "👨‍👦💫🌟😈",
            hard: "🐒🌧️🦌🔥"
        },
        acceptedAnswers: ["rei leao", "o rei leao", "the lion king", "rei leão", "o rei leão"]
    },
    {
        title: "Avatar",
        variations: {
            easy: "🔵🌎🐉👽",
            medium: "👽🌿🎨🐎",
            hard: "💎🚀🌿🔵"
        },
        acceptedAnswers: ["avatar"]
    },
    {
        title: "Harry Potter",
        variations: {
            easy: "👦⚡🧙‍♂️🦉",
            medium: "⚡🧙‍♂️🏰🐍",
            hard: "💀📜🔥⚡"
        },
        acceptedAnswers: ["harry potter"]
    },
    {
        title: "Matrix",
        variations: {
            easy: "🕶️💊💻🔴",
            medium: "💻🔴💊🐇",
            hard: "🌐💊🔴👨‍💼"
        },
        acceptedAnswers: ["matrix"]
    },
    {
        title: "Star Wars",
        variations: {
            easy: "⭐⚔️👽🌌",
            medium: "🚀🌌⚔️🤖",
            hard: "💫🏰⚔️👁️"
        },
        acceptedAnswers: ["star wars", "guerra nas estrelas"]
    },
    {
        title: "Jurassic Park",
        variations: {
            easy: "🦖🌴🚙🔬",
            medium: "🐊🔍🏞️🥚",
            hard: "🧬🔬🌋🚁"
        },
        acceptedAnswers: ["jurassic park", "parque dos dinossauros", "parque jurassico"]
    },
    {
        title: "Toy Story",
        variations: {
            easy: "🤠⚔️🧸🚀",
            medium: "🎯📞🍕🚖",
            hard: "👶🎎🌞🎪"
        },
        acceptedAnswers: ["toy story"]
    },
    {
        title: "Frozen",
        variations: {
            easy: "👸❄️☃️❤️",
            medium: "🏰🌨️🔮⛄",
            hard: "💎👑🎵🌊"
        },
        acceptedAnswers: ["frozen", "frozen uma aventura congelante", "congelante"]
    },
    {
        title: "Homem-Aranha",
        variations: {
            easy: "🕷️👦🗽🕸️",
            medium: "🔴🔵🏙️👨‍🔬",
            hard: "💥🚇🎭📷"
        },
        acceptedAnswers: ["homem aranha", "spiderman", "spider-man"]
    },
    {
        title: "Batman",
        variations: {
            easy: "🦇👦💼🌃",
            medium: "🚗🃏🔦🏢",
            hard: "🎭💀🌀🔍"
        },
        acceptedAnswers: ["batman", "the batman", "cavaleiro das trevas"]
    },
    {
        title: "Super Mario Bros",
        variations: {
            easy: "👨🧒🍄🌟",
            medium: "🐢🏰👸🥚",
            hard: "🔨🐲🎮👑"
        },
        acceptedAnswers: ["super mario", "mario bros", "super mario bros"]
    },
    {
        title: "Vingadores",
        variations: {
            easy: "🦸‍♂️🦸‍♀️💎👊",
            medium: "🚀🛡️⚡🌎",
            hard: "🧤♾️⚔️👨‍🔬"
        },
        acceptedAnswers: ["vingadores", "avengers", "os vingadores"]
    },
    {
        title: "O Poderoso Chefão",
        variations: {
            easy: "👨💼🔫🍊",
            medium: "🎭🐴🛌💵",
            hard: "⚖️🔪🎻🍝"
        },
        acceptedAnswers: ["o poderoso chefa", "the godfather", "poderoso chefa"]
    },
    {
        title: "De Volta para o Futuro",
        variations: {
            easy: "🚗⏰⚡🔮",
            medium: "👨‍👦🕐🚀🎸",
            hard: "📼⚡🧪👵"
        },
        acceptedAnswers: ["de volta para o futuro", "back to the future"]
    },
    {
        title: "Senhor dos Anéis",
        variations: {
            easy: "💍🧙‍♂️🧝‍♂️⚔️",
            medium: "🏔️👁️🔥🧝‍♀️",
            hard: "🧌🗡️🌄🔮"
        },
        acceptedAnswers: ["senhor dos aneis", "senhor dos anéis", "lord of the rings"]
    },
    {
        title: "Pantera Negra",
        variations: {
            easy: "🐆👑💜🌍",
            medium: "🛸💎🤴🔬",
            hard: "💥🌸⚔️👸"
        },
        acceptedAnswers: ["pantera negra", "black panther"]
    },
    {
        title: "Coringa",
        variations: {
            easy: "🃏🤡💄🚬",
            medium: "🎭📺🔫🏙️",
            hard: "💃🎪🔨😄"
        },
        acceptedAnswers: ["coringa", "joker"]
    },
    {
        title: "Interestelar",
        variations: {
            easy: "🚀🌌🕐👨‍👧",
            medium: "🌽🕳️📚👨‍🔬",
            hard: "⏰🔄📡🌑"
        },
        acceptedAnswers: ["interestelar", "interstellar"]
    },
    {
        title: "Os Incríveis",
        variations: {
            easy: "👨‍👩‍👧‍👦🦸‍♂️💥🤖",
            medium: "🚀👗🌊👶",
            hard: "🏝️⚔️🧭🔧"
        },
        acceptedAnswers: ["os incriveis", "the incredibles", "increveis"]
    }
];

// Função para normalizar texto
function normalizeText(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim();
}

// Sistema de salas
const rooms = {};

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function createRoom(hostName, difficulty) {
    const roomCode = generateRoomCode();
    
    rooms[roomCode] = {
        host: hostName,
        players: {},
        difficulty: difficulty,
        gameState: 'waiting',
        currentRound: 0,
        totalRounds: 3,
        currentMovie: null,
        timer: null,
        hasRoundEnded: false,
        playersAnswered: new Set()
    };
    
    return roomCode;
}

function startRound(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;
    
    room.currentRound++;
    room.hasRoundEnded = false;
    room.playersAnswered.clear();
    
    const randomMovie = moviesDatabase[Math.floor(Math.random() * moviesDatabase.length)];
    room.currentMovie = {
        ...randomMovie,
        currentEmojis: randomMovie.variations[room.difficulty]
    };
    
    console.log(`Sala ${roomCode} - Rodada ${room.currentRound} iniciada: ${randomMovie.title}`);
    
    io.to(roomCode).emit('startRound', {
        roundNumber: room.currentRound,
        movie: room.currentMovie,
        totalRounds: room.totalRounds
    });
    
    room.timer = setTimeout(() => {
        if (!room.hasRoundEnded) {
            endRound(roomCode);
        }
    }, 15000);
}

function endRound(roomCode) {
    const room = rooms[roomCode];
    if (!room || room.hasRoundEnded) return;
    
    room.hasRoundEnded = true;
    clearTimeout(room.timer);
    
    console.log(`Sala ${roomCode} - Rodada ${room.currentRound} finalizada`);
    
    io.to(roomCode).emit('roundEnd', {
        roundNumber: room.currentRound
    });
    
    if (room.currentRound >= room.totalRounds) {
        setTimeout(() => endGame(roomCode), 3000);
    } else {
        setTimeout(() => startRound(roomCode), 3000);
    }
}

function endGame(roomCode) {
    const room = rooms[roomCode];
    if (!room) return;
    
    room.gameState = 'ended';
    
    const players = Object.values(room.players);
    const winner = players.reduce((prev, current) => 
        (prev.score > current.score) ? prev : current
    );
    
    io.to(roomCode).emit('gameEnd', {
        players: players,
        winner: winner
    });
    
    console.log(`Sala ${roomCode} - Jogo finalizado. Vencedor: ${winner.name}`);
}

// Conexões Socket.io
io.on('connection', (socket) => {
    console.log('Usuário conectado:', socket.id);

    socket.on('createRoom', (data) => {
        const roomCode = createRoom(data.playerName, data.difficulty);
        socket.join(roomCode);
        
        rooms[roomCode].players[socket.id] = {
            id: socket.id,
            name: data.playerName,
            score: 0,
            isHost: true
        };
        
        socket.emit('roomCreated', { roomCode: roomCode });
        io.to(roomCode).emit('playersUpdate', { 
            players: Object.values(rooms[roomCode].players) 
        });
        
        console.log(`Sala criada: ${roomCode} por ${data.playerName}`);
    });

    socket.on('joinRoom', (data) => {
        const room = rooms[data.roomCode];
        
        if (!room) {
            socket.emit('error', { message: 'Sala não encontrada!' });
            return;
        }
        
        if (room.gameState !== 'waiting') {
            socket.emit('error', { message: 'Jogo já em andamento!' });
            return;
        }
        
        socket.join(data.roomCode);
        
        room.players[socket.id] = {
            id: socket.id,
            name: data.playerName,
            score: 0,
            isHost: false
        };
        
        socket.emit('roomJoined', { roomCode: data.roomCode });
        io.to(data.roomCode).emit('playersUpdate', { 
            players: Object.values(room.players) 
        });
        
        console.log(`Jogador ${data.playerName} entrou na sala ${data.roomCode}`);
    });

    socket.on('startGame', (roomCode) => {
        const room = rooms[roomCode];
        if (room && room.players[socket.id]?.isHost) {
            room.gameState = 'playing';
            io.to(roomCode).emit('gameStarted');
            startRound(roomCode);
        }
    });

    socket.on('submitAnswer', (data) => {
        const room = rooms[data.roomCode];
        if (!room || room.hasRoundEnded) return;
        
        const player = room.players[socket.id];
        if (!player || room.playersAnswered.has(socket.id)) return;
        
        const normalizedAnswer = normalizeText(data.answer);
        const isCorrect = room.currentMovie.acceptedAnswers.some(answer => 
            normalizeText(answer) === normalizedAnswer
        );
        
        if (isCorrect) {
            room.playersAnswered.add(socket.id);
            
            const timeLeft = 15000 - (Date.now() - data.timestamp);
            const points = Math.max(100, Math.floor(timeLeft / 150));
            
            player.score += points;
            
            socket.emit('answerResult', { 
                correct: true, 
                points: points,
                movieTitle: room.currentMovie.title
            });
            
            io.to(data.roomCode).emit('playersUpdate', { 
                players: Object.values(room.players) 
            });
            
            console.log(`Jogador ${player.name} acertou! +${points} pontos`);
            
            if (room.playersAnswered.size >= Object.keys(room.players).length) {
                setTimeout(() => endRound(data.roomCode), 1000);
            }
        } else {
            socket.emit('answerResult', { 
                correct: false 
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectado:', socket.id);
        
        for (const roomCode in rooms) {
            if (rooms[roomCode].players[socket.id]) {
                delete rooms[roomCode].players[socket.id];
                io.to(roomCode).emit('playersUpdate', { 
                    players: Object.values(rooms[roomCode].players) 
                });
                
                if (rooms[roomCode].players[socket.id]?.isHost) {
                    io.to(roomCode).emit('hostLeft');
                    delete rooms[roomCode];
                }
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🎮 Servidor rodando na porta ${PORT}`);
    console.log(`🌐 Acesse: http://localhost:${PORT}`);
    console.log(`🎬 Base de dados: ${moviesDatabase.length} filmes carregados`);
});