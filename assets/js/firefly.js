/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ✦ PAYROLL NEXUS — AUTONOMOUS FIREFLY MASCOT ("LUMI")
 * Lightweight, theme-adaptive, living SVG creature exploring the interface
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function () {
    'use strict';

    // Guard against multiple initializations
    if (window.__PAYROLL_NEXUS_FIREFLY__) {
        try {
            window.__PAYROLL_NEXUS_FIREFLY__.destroy();
        } catch (_) {}
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 1. MOTION MANAGER (Gentle mode instead of hard freeze)
    // ══════════════════════════════════════════════════════════════════════════
    class MotionManager {
        constructor() {
            this.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            this.prefersReduced = this.mediaQuery.matches;

            this.mediaQuery.addEventListener('change', (e) => {
                this.prefersReduced = e.matches;
            });
        }

        isReduced() {
            const hasAppDisabled = document.body.classList.contains('motion-disabled') ||
                                   document.body.classList.contains('no-anim');
            return this.prefersReduced || hasAppDisabled;
        }

        getSpeedScale() {
            return this.isReduced() ? 0.45 : 1.0;
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 2. ANTENNA SPRING PHYSICS
    // ══════════════════════════════════════════════════════════════════════════
    class AntennaPhysics {
        constructor(svgRoot) {
            this.svg = svgRoot;
            this.pathL = svgRoot.querySelector('#fireflyAntennaL');
            this.pathR = svgRoot.querySelector('#fireflyAntennaR');
            this.tipL = svgRoot.querySelector('#fireflyAntennaTipL');
            this.tipR = svgRoot.querySelector('#fireflyAntennaTipR');
            this.tipGlintL = svgRoot.querySelector('#fireflyAntennaTipGlintL');
            this.tipGlintR = svgRoot.querySelector('#fireflyAntennaTipGlintR');

            // Rest positions (160x160 coordinate space)
            this.baseL = { x: 76, y: 46 };
            this.restTipL = { x: 56, y: 22 };
            this.currTipL = { x: 56, y: 22 };

            this.baseR = { x: 84, y: 46 };
            this.restTipR = { x: 104, y: 22 };
            this.currTipR = { x: 104, y: 22 };

            this.spring = 0.18;
            this.damping = 0.80;
            this.vxL = 0;
            this.vyL = 0;
            this.vxR = 0;
            this.vyR = 0;
        }

        update(dt, velocity, acceleration, mouseCuriosity = 0) {
            // Velocity drag & inertia applied to antennae tips
            const dragX = -velocity.x * 0.04 - acceleration.x * 0.08;
            const dragY = -velocity.y * 0.04 - acceleration.y * 0.08;

            // Target positions with dynamic inertia
            const targetLx = this.restTipL.x + dragX + mouseCuriosity * 4;
            const targetLy = this.restTipL.y + dragY;

            const targetRx = this.restTipR.x + dragX + mouseCuriosity * 4;
            const targetRy = this.restTipR.y + dragY;

            // Spring integration for Left Antenna
            const axL = (targetLx - this.currTipL.x) * this.spring;
            const ayL = (targetLy - this.currTipL.y) * this.spring;
            this.vxL = (this.vxL + axL) * this.damping;
            this.vyL = (this.vyL + ayL) * this.damping;
            this.currTipL.x += this.vxL;
            this.currTipL.y += this.vyL;

            // Spring integration for Right Antenna
            const axR = (targetRx - this.currTipR.x) * this.spring;
            const ayR = (targetRy - this.currTipR.y) * this.spring;
            this.vxR = (this.vxR + axR) * this.damping;
            this.vyR = (this.vyR + ayR) * this.damping;
            this.currTipR.x += this.vxR;
            this.currTipR.y += this.vyR;

            // Update SVG DOM paths
            if (this.pathL && this.tipL) {
                const midLx = (this.baseL.x + this.currTipL.x) * 0.5 - 5;
                const midLy = (this.baseL.y + this.currTipL.y) * 0.5 - 2;
                this.pathL.setAttribute('d', `M ${this.baseL.x} ${this.baseL.y} Q ${midLx.toFixed(1)} ${midLy.toFixed(1)} ${this.currTipL.x.toFixed(1)} ${this.currTipL.y.toFixed(1)}`);
                this.tipL.setAttribute('cx', this.currTipL.x.toFixed(1));
                this.tipL.setAttribute('cy', this.currTipL.y.toFixed(1));
                if (this.tipGlintL) {
                    this.tipGlintL.setAttribute('cx', (this.currTipL.x - 0.7).toFixed(1));
                    this.tipGlintL.setAttribute('cy', (this.currTipL.y - 0.7).toFixed(1));
                }
            }

            if (this.pathR && this.tipR) {
                const midRx = (this.baseR.x + this.currTipR.x) * 0.5 + 5;
                const midRy = (this.baseR.y + this.currTipR.y) * 0.5 - 2;
                this.pathR.setAttribute('d', `M ${this.baseR.x} ${this.baseR.y} Q ${midRx.toFixed(1)} ${midRy.toFixed(1)} ${this.currTipR.x.toFixed(1)} ${this.currTipR.y.toFixed(1)}`);
                this.tipR.setAttribute('cx', this.currTipR.x.toFixed(1));
                this.tipR.setAttribute('cy', this.currTipR.y.toFixed(1));
                if (this.tipGlintR) {
                    this.tipGlintR.setAttribute('cx', (this.currTipR.x - 0.7).toFixed(1));
                    this.tipGlintR.setAttribute('cy', (this.currTipR.y - 0.7).toFixed(1));
                }
            }
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 3. PARTICLE SYSTEM (Sparkling starlight & bioluminescent data sparks)
    // ══════════════════════════════════════════════════════════════════════════
    class ParticleSystem {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.pool = [];
            this.maxParticles = 24;
            this.colors = ['#ffd768', '#b68cff', '#7c8cff', '#38bdf8', '#ffffff'];

            this.resize();
            this.onResize = () => this.resize();
            window.addEventListener('resize', this.onResize, { passive: true });

            for (let i = 0; i < this.maxParticles; i++) {
                this.pool.push({
                    active: false,
                    x: 0,
                    y: 0,
                    vx: 0,
                    vy: 0,
                    size: 2,
                    alpha: 1,
                    life: 0,
                    maxLife: 1,
                    color: '#ffd768'
                });
            }
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        spawn(x, y, speed = 60, burst = false) {
            let p = null;
            for (let i = 0; i < this.pool.length; i++) {
                if (!this.pool[i].active) {
                    p = this.pool[i];
                    break;
                }
            }
            if (!p) return;

            p.active = true;
            p.x = x + (Math.random() - 0.5) * 8;
            p.y = y + (Math.random() - 0.5) * 8;

            const spread = burst ? 70 : 25;
            p.vx = (Math.random() - 0.5) * spread;
            p.vy = (Math.random() - 0.5) * spread + 10;
            p.size = Math.random() * 2.4 + 1.2;
            p.alpha = Math.min(1, 0.5 + speed * 0.003);
            p.life = 0;
            p.maxLife = 0.5 + Math.random() * 0.6;
            p.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        }

        updateAndRender(dt) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            for (let i = 0; i < this.pool.length; i++) {
                const p = this.pool[i];
                if (!p.active) continue;

                p.life += dt;
                if (p.life >= p.maxLife) {
                    p.active = false;
                    continue;
                }

                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.size *= 0.98;
                const progress = p.life / p.maxLife;
                const currentAlpha = p.alpha * (1 - progress);

                this.ctx.save();
                this.ctx.globalAlpha = Math.max(0, currentAlpha);
                this.ctx.fillStyle = p.color;
                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = p.color;

                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, Math.max(0.6, p.size), 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        }

        destroy() {
            window.removeEventListener('resize', this.onResize);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 4. WAYPOINT & SECTION NAVIGATION MANAGER
    // ══════════════════════════════════════════════════════════════════════════
    class ExplorationManager {
        constructor() {
            this.currentSection = 'dashboard';
            this.recentTargets = [];
            this.initSectionListeners();
        }

        initSectionListeners() {
            // Tab clicks
            document.addEventListener('click', (e) => {
                const tabBtn = e.target.closest && e.target.closest('[data-tab]');
                if (tabBtn) {
                    const tabName = tabBtn.getAttribute('data-tab');
                    if (tabName && tabName !== this.currentSection) {
                        this.currentSection = tabName;
                        window.dispatchEvent(new CustomEvent('firefly:section-changed', { detail: { section: tabName } }));
                    }
                }
            }, true);

            // Mutation observer for active tab changes
            const observer = new MutationObserver(() => {
                const activeTab = document.querySelector('.tab-content:not(.hidden)');
                if (activeTab && activeTab.id) {
                    const sec = activeTab.id.replace('Section', '').toLowerCase();
                    if (sec && sec !== this.currentSection) {
                        this.currentSection = sec;
                        window.dispatchEvent(new CustomEvent('firefly:section-changed', { detail: { section: sec } }));
                    }
                }
            });

            const main = document.querySelector('.helios-main') || document.body;
            observer.observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
        }

        getInterestingAnchor() {
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            let anchorCandidates = [];

            switch (this.currentSection) {
                case 'payroll':
                    anchorCandidates = [
                        '#payrollTrendChart', '#payrollTableWrap', '#calcPayrollBtn',
                        '.payroll-stat-card', '#payrollSection .glass'
                    ];
                    break;
                case 'employees':
                    anchorCandidates = [
                        '#empDeptChart', '#employeesSection .table-wrap',
                        '#addEmployeeBtn', '#employeesSection .glass'
                    ];
                    break;
                case 'attendance':
                    anchorCandidates = [
                        '#attendancePieChart', '#attendanceSection .glass',
                        '#markAttendanceBtn'
                    ];
                    break;
                case 'leaves':
                    anchorCandidates = [
                        '#leavesSection .leave-stats-grid', '#requestLeaveBtn',
                        '#leavesSection .glass'
                    ];
                    break;
                case 'reports':
                    anchorCandidates = [
                        '#reportChartGrid', '#exportReportBtn',
                        '#reportsSection .glass'
                    ];
                    break;
                case 'dashboard':
                default:
                    anchorCandidates = [
                        '.helios-telemetry-banner', '#heliosAiSearchCapsule',
                        '.helios-top-triad', '#globalPulseDot',
                        '.qa-card', '#dashboardSection .glass'
                    ];
                    break;
            }

            for (const sel of anchorCandidates) {
                const el = document.querySelector(sel);
                if (el) {
                    const r = el.getBoundingClientRect();
                    if (r.width > 30 && r.height > 20 && r.top < vh && r.bottom > 60) {
                        // Offset near the edge or above the element
                        const ox = (Math.random() > 0.5 ? 1 : -1) * (r.width * 0.35 + 20);
                        const oy = -25 + (Math.random() - 0.5) * 30;
                        const px = Math.max(50, Math.min(vw - 60, (r.left + r.right) / 2 + ox));
                        const py = Math.max(60, Math.min(vh - 60, r.top + oy));
                        return { x: px, y: py };
                    }
                }
            }

            return null;
        }

        getNextTarget(currentX, currentY) {
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            // Generate diverse candidate zones across the viewport
            const candidatePool = [];

            // 1. Specific section element anchor
            const anchor = this.getInterestingAnchor();
            if (anchor) {
                candidatePool.push(anchor);
            }

            // 2. Airspace Quadrants & Corridors (designed for comfortable, expansive flight paths)
            const corridors = [
                // Top-left dashboard overview corridor
                { x: vw * (0.16 + Math.random() * 0.18), y: Math.max(80, vh * (0.12 + Math.random() * 0.16)) },
                // Top-right KPI & telemetry margin
                { x: vw * (0.68 + Math.random() * 0.22), y: Math.max(80, vh * (0.14 + Math.random() * 0.18)) },
                // Center-left analytics airspace
                { x: vw * (0.22 + Math.random() * 0.24), y: vh * (0.35 + Math.random() * 0.28) },
                // Center-right activity & quick action airspace
                { x: vw * (0.62 + Math.random() * 0.26), y: vh * (0.36 + Math.random() * 0.26) },
                // Mid-screen graceful traverse
                { x: vw * (0.42 + Math.random() * 0.18), y: vh * (0.22 + Math.random() * 0.28) },
                // Lower exploration corridor
                { x: vw * (0.30 + Math.random() * 0.40), y: Math.min(vh - 70, vh * (0.68 + Math.random() * 0.18)) }
            ];

            candidatePool.push(...corridors);

            // Filter out candidates that are too close to current position or recent history
            let valid = candidatePool.filter(pt => {
                const d = Math.hypot(pt.x - currentX, pt.y - currentY);
                if (d < 160) return false;

                // Check distance from last 2 targets
                for (const r of this.recentTargets) {
                    if (Math.hypot(pt.x - r.x, pt.y - r.y) < 120) return false;
                }
                return true;
            });

            if (valid.length === 0) {
                // Pick the candidate furthest from current position
                valid = candidatePool.sort((a, b) => {
                    const da = Math.hypot(a.x - currentX, a.y - currentY);
                    const db = Math.hypot(b.x - currentX, b.y - currentY);
                    return db - da;
                });
            }

            const chosen = valid[Math.floor(Math.random() * valid.length)] || {
                x: Math.max(60, Math.min(vw - 60, vw * 0.5 + (Math.random() - 0.5) * vw * 0.6)),
                y: Math.max(70, Math.min(vh - 70, vh * 0.35 + (Math.random() - 0.5) * vh * 0.4))
            };

            // Clamp safely
            chosen.x = Math.max(50, Math.min(vw - 50, chosen.x));
            chosen.y = Math.max(60, Math.min(vh - 60, chosen.y));

            // Record history
            this.recentTargets.push(chosen);
            if (this.recentTargets.length > 4) this.recentTargets.shift();

            return chosen;
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 5. FLIGHT PHYSICS ENGINE
    // ══════════════════════════════════════════════════════════════════════════
    class PhysicsSystem {
        constructor(startX, startY) {
            this.x = startX;
            this.y = startY;
            this.vx = 0;
            this.vy = 0;
            this.ax = 0;
            this.ay = 0;

            this.targetX = startX;
            this.targetY = startY;

            this.rotation = 0;
            this.targetRotation = 0;

            this.baseMaxSpeed = 220;
            this.maxSpeed = 220;
            this.maxForce = 340;
            this.friction = 0.93;
            this.arrivalRadius = 70;

            this.curvedPhase = Math.random() * Math.PI * 2;
        }

        setTarget(x, y) {
            this.targetX = x;
            this.targetY = y;
        }

        update(dt, speedScale = 1.0) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dist = Math.hypot(dx, dy);

            // Reynolds Seek + Organic Curvature + Arrival Deceleration
            if (dist > 4) {
                let desiredSpeed = this.maxSpeed * speedScale;
                if (dist < this.arrivalRadius) {
                    desiredSpeed *= (dist / this.arrivalRadius);
                }

                const nx = dx / dist;
                const ny = dy / dist;

                // Organic lateral wave curvature
                this.curvedPhase += dt * 3.5;
                const curveAmp = Math.min(48, dist * 0.30);
                const perpX = -ny * Math.sin(this.curvedPhase) * curveAmp;
                const perpY = nx * Math.sin(this.curvedPhase) * curveAmp;

                const targetVx = (nx * desiredSpeed) + (perpX * 0.45);
                const targetVy = (ny * desiredSpeed) + (perpY * 0.45);

                const steerX = Math.max(-this.maxForce, Math.min(this.maxForce, (targetVx - this.vx) * 3.8));
                const steerY = Math.max(-this.maxForce, Math.min(this.maxForce, (targetVy - this.vy) * 3.8));

                this.ax = steerX;
                this.ay = steerY;
            } else {
                this.ax = -this.vx * 4.5;
                this.ay = -this.vy * 4.5;
            }

            // Integrate
            this.vx += this.ax * dt;
            this.vy += this.ay * dt;

            this.vx *= Math.pow(this.friction, dt * 60);
            this.vy *= Math.pow(this.friction, dt * 60);

            this.x += this.vx * dt;
            this.y += this.vy * dt;

            // Viewport bounds
            this.x = Math.max(35, Math.min(window.innerWidth - 35, this.x));
            this.y = Math.max(45, Math.min(window.innerHeight - 45, this.y));

            // Rotational heading
            const speed = Math.hypot(this.vx, this.vy);
            if (speed > 16) {
                this.targetRotation = Math.atan2(this.vy, this.vx) + (Math.PI * 0.5);
            }

            let diff = this.targetRotation - this.rotation;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;

            this.rotation += diff * Math.min(1, dt * 6.0);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 6. STATE MACHINE & AUTONOMOUS DECISION TREE
    // ══════════════════════════════════════════════════════════════════════════
    const STATES = {
        ENTERING: 'state-entering',
        IDLE: 'state-idle',
        TRAVELLING: 'state-travelling',
        INSPECTING: 'state-inspecting',
        RESTING: 'state-resting',
        REACTING: 'state-reacting'
    };

    class FireflyStateMachine {
        constructor(controller) {
            this.ctrl = controller;
            this.state = STATES.ENTERING;
            this.stateTimer = 0;
            this.duration = 1.8;
        }

        setState(newState, duration = 3.0) {
            if (this.state === newState && newState !== STATES.REACTING) return;
            this.state = newState;
            this.stateTimer = 0;
            this.duration = duration;

            const container = this.ctrl.creatureEl;
            Object.values(STATES).forEach(cls => container.classList.remove(cls));
            container.classList.add(newState);

            this.ctrl.onStateChanged(newState);
        }

        update(dt) {
            this.stateTimer += dt;
            if (this.stateTimer >= this.duration) {
                this.decideNextState();
            }
        }

        decideNextState() {
            const dist = Math.hypot(this.ctrl.physics.targetX - this.ctrl.physics.x, this.ctrl.physics.targetY - this.ctrl.physics.y);

            // If still en route, keep travelling
            if (dist > 45 && this.state === STATES.TRAVELLING && this.stateTimer < 5.0) {
                this.setState(STATES.TRAVELLING, 2.0);
                return;
            }

            // Arrived at destination: Hover & Inspect
            if (this.state === STATES.TRAVELLING || this.state === STATES.ENTERING) {
                const inspectDuration = 2.2 + Math.random() * 2.4;
                this.setState(STATES.INSPECTING, inspectDuration);
                return;
            }

            // Done inspecting/resting: Embark on next journey!
            if (this.state === STATES.INSPECTING || this.state === STATES.IDLE || this.state === STATES.REACTING || this.state === STATES.RESTING) {
                this.ctrl.flyToNextTarget();
            }
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 7. MASTER FIREFLY CONTROLLER
    // ══════════════════════════════════════════════════════════════════════════
    class FireflyController {
        constructor() {
            this.motionMgr = new MotionManager();
            this.exploration = new ExplorationManager();

            this.isDragging = false;
            this.dragStart = { x: 0, y: 0 };
            this.dragOffset = { x: 0, y: 0 };
            this.dragPointerId = null;
            this.dragDist = 0;

            this.isSleeping = false;
            this.mousePos = { x: -999, y: -999 };
            this.mouseNear = false;
            this.mouseCuriosity = 0;

            this.initDOM();
            this.initPhysics();
            this.initAntenna();
            this.initParticles();
            this.initInteractions();

            this.stateMachine = new FireflyStateMachine(this);

            this.lastTime = performance.now();
            this.rafId = null;
            this.isRunning = true;

            this.loop = this.loop.bind(this);
            this.rafId = requestAnimationFrame(this.loop);

            // Visibility handling
            this.onVisibilityChange = () => {
                if (document.hidden) {
                    this.pause();
                } else {
                    this.resume();
                }
            };
            document.addEventListener('visibilitychange', this.onVisibilityChange);

            // Launch initial flight after short delay
            setTimeout(() => {
                this.flyToNextTarget();
            }, 600);
        }

        initDOM() {
            let layer = document.getElementById('firefly-layer');
            if (!layer) {
                layer = document.createElement('div');
                layer.id = 'firefly-layer';
                layer.setAttribute('aria-hidden', 'true');
                document.body.appendChild(layer);
            }
            this.layerEl = layer;

            const canvas = document.createElement('canvas');
            canvas.className = 'firefly-particle-canvas';
            this.layerEl.appendChild(canvas);
            this.canvasEl = canvas;

            const creature = document.createElement('div');
            creature.className = 'firefly-creature state-entering';
            creature.title = 'Lumi — Click to play, drag anywhere, double-click to sleep';

            creature.innerHTML = `
                <svg class="firefly-svg" viewBox="0 0 160 160" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="fireflyWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="var(--firefly-wing-specular)" stop-opacity="0.92"/>
                            <stop offset="35%" stop-color="var(--firefly-wing-fill)" stop-opacity="0.55"/>
                            <stop offset="70%" stop-color="var(--firefly-accent)" stop-opacity="0.32"/>
                            <stop offset="100%" stop-color="var(--firefly-accent2)" stop-opacity="0.55"/>
                        </linearGradient>

                        <radialGradient id="fireflyCoreGrad" cx="50%" cy="38%" r="58%">
                            <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
                            <stop offset="28%" stop-color="var(--firefly-glow-warm)" stop-opacity="0.95"/>
                            <stop offset="65%" stop-color="var(--firefly-accent)" stop-opacity="0.75"/>
                            <stop offset="92%" stop-color="var(--firefly-accent2)" stop-opacity="0.35"/>
                            <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
                        </radialGradient>

                        <radialGradient id="fireflyCoreInnerGrad" cx="50%" cy="32%" r="50%">
                            <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
                            <stop offset="40%" stop-color="#fff8cc" stop-opacity="0.95"/>
                            <stop offset="78%" stop-color="var(--firefly-glow-warm)" stop-opacity="0.85"/>
                            <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
                        </radialGradient>

                        <radialGradient id="fireflyAuraGrad" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="var(--firefly-glow-warm)" stop-opacity="0.9"/>
                            <stop offset="40%" stop-color="var(--firefly-glow-ambient)" stop-opacity="0.48"/>
                            <stop offset="75%" stop-color="var(--firefly-glow-violet)" stop-opacity="0.25"/>
                            <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
                        </radialGradient>

                        <radialGradient id="fireflyHeadHighlight" cx="38%" cy="30%" r="62%">
                            <stop offset="0%" stop-color="rgba(255,255,255,0.42)"/>
                            <stop offset="48%" stop-color="rgba(255,255,255,0.08)"/>
                            <stop offset="100%" stop-color="transparent"/>
                        </radialGradient>
                    </defs>

                    <g class="firefly">
                        <!-- Glow Aura -->
                        <g class="glow-auras">
                            <circle cx="80" cy="102" r="46" fill="url(#fireflyAuraGrad)" class="firefly-aura"/>
                        </g>

                        <!-- BACK WINGS -->
                        <g class="wings-back">
                            <g class="wing-group wing-left-back">
                                <path class="firefly-wing" d="M 73 76 C 56 70, 28 66, 16 75 C 10 80, 16 92, 38 92 C 54 92, 68 83, 73 76 Z"/>
                                <path class="firefly-wing-vein" d="M 73 76 C 48 78, 26 80, 18 76"/>
                            </g>
                            <g class="wing-group wing-right-back">
                                <path class="firefly-wing" d="M 87 76 C 104 70, 132 66, 144 75 C 150 80, 144 92, 122 92 C 106 92, 92 83, 87 76 Z"/>
                                <path class="firefly-wing-vein" d="M 87 76 C 112 78, 134 80, 142 76"/>
                            </g>
                        </g>

                        <!-- ABDOMEN & GLOWING DATA CORE -->
                        <g class="abdomen-group">
                            <path class="firefly-abdomen" d="M 70 82 C 67 98, 68 116, 80 128 C 92 116, 93 98, 90 82 Z"/>
                            <path d="M 71 90 Q 80 95 89 90" stroke="var(--firefly-accent)" stroke-width="1.2" opacity="0.65" fill="none"/>
                            <path d="M 73 99 Q 80 104 87 99" stroke="var(--firefly-accent2)" stroke-width="1.2" opacity="0.75" fill="none"/>
                            <ellipse cx="80" cy="104" rx="14" ry="18" fill="url(#fireflyCoreGrad)" class="firefly-core"/>
                            <ellipse cx="80" cy="107" rx="8" ry="11" fill="url(#fireflyCoreInnerGrad)" class="firefly-core-inner"/>
                        </g>

                        <!-- BODY / THORAX -->
                        <g class="body-group">
                            <ellipse cx="80" cy="74" rx="13" ry="12" class="firefly-body-main"/>
                            <ellipse cx="78" cy="70" rx="9" ry="6" fill="rgba(255,255,255,0.18)"/>
                        </g>

                        <!-- HEAD & EYES -->
                        <g class="head-group">
                            <circle cx="80" cy="55" r="12" class="firefly-head"/>
                            <circle cx="80" cy="55" r="12" fill="url(#fireflyHeadHighlight)"/>
                            <circle cx="75" cy="53" r="2.8" class="firefly-eye"/>
                            <circle cx="74.2" cy="52.2" r="1" fill="#ffffff" opacity="0.9"/>
                            <circle cx="85" cy="53" r="2.8" class="firefly-eye"/>
                            <circle cx="84.2" cy="52.2" r="1" fill="#ffffff" opacity="0.9"/>
                        </g>

                        <!-- EXPRESSIVE ANTENNAE -->
                        <g class="antennae-group">
                            <path id="fireflyAntennaL" class="antenna antenna-left" d="M 76 46 Q 66 34 56 22"/>
                            <circle id="fireflyAntennaTipL" cx="56" cy="22" r="2.8" class="antenna-tip antenna-tip-left"/>
                            <circle id="fireflyAntennaTipGlintL" cx="55.2" cy="21.2" r="0.9" fill="#ffffff"/>

                            <path id="fireflyAntennaR" class="antenna antenna-right" d="M 84 46 Q 94 34 104 22"/>
                            <circle id="fireflyAntennaTipR" cx="104" cy="22" r="2.8" class="antenna-tip antenna-tip-right"/>
                            <circle id="fireflyAntennaTipGlintR" cx="103.2" cy="21.2" r="0.9" fill="#ffffff"/>
                        </g>

                        <!-- FRONT WINGS -->
                        <g class="wings-front">
                            <g class="wing-group wing-left-front">
                                <path class="firefly-wing" d="M 74 68 C 65 44, 30 28, 12 36 C 4 41, 8 62, 38 72 C 55 78, 70 72, 74 68 Z"/>
                                <path class="firefly-wing-vein" d="M 74 68 C 50 54, 26 42, 14 38"/>
                                <path d="M 12 36 C 30 28, 65 44, 74 68" fill="none" stroke="var(--firefly-wing-specular)" stroke-width="0.75" opacity="0.75"/>
                            </g>
                            <g class="wing-group wing-right-front">
                                <path class="firefly-wing" d="M 86 68 C 95 44, 130 28, 148 36 C 156 41, 152 62, 122 72 C 105 78, 90 72, 86 68 Z"/>
                                <path class="firefly-wing-vein" d="M 86 68 C 110 54, 134 42, 146 38"/>
                                <path d="M 148 36 C 130 28, 95 44, 86 68" fill="none" stroke="var(--firefly-wing-specular)" stroke-width="0.75" opacity="0.75"/>
                            </g>
                        </g>
                    </g>
                </svg>
            `;

            this.layerEl.appendChild(creature);
            this.creatureEl = creature;
            this.svgEl = creature.querySelector('svg');
        }

        initPhysics() {
            // Initial spawn point: mid-upper right of screen
            const startX = Math.min(window.innerWidth - 80, window.innerWidth * 0.78);
            const startY = 110;
            this.physics = new PhysicsSystem(startX, startY);
        }

        initAntenna() {
            this.antenna = new AntennaPhysics(this.svgEl);
        }

        initParticles() {
            this.particles = new ParticleSystem(this.canvasEl);
        }

        initInteractions() {
            // Track pointer movement
            window.addEventListener('pointermove', (e) => {
                this.mousePos.x = e.clientX;
                this.mousePos.y = e.clientY;

                if (this.isDragging) {
                    const nx = e.clientX - this.dragOffset.x;
                    const ny = e.clientY - this.dragOffset.y;

                    // Compute drag velocity
                    const vx = (nx - this.physics.x) * 20;
                    const vy = (ny - this.physics.y) * 20;

                    this.physics.vx = vx;
                    this.physics.vy = vy;
                    this.physics.x = nx;
                    this.physics.y = ny;
                    this.physics.targetX = nx;
                    this.physics.targetY = ny;

                    this.dragDist += Math.hypot(e.clientX - this.dragStart.x, e.clientY - this.dragStart.y);
                }
            }, { passive: true });

            // Pointer down on creature (Drag start)
            this.creatureEl.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                e.stopPropagation();

                this.isDragging = true;
                this.dragPointerId = e.pointerId;
                this.creatureEl.setPointerCapture(e.pointerId);

                this.dragStart.x = e.clientX;
                this.dragStart.y = e.clientY;
                this.dragOffset.x = e.clientX - this.physics.x;
                this.dragOffset.y = e.clientY - this.physics.y;
                this.dragDist = 0;

                this.creatureEl.classList.add('is-dragging');
                if (this.isSleeping) {
                    this.wakeUp();
                }
            });

            // Pointer up (Release or Click)
            this.creatureEl.addEventListener('pointerup', (e) => {
                if (!this.isDragging) return;
                this.isDragging = false;
                this.creatureEl.classList.remove('is-dragging');

                try {
                    this.creatureEl.releasePointerCapture(e.pointerId);
                } catch (_) {}

                if (this.dragDist < 8) {
                    // It was a crisp click! Playful aerial spin
                    this.react('click');
                } else {
                    // User tossed Lumi! Keep velocity and cruise to a nearby waypoint
                    this.particles.spawn(this.physics.x, this.physics.y, 80, true);
                    this.stateMachine.setState(STATES.TRAVELLING, 3.0);
                    setTimeout(() => {
                        this.flyToNextTarget();
                    }, 1200);
                }
            });

            this.creatureEl.addEventListener('pointercancel', () => {
                this.isDragging = false;
                this.creatureEl.classList.remove('is-dragging');
            });

            // Double-click to toggle Sleep Mode
            this.creatureEl.addEventListener('dblclick', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.isSleeping) {
                    this.wakeUp();
                } else {
                    this.goToSleep();
                }
            });

            // Section change notification
            window.addEventListener('firefly:section-changed', () => {
                if (this.isSleeping) return;
                setTimeout(() => {
                    this.flyToNextTarget();
                }, 200);
            });

            // React to theme switch or AI button
            document.addEventListener('click', (e) => {
                const target = e.target;
                if (!target) return;

                if (target.closest('#themeToggle') || target.closest('#mobileThemeToggle')) {
                    this.react('theme');
                    return;
                }

                if (target.closest('#heliosAiBtn') || target.closest('#calcPayrollBtn')) {
                    this.react('action');
                }
            }, true);
        }

        goToSleep() {
            this.isSleeping = true;
            this.creatureEl.classList.add('is-sleeping');
            const parkX = Math.min(window.innerWidth - 65, window.innerWidth * 0.88);
            const parkY = 70;
            this.physics.setTarget(parkX, parkY);
            this.stateMachine.setState(STATES.RESTING, 999999);
        }

        wakeUp() {
            this.isSleeping = false;
            this.creatureEl.classList.remove('is-sleeping');
            this.react('click');
            this.flyToNextTarget();
        }

        flyToNextTarget() {
            if (this.isSleeping || this.isDragging) return;
            const next = this.exploration.getNextTarget(this.physics.x, this.physics.y);
            this.physics.setTarget(next.x, next.y);

            const dist = Math.hypot(next.x - this.physics.x, next.y - this.physics.y);
            const duration = Math.max(2.2, Math.min(4.8, dist / 110));
            this.stateMachine.setState(STATES.TRAVELLING, duration);
        }

        react(type) {
            if (this.isSleeping) return;

            this.stateMachine.setState(STATES.REACTING, 1.4);

            // Starlight burst
            for (let i = 0; i < 7; i++) {
                this.particles.spawn(this.physics.x, this.physics.y, 90, true);
            }

            // Playful boost
            this.physics.vx += (Math.random() - 0.5) * 120;
            this.physics.vy -= 80;

            // Pick next destination soon after
            setTimeout(() => {
                if (!this.isDragging && !this.isSleeping) {
                    this.flyToNextTarget();
                }
            }, 900);
        }

        onStateChanged(newState) {
            switch (newState) {
                case STATES.TRAVELLING:
                    this.physics.maxSpeed = 230;
                    break;
                case STATES.INSPECTING:
                    this.physics.maxSpeed = 55;
                    break;
                case STATES.RESTING:
                    this.physics.maxSpeed = 30;
                    break;
                case STATES.IDLE:
                default:
                    this.physics.maxSpeed = 90;
                    break;
            }
        }

        pause() {
            this.isRunning = false;
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }
        }

        resume() {
            if (!this.isRunning) {
                this.isRunning = true;
                this.lastTime = performance.now();
                this.rafId = requestAnimationFrame(this.loop);
            }
        }

        loop(now) {
            const dt = Math.min((now - this.lastTime) * 0.001, 0.064);
            this.lastTime = now;

            if (!this.isRunning) return;

            const speedScale = this.motionMgr.getSpeedScale();

            // 1. Mouse Awareness & Evasion (if cursor gets too close during normal flight)
            if (!this.isDragging && !this.isSleeping) {
                const mdx = this.mousePos.x - this.physics.x;
                const mdy = this.mousePos.y - this.physics.y;
                const mDist = Math.hypot(mdx, mdy);

                if (mDist < 70 && mDist > 0) {
                    this.mouseNear = true;
                    this.mouseCuriosity = (mdx / mDist);

                    // Dodge sideways gently
                    const push = (1 - (mDist / 70)) * 160;
                    this.physics.vx -= (mdx / mDist) * push * dt;
                    this.physics.vy -= (mdy / mDist) * push * dt;
                } else {
                    this.mouseNear = false;
                    this.mouseCuriosity *= 0.92;
                }
            }

            // 2. State & Physics Update
            if (!this.isDragging) {
                this.stateMachine.update(dt);
                this.physics.update(dt, speedScale);
            }

            // 3. Micro-hovering organic float layer
            const timeSec = now * 0.001;
            const floatScale = this.isSleeping ? 0.3 : 1.0;
            const floatX = (Math.sin(timeSec * 1.8) * 3.8 + Math.cos(timeSec * 2.5) * 1.8) * floatScale;
            const floatY = (Math.cos(timeSec * 2.2) * 4.6 + Math.sin(timeSec * 1.3) * 2.2) * floatScale;
            const floatRot = Math.sin(timeSec * 1.6) * 4.0 * floatScale;

            const renderX = this.physics.x + floatX;
            const renderY = this.physics.y + floatY;
            const renderRot = (this.physics.rotation * 180 / Math.PI) + floatRot;

            // 4. GPU-accelerated rendering
            this.creatureEl.style.transform = `translate3d(${renderX.toFixed(1)}px, ${renderY.toFixed(1)}px, 0) rotate(${renderRot.toFixed(1)}deg)`;

            // 5. Antenna physics
            this.antenna.update(
                dt,
                { x: this.physics.vx, y: this.physics.vy },
                { x: this.physics.ax, y: this.physics.ay },
                this.mouseCuriosity
            );

            // 6. Particle Trail
            const speed = Math.hypot(this.physics.vx, this.physics.vy);
            if (!this.isSleeping && (speed > 45 || this.stateMachine.state === STATES.REACTING)) {
                const tailAngle = this.physics.rotation + Math.PI;
                const tailDist = 24;
                const tailX = renderX + Math.sin(tailAngle) * tailDist;
                const tailY = renderY - Math.cos(tailAngle) * tailDist;

                if (Math.random() < 0.45) {
                    this.particles.spawn(tailX, tailY, speed);
                }
            }

            this.particles.updateAndRender(dt);

            this.rafId = requestAnimationFrame(this.loop);
        }

        destroy() {
            this.pause();
            document.removeEventListener('visibilitychange', this.onVisibilityChange);
            this.particles.destroy();
            if (this.layerEl) {
                this.layerEl.remove();
            }
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // 8. BOOTSTRAP WHEN READY
    // ══════════════════════════════════════════════════════════════════════════
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                window.__PAYROLL_NEXUS_FIREFLY__ = new FireflyController();
            });
        } else {
            window.__PAYROLL_NEXUS_FIREFLY__ = new FireflyController();
        }
    }

    init();
})();
