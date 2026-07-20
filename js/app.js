// js/app.js - Motor Avanzado con Canvas 2D de Partículas, Sintetizador y Módulo Pausa y Respira Ultra-Visual

let activeInterval = null;
let breatheStepInterval = null;
let currentBreatheTech = '478';
let visualBreatheInstance = null;

// ==========================================
// 1. LIENZO DE PARTÍCULAS INTERACTIVAS DE FONDO
// ==========================================
function initBackgroundCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = 45;

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2.5 + 1,
            color: i % 2 === 0 ? 'rgba(255, 126, 179, ' : 'rgba(99, 102, 241, ',
            alpha: Math.random() * 0.5 + 0.2,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particleCount; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color + p.alpha + ')';
            ctx.fill();

            for (let j = i + 1; j < particleCount; j++) {
                const p2 = particles[j];
                const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                if (dist < 110) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * (1 - dist / 110)})`;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}

// ==========================================
// 2. SINTETIZADOR DE MÚSICA AMBIENTAL RELAJANTE
// ==========================================
class AmbientMusicSynth {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.timer = null;
        this.step = 0;
        this.chords = [
            [261.63, 329.63, 392.00, 493.88], // Cmaj7
            [220.00, 261.63, 329.63, 392.00], // Am7
            [174.61, 220.00, 261.63, 329.63], // Fmaj7
            [196.00, 246.94, 293.66, 349.23]  // G7
        ];
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

    start() {
        this.init();
        if (!this.ctx) return;
        this.isPlaying = true;
        this.step = 0;
        this.playNextChord();
        this.timer = setInterval(() => this.playNextChord(), 3200);
    }

    stop() {
        this.isPlaying = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    playNextChord() {
        if (!this.isPlaying || !this.ctx) return;
        const currentChord = this.chords[this.step % this.chords.length];
        this.step++;

        currentChord.forEach((freq, idx) => {
            try {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.15);

                gain.gain.setValueAtTime(0.001, this.ctx.currentTime + idx * 0.15);
                gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + idx * 0.15 + 0.4);
                gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + idx * 0.15 + 3.0);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(this.ctx.currentTime + idx * 0.15);
                osc.stop(this.ctx.currentTime + idx * 0.15 + 3.0);
            } catch (e) { }
        });
    }
}

const ambientSynth = new AmbientMusicSynth();

// 3. Reproductor de Música
let isPlaying = false;
function togglePlay() {
    const audio = document.getElementById('bg-music');
    const btn = document.getElementById('play-btn');
    const disc = document.getElementById('disc-icon');
    const playerWrapper = document.querySelector('.luxury-music-player') || document.querySelector('.music-player');
    const titleText = document.getElementById('music-title-text');

    if (!btn || !disc) return;

    if (isPlaying) {
        if (audio) audio.pause();
        ambientSynth.stop();
        btn.innerHTML = '<i class="fas fa-play"></i>';
        disc.classList.remove('rotating');
        if (playerWrapper) playerWrapper.classList.remove('playing');
        if (titleText) titleText.innerText = "Música de Calma & Relax 🎶";
    } else {
        let playedFile = false;
        if (audio && audio.src && !audio.src.includes('cancion.mp3')) {
            audio.play().then(() => { playedFile = true; }).catch(() => { });
        }

        if (!playedFile) {
            ambientSynth.start();
        }

        btn.innerHTML = '<i class="fas fa-pause"></i>';
        disc.classList.add('rotating');
        if (playerWrapper) playerWrapper.classList.add('playing');
        if (titleText) titleText.innerText = "Sonando: Melodía de Paz 💖";
    }
    isPlaying = !isPlaying;
}

// 4. Efecto Máquina de Escribir
document.addEventListener('DOMContentLoaded', () => {
    initBackgroundCanvas();

    const text = "Hola Amor de mi Vida ✨";
    const titleElement = document.getElementById('dynamic-greeting');
    const subtitleElement = document.getElementById('dynamic-subtitle');
    const modal = document.getElementById('app-modal');

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    if (!titleElement) return;
    let i = 0;

    function typeWriter() {
        if (!titleElement) return;
        if (i < text.length) {
            titleElement.innerHTML += text.charAt(i);
            i++;
            setTimeout(typeWriter, 90);
        } else if (subtitleElement) {
            subtitleElement.style.opacity = '1';
        }
    }

    setTimeout(typeWriter, 400);
});

// 5. Control del Modal
function openModal(htmlContent) {
    const modal = document.getElementById('app-modal');
    const modalBody = document.getElementById('modal-body');
    if (modalBody) modalBody.innerHTML = htmlContent;
    if (modal) modal.classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('app-modal');
    const modalBody = document.getElementById('modal-body');
    if (modal) modal.classList.add('hidden');

    if (activeInterval) {
        clearInterval(activeInterval);
        activeInterval = null;
    }

    if (breatheStepInterval) {
        clearInterval(breatheStepInterval);
        breatheStepInterval = null;
    }

    if (visualBreatheInstance) {
        visualBreatheInstance.stop();
        visualBreatheInstance = null;
    }

    if (typeof memoryGameState !== 'undefined' && memoryGameState?.timerInterval) {
        clearInterval(memoryGameState.timerInterval);
        memoryGameState.timerInterval = null;
    }

    if (typeof stopCatcherGame === 'function') {
        stopCatcherGame();
    }

    if (typeof stopGoodsProGame === 'function') {
        stopGoodsProGame();
    }

    setTimeout(() => {
        if (modalBody) modalBody.innerHTML = '';
    }, 300);
}

// ==========================================
// ==========================================
// 6. MOTOR 2D VISUAL DE RESPIRACIÓN (VisualBreatheEngine)
// ==========================================
class VisualBreatheEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = 280;
        this.height = canvas.height = 280;
        this.centerX = 140;
        this.centerY = 140;
        this.phase = 'inhale';
        this.duration = 4;
        this.secondsLeft = 4;
        this.startTime = performance.now();
        this.animFrame = null;
        this.particles = [];
        this.initParticles();
    }

    initParticles() {
        this.particles = [];
        for (let i = 0; i < 40; i++) {
            const angle = (i / 40) * Math.PI * 2;
            this.particles.push({
                angle: angle,
                distRatio: Math.random() * 0.3 + 0.7,
                size: Math.random() * 3 + 2,
                colorHue: Math.random() * 60 + 330
            });
        }
    }

    setPhase(phase, durationSec) {
        this.phase = phase;
        this.duration = durationSec;
        this.startTime = performance.now();
    }

    setSecondsLeft(sec) {
        this.secondsLeft = sec;
    }

    render(now) {
        if (!this.ctx) return;
        const elapsed = (now - this.startTime) / 1000;
        const progress = Math.min(1.0, Math.max(0.0, elapsed / this.duration));

        this.ctx.clearRect(0, 0, this.width, this.height);

        // Radio dinámico que Crece al Inhalar y se Contrae al Exhalar
        let currentRadius = 65;
        let glowColor = 'rgba(255, 126, 179, ';
        let borderColor = '#ff7eb3';

        if (this.phase === 'inhale') {
            currentRadius = 55 + progress * 55; // 55px -> 110px (CRECE)
            glowColor = 'rgba(255, 126, 179, ';
            borderColor = '#ff7eb3';
        } else if (this.phase === 'exhale') {
            currentRadius = 110 - progress * 55; // 110px -> 55px (SE CONTRAE)
            glowColor = 'rgba(168, 85, 247, ';
            borderColor = '#a855f7';
        } else { // hold
            currentRadius = 105 + Math.sin(now * 0.003) * 5;
            glowColor = 'rgba(0, 242, 254, ';
            borderColor = '#00f2fe';
        }

        // 1. Aura Exterior Pulsante
        const auraGrad = this.ctx.createRadialGradient(this.centerX, this.centerY, 10, this.centerX, this.centerY, currentRadius + 25);
        auraGrad.addColorStop(0, glowColor + '0.45)');
        auraGrad.addColorStop(0.7, glowColor + '0.15)');
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, currentRadius + 25, 0, Math.PI * 2);
        this.ctx.fillStyle = auraGrad;
        this.ctx.fill();

        // 2. Anillo de Progreso Exterior (Arc)
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, currentRadius + 8, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * (1 - progress)));
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = 4;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = borderColor;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        // 3. Esfera Central Translúcida
        const sphereGrad = this.ctx.createRadialGradient(this.centerX, this.centerY, 5, this.centerX, this.centerY, currentRadius);
        sphereGrad.addColorStop(0, glowColor + '0.4)');
        sphereGrad.addColorStop(1, 'rgba(18, 22, 38, 0.88)');

        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, currentRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = sphereGrad;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.lineWidth = 2;
        this.ctx.fill();
        this.ctx.stroke();

        // 4. Partículas en Movimiento Concéntrico
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            const rotSpeed = this.phase === 'hold' ? 0.0012 : 0.0005;
            p.angle += rotSpeed;

            const r = currentRadius * p.distRatio;
            const x = this.centerX + Math.cos(p.angle) * r;
            const y = this.centerY + Math.sin(p.angle) * r;

            this.ctx.beginPath();
            this.ctx.arc(x, y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = this.phase === 'inhale' ? '#ff7eb3' : (this.phase === 'exhale' ? '#c084fc' : '#00f2fe');
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = this.ctx.fillStyle;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }

        // 5. Número Cuenta Regresiva al Centro
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '900 42px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = '#000000';
        this.ctx.fillText(this.secondsLeft.toString(), this.centerX, this.centerY);
        this.ctx.shadowBlur = 0;

        this.animFrame = requestAnimationFrame((ts) => this.render(ts));
    }

    stop() {
        if (this.animFrame) {
            cancelAnimationFrame(this.animFrame);
            this.animFrame = null;
        }
    }
}

// ==========================================
// 7. MÓDULO PAUSA Y RESPIRA ULTRA-VISUAL
// ==========================================

function startBreathing(tech = '478') {
    currentBreatheTech = tech;

    const content = `
        <div class="ultra-breathe-wrapper">
            <h2 style="color: #ff7eb3; font-size: 1.6rem; font-weight: 700; margin-bottom: 6px;">Pausa y Respira 🌿</h2>
            <p style="color: #a1a1aa; font-size: 0.95rem; margin-bottom: 18px;">Sincroniza tu energía con la animación de luz y las partículas.</p>

            <!-- Selector de Técnicas Guiadas -->
            <div class="breathe-tech-selector">
                <button class="breathe-tech-btn ${tech === '478' ? 'active-tech' : ''}" onclick="startBreathing('478')">
                    🌸 Técnica 4-7-8
                </button>
                <button class="breathe-tech-btn ${tech === 'box' ? 'active-tech' : ''}" onclick="startBreathing('box')">
                    🌿 Respiración Cuadrada (4-4-4-4)
                </button>
                <button class="breathe-tech-btn ${tech === '55' ? 'active-tech' : ''}" onclick="startBreathing('55')">
                    💖 Calma Profunda (5-5)
                </button>
            </div>

            <!-- Escenario Visual: Canvas 2D Animado Concéntrico -->
            <div class="breathe-visual-stage">
                <canvas id="breathe-canvas" width="280" height="280"></canvas>
            </div>

            <!-- Fase de Respiración y Frase Confortante -->
            <div class="breathe-phase-badge" id="breathe-phase-badge">Inhala profundo...</div>
            <div class="breathe-quote-sub" id="breathe-quote-sub">"Visualiza aire puro y renovador entrando en ti."</div>
        </div>
    `;
    openModal(content);

    if (activeInterval) clearInterval(activeInterval);
    if (breatheStepInterval) clearInterval(breatheStepInterval);
    if (visualBreatheInstance) {
        visualBreatheInstance.stop();
        visualBreatheInstance = null;
    }

    setTimeout(() => {
        const canvas = document.getElementById('breathe-canvas');

        if (canvas) {
            visualBreatheInstance = new VisualBreatheEngine(canvas);
            visualBreatheInstance.render(performance.now());
            runBreathingCycle();
        }
    }, 60);
}

function runBreathingCycle() {
    const phaseBadge = document.getElementById('breathe-phase-badge');
    const quoteSub = document.getElementById('breathe-quote-sub');

    let phases = [];
    if (currentBreatheTech === '478') {
        phases = [
            { name: "Inhala...", duration: 4, action: "inhale", quote: "Visualiza aire puro y renovador entrando en ti." },
            { name: "Sostén...", duration: 7, action: "hold", quote: "Retén esa calma y siéntete segura en este lugar." },
            { name: "Exhala...", duration: 8, action: "exhale", quote: "Suelta toda la presión, tensiones y preocupaciones." }
        ];
    } else if (currentBreatheTech === 'box') {
        phases = [
            { name: "Inhala...", duration: 4, action: "inhale", quote: "Inhala paz para tu mente brillante." },
            { name: "Sostén...", duration: 4, action: "hold", quote: "Mantén el equilibrio perfecto." },
            { name: "Exhala...", duration: 4, action: "exhale", quote: "Libera el peso de tus hombros." },
            { name: "Sostén en calma...", duration: 4, action: "hold", quote: "Descansa en este instante de quietud." }
        ];
    } else { // 5-5
        phases = [
            { name: "Inhala...", duration: 5, action: "inhale", quote: "Siente el latido sereno de tu corazón." },
            { name: "Exhala...", duration: 5, action: "exhale", quote: "Todo está bien, Amalia. Estás haciéndolo excelente." }
        ];
    }

    let phaseIndex = 0;
    let secondsLeft = phases[0].duration;

    function updatePhaseDisplay() {
        const current = phases[phaseIndex];

        if (phaseBadge) phaseBadge.innerText = current.name;
        if (quoteSub) quoteSub.innerText = `"${current.quote}"`;

        if (visualBreatheInstance) {
            visualBreatheInstance.setPhase(current.action, current.duration);
            visualBreatheInstance.setSecondsLeft(secondsLeft);
        }
    }

    updatePhaseDisplay();

    breatheStepInterval = setInterval(() => {
        if (visualBreatheInstance) {
            visualBreatheInstance.setSecondsLeft(secondsLeft);
        }

        secondsLeft--;
        if (secondsLeft < 0) {
            phaseIndex = (phaseIndex + 1) % phases.length;
            secondsLeft = phases[phaseIndex].duration;
            updatePhaseDisplay();
        }
    }, 1000);
}

// MÓDULO BOTIQUÍN DE EMERGENCIA
function generateCompliment() {
    const randomIndex = Math.floor(Math.random() * database.compliments.length);
    const compliment = database.compliments[randomIndex];

    const content = `
        <div style="text-align:center; padding: 30px;">
            <i class="fas fa-quote-left" style="font-size: 3rem; color: var(--primary); opacity: 0.5; margin-bottom: 20px;"></i>
            <h2 style="font-size: 1.8rem; font-weight: 400; line-height: 1.4; margin-bottom: 30px; min-height: 80px; display: flex; align-items: center; justify-content: center;">
                "${compliment}"
            </h2>
            <button class="difficulty-btn" onclick="generateCompliment()">Siguiente Recordatorio 💕</button>
        </div>
    `;
    openModal(content);
}

// ==========================================
// MÓDULO NUESTRA BÓVEDA
// ==========================================
function showMemories() {
    const list = database.memories;
    const random = Math.floor(Math.random() * list.length);
    const memory = list[random];

    const content = `
        <div style="text-align:center;">
            <h2 style="margin-bottom: 20px; font-weight: 600; color: #ff7eb3;">${memory.title}</h2>
            <div style="width: 100%; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); margin-bottom: 25px;">
                <img src="${memory.image}" alt="Recuerdo" style="width: 100%; max-height: 400px; object-fit: contain; background: #000;">
            </div>
            <p style="font-size: 1.1rem; font-weight: 300; line-height: 1.6;">"${memory.description}"</p>
        </div>
    `;
    openModal(content);
}

const appModal = document.getElementById('app-modal');
if (appModal) {
    appModal.addEventListener('click', (e) => {
        if (e.target === appModal) closeModal();
    });
}