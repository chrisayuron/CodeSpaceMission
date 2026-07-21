(function() {
    'use strict';

    // ========== CANVAS SETUP ==========
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // ========== GAME CONSTANTS ==========
    const FUEL_MAX = 100;
    const FUEL_START = 50;
    const FUEL_DRAIN_RATE = 0.08;
    const FUEL_PER_LOGO = 15;
    const OBSTACLE_FUEL_DAMAGE = 12;
    const QUESTION_INTERVAL = 1500;
    const BASE_SPEED = 2.5;
    const MAX_SPEED = 5;
    const SPEED_BOOST = 0.5;
    const INVINCIBLE_DURATION = 120;
    const ASTEROID_MIN_SIZE = 25;
    const ASTEROID_MAX_SIZE = 55;
    const PLANET_MIN_SIZE = 60;
    const PLANET_MAX_SIZE = 120;
    const DEBRIS_MIN_SIZE = 15;
    const DEBRIS_MAX_SIZE = 35;
    const LOGO_SIZE = 35;

    // ========== GAME STATE ==========
    let gameState = 'menu';
    let fuel = FUEL_START;
    let distance = 0;
    let speed = BASE_SPEED;
    let htmlLogosCollected = 0;
    let cssLogosCollected = 0;
    let questionsCorrect = 0;
    let questionsTotal = 0;
    let lastQuestionDistance = 0;
    let invincibleTimer = 0;
    let frameCount = 0;

    // ========== LEVEL SYSTEM ==========
    let currentLevel = 0;
    let currentQuestionInLevel = 0;
    let levelQuestions = [];
    let levelTransitionActive = false;

    // ========== INPUT ==========
    const keys = {};
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        if (e.key === 'Escape') {
            if (gameState === 'playing' && !questionPaused && !levelTransitionActive) {
                gameState = 'paused';
                showPause();
            } else if (gameState === 'paused') {
                gameState = 'playing';
                hidePause();
            }
        }
    });
    window.addEventListener('keyup', (e) => { keys[e.key] = false; });

    // ========== ASSETS ==========
    const assets = {};
    let assetsLoaded = 0;
    const assetSources = [
        { name: 'nave', src: 'assets/nave.png' },
        { name: 'html', src: 'assets/html.png' },
        { name: 'css', src: 'assets/css.png' }
    ];

    function loadAssets(callback) {
        if (assetSources.length === 0) { callback(); return; }
        assetSources.forEach(a => {
            const img = new Image();
            img.onload = () => {
                assets[a.name] = img;
                assetsLoaded++;
                if (assetsLoaded === assetSources.length) callback();
            };
            img.onerror = () => {
                assets[a.name] = null;
                assetsLoaded++;
                if (assetsLoaded === assetSources.length) callback();
            };
            img.src = a.src;
        });
    }

    // ========== STARS ==========
    const stars = [];
    const STAR_COUNT = 200;
    function initStars() {
        stars.length = 0;
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2.5 + 0.5,
                speed: Math.random() * 1.5 + 0.5,
                brightness: Math.random() * 0.6 + 0.4
            });
        }
    }

    function updateStars() {
        stars.forEach(s => {
            s.x -= s.speed * speed;
            if (s.x < -5) {
                s.x = canvas.width + 5;
                s.y = Math.random() * canvas.height;
            }
        });
    }

    function drawStars() {
        stars.forEach(s => {
            ctx.globalAlpha = s.brightness;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    // ========== PLAYER ==========
    const player = {
        x: 0, y: 0,
        width: 70, height: 39,
        speed: 5,
        trail: []
    };

    function initPlayer() {
        player.x = canvas.width * 0.15;
        player.y = canvas.height * 0.5;
        player.trail = [];
    }

    function updatePlayer() {
        if (keys['ArrowUp'] || keys['w'] || keys['W']) player.y -= player.speed;
        if (keys['ArrowDown'] || keys['s'] || keys['S']) player.y += player.speed;
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) player.x -= player.speed;
        if (keys['ArrowRight'] || keys['d'] || keys['D']) player.x += player.speed;

        player.x = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, player.x));
        player.y = Math.max(player.height / 2, Math.min(canvas.height - player.height / 2, player.y));

        player.trail.push({ x: player.x, y: player.y, alpha: 1 });
        if (player.trail.length > 12) player.trail.shift();
        player.trail.forEach(t => t.alpha -= 0.08);
    }

    function drawPlayer() {
        player.trail.forEach(t => {
            if (t.alpha > 0) {
                ctx.globalAlpha = t.alpha * 0.3;
                ctx.fillStyle = '#00aaff';
                ctx.beginPath();
                ctx.arc(t.x, t.y, player.width * 0.2, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.globalAlpha = 1;

        if (assets.nave) {
            ctx.save();
            ctx.translate(player.x, player.y);
            ctx.drawImage(assets.nave, -player.width / 2, -player.height / 2, player.width, player.height);
            ctx.restore();
        } else {
            ctx.fillStyle = '#00aaff';
            ctx.beginPath();
            ctx.moveTo(player.x + player.width / 2, player.y);
            ctx.lineTo(player.x - player.width / 2, player.y - player.height / 2);
            ctx.lineTo(player.x - player.width / 2, player.y + player.height / 2);
            ctx.closePath();
            ctx.fill();
        }

        if (invincibleTimer > 0) {
            ctx.globalAlpha = 0.3 + Math.sin(frameCount * 0.3) * 0.3;
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(player.x, player.y, player.width * 0.5, player.height * 0.6, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        // Engine flame
        ctx.globalAlpha = 0.7 + Math.random() * 0.3;
        const flameSize = 10 + Math.random() * 8;
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.moveTo(player.x - player.width / 2, player.y - 4);
        ctx.lineTo(player.x - player.width / 2 - flameSize, player.y);
        ctx.lineTo(player.x - player.width / 2, player.y + 4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.moveTo(player.x - player.width / 2, player.y - 2);
        ctx.lineTo(player.x - player.width / 2 - flameSize * 0.6, player.y);
        ctx.lineTo(player.x - player.width / 2, player.y + 2);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    // ========== OBSTACLES ==========
    const obstacles = [];
    const obstacleColors = ['#8B4513', '#A0522D', '#6B3A2A', '#D2691E', '#556B2F', '#2F4F4F'];

    function spawnObstacle() {
        const type = Math.random();
        let obs;

        if (type < 0.5) {
            const size = ASTEROID_MIN_SIZE + Math.random() * (ASTEROID_MAX_SIZE - ASTEROID_MIN_SIZE);
            obs = {
                x: canvas.width + size,
                y: Math.random() * canvas.height,
                width: size, height: size,
                type: 'asteroid',
                color: obstacleColors[Math.floor(Math.random() * obstacleColors.length)],
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.05,
                vertices: generateAsteroidShape()
            };
        } else if (type < 0.8) {
            const size = PLANET_MIN_SIZE + Math.random() * (PLANET_MAX_SIZE - PLANET_MIN_SIZE);
            const colors = ['#4a6fa5', '#8b4513', '#2e8b57', '#cd853f', '#6a5acd'];
            obs = {
                x: canvas.width + size,
                y: Math.random() * canvas.height,
                width: size, height: size,
                type: 'planet',
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: 0,
                rotSpeed: 0.002,
                hasRing: Math.random() > 0.6
            };
        } else {
            const size = DEBRIS_MIN_SIZE + Math.random() * (DEBRIS_MAX_SIZE - DEBRIS_MIN_SIZE);
            obs = {
                x: canvas.width + size,
                y: Math.random() * canvas.height,
                width: size, height: size,
                type: 'debris',
                color: '#888',
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.08,
                vertices: generateDebrisShape()
            };
        }

        obstacles.push(obs);
    }

    function generateAsteroidShape() {
        const verts = [];
        const n = 8 + Math.floor(Math.random() * 4);
        for (let i = 0; i < n; i++) {
            const angle = (i / n) * Math.PI * 2;
            const r = 0.7 + Math.random() * 0.3;
            verts.push({ angle, r });
        }
        return verts;
    }

    function generateDebrisShape() {
        const verts = [];
        const n = 4 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n; i++) {
            const angle = (i / n) * Math.PI * 2;
            const r = 0.5 + Math.random() * 0.5;
            verts.push({ angle, r });
        }
        return verts;
    }

    function updateObstacles() {
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obs = obstacles[i];
            obs.x -= speed;
            obs.rotation += obs.rotSpeed;
            if (obs.x + obs.width < -50) {
                obstacles.splice(i, 1);
            }
        }
    }

    function drawObstacles() {
        obstacles.forEach(obs => {
            ctx.save();
            ctx.translate(obs.x, obs.y);
            ctx.rotate(obs.rotation);

            if (obs.type === 'asteroid' || obs.type === 'debris') {
                ctx.fillStyle = obs.color;
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                obs.vertices.forEach((v, i) => {
                    const px = Math.cos(v.angle) * v.r * obs.width / 2;
                    const py = Math.sin(v.angle) * v.r * obs.height / 2;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                });
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (obs.type === 'planet') {
                const grad = ctx.createRadialGradient(-obs.width * 0.2, -obs.height * 0.2, obs.width * 0.1, 0, 0, obs.width / 2);
                grad.addColorStop(0, lightenColor(obs.color, 40));
                grad.addColorStop(1, obs.color);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(0, 0, obs.width / 2, 0, Math.PI * 2);
                ctx.fill();

                if (obs.hasRing) {
                    ctx.strokeStyle = 'rgba(200,200,200,0.4)';
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, obs.width * 0.7, obs.width * 0.2, 0.3, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
            ctx.restore();
        });
    }

    function lightenColor(hex, amt) {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        r = Math.min(255, r + amt);
        g = Math.min(255, g + amt);
        b = Math.min(255, b + amt);
        return `rgb(${r},${g},${b})`;
    }

    // ========== COLLECTIBLES ==========
    const collectibles = [];

    function spawnCollectible() {
        const type = Math.random() > 0.5 ? 'html' : 'css';
        collectibles.push({
            x: canvas.width + LOGO_SIZE,
            y: Math.random() * (canvas.height - 80) + 40,
            width: LOGO_SIZE,
            height: LOGO_SIZE,
            type: type,
            bobOffset: Math.random() * Math.PI * 2,
            glow: 0
        });
    }

    function updateCollectibles() {
        for (let i = collectibles.length - 1; i >= 0; i--) {
            const c = collectibles[i];
            c.x -= speed;
            c.glow = 0.5 + Math.sin(frameCount * 0.1 + c.bobOffset) * 0.5;
            if (c.x + c.width < -20) {
                collectibles.splice(i, 1);
            }
        }
    }

    function drawCollectibles() {
        collectibles.forEach(c => {
            const img = c.type === 'html' ? assets.html : assets.css;
            const bobY = Math.sin(frameCount * 0.05 + c.bobOffset) * 4;

            ctx.save();
            ctx.translate(c.x, c.y + bobY);

            ctx.globalAlpha = 0.3 + c.glow * 0.4;
            ctx.fillStyle = c.type === 'html' ? '#e44d26' : '#2965f1';
            ctx.beginPath();
            ctx.arc(0, 0, c.width * 0.7, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = 1;
            if (img) {
                ctx.drawImage(img, -c.width / 2, -c.height / 2, c.width, c.height);
            } else {
                ctx.fillStyle = c.type === 'html' ? '#e44d26' : '#2965f1';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(c.type.toUpperCase(), 0, 0);
            }

            ctx.restore();
        });
    }

    // ========== QUESTIONS ==========
    let questionActive = false;
    let questionPaused = false;

    function shuffleArray(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function initLevel(levelIndex) {
        currentLevel = levelIndex;
        currentQuestionInLevel = 0;
        levelQuestions = shuffleArray(LEVELS[currentLevel].questions);
        lastQuestionDistance = distance;
    }

    function shouldShowQuestion() {
        if (questionActive || levelTransitionActive) return false;
        if (currentLevel >= LEVELS.length) return false;
        if (currentQuestionInLevel >= levelQuestions.length) return false;
        return distance - lastQuestionDistance >= QUESTION_INTERVAL;
    }

    function showQuestion() {
        if (currentQuestionInLevel >= levelQuestions.length) return;
        questionActive = true;
        questionPaused = true;
        const q = levelQuestions[currentQuestionInLevel];
        const level = LEVELS[currentLevel];
        questionsTotal++;

        document.getElementById('question-title').textContent = 'NIVEL ' + level.id + ' - ' + level.name.toUpperCase();
        document.getElementById('question-text').textContent = q.text;
        const optionsDiv = document.getElementById('question-options');
        optionsDiv.innerHTML = '';

        q.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.textContent = opt;
            btn.addEventListener('click', () => handleAnswer(i, q.correct, q.explanation));
            optionsDiv.appendChild(btn);
        });

        document.getElementById('question-feedback').className = 'hidden';
        document.getElementById('question-feedback').textContent = '';
        document.getElementById('btn-continue-after-question').className = 'menu-btn primary hidden';
        document.getElementById('question-modal').className = '';
    }

    function handleAnswer(selected, correct, explanation) {
        const buttons = document.querySelectorAll('#question-options button');
        buttons.forEach((btn, i) => {
            btn.disabled = true;
            if (i === correct) btn.classList.add('correct');
            if (i === selected && i !== correct) btn.classList.add('wrong');
        });

        const feedback = document.getElementById('question-feedback');
        if (selected === correct) {
            questionsCorrect++;
            speed = Math.min(MAX_SPEED, speed + SPEED_BOOST);
            feedback.textContent = '¡Correcto! +Velocidad';
            feedback.className = 'correct-feedback';
        } else {
            feedback.textContent = 'Incorrecto. ' + explanation;
            feedback.className = 'wrong-feedback';
        }

        document.getElementById('btn-continue-after-question').className = 'menu-btn primary';
    }

    function closeQuestion() {
        questionActive = false;
        questionPaused = false;
        lastQuestionDistance = distance;
        currentQuestionInLevel++;
        document.getElementById('question-modal').className = 'hidden';

        if (currentQuestionInLevel >= levelQuestions.length) {
            if (currentLevel < LEVELS.length - 1) {
                showLevelTransition();
            } else {
                victory();
            }
        }
    }

    function showLevelTransition() {
        levelTransitionActive = true;
        const nextLevel = LEVELS[currentLevel + 1];
        document.getElementById('transition-level-num').textContent = 'NIVEL ' + nextLevel.id;
        document.getElementById('transition-level-name').textContent = nextLevel.name;
        document.getElementById('transition-level-desc').textContent = nextLevel.description;

        const dots = document.querySelectorAll('.transition-dot');
        dots.forEach((dot, i) => {
            dot.classList.remove('completed', 'active');
            if (i < currentLevel + 1) {
                dot.classList.add('completed');
            } else if (i === currentLevel + 1) {
                dot.classList.add('active');
            }
        });

        document.getElementById('level-transition').className = '';
        setTimeout(() => {
            document.getElementById('level-transition').className = 'hidden';
            levelTransitionActive = false;
            initLevel(currentLevel + 1);
            updateLevelHUD();
        }, 3000);
    }

    // ========== COLLISION DETECTION ==========
    function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
        return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }

    function getPlayerHitbox() {
        const hw = player.width * 0.6;
        const hh = player.height * 0.7;
        return {
            x: player.x - hw / 2,
            y: player.y - hh / 2,
            w: hw,
            h: hh
        };
    }

    function checkCollisions() {
        if (invincibleTimer > 0) {
            invincibleTimer--;
        }

        const ph = getPlayerHitbox();

        if (invincibleTimer <= 0) {
            for (let i = obstacles.length - 1; i >= 0; i--) {
                const obs = obstacles[i];
                const ow = obs.width * 0.6;
                const oh = obs.height * 0.6;
                const ox = obs.x - ow / 2;
                const oy = obs.y - oh / 2;

                if (rectsOverlap(ph.x, ph.y, ph.w, ph.h, ox, oy, ow, oh)) {
                    fuel = Math.max(0, fuel - OBSTACLE_FUEL_DAMAGE);
                    invincibleTimer = INVINCIBLE_DURATION;
                    obstacles.splice(i, 1);
                    showDamageFlash();
                    break;
                }
            }
        }

        for (let i = collectibles.length - 1; i >= 0; i--) {
            const c = collectibles[i];
            const cw = c.width * 0.7;
            const ch = c.height * 0.7;
            const cx = c.x - cw / 2;
            const cy = (c.y + Math.sin(frameCount * 0.05 + c.bobOffset) * 4) - ch / 2;

            if (rectsOverlap(ph.x, ph.y, ph.w, ph.h, cx, cy, cw, ch)) {
                fuel = Math.min(FUEL_MAX, fuel + FUEL_PER_LOGO);
                if (c.type === 'html') htmlLogosCollected++;
                else cssLogosCollected++;
                collectibles.splice(i, 1);
                showCollectEffect(c.x, c.y, c.type);
            }
        }
    }

    // ========== EFFECTS ==========
    const effects = [];

    function showDamageFlash() {
        effects.push({ type: 'damage', timer: 15 });
    }

    function showCollectEffect(x, y, type) {
        effects.push({
            type: 'collect',
            x, y,
            text: type === 'html' ? '+15% HTML' : '+15% CSS',
            color: type === 'html' ? '#e44d26' : '#2965f1',
            timer: 50,
            vy: -2
        });
    }

    function updateEffects() {
        for (let i = effects.length - 1; i >= 0; i--) {
            const e = effects[i];
            e.timer--;
            if (e.type === 'collect') {
                e.y += e.vy;
            }
            if (e.timer <= 0) effects.splice(i, 1);
        }
    }

    function drawEffects() {
        effects.forEach(e => {
            if (e.type === 'damage') {
                ctx.globalAlpha = e.timer / 15 * 0.3;
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.globalAlpha = 1;
            } else if (e.type === 'collect') {
                const progress = e.timer / 50;
                ctx.globalAlpha = progress;
                ctx.fillStyle = e.color;
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(e.text, e.x, e.y - (1 - progress) * 30);
                ctx.globalAlpha = 1;
            }
        });
    }

    // ========== SPAWNING ==========
    let obstacleTimer = 0;
    let collectibleTimer = 0;
    const OBSTACLE_INTERVAL = 80;
    const COLLECTIBLE_INTERVAL = 50;

    function updateSpawning() {
        obstacleTimer++;
        collectibleTimer++;

        if (obstacleTimer >= OBSTACLE_INTERVAL) {
            obstacleTimer = 0;
            spawnObstacle();
        }

        if (collectibleTimer >= COLLECTIBLE_INTERVAL) {
            collectibleTimer = 0;
            spawnCollectible();
        }
    }

    // ========== HUD ==========
    function updateHUD() {
        const fuelFill = document.getElementById('fuel-fill');
        const fuelText = document.getElementById('fuel-text');
        const distanceValue = document.getElementById('distance-value');
        const speedValue = document.getElementById('speed-value');

        fuelFill.style.width = fuel + '%';
        fuelText.textContent = Math.round(fuel) + '%';
        distanceValue.textContent = Math.round(distance) + ' m';
        speedValue.textContent = Math.round(speed * 40) + ' km/h';

        fuelFill.classList.remove('low', 'medium');
        if (fuel <= 25) fuelFill.classList.add('low');
        else if (fuel <= 50) fuelFill.classList.add('medium');
    }

    function updateLevelHUD() {
        const levelInfo = document.getElementById('hud-level');
        if (currentLevel < LEVELS.length) {
            const level = LEVELS[currentLevel];
            levelInfo.innerHTML = '<span class="level-tag" style="background:' + level.color + '">Nivel ' + level.id + '</span> ' + level.name;
        }
    }

    // ========== GAME STATE MANAGEMENT ==========
    function startGame() {
        fuel = FUEL_START;
        distance = 0;
        speed = BASE_SPEED;
        htmlLogosCollected = 0;
        cssLogosCollected = 0;
        questionsCorrect = 0;
        questionsTotal = 0;
        lastQuestionDistance = 0;
        invincibleTimer = 0;
        frameCount = 0;
        obstacleTimer = 0;
        collectibleTimer = 0;

        obstacles.length = 0;
        collectibles.length = 0;
        effects.length = 0;

        initLevel(0);
        initPlayer();
        initStars();

        document.getElementById('main-menu').className = 'hidden';
        document.getElementById('game-over').className = 'hidden';
        document.getElementById('victory').className = 'hidden';
        document.getElementById('level-transition').className = 'hidden';
        document.getElementById('hud').className = '';
        updateLevelHUD();

        gameState = 'playing';
    }

    function gameOver() {
        gameState = 'gameover';
        const level = LEVELS[currentLevel];
        document.getElementById('gameover-title').textContent = 'MISIÓN FALLIDA';
        document.getElementById('gameover-message').textContent = 'Te quedaste sin combustible en Nivel ' + level.id + ' - ' + level.name;
        document.getElementById('final-level').textContent = 'Nivel ' + level.id + ' - ' + level.name;
        document.getElementById('final-distance').textContent = Math.round(distance) + ' m';
        document.getElementById('final-html').textContent = htmlLogosCollected;
        document.getElementById('final-css').textContent = cssLogosCollected;
        document.getElementById('final-questions').textContent = questionsCorrect + '/' + questionsTotal;
        document.getElementById('game-over').className = '';
        document.getElementById('hud').className = 'hidden';
    }

    function victory() {
        gameState = 'victory';
        document.getElementById('victory-fuel').textContent = Math.round(fuel) + '%';
        document.getElementById('victory-distance').textContent = Math.round(distance) + ' m';
        document.getElementById('victory-questions').textContent = questionsCorrect + '/' + questionsTotal;
        document.getElementById('victory').className = '';
        document.getElementById('hud').className = 'hidden';
    }

    // ========== UI HELPERS ==========
    function showPause() { document.getElementById('pause-menu').className = ''; }
    function hidePause() { document.getElementById('pause-menu').className = 'hidden'; }

    // ========== MAIN GAME LOOP ==========
    function gameLoop() {
        requestAnimationFrame(gameLoop);

        if (gameState !== 'playing') {
            if (gameState === 'menu' || gameState === 'gameover' || gameState === 'victory') {
                drawMenuBackground();
            }
            return;
        }

        frameCount++;

        if (questionPaused || levelTransitionActive) {
            drawGame();
            return;
        }

        distance += speed * 0.5;
        fuel -= FUEL_DRAIN_RATE * (speed / BASE_SPEED);

        if (fuel <= 0) {
            fuel = 0;
            gameOver();
            return;
        }

        if (shouldShowQuestion()) {
            showQuestion();
            return;
        }

        updatePlayer();
        updateStars();
        updateObstacles();
        updateCollectibles();
        updateSpawning();
        updateEffects();
        checkCollisions();
        updateHUD();

        drawGame();
    }

    function drawGame() {
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawStars();
        drawCollectibles();
        drawObstacles();
        drawPlayer();
        drawEffects();

        drawDistanceProgress();
    }

    function drawDistanceProgress() {
        const barY = canvas.height - 20;
        const barWidth = canvas.width - 40;

        let totalQuestions = 0;
        let answeredQuestions = 0;
        for (let i = 0; i < LEVELS.length; i++) {
            totalQuestions += LEVELS[i].questions.length;
            if (i < currentLevel) {
                answeredQuestions += LEVELS[i].questions.length;
            }
        }
        answeredQuestions += currentQuestionInLevel;
        const progress = Math.min(1, answeredQuestions / totalQuestions);

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(20, barY, barWidth, 8);

        const grad = ctx.createLinearGradient(20, 0, 20 + barWidth * progress, 0);
        grad.addColorStop(0, '#e44d26');
        grad.addColorStop(1, '#00ff88');
        ctx.fillStyle = grad;
        ctx.fillRect(20, barY, barWidth * progress, 8);

        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Nivel ' + (currentLevel + 1) + '/' + LEVELS.length + '  |  Preguntas: ' + answeredQuestions + '/' + totalQuestions, canvas.width / 2, barY - 4);

        ctx.fillStyle = '#00ff88';
        ctx.beginPath();
        ctx.arc(20 + barWidth * progress, barY + 4, 6, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawMenuBackground() {
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        updateStars();
        drawStars();

        if (frameCount % 3 === 0) {
            frameCount++;
        }
    }

    // ========== UI EVENT LISTENERS ==========
    document.getElementById('btn-play').addEventListener('click', startGame);
    document.getElementById('btn-how').addEventListener('click', () => {
        document.getElementById('main-menu').className = 'hidden';
        document.getElementById('how-to-play').className = '';
    });
    document.getElementById('btn-back-how').addEventListener('click', () => {
        document.getElementById('how-to-play').className = 'hidden';
        document.getElementById('main-menu').className = '';
    });
    document.getElementById('btn-retry').addEventListener('click', startGame);
    document.getElementById('btn-menu').addEventListener('click', () => {
        document.getElementById('game-over').className = 'hidden';
        document.getElementById('main-menu').className = '';
    });
    document.getElementById('btn-play-again').addEventListener('click', startGame);
    document.getElementById('btn-victory-menu').addEventListener('click', () => {
        document.getElementById('victory').className = 'hidden';
        document.getElementById('main-menu').className = '';
    });
    document.getElementById('btn-resume').addEventListener('click', () => {
        gameState = 'playing';
        hidePause();
    });
    document.getElementById('btn-pause-quit').addEventListener('click', () => {
        gameState = 'menu';
        hidePause();
        document.getElementById('hud').className = 'hidden';
        document.getElementById('main-menu').className = '';
    });
    document.getElementById('btn-continue-after-question').addEventListener('click', closeQuestion);

    // ========== INIT ==========
    loadAssets(() => {
        initStars();
        initPlayer();
        gameState = 'menu';
        gameLoop();
    });

})();
