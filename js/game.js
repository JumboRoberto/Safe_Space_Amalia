// js/game.js - Módulo de Distracción Cognitiva y Juegos Arcade (Memoria 3D, Canvas Catcher & Organizador Mágico Dopamine Edition)

let memoryGameState = {
    firstCard: null, secondCard: null,
    hasFlippedCard: false, lockBoard: false,
    matchedPairs: 0, totalPairs: 0,
    moves: 0, time: 0, timerInterval: null
};

let activeCatcherGame = null;
let activeGoodsProGame = null;

// ==========================================
// SINTETIZADOR DE EFECTOS DE SONIDO (Web Audio API - Escala Pentatónica Ascendente)
// ==========================================
class SoundFX {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    playPop() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(450, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(850, this.ctx.currentTime + 0.07);
            gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.07);
        } catch (e) { }
    }

    // Melodía Pentatónica Ascendente para Combos
    playComboNote(step = 0) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const pentatonicScale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
            const freq = pentatonicScale[step % pentatonicScale.length];
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.28);
        } catch (e) { }
    }

    playMatch() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.05);
                gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.05 + 0.22);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(this.ctx.currentTime + idx * 0.05);
                osc.stop(this.ctx.currentTime + idx * 0.05 + 0.22);
            });
        } catch (e) { }
    }

    playWin() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.09);
                gain.gain.setValueAtTime(0.25, this.ctx.currentTime + idx * 0.09);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.09 + 0.35);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(this.ctx.currentTime + idx * 0.09);
                osc.stop(this.ctx.currentTime + idx * 0.09 + 0.35);
            });
        } catch (e) { }
    }

    playLose() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;
        try {
            const notes = [380, 320, 260, 200];
            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.12);
                gain.gain.setValueAtTime(0.18, this.ctx.currentTime + idx * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.12 + 0.25);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(this.ctx.currentTime + idx * 0.12);
                osc.stop(this.ctx.currentTime + idx * 0.12 + 0.25);
            });
        } catch (e) { }
    }
}

const soundFx = new SoundFX();

// 1. Inyectar estilos dinámicamente
function injectGameStyles() {
    if (document.getElementById('game-styles')) return;
    const style = document.createElement('style');
    style.id = 'game-styles';
    style.innerHTML = `
        .game-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-weight: bold; color: #fff; }
        .difficulty-btn { background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: bold; transition: 0.3s; margin: 5px; }
        .difficulty-btn:hover { transform: scale(1.05); background: #ff7b82; box-shadow: 0 0 15px rgba(255, 42, 95, 0.5); }
        .back-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 6px 14px; border-radius: 8px; cursor: pointer; transition: 0.2s; font-size: 0.85rem; }
        .back-btn:hover { background: rgba(255,255,255,0.2); }
        .memory-game-board { display: grid; gap: 10px; margin: 0 auto; perspective: 1000px; max-width: 100%; }
        .memory-card { position: relative; width: 100%; aspect-ratio: 1 / 1; transform-style: preserve-3d; transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1); cursor: pointer; }
        .memory-card.flip { transform: rotateY(180deg); }
        .memory-card.matched { animation: pulseMatch 0.5s ease; cursor: default; }
        .card-face { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); display: flex; justify-content: center; align-items: center; }
        .card-front { background-color: var(--glass); border: 2px solid var(--primary); transform: rotateY(180deg); background-size: cover; background-position: center; }
        .card-back { background: linear-gradient(135deg, var(--primary), var(--secondary)); font-size: 2rem; color: white; border: 1px solid rgba(255,255,255,0.2); }
        @keyframes pulseMatch { 0% { transform: rotateY(180deg) scale(1); } 50% { transform: rotateY(180deg) scale(1.1); box-shadow: 0 0 30px #ff9a9e; } 100% { transform: rotateY(180deg) scale(1); } }
    `;
    document.head.appendChild(style);
}

// 2. Menú Principal de Juegos (Selector General)
function openGames() {
    injectGameStyles();
    stopCatcherGame();
    stopGoodsProGame();

    const content = `
        <div style="text-align:center; padding: 10px;">
            <h2 style="color: #ff7eb3; font-size: 1.8rem; font-weight: 600; margin-bottom: 5px;">Distracción Cognitiva</h2>
            <p style="color: #a1a1aa; font-weight: 300; font-size: 0.95rem; margin-bottom: 25px;">Selecciona una actividad para recargar tu mente y liberar dopamina ✨</p>
            
            <div class="game-selector-grid">
                <div class="game-card-select" onclick="openGoodsProMenu()">
                    <span class="game-badge">DOPAMINE EDITION 🔥</span>
                    <i class="fas fa-magic game-icon"></i>
                    <h3>Organizador Mágico</h3>
                    <p>Juego de clasificación hiper-adictivo con combos musicales, fuegos artificiales y poder-ups.</p>
                </div>

                <div class="game-card-select" onclick="startCatcherGame()">
                    <i class="fas fa-meteor game-icon"></i>
                    <h3>Atrapando Calma</h3>
                    <p>Juego arcade 2D. Atrapa estrellas y corazones esquivando la ansiedad.</p>
                </div>
                
                <div class="game-card-select" onclick="openMemoryMenu()">
                    <i class="fas fa-brain game-icon"></i>
                    <h3>Bóveda de Memoria</h3>
                    <p>Encuentra los pares de nuestras mejores fotos juntos.</p>
                </div>
            </div>
        </div>
    `;
    openModal(content);
}

// 3. Menú de Memoria 3D
function openMemoryMenu() {
    const content = `
        <div style="text-align:center; padding: 10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px;">
                <button class="back-btn" onclick="openGames()"><i class="fas fa-arrow-left"></i> Volver</button>
                <h2 style="color: #ff7eb3; font-size: 1.5rem; font-weight: 600; margin: 0;">Juego de Memoria</h2>
                <div style="width:70px;"></div>
            </div>
            <p style="margin-bottom: 20px; color: #fff; font-weight: 300;">Elige la dificultad del tablero:</p>
            <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; margin-top: 20px;">
                <button class="difficulty-btn" onclick="initMemoryGame(4)">Fácil (8 Cartas)</button>
                <button class="difficulty-btn" onclick="initMemoryGame(6)">Intermedio (12 Cartas)</button>
                <button class="difficulty-btn" onclick="initMemoryGame(8)">Difícil (16 Cartas)</button>
            </div>
        </div>
    `;
    openModal(content);
}

function initMemoryGame(pairs) {
    memoryGameState = {
        firstCard: null, secondCard: null,
        hasFlippedCard: false, lockBoard: false,
        matchedPairs: 0, totalPairs: pairs,
        moves: 0, time: 0, timerInterval: null
    };

    let cols = pairs === 4 ? 4 : (pairs === 6 ? 4 : 4);
    const content = `
        <div class="game-header">
            <button class="back-btn" onclick="openMemoryMenu()"><i class="fas fa-arrow-left"></i> Nivel</button>
            <span id="move-counter">Movimientos: 0</span>
            <span id="time-counter">Tiempo: 0s</span>
        </div>
        <div id="memory-board" class="memory-game-board" style="grid-template-columns: repeat(${cols}, 1fr);">
        </div>
    `;
    openModal(content);
    generateCards(pairs);
    startTimer();
}

function generateCards(pairs) {
    const board = document.getElementById('memory-board');
    if (!board) return;
    let selectedMemories = [];
    let availableMemories = [...database.memories];

    for (let i = 0; i < pairs; i++) {
        const randomIndex = Math.floor(Math.random() * availableMemories.length);
        selectedMemories.push(availableMemories[randomIndex]);
        availableMemories.splice(randomIndex, 1);
    }

    let gameCards = [...selectedMemories, ...selectedMemories];
    gameCards = gameCards.sort(() => Math.random() - 0.5);

    board.innerHTML = gameCards.map(memory => `
        <div class="memory-card" data-id="${memory.id}" onclick="flipCard(this)">
            <div class="card-face card-front" style="background-image: url('${memory.image}')"></div>
            <div class="card-face card-back"><i class="fas fa-heart"></i></div>
        </div>
    `).join('');
}

function flipCard(cardElement) {
    if (memoryGameState.lockBoard) return;
    if (cardElement === memoryGameState.firstCard) return;

    cardElement.classList.add('flip');

    if (!memoryGameState.hasFlippedCard) {
        memoryGameState.hasFlippedCard = true;
        memoryGameState.firstCard = cardElement;
        return;
    }

    memoryGameState.secondCard = cardElement;
    memoryGameState.moves++;
    const moveCounter = document.getElementById('move-counter');
    if (moveCounter) moveCounter.innerText = `Movimientos: ${memoryGameState.moves}`;

    checkForMatch();
}

function checkForMatch() {
    let isMatch = memoryGameState.firstCard.dataset.id === memoryGameState.secondCard.dataset.id;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    memoryGameState.firstCard.classList.add('matched');
    memoryGameState.secondCard.classList.add('matched');
    memoryGameState.firstCard.style.pointerEvents = 'none';
    memoryGameState.secondCard.style.pointerEvents = 'none';
    memoryGameState.matchedPairs++;

    if (memoryGameState.matchedPairs === memoryGameState.totalPairs) {
        setTimeout(gameWon, 600);
    }
    resetBoard();
}

function unflipCards() {
    memoryGameState.lockBoard = true;
    setTimeout(() => {
        memoryGameState.firstCard.classList.remove('flip');
        memoryGameState.secondCard.classList.remove('flip');
        resetBoard();
    }, 1200);
}

function resetBoard() {
    [memoryGameState.hasFlippedCard, memoryGameState.lockBoard] = [false, false];
    [memoryGameState.firstCard, memoryGameState.secondCard] = [null, null];
}

function startTimer() {
    memoryGameState.timerInterval = setInterval(() => {
        memoryGameState.time++;
        const timerElement = document.getElementById('time-counter');
        if (timerElement) {
            timerElement.innerText = `Tiempo: ${memoryGameState.time}s`;
        }
    }, 1000);
}

function stopTimer() {
    if (memoryGameState.timerInterval) {
        clearInterval(memoryGameState.timerInterval);
        memoryGameState.timerInterval = null;
    }
}

function gameWon() {
    stopTimer();
    soundFx.playWin();
    const content = `
        <div style="text-align:center; padding: 20px;">
            <i class="fas fa-trophy" style="font-size: 4rem; color: #f1c40f; margin-bottom: 20px; filter: drop-shadow(0 0 10px rgba(241, 196, 15, 0.5));"></i>
            <h2 style="color: #ff7eb3; font-weight: 600;">¡Reto Superado, Amalia!</h2>
            <p style="margin-top: 15px; font-size: 1.2rem; color: #fff; font-weight: 300;">
                Completaste el tablero en <b>${memoryGameState.time} segundos</b> usando <b>${memoryGameState.moves} movimientos</b>.
            </p>
            <p style="margin-top: 15px; font-style: italic; color: #ff2a5f; font-weight: 600;">
                "Tu cerebro es brillante, pero sigo creyendo que tu sonrisa es mejor."
            </p>
            <div style="display:flex; justify-content:center; gap:10px; margin-top:25px;">
                <button class="back-btn" onclick="openGames()">Menú Principal</button>
                <button class="difficulty-btn" onclick="openMemoryMenu()">Jugar de nuevo</button>
            </div>
        </div>
    `;
    openModal(content);
}

// ==========================================
// 4. MOTOR DE JUEGO ARCADE 2D: "ATRAPANDO CALMA"
// ==========================================

function startCatcherGame() {
    stopCatcherGame();
    stopGoodsProGame();

    const highscore = localStorage.getItem('danna_catcher_highscore') || 0;

    const content = `
        <div class="canvas-game-wrapper">
            <div style="width:100%; display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <button class="back-btn" onclick="openGames()"><i class="fas fa-arrow-left"></i> Menú</button>
                <span style="color:#ff7eb3; font-weight:600; font-size:1.2rem;">Atrapando Calma ✨</span>
                <span style="color:#ffd700; font-weight:600; font-size:0.85rem;"><i class="fas fa-crown"></i> Max: <span id="catcher-highscore">${highscore}</span></span>
            </div>

            <div class="canvas-hud">
                <div class="hud-item"><i class="fas fa-star"></i> Puntos: <span id="catcher-score">0</span></div>
                <div class="hud-item" id="catcher-level-text">Nivel 1</div>
                <div class="hud-item"><i class="fas fa-heart"></i> Vidas: <span id="catcher-lives">❤️❤️❤️</span></div>
            </div>

            <canvas id="catcher-canvas" width="500" height="360"></canvas>

            <div class="game-controls-hint">
                <span>🖱️ Mueve el mouse</span>
                <span>📱 Desliza el dedo</span>
                <span>⌨️ Teclas ← / →</span>
            </div>
        </div>
    `;
    openModal(content);

    setTimeout(() => {
        const canvas = document.getElementById('catcher-canvas');
        if (canvas) {
            activeCatcherGame = new CatcherGame(canvas);
            activeCatcherGame.start();
        }
    }, 50);
}

function stopCatcherGame() {
    if (activeCatcherGame) {
        activeCatcherGame.stop();
        activeCatcherGame = null;
    }
}

class CatcherGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.isRunning = false;
        this.animFrameId = null;

        this.paddleWidth = 95;
        this.paddleHeight = 18;
        this.paddleX = (this.width - this.paddleWidth) / 2;
        this.paddleSpeed = 8;
        this.moveLeft = false;
        this.moveRight = false;

        this.items = [];
        this.particles = [];
        this.floatingTexts = [];
        this.lastSpawnTime = 0;
        this.spawnInterval = 900;

        this.slowMoTimer = 0;
        this.shieldActive = false;

        this.milestonesReached = new Set();
        this.messages = [
            { score: 50, text: "¡Abrazo virtual enviado por Roberto! 💕" },
            { score: 100, text: "¡Tu mente brilla increíble! ✨" },
            { score: 200, text: "¡Eres pura paz e inteligencia, Amalia! 🌟" },
            { score: 350, text: "¡Campeona absoluta del refugio! 👑" }
        ];

        this.bindEvents();
    }

    bindEvents() {
        this.onMouseMove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            this.paddleX = mouseX - this.paddleWidth / 2;
            this.clampPaddle();
        };

        this.onTouchMove = (e) => {
            if (e.touches.length > 0) {
                const rect = this.canvas.getBoundingClientRect();
                const touchX = e.touches[0].clientX - rect.left;
                this.paddleX = touchX - this.paddleWidth / 2;
                this.clampPaddle();
            }
        };

        this.onKeyDown = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.moveLeft = true;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.moveRight = true;
        };

        this.onKeyUp = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.moveLeft = false;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.moveRight = false;
        };

        this.canvas.addEventListener('mousemove', this.onMouseMove);
        this.canvas.addEventListener('touchmove', this.onTouchMove, { passive: true });
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
    }

    unbindEvents() {
        if (this.canvas) {
            this.canvas.removeEventListener('mousemove', this.onMouseMove);
            this.canvas.removeEventListener('touchmove', this.onTouchMove);
        }
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
    }

    clampPaddle() {
        if (this.paddleX < 0) this.paddleX = 0;
        if (this.paddleX + this.paddleWidth > this.width) this.paddleX = this.width - this.paddleWidth;
    }

    start() {
        this.isRunning = true;
        this.lastSpawnTime = performance.now();
        this.loop(performance.now());
    }

    stop() {
        this.isRunning = false;
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }
        this.unbindEvents();
    }

    spawnItem() {
        const types = [
            { type: 'heart', symbol: '💖', pts: 15, weight: 45, speed: 2.2, color: '#ff2a5f' },
            { type: 'star', symbol: '🌟', pts: 25, weight: 30, speed: 2.8, color: '#ffd700' },
            { type: 'coffee', symbol: '☕', pts: 20, weight: 10, speed: 2.0, color: '#00f2fe', power: 'slow' },
            { type: 'shield', symbol: '🛡️', pts: 10, weight: 7, speed: 1.8, color: '#6366f1', power: 'shield' },
            { type: 'stress', symbol: '🌩️', pts: -15, weight: 25, speed: 2.5, color: '#a855f7', penalty: true }
        ];

        const speedMult = 1 + (this.level - 1) * 0.35;
        const totalWeight = types.reduce((acc, t) => acc + t.weight, 0);
        let rand = Math.random() * totalWeight;
        let selected = types[0];

        for (let t of types) {
            if (rand < t.weight) {
                selected = t;
                break;
            }
            rand -= t.weight;
        }

        const radius = 18;
        const x = radius + Math.random() * (this.width - radius * 2);

        this.items.push({
            x: x,
            y: -radius,
            radius: radius,
            symbol: selected.symbol,
            pts: selected.pts,
            speed: selected.speed * speedMult,
            color: selected.color,
            power: selected.power,
            penalty: selected.penalty
        });
    }

    addParticles(x, y, color, count = 15) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 3.5;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.03,
                radius: 2 + Math.random() * 3,
                color: color
            });
        }
    }

    addFloatingText(x, y, text, color = '#ff7eb3') {
        this.floatingTexts.push({
            x: x,
            y: y,
            text: text,
            alpha: 1.0,
            vy: -1.2,
            color: color
        });
    }

    update(now) {
        if (this.moveLeft) this.paddleX -= this.paddleSpeed;
        if (this.moveRight) this.paddleX += this.paddleSpeed;
        this.clampPaddle();

        if (this.slowMoTimer > 0) {
            this.slowMoTimer -= 16;
        }

        const currentInterval = this.spawnInterval / (1 + (this.level - 1) * 0.2);
        if (now - this.lastSpawnTime > currentInterval) {
            this.spawnItem();
            this.lastSpawnTime = now;
        }

        const effectiveSlow = this.slowMoTimer > 0 ? 0.5 : 1.0;
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.y += item.speed * effectiveSlow;

            const paddleY = this.height - 35;
            if (
                item.y + item.radius >= paddleY &&
                item.y - item.radius <= paddleY + this.paddleHeight &&
                item.x >= this.paddleX - 5 &&
                item.x <= this.paddleX + this.paddleWidth + 5
            ) {
                if (item.penalty) {
                    if (this.shieldActive) {
                        this.shieldActive = false;
                        this.addFloatingText(item.x, item.y, "🛡️ ¡Escudo Bloqueó!", "#6366f1");
                        this.addParticles(item.x, item.y, "#6366f1", 12);
                    } else {
                        this.lives--;
                        this.score = Math.max(0, this.score + item.pts);
                        this.addFloatingText(item.x, item.y, "-1 Vida ☁️", "#a855f7");
                        this.addParticles(item.x, item.y, "#a855f7", 18);
                        soundFx.playLose();
                    }
                } else {
                    this.score += item.pts;
                    this.addParticles(item.x, item.y, item.color, 16);
                    soundFx.playPop();

                    if (item.power === 'slow') {
                        this.slowMoTimer = 4000;
                        this.addFloatingText(item.x, item.y, "☕ Tiempo Relajado", "#00f2fe");
                    } else if (item.power === 'shield') {
                        this.shieldActive = true;
                        this.addFloatingText(item.x, item.y, "🛡️ Escudo Activado", "#6366f1");
                    } else {
                        this.addFloatingText(item.x, item.y, `+${item.pts}`, item.color);
                    }
                }

                this.updateHUD();
                this.checkMilestones();
                this.items.splice(i, 1);
                continue;
            }

            if (item.y - item.radius > this.height) {
                this.items.splice(i, 1);
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.vy;
            ft.alpha -= 0.015;
            if (ft.alpha <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }

        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    checkMilestones() {
        if (this.score >= 250 && this.level < 3) {
            this.level = 3;
            this.addFloatingText(this.width / 2, 100, "✨ ¡NIVEL 3: MODO MÁGICO! ✨", "#ffd700");
        } else if (this.score >= 100 && this.level < 2) {
            this.level = 2;
            this.addFloatingText(this.width / 2, 100, "💖 ¡NIVEL 2: LLUVIAS DE AMOR! 💖", "#ff7eb3");
        }

        for (let m of this.messages) {
            if (this.score >= m.score && !this.milestonesReached.has(m.score)) {
                this.milestonesReached.add(m.score);
                this.addFloatingText(this.width / 2, 140, m.text, "#ffffff");
            }
        }
    }

    updateHUD() {
        const scoreElem = document.getElementById('catcher-score');
        const livesElem = document.getElementById('catcher-lives');
        const levelElem = document.getElementById('catcher-level-text');

        if (scoreElem) scoreElem.innerText = this.score;
        if (livesElem) {
            livesElem.innerText = '❤️'.repeat(Math.max(0, this.lives)) + '🖤'.repeat(Math.max(0, 3 - this.lives));
        }
        if (levelElem) levelElem.innerText = `Nivel ${this.level}`;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        for (let i = 0; i < 20; i++) {
            const starX = (i * 27 + (Date.now() * 0.01)) % this.width;
            const starY = (i * 43) % this.height;
            this.ctx.fillRect(starX, starY, 2, 2);
        }

        if (this.slowMoTimer > 0) {
            this.ctx.fillStyle = 'rgba(0, 242, 254, 0.06)';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        const paddleY = this.height - 35;
        const grad = this.ctx.createLinearGradient(this.paddleX, 0, this.paddleX + this.paddleWidth, 0);

        if (this.shieldActive) {
            grad.addColorStop(0, '#6366f1');
            grad.addColorStop(1, '#a855f7');
        } else {
            grad.addColorStop(0, '#ff7eb3');
            grad.addColorStop(1, '#ff2a5f');
        }

        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = this.shieldActive ? '#6366f1' : '#ff2a5f';

        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.roundRect(this.paddleX, paddleY, this.paddleWidth, this.paddleHeight, 10);
        this.ctx.fill();

        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.shieldActive ? '🛡️' : '🤍 Refugio', this.paddleX + this.paddleWidth / 2, paddleY + 13);

        for (let item of this.items) {
            this.ctx.font = `${item.radius * 1.5}px sans-serif`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(item.symbol, item.x, item.y);
        }

        for (let p of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        for (let ft of this.floatingTexts) {
            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, ft.alpha);
            this.ctx.fillStyle = ft.color;
            this.ctx.font = 'bold 15px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = '#000000';
            this.ctx.fillText(ft.text, ft.x, ft.y);
            this.ctx.restore();
        }
    }

    loop(now) {
        if (!this.isRunning) return;
        this.update(now);
        this.draw();
        this.animFrameId = requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    gameOver() {
        this.stop();
        soundFx.playLose();

        const currentHigh = parseInt(localStorage.getItem('danna_catcher_highscore') || '0');
        const isNewHigh = this.score > currentHigh;
        if (isNewHigh) {
            localStorage.setItem('danna_catcher_highscore', this.score.toString());
        }

        const content = `
            <div style="text-align:center; padding: 20px;">
                <i class="fas ${isNewHigh ? 'fa-crown' : 'fa-star'}" style="font-size: 3.5rem; color: #ffd700; margin-bottom: 15px;"></i>
                <h2 style="color: #ff7eb3; font-weight: 600;">${isNewHigh ? '¡Nuevo Récord de Calma!' : '¡Gran Partida, Amalia!'}</h2>
                <p style="margin-top: 15px; font-size: 1.2rem; color: #fff;">
                    Conseguiste <b>${this.score} Puntos</b> en el Nivel <b>${this.level}</b>.
                </p>
                <p style="margin-top: 15px; font-style: italic; color: #ff7eb3; font-weight: 500;">
                    "Tu serenidad y tu sonrisa son la combinación perfecta."
                </p>
                <div style="display:flex; justify-content:center; gap:12px; margin-top:25px;">
                    <button class="back-btn" onclick="openGames()">Menú Principal</button>
                    <button class="difficulty-btn" onclick="startCatcherGame()">Intentar de nuevo 🚀</button>
                </div>
            </div>
        `;
        openModal(content);
    }
}

// ==========================================
// 5. JUEGO "ORGANIZADOR MÁGICO - DOPAMINE EDITION"
// (Melodía Pentatónica, Combos x2/x3/x5, Temblor de Pantalla, Power-Ups Mágicos)
// ==========================================

const DOPAMINE_GOODS_CATALOG = [
    { id: 'bear', name: 'Osito', emoji: '🧸' },
    { id: 'apple', name: 'Manzana', emoji: '🍎' },
    { id: 'bunny', name: 'Conejo', emoji: '🐰' },
    { id: 'flower', name: 'Flor', emoji: '🌸' },
    { id: 'choco', name: 'Choco', emoji: '🍫' },
    { id: 'coffee', name: 'Café', emoji: '☕' },
    { id: 'gift', name: 'Regalo', emoji: '🎁' },
    { id: 'cat', name: 'Gatito', emoji: '🐱' },
    { id: 'dino', name: 'Dino', emoji: '🦖' },
    { id: 'donut', name: 'Dona', emoji: '🍩' },
    { id: 'gem', name: 'Diamante', emoji: '💎' },
    { id: 'palette', name: 'Arte', emoji: '🎨' },
    { id: 'boba', name: 'Boba', emoji: '🧋' },
    { id: 'crown', name: 'Corona', emoji: '👑' },
    { id: 'strawberry', name: 'Fresa', emoji: '🍓' },
    { id: 'cake', name: 'Pastel', emoji: '🍰' }
];

function getGoodsProSave() {
    const saved = localStorage.getItem('danna_sort_pro_save');
    if (saved) {
        try { return JSON.parse(saved); } catch (e) { }
    }
    return {
        unlockedLevel: 1,
        coins: 100,
        stars: {},
        scores: {},
        times: {},
        highestScore: 0,
        soundEnabled: true
    };
}

function saveGoodsProData(saveData) {
    localStorage.setItem('danna_sort_pro_save', JSON.stringify(saveData));
}

let currentGameDifficultyMode = 'master'; // 'standard', 'master', 'nightmare'

function openGoodsProMenu() {
    stopCatcherGame();
    stopGoodsProGame();

    const save = getGoodsProSave();

    const content = `
        <div style="text-align:center; padding: 10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px;">
                <button class="back-btn" onclick="openGames()"><i class="fas fa-arrow-left"></i> Juegos</button>
                <h2 style="color: #ff7eb3; font-size: 1.6rem; font-weight: 600; margin: 0;">Organizador Mágico ✨</h2>
                <div style="display:flex; gap:12px; align-items:center;">
                    <span style="color:#ffd700; font-weight:700;"><i class="fas fa-coins"></i> ${save.coins}</span>
                    <button class="back-btn" onclick="soundFx.toggleMute(); this.innerText = soundFx.muted ? '🔇' : '🔊';">🔊</button>
                </div>
            </div>

            <!-- Selector de Dificultad Exigente -->
            <div style="margin-bottom: 20px; background: rgba(0,0,0,0.3); padding: 12px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
                <div style="font-size: 0.9rem; color: #ff7eb3; font-weight: 700; margin-bottom: 8px;">Elige el Nivel de Dificultad:</div>
                <div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap;">
                    <button class="difficulty-btn ${currentGameDifficultyMode === 'standard' ? 'selected-diff' : ''}" style="padding:6px 14px; font-size:0.85rem;" onclick="currentGameDifficultyMode = 'standard'; openGoodsProMenu();">
                        🟢 Estándar
                    </button>
                    <button class="difficulty-btn ${currentGameDifficultyMode === 'master' ? 'selected-diff' : ''}" style="padding:6px 14px; font-size:0.85rem; background:#f59e0b;" onclick="currentGameDifficultyMode = 'master'; openGoodsProMenu();">
                        🟠 Maestro 🔥
                    </button>
                    <button class="difficulty-btn ${currentGameDifficultyMode === 'nightmare' ? 'selected-diff' : ''}" style="padding:6px 14px; font-size:0.85rem; background:#ef4444;" onclick="currentGameDifficultyMode = 'nightmare'; openGoodsProMenu();">
                        🔴 Pesadilla 💀
                    </button>
                </div>
            </div>

            <p style="color: #a1a1aa; font-size: 0.9rem; margin-bottom: 20px;">
                Modo seleccionado: <b style="color:#ffd700;">${currentGameDifficultyMode === 'nightmare' ? 'Modo Pesadilla (Objetos masivos + 6 slots)' : (currentGameDifficultyMode === 'master' ? 'Desafío Maestro (35s tiempo límite)' : 'Estándar')}</b>
            </p>

            <div style="display: flex; flex-direction: column; gap: 10px; max-width: 320px; margin: 0 auto;">
                <button class="difficulty-btn" style="padding:12px 20px; font-size:1.1rem; background: linear-gradient(135deg, #ff7eb3, #ff2a5f);" onclick="startGoodsProLevel(${save.unlockedLevel})">
                    ▶ Jugar Nivel ${save.unlockedLevel}
                </button>
                <button class="back-btn" style="padding:10px; font-size:1rem;" onclick="openGoodsProLevelSelect()">
                    📚 Seleccionar Nivel
                </button>
                <button class="back-btn" style="padding:10px; font-size:1rem;" onclick="openGoodsProLeaderboard()">
                    🏆 Mejores Puntuaciones
                </button>
                <button class="back-btn" style="padding:10px; font-size:1rem;" onclick="openGoodsProHelp()">
                    ❓ Ayuda e Instrucciones
                </button>
            </div>
        </div>
    `;
    openModal(content);
}

function openGoodsProLevelSelect() {
    const save = getGoodsProSave();
    let levelsHtml = '';

    for (let l = 1; l <= 15; l++) {
        const isUnlocked = l <= save.unlockedLevel;
        const starsCount = save.stars[l] || 0;
        const starStr = isUnlocked ? ('⭐'.repeat(starsCount) + '☆'.repeat(3 - starsCount)) : '🔒';
        const bestTime = save.times[l] ? `${save.times[l]}s` : '';

        levelsHtml += `
            <div class="level-card ${isUnlocked ? '' : 'locked'}" ${isUnlocked ? `onclick="startGoodsProLevel(${l})"` : ''}>
                <div class="level-number">Lvl ${l}</div>
                <div class="level-stars">${starStr}</div>
                ${bestTime ? `<div style="font-size:0.75rem; color:#a1a1aa; margin-top:3px;">⏱️ ${bestTime}</div>` : ''}
            </div>
        `;
    }

    const content = `
        <div style="text-align:center; padding: 10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px;">
                <button class="back-btn" onclick="openGoodsProMenu()"><i class="fas fa-arrow-left"></i> Menú</button>
                <h2 style="color: #ff7eb3; font-size: 1.4rem; font-weight: 600;">Selección de Niveles</h2>
                <span style="color:#ffd700; font-weight:700;"><i class="fas fa-coins"></i> ${save.coins}</span>
            </div>

            <div class="level-select-grid">
                ${levelsHtml}
            </div>
        </div>
    `;
    openModal(content);
}

function openGoodsProLeaderboard() {
    const save = getGoodsProSave();
    let recordsHtml = '';

    Object.keys(save.scores).forEach(lvl => {
        recordsHtml += `
            <div style="display:flex; justify-content:space-between; padding:8px 15px; background:rgba(255,255,255,0.05); border-radius:10px; margin-bottom:6px;">
                <span>Nivel ${lvl}</span>
                <span style="color:#ffd700;">⭐ ${save.stars[lvl] || 0} Estrellas</span>
                <span style="color:#ff7eb3;">${save.scores[lvl]} pts</span>
                <span>⏱️ ${save.times[lvl]}s</span>
            </div>
        `;
    });

    const content = `
        <div style="text-align:center; padding: 10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px;">
                <button class="back-btn" onclick="openGoodsProMenu()"><i class="fas fa-arrow-left"></i> Menú</button>
                <h2 style="color: #ff7eb3; font-size: 1.4rem; font-weight: 600;">Mejores Puntuaciones 🏆</h2>
                <div style="width:50px;"></div>
            </div>

            <div style="max-height:300px; overflow-y:auto;">
                ${recordsHtml || '<p style="color:#a1a1aa; padding:20px;">Aún no has completado niveles. ¡Juega para registrar récords!</p>'}
            </div>
        </div>
    `;
    openModal(content);
}

function openGoodsProHelp() {
    const content = `
        <div style="text-align:center; padding: 10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px;">
                <button class="back-btn" onclick="openGoodsProMenu()"><i class="fas fa-arrow-left"></i> Menú</button>
                <h2 style="color: #ff7eb3; font-size: 1.4rem; font-weight: 600;">¿Cómo Jugar? ❓</h2>
                <div style="width:50px;"></div>
            </div>

            <div style="text-align:left; font-size:0.9rem; color:#e4e4e7; line-height:1.6; max-height:340px; overflow-y:auto; padding:5px 15px;">
                <p><b>1. Formar Tríos Rápidos:</b> Junta 3 objetos iguales en la bandeja inferior. ¡Hacer tríos seguidos activa notas musicales y MULTIPLICADORES DE COMBO!</p>
                <p><b>2. Modos de Dificultad:</b> Selecciona entre Estándar, Maestro y Pesadilla para poner a prueba tu velocidad mental extrema.</p>
                <p><b>3. Poderes Mágicos:</b></p>
                <ul>
                    <li>🪄 <b>Vara Mágica (35🪙):</b> Destruye automáticamente un trío completo al instante.</li>
                    <li>🔀 <b>Torbellino (25🪙):</b> Mezcla los objetos en remolino.</li>
                    <li>💣 <b>Bomba (30🪙):</b> Explota 3 objetos del estante.</li>
                    <li>↩️ <b>Deshacer (20🪙):</b> Regresa el último movimiento.</li>
                    <li>🧊 <b>Congelar (35🪙):</b> Pausa el reloj por 15 segundos.</li>
                </ul>
            </div>
        </div>
    `;
    openModal(content);
}

function startGoodsProLevel(levelNumber) {
    stopCatcherGame();
    stopGoodsProGame();

    activeGoodsProGame = new GoodsSortingGamePro(levelNumber);
    activeGoodsProGame.initUI();
}

function stopGoodsProGame() {
    if (activeGoodsProGame) {
        activeGoodsProGame.stopTimer();
        activeGoodsProGame = null;
    }
}

class GoodsSortingGamePro {
    constructor(levelNumber) {
        this.level = levelNumber;
        this.saveData = getGoodsProSave();
        this.mode = currentGameDifficultyMode;

        // Configuración de Alta Dificultad según Modo Elegido
        let mult = this.mode === 'nightmare' ? 2.2 : (this.mode === 'master' ? 1.6 : 1.0);

        if (levelNumber === 1) {
            this.triosCount = Math.round(10 * mult);
            this.rows = 4;
            this.cols = 3;
            this.targetTime = this.mode === 'nightmare' ? 28 : (this.mode === 'master' ? 35 : 45);
        } else if (levelNumber === 2) {
            this.triosCount = Math.round(14 * mult);
            this.rows = 4;
            this.cols = 4;
            this.targetTime = this.mode === 'nightmare' ? 30 : (this.mode === 'master' ? 38 : 50);
        } else if (levelNumber === 3) {
            this.triosCount = Math.round(18 * mult);
            this.rows = 4;
            this.cols = 4;
            this.targetTime = this.mode === 'nightmare' ? 32 : (this.mode === 'master' ? 42 : 55);
        } else if (levelNumber === 4) {
            this.triosCount = Math.round(24 * mult);
            this.rows = 5;
            this.cols = 4;
            this.targetTime = this.mode === 'nightmare' ? 35 : (this.mode === 'master' ? 45 : 60);
        } else {
            this.triosCount = Math.round((28 + (levelNumber - 5) * 4) * mult);
            this.rows = 5;
            this.cols = 4;
            this.targetTime = Math.max(25, 45 - (levelNumber - 5) * 3);
        }

        this.totalObjectsCount = this.triosCount * 3;
        this.matchedTrios = 0;
        this.score = 0;
        this.secondsElapsed = 0;
        this.timerInterval = null;
        this.isFrozen = false;
        this.freezeTimer = 0;

        // Combos
        this.comboCount = 0;
        this.lastMatchTime = 0;

        // En Modo Pesadilla la bandeja se reduce a 6 espacios
        this.trayCapacity = this.mode === 'nightmare' ? 6 : 7;
        this.tray = [];
        this.undoStack = [];

        this.shelvesData = [];
        this.isProcessingMatch = false;

        this.generateLevelData();
    }


    generateLevelData() {
        const availableCatalog = [...DOPAMINE_GOODS_CATALOG];
        const selectedTypes = [];

        for (let i = 0; i < this.triosCount; i++) {
            const type = availableCatalog[i % availableCatalog.length];
            selectedTypes.push(type);
        }

        let allObjects = [];
        selectedTypes.forEach((type) => {
            for (let k = 0; k < 3; k++) {
                allObjects.push({
                    uid: `${type.id}_${k}_${Math.random().toString(36).substring(2, 6)}`,
                    id: type.id,
                    name: type.name,
                    emoji: type.emoji
                });
            }
        });

        allObjects = allObjects.sort(() => Math.random() - 0.5);

        const totalCompartments = this.rows * this.cols;
        const itemsPerComp = Math.ceil(allObjects.length / totalCompartments);

        this.shelvesData = [];
        let itemIdx = 0;

        for (let r = 0; r < this.rows; r++) {
            const row = [];
            for (let c = 0; c < this.cols; c++) {
                const comp = [];
                for (let k = 0; k < itemsPerComp && itemIdx < allObjects.length; k++) {
                    comp.push(allObjects[itemIdx]);
                    itemIdx++;
                }
                row.push(comp);
            }
            this.shelvesData.push(row);
        }
    }

    initUI() {
        const content = `
            <div class="dopamine-shelf-wrapper" id="game-modal-wrapper">
                <div style="width:100%; display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <button class="back-btn" onclick="openGoodsProMenu()"><i class="fas fa-home"></i> Inicio</button>
                    <span style="color:#ff7eb3; font-weight:700; font-size:1.1rem;">Nivel ${this.level} ✨</span>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <span style="color:#ffd700; font-weight:700;"><i class="fas fa-coins"></i> <span id="goods-coins">${this.saveData.coins}</span></span>
                        <button class="back-btn" onclick="startGoodsProLevel(${this.level})"><i class="fas fa-redo"></i></button>
                    </div>
                </div>

                <div class="canvas-hud" style="margin-bottom:6px;">
                    <div class="hud-item"><i class="fas fa-star"></i> <span id="goods-score">0</span></div>
                    <div class="hud-item"><i class="fas fa-clock"></i> <span id="goods-timer">0s</span></div>
                    <div class="hud-item"><i class="fas fa-fire"></i> Combo: <span id="goods-combo-text" style="color:#ffd700;">x1</span></div>
                </div>

                <div class="shelf-progress-container">
                    <div id="goods-progress-bar" class="shelf-progress-fill"></div>
                </div>

                <!-- Estante Neón Glassmorphic -->
                <div id="dopamine-shelf" class="dopamine-shelf-container"></div>

                <!-- Barra de Power-Ups Mágicos -->
                <div class="powerup-bar">
                    <button class="powerup-btn" onclick="activeGoodsProGame?.useMagicWand()">
                        🪄 Vara Mágica <span class="powerup-cost">35🪙</span>
                    </button>
                    <button class="powerup-btn" onclick="activeGoodsProGame?.useShuffle()">
                        🔀 Torbellino <span class="powerup-cost">25🪙</span>
                    </button>
                    <button class="powerup-btn" onclick="activeGoodsProGame?.useBomb()">
                        💣 Bomba <span class="powerup-cost">30🪙</span>
                    </button>
                    <button class="powerup-btn" onclick="activeGoodsProGame?.useUndo()">
                        ↩️ Deshacer <span class="powerup-cost">20🪙</span>
                    </button>
                    <button class="powerup-btn" onclick="activeGoodsProGame?.useFreeze()">
                        🧊 Congelar <span class="powerup-cost">35🪙</span>
                    </button>
                </div>

                <!-- Bandeja de Clasificación -->
                <div class="tray-wrapper-pro">
                    <div class="tray-title" id="tray-title-text">Bandeja de Selección (Capacidad 7)</div>
                    <div id="tray-slots" class="tray-slots"></div>
                </div>
            </div>
        `;
        openModal(content);

        this.renderShelves();
        this.renderTray();
        this.startTimer();
    }

    startTimer() {
        this.secondsElapsed = 0;
        this.timerInterval = setInterval(() => {
            if (this.isFrozen) {
                this.freezeTimer--;
                if (this.freezeTimer <= 0) this.isFrozen = false;
                return;
            }
            this.secondsElapsed++;
            const timerElem = document.getElementById('goods-timer');
            if (timerElem) timerElem.innerText = `${this.secondsElapsed}s`;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    renderShelves() {
        const display = document.getElementById('dopamine-shelf');
        if (!display) return;

        let html = '';
        this.shelvesData.forEach((row, rIdx) => {
            html += `<div class="neon-glass-shelf">`;
            row.forEach((comp, cIdx) => {
                html += `<div class="dopamine-comp">`;
                comp.forEach((item) => {
                    html += `
                        <div class="juicy-card-3d" onclick="activeGoodsProGame?.selectItem('${item.uid}', ${rIdx}, ${cIdx})">
                            <span class="juicy-card-emoji">${item.emoji}</span>
                            <span class="juicy-card-name">${item.name}</span>
                        </div>
                    `;
                });
                html += `</div>`;
            });
            html += `</div>`;
        });

        display.innerHTML = html;
    }

    renderTray() {
        const slotsContainer = document.getElementById('tray-slots');
        if (!slotsContainer) return;

        let html = '';
        for (let i = 0; i < this.trayCapacity; i++) {
            const item = this.tray[i];
            const isExtra = i >= 7 ? 'extra-slot' : '';
            if (item) {
                const isMatching = item.isMatching ? 'matched-anim' : '';
                html += `
                    <div class="tray-slot-pro filled ${isExtra}">
                        <div class="juicy-card-3d ${isMatching}">
                            <span class="juicy-card-emoji">${item.emoji}</span>
                            <span class="juicy-card-name">${item.name}</span>
                        </div>
                    </div>
                `;
            } else {
                html += `<div class="tray-slot-pro ${isExtra}"></div>`;
            }
        }
        slotsContainer.innerHTML = html;
    }

    selectItem(uid, rIdx, cIdx) {
        if (this.isProcessingMatch) return;
        if (this.tray.length >= this.trayCapacity) return;

        const comp = this.shelvesData[rIdx][cIdx];
        const itemIndex = comp.findIndex(it => it.uid === uid);
        if (itemIndex === -1) return;

        const [item] = comp.splice(itemIndex, 1);
        this.undoStack.push({ item, rIdx, cIdx });

        this.tray.push(item);
        soundFx.playPop();

        this.sortTray();
        this.renderShelves();
        this.renderTray();

        this.checkMatch();
    }

    sortTray() {
        const grouped = {};
        this.tray.forEach(item => {
            if (!grouped[item.id]) grouped[item.id] = [];
            grouped[item.id].push(item);
        });

        const sorted = [];
        Object.keys(grouped).forEach(id => {
            sorted.push(...grouped[id]);
        });
        this.tray = sorted;
    }

    checkMatch() {
        const counts = {};
        this.tray.forEach(item => {
            counts[item.id] = (counts[item.id] || 0) + 1;
        });

        let matchedId = null;
        Object.keys(counts).forEach(id => {
            if (counts[id] >= 3) matchedId = id;
        });

        if (matchedId) {
            this.isProcessingMatch = true;

            // Gestión de Combos Rápidos
            const now = Date.now();
            if (now - this.lastMatchTime < 3500) {
                this.comboCount++;
            } else {
                this.comboCount = 1;
            }
            this.lastMatchTime = now;

            // Sonido de Escala Pentatónica por Combo
            soundFx.playComboNote(this.comboCount);

            // Banner Popup y Temblor si hay Combo x2+
            if (this.comboCount >= 2) {
                this.triggerComboPopup(this.comboCount);
            }

            this.tray.forEach(item => {
                if (item.id === matchedId) item.isMatching = true;
            });
            this.renderTray();

            setTimeout(() => {
                let removedCount = 0;
                this.tray = this.tray.filter(item => {
                    if (item.id === matchedId && removedCount < 3) {
                        removedCount++;
                        return false;
                    }
                    return true;
                });

                const comboMult = Math.min(5, this.comboCount);
                this.score += 100 * comboMult;
                this.saveData.coins += 10 * comboMult;
                saveGoodsProData(this.saveData);

                this.matchedTrios++;
                this.isProcessingMatch = false;

                this.updateHUD();
                this.renderTray();

                if (this.matchedTrios >= this.triosCount) {
                    this.gameWon();
                }
            }, 380);
        } else {
            if (this.tray.length >= this.trayCapacity) {
                setTimeout(() => this.gameOver(), 300);
            }
        }
    }

    triggerComboPopup(comboMultiplier) {
        const wrapper = document.getElementById('game-modal-wrapper');
        if (wrapper) {
            wrapper.classList.remove('combo-shake');
            void wrapper.offsetWidth;
            wrapper.classList.add('combo-shake');

            const popup = document.createElement('div');
            popup.className = 'combo-banner-popup';
            const phrases = ['COMBO x2! 🔥', '¡SÚPER COMBO x3! 🌟', '¡MEGA COMBO x4! 🎆', '¡ULTRA COMBO x5! 👑'];
            popup.innerText = phrases[Math.min(phrases.length - 1, comboMultiplier - 2)];
            wrapper.appendChild(popup);

            setTimeout(() => popup.remove(), 700);
        }
    }

    // POWER-UP: Vara Mágica 🪄 (Busca y elimina un trío completo)
    useMagicWand() {
        if (this.saveData.coins < 35) return alert("¡Necesitas 35 Monedas para la Vara Mágica!");

        // Buscar qué ID tiene más copias entre estante y bandeja
        const counts = {};
        this.tray.forEach(it => counts[it.id] = (counts[it.id] || 0) + 1);
        this.shelvesData.forEach(row => row.forEach(comp => comp.forEach(it => counts[it.id] = (counts[it.id] || 0) + 1)));

        let targetId = null;
        Object.keys(counts).forEach(id => {
            if (counts[id] >= 3 && !targetId) targetId = id;
        });

        if (!targetId) return alert("No hay tríos disponibles para destruir.");

        this.saveData.coins -= 35;
        saveGoodsProData(this.saveData);

        // Remover 3 copias de targetId
        let count = 0;
        this.tray = this.tray.filter(it => {
            if (it.id === targetId && count < 3) { count++; return false; }
            return true;
        });

        this.shelvesData.forEach(row => row.forEach(comp => {
            for (let i = comp.length - 1; i >= 0; i--) {
                if (comp[i].id === targetId && count < 3) {
                    comp.splice(i, 1);
                    count++;
                }
            }
        }));

        soundFx.playMatch();
        this.score += 150;
        this.matchedTrios++;
        this.updateHUD();
        this.renderShelves();
        this.renderTray();

        if (this.matchedTrios >= this.triosCount) {
            this.gameWon();
        }
    }

    // POWER-UP: Bomba de Dopamina 💣
    useBomb() {
        if (this.saveData.coins < 30) return alert("¡Necesitas 30 Monedas!");
        this.saveData.coins -= 30;
        saveGoodsProData(this.saveData);

        let count = 0;
        this.shelvesData.forEach(row => row.forEach(comp => {
            if (comp.length > 0 && count < 3) {
                comp.pop();
                count++;
            }
        }));

        soundFx.playMatch();
        this.updateHUD();
        this.renderShelves();
    }

    useShuffle() {
        if (this.saveData.coins < 25) return alert("¡Necesitas 25 Monedas!");
        this.saveData.coins -= 25;
        saveGoodsProData(this.saveData);
        this.updateHUD();

        let allItems = [];
        this.shelvesData.forEach(row => row.forEach(comp => {
            allItems.push(...comp);
            comp.length = 0;
        }));

        allItems = allItems.sort(() => Math.random() - 0.5);

        let idx = 0;
        this.shelvesData.forEach(row => row.forEach(comp => {
            while (comp.length < 3 && idx < allItems.length) {
                comp.push(allItems[idx]);
                idx++;
            }
        }));

        soundFx.playPop();
        this.renderShelves();
    }

    useUndo() {
        if (this.saveData.coins < 20) return alert("¡Necesitas 20 Monedas!");
        if (this.undoStack.length === 0) return alert("¡No hay movimientos!");

        this.saveData.coins -= 20;
        saveGoodsProData(this.saveData);
        this.updateHUD();

        const lastMove = this.undoStack.pop();
        const trayIdx = this.tray.findIndex(it => it.uid === lastMove.item.uid);
        if (trayIdx !== -1) {
            const [item] = this.tray.splice(trayIdx, 1);
            this.shelvesData[lastMove.rIdx][lastMove.cIdx].push(item);
            soundFx.playPop();
            this.renderShelves();
            this.renderTray();
        }
    }

    useFreeze() {
        if (this.saveData.coins < 35) return alert("¡Necesitas 35 Monedas!");
        this.saveData.coins -= 35;
        this.isFrozen = true;
        this.freezeTimer = 15;
        saveGoodsProData(this.saveData);
        this.updateHUD();

        soundFx.playPop();
        alert("🧊 ¡Reloj congelado por 15 segundos!");
    }

    updateHUD() {
        const scoreElem = document.getElementById('goods-score');
        const coinsElem = document.getElementById('goods-coins');
        const comboText = document.getElementById('goods-combo-text');
        const progressText = document.getElementById('goods-progress-text');
        const progressBar = document.getElementById('goods-progress-bar');

        if (scoreElem) scoreElem.innerText = this.score;
        if (coinsElem) coinsElem.innerText = this.saveData.coins;
        if (comboText) comboText.innerText = `x${Math.max(1, this.comboCount)}`;
        if (progressText) progressText.innerText = `${this.matchedTrios}/${this.triosCount}`;
        if (progressBar) {
            const pct = Math.round((this.matchedTrios / this.triosCount) * 100);
            progressBar.style.width = `${pct}%`;
        }
    }

    gameWon() {
        this.stopTimer();
        soundFx.playWin();

        let starsEarned = 1;
        if (this.secondsElapsed <= this.targetTime * 0.5) {
            starsEarned = 3;
        } else if (this.secondsElapsed <= this.targetTime * 0.8) {
            starsEarned = 2;
        }

        const bonusCoins = 60 + (starsEarned * 25);
        this.saveData.coins += bonusCoins;

        this.saveData.stars[this.level] = Math.max(this.saveData.stars[this.level] || 0, starsEarned);
        this.saveData.scores[this.level] = Math.max(this.saveData.scores[this.level] || 0, this.score);
        this.saveData.times[this.level] = this.saveData.times[this.level] ? Math.min(this.saveData.times[this.level], this.secondsElapsed) : this.secondsElapsed;

        if (this.level >= this.saveData.unlockedLevel) {
            this.saveData.unlockedLevel = this.level + 1;
        }

        saveGoodsProData(this.saveData);

        const starsStr = '⭐'.repeat(starsEarned);

        const content = `
            <div style="text-align:center; padding: 20px;">
                <div style="font-size: 3.8rem; color: #ffd700; margin-bottom: 10px; animation: pulseMatch 0.6s ease infinite alternate;">🎁</div>
                <div style="font-size: 2rem; color: #ffd700; margin-bottom: 10px;">${starsStr}</div>
                <h2 style="color: #ff7eb3; font-weight: 700; font-size: 1.8rem;">¡NIVEL ${this.level} COMPLETADO! 🏆</h2>
                <p style="margin-top: 15px; font-size: 1.1rem; color: #fff;">
                    Tiempo: <b>${this.secondsElapsed}s</b> | Ganaste: <b style="color:#ffd700;">+${bonusCoins} Monedas 🪙</b>
                </p>
                <p style="margin-top: 12px; font-style: italic; color: #ff7eb3; font-weight: 500;">
                    "Tu agilidad mental y tu sonrisa hacen que todo sea perfecto."
                </p>
                <div style="display:flex; justify-content:center; gap:12px; margin-top:25px;">
                    <button class="back-btn" onclick="openGoodsProLevelSelect()">Niveles</button>
                    <button class="difficulty-btn" style="background: linear-gradient(135deg, #ff7eb3, #ff2a5f);" onclick="startGoodsProLevel(${this.level + 1})">
                        Siguiente Nivel ${this.level + 1} 🚀
                    </button>
                </div>
            </div>
        `;
        openModal(content);
    }

    gameOver() {
        this.stopTimer();
        soundFx.playLose();

        const content = `
            <div style="text-align:center; padding: 20px;">
                <i class="fas fa-heart-broken" style="font-size: 3.5rem; color: #ff2a5f; margin-bottom: 15px;"></i>
                <h2 style="color: #ff7eb3; font-weight: 600;">¡Bandeja Llenada!</h2>
                <p style="margin-top: 15px; font-size: 1.1rem; color: #fff;">
                    La bandeja de 7 espacios se llenó sin formar un trío.
                </p>
                <p style="margin-top: 15px; font-style: italic; color: #a1a1aa;">
                    "Usa la Vara Mágica 🪄 o Deshacer ↩️ para mantener viva la racha de combos."
                </p>
                <div style="display:flex; justify-content:center; gap:12px; margin-top:25px;">
                    <button class="back-btn" onclick="openGoodsProLevelSelect()">Niveles</button>
                    <button class="difficulty-btn" onclick="startGoodsProLevel(${this.level})">Reintentar Nivel ${this.level} 🔄</button>
                </div>
            </div>
        `;
        openModal(content);
    }
}