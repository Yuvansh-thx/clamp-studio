/**
 * CLAMP STUDIO — CORE APPLICATION SCRIPT
 * Features:
 * 1. Physical Verlet/Spring Pendulum Keychain Simulation (Drag, Momentum, Natural Sway)
 * 2. Web Audio API Synthesized Tactile Sound Engine (Metallic & Acrylic Clinks)
 * 3. Dynamic "Clamp does [discipline]" Handwriting Typewriter System
 * 4. Folder-Tab Featured Works Showcase & Video/Asset Viewport Switcher
 * 5. Slide-out Project Spec Inspector Drawer
 * 6. 24-Item Archive Filter & Fullscreen Lightbox with Keyboard Navigation
 * 7. Live Studio Telemetry & Timezone Clock
 * 8. One-Click Clipboard Copy with Toast Feedback
 * 9. Custom Crosshair Magnet Cursor
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. SOUND ENGINE (Synthesized via Web Audio API)
  // =========================================================================
  class SoundEngine {
    constructor() {
      this.enabled = true;
      this.ctx = null;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      return this.enabled;
    }

    // Play subtle metallic/acrylic clink sound
    playClink(pitchMultiplier = 1.0, volume = 0.15) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      try {
        const t = this.ctx.currentTime;
        
        // High harmonic oscillator (metallic strike)
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(2200 * pitchMultiplier, t);
        osc1.frequency.exponentialRampToValueAtTime(1400 * pitchMultiplier, t + 0.05);

        gain1.gain.setValueAtTime(volume, t);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

        // Resonance overtone (glass/acrylic shimmer)
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(3800 * pitchMultiplier, t);
        gain2.gain.setValueAtTime(volume * 0.4, t);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        // Body knock (hollow plastic weight)
        const osc3 = this.ctx.createOscillator();
        const gain3 = this.ctx.createGain();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(450 * pitchMultiplier, t);
        gain3.gain.setValueAtTime(volume * 0.3, t);
        gain3.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

        osc1.connect(gain1);
        osc2.connect(gain2);
        osc3.connect(gain3);

        gain1.connect(this.ctx.destination);
        gain2.connect(this.ctx.destination);
        gain3.connect(this.ctx.destination);

        osc1.start(t);
        osc2.start(t);
        osc3.start(t);

        osc1.stop(t + 0.07);
        osc2.stop(t + 0.09);
        osc3.stop(t + 0.05);
      } catch (e) {
        // Audio error silent fallback
      }
    }

    // Play paper scratch / typewriter click
    playTick() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800 + Math.random() * 400, t);
        gain.gain.setValueAtTime(0.04, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.025);
      } catch (e) {}
    }
  }

  const sound = new SoundEngine();

  // Sound Toggle UI
  const soundBtn = document.getElementById('soundToggleBtn');
  const soundStatusText = document.getElementById('soundStatusText');
  const soundIconOn = soundBtn?.querySelector('.sound-on');
  const soundIconOff = soundBtn?.querySelector('.sound-off');

  soundBtn?.addEventListener('click', () => {
    sound.init();
    const isEnabled = sound.toggle();
    if (soundStatusText) soundStatusText.textContent = isEnabled ? 'AUDIO ON' : 'MUTED';
    soundIconOn?.classList.toggle('hidden', !isEnabled);
    soundIconOff?.classList.toggle('hidden', isEnabled);
    if (isEnabled) sound.playClink(1.2, 0.2);
  });

  // =========================================================================
  // 2. KEYCHAIN SPRING-PENDULUM PHYSICS SIMULATION
  // =========================================================================
  class KeychainPhysics {
    constructor() {
      this.stage = document.getElementById('keychainStage');
      this.assembly = document.getElementById('keychainAssembly');
      this.charmElements = Array.from(document.querySelectorAll('.charm-item'));
      this.badgeTitle = document.getElementById('badgeCharmName');
      
      // Configuration of the 6 charms (aligned to 50% 34.333% pivot)
      this.charms = [
        {
          id: 'motion',
          name: '01 / MOTION DESIGN',
          el: document.getElementById('charm-motion'),
          baseAngle: -24,
          angle: -24,
          velocity: 0,
          targetAngle: -24,
          damping: 0.92,
          stiffness: 0.045,
          mass: 1.1,
          isDragging: false,
          discipline: 'motion'
        },
        {
          id: 'branding',
          name: '02 / BRAND SYSTEMS',
          el: document.getElementById('charm-branding'),
          baseAngle: -9,
          angle: -9,
          velocity: 0,
          targetAngle: -9,
          damping: 0.90,
          stiffness: 0.040,
          mass: 1.3,
          isDragging: false,
          discipline: 'branding'
        },
        {
          id: 'editorial',
          name: '03 / EDITORIAL SPEC',
          el: document.getElementById('charm-editorial'),
          baseAngle: 6,
          angle: 6,
          velocity: 0,
          targetAngle: 6,
          damping: 0.91,
          stiffness: 0.038,
          mass: 1.2,
          isDragging: false,
          discipline: 'editorial'
        },
        {
          id: 'photoworks',
          name: '04 / PHOTOWORKS',
          el: document.getElementById('charm-photoworks'),
          baseAngle: 18,
          angle: 18,
          velocity: 0,
          targetAngle: 18,
          damping: 0.89,
          stiffness: 0.042,
          mass: 1.4,
          isDragging: false,
          discipline: 'photoworks'
        },
        {
          id: 'illustration',
          name: '05 / ILLUSTRATION',
          el: document.getElementById('charm-illustration'),
          baseAngle: 33,
          angle: 33,
          velocity: 0,
          targetAngle: 33,
          damping: 0.92,
          stiffness: 0.048,
          mass: 1.0,
          isDragging: false,
          discipline: 'illustration'
        },
        {
          id: '3dtech',
          name: '06 / 3D TECH WORKS',
          el: document.getElementById('charm-3dtech'),
          baseAngle: 45,
          angle: 45,
          velocity: 0,
          targetAngle: 45,
          damping: 0.93,
          stiffness: 0.035,
          mass: 1.5,
          isDragging: false,
          discipline: '3dtech'
        }
      ];

      this.activeCharmIndex = 0;
      this.activeDragCharm = null;
      this.lastMouseX = 0;
      this.mouseVelocityX = 0;
      this.assemblyTilt = 0;

      // Floating & 3D Levitation State
      this.cluster = document.getElementById('charmsCluster');
      this.isStageHovered = false;
      this.hoveredCharmIdx = -1;
      this.mouseNormX = 0;
      this.mouseNormY = 0;

      this.currentTiltX = 0;
      this.currentTiltY = 0;
      this.currentAssemblyTilt = 0;
      this.currentElevateY = 0;
      this.currentElevateZ = 0;

      this.initEvents();
      this.animate();
    }

    // Calculate ring hole center coordinates in page pixels
    getPivotPoint() {
      if (!this.assembly) return { x: window.innerWidth / 2, y: 300 };
      const rect = this.assembly.getBoundingClientRect();
      return {
        x: rect.left + rect.width * 0.5,
        y: rect.top + rect.height * 0.34333
      };
    }

    initEvents() {
      if (!this.stage) return;

      // Stage hover detection for buoyant floating
      this.stage.addEventListener('mouseenter', () => {
        this.isStageHovered = true;
        this.stage.classList.add('is-floating');
        sound.playClink(1.05, 0.12);
      });

      this.stage.addEventListener('mouseleave', () => {
        this.isStageHovered = false;
        this.hoveredCharmIdx = -1;
        this.stage.classList.remove('is-floating');
        this.cluster?.classList.remove('has-hover');
        this.mouseNormX = 0;
        this.mouseNormY = 0;
      });

      // Track cursor inside stage for 3D perspective tilt
      this.stage.addEventListener('mousemove', (e) => {
        const rect = this.stage.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        this.mouseNormX = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2)));
        this.mouseNormY = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2)));
      });

      // Mouse move across hero imparts subtle sway
      window.addEventListener('mousemove', (e) => {
        const deltaX = e.clientX - this.lastMouseX;
        this.mouseVelocityX = deltaX * 0.25;
        this.lastMouseX = e.clientX;

        // Apply impulse to idle charms
        this.charms.forEach((charm, i) => {
          if (!charm.isDragging) {
            charm.velocity += (this.mouseVelocityX / charm.mass) * 0.05 * (i % 2 === 0 ? 1 : -0.8);
          }
        });

        // Subtly tilt base assembly
        const normX = (e.clientX / window.innerWidth) * 2 - 1;
        this.assemblyTilt = normX * 4;
      });

      // Update hint for touch devices
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      const hintText = document.getElementById('heroHintText');
      if (hintText && isTouch) {
        hintText.textContent = 'DRAG OR TAP CHARMS TO SWING';
      }

      // Pointer down on charms for drag & drop
      this.charms.forEach((charm, idx) => {
        if (!charm.el) return;

        charm.el.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          sound.init();
          sound.playClink(0.9 + idx * 0.1, 0.22);
          
          this.activeDragCharm = charm;
          charm.isDragging = true;
          this.stage.classList.add('is-dragging');
          this.setActiveCharm(idx);

          // Pointer capture for smooth dragging across touch & mouse screens
          if (charm.el.setPointerCapture) {
            try {
              charm.el.setPointerCapture(e.pointerId);
            } catch (err) {}
          }

          // Elevate dragged charm
          charm.el.style.zIndex = '30';

          const onPointerMove = (moveEvt) => {
            if (!charm.isDragging) return;
            const pivot = this.getPivotPoint();
            const dx = moveEvt.clientX - pivot.x;
            const dy = moveEvt.clientY - pivot.y;
            
            // Angle in degrees from downward vertical
            let computedAngle = Math.atan2(dx, dy) * (180 / Math.PI);
            // Constrain between -75° and +75°
            computedAngle = Math.max(-75, Math.min(75, computedAngle));

            const dAngle = computedAngle - charm.angle;
            charm.velocity = dAngle * 0.6;
            charm.angle = computedAngle;
            charm.targetAngle = computedAngle;
          };

          const onPointerUp = (upEvt) => {
            if (!charm.isDragging) return;
            charm.isDragging = false;
            this.activeDragCharm = null;
            this.stage.classList.remove('is-dragging');

            if (charm.el.releasePointerCapture && upEvt?.pointerId !== undefined) {
              try {
                charm.el.releasePointerCapture(upEvt.pointerId);
              } catch (err) {}
            }
            
            // Restore default resting target with spring rebound
            charm.targetAngle = charm.baseAngle * (this.isStageHovered ? 1.35 : 1.0);
            sound.playClink(1.3, 0.15);

            // Reset z-index after settling
            setTimeout(() => {
              if (charm.el && this.activeCharmIndex !== idx) {
                charm.el.style.zIndex = '';
              }
            }, 300);

            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointercancel', onPointerUp);
          };

          window.addEventListener('pointermove', onPointerMove);
          window.addEventListener('pointerup', onPointerUp);
          window.addEventListener('pointercancel', onPointerUp);
        });

        // Click / selection & touch tap impulse
        charm.el.addEventListener('click', () => {
          if (!charm.isDragging) {
            charm.velocity += (Math.random() > 0.5 ? 8 : -8);
          }
          this.selectDiscipline(charm.discipline, idx);
        });

        // Charm hover & depth focus
        charm.el.addEventListener('mouseenter', () => {
          this.hoveredCharmIdx = idx;
          this.cluster?.classList.add('has-hover');

          if (!charm.isDragging) {
            charm.velocity += (Math.random() > 0.5 ? 4 : -4);
            sound.playClink(1.15 + idx * 0.08, 0.14);
          }
        });

        charm.el.addEventListener('mouseleave', () => {
          if (this.hoveredCharmIdx === idx) {
            this.hoveredCharmIdx = -1;
          }
          if (this.hoveredCharmIdx === -1) {
            this.cluster?.classList.remove('has-hover');
          }
        });
      });
    }

    setActiveCharm(index) {
      this.activeCharmIndex = index;
      const charm = this.charms[index];
      if (!charm) return;

      this.charms.forEach((c, i) => {
        c.el?.classList.toggle('active-charm', i === index);
        if (i !== index && !c.isDragging) {
          c.el.style.zIndex = '';
        }
      });

      if (charm.el) {
        charm.el.style.zIndex = '25';
      }
    }

    selectDiscipline(discipline, index) {
      this.setActiveCharm(index);
      sound.playClink(1.0 + index * 0.12, 0.2);

      // Trigger Handwriting in Dossier
      if (window.clampDossier) {
        window.clampDossier.setDiscipline(discipline);
      }
    }

    animate() {
      const t = performance.now();

      // 1. Organic buoyant floating waves
      const idleBob = Math.sin(t * 0.0016) * 4;
      const hoverBob = this.isStageHovered ? Math.sin(t * 0.003) * 11 : 0;
      const driftX = Math.cos(t * 0.002) * (this.isStageHovered ? 6 : 2);

      // Target elevation and 3D perspective tilt
      const targetElevateY = this.isStageHovered ? -26 : 0;
      const targetElevateZ = this.isStageHovered ? 36 : 0;
      const targetTiltX = this.isStageHovered ? -this.mouseNormY * 13 : 0;
      const targetTiltY = this.isStageHovered ? this.mouseNormX * 16 : 0;
      const targetAssemblyTilt = this.assemblyTilt + (this.isStageHovered ? this.mouseNormX * 3.5 : 0);

      // Smooth lerp for assembly floating
      this.currentElevateY += (targetElevateY - this.currentElevateY) * 0.08;
      this.currentElevateZ += (targetElevateZ - this.currentElevateZ) * 0.08;
      this.currentTiltX += (targetTiltX - this.currentTiltX) * 0.09;
      this.currentTiltY += (targetTiltY - this.currentTiltY) * 0.09;
      this.currentAssemblyTilt += (targetAssemblyTilt - this.currentAssemblyTilt) * 0.08;

      const finalY = this.currentElevateY + idleBob + hoverBob;
      const finalX = driftX;

      if (this.assembly) {
        this.assembly.style.transform = `translate3d(${finalX.toFixed(2)}px, ${finalY.toFixed(2)}px, ${this.currentElevateZ.toFixed(2)}px) rotateX(${this.currentTiltX.toFixed(2)}deg) rotateY(${this.currentTiltY.toFixed(2)}deg) rotateZ(${this.currentAssemblyTilt.toFixed(2)}deg)`;
      }

      // 2. Physics & 3D depth for each charm
      const spreadMultiplier = this.isStageHovered ? 1.35 : 1.0;

      this.charms.forEach((charm, idx) => {
        if (!charm.isDragging) {
          // Dynamic fan-out spread on hover
          const currentResting = charm.baseAngle * spreadMultiplier;
          charm.targetAngle = currentResting;

          const displacement = charm.angle - charm.targetAngle;
          const springForce = -charm.stiffness * displacement;

          charm.velocity += springForce / charm.mass;
          charm.velocity *= charm.damping;
          charm.angle += charm.velocity;
        }

        // Individual charm 3D levitation & depth
        const isHovered = (this.hoveredCharmIdx === idx);
        const targetCharmZ = isHovered ? 52 : (this.hoveredCharmIdx !== -1 ? -14 : 0);
        const targetCharmY = isHovered ? -16 + Math.sin(t * 0.004 + idx) * 5 : 0;
        const targetCharmScale = isHovered ? 1.09 : (this.hoveredCharmIdx !== -1 ? 0.96 : 1.0);
        const targetCharmTiltX = isHovered ? -this.mouseNormY * 16 : 0;
        const targetCharmTiltY = isHovered ? this.mouseNormX * 16 : 0;

        charm.currentZ = (charm.currentZ || 0) + (targetCharmZ - (charm.currentZ || 0)) * 0.12;
        charm.currentY = (charm.currentY || 0) + (targetCharmY - (charm.currentY || 0)) * 0.12;
        charm.currentScale = (charm.currentScale || 1) + (targetCharmScale - (charm.currentScale || 1)) * 0.12;
        charm.currentTiltX = (charm.currentTiltX || 0) + (targetCharmTiltX - (charm.currentTiltX || 0)) * 0.12;
        charm.currentTiltY = (charm.currentTiltY || 0) + (targetCharmTiltY - (charm.currentTiltY || 0)) * 0.12;

        if (charm.el) {
          charm.el.style.transform = `rotateZ(${charm.angle.toFixed(2)}deg) translate3d(0px, ${charm.currentY.toFixed(2)}px, ${charm.currentZ.toFixed(2)}px) rotateX(${charm.currentTiltX.toFixed(2)}deg) rotateY(${charm.currentTiltY.toFixed(2)}deg) scale(${charm.currentScale.toFixed(3)})`;
        }
      });

      requestAnimationFrame(() => this.animate());
    }
  }

  // =========================================================================
  // 3. THE CLAMP DOSSIER DYNAMIC HANDWRITING & SPEC MANAGER
  // =========================================================================
  class ClampDossier {
    constructor() {
      this.handwrittenEl = document.getElementById('handwrittenDiscipline');
      this.pinnedImg = document.getElementById('pinnedCharmImg');
      this.pills = Array.from(document.querySelectorAll('.d-pill'));
      
      this.disciplineData = {
        motion: {
          label: 'motion design',
          charm: 'assets/charm-motion-01.png',
          spec: 'SPEC NO. 01 / YELLOW ACRYLIC',
          workIndex: 1
        },
        branding: {
          label: 'brand identities',
          charm: 'assets/charm-branding-02.png',
          spec: 'SPEC NO. 02 / RETRO HOTEL TAG',
          workIndex: 2
        },
        editorial: {
          label: 'editorial design',
          charm: 'assets/charm-editorial-03.png',
          spec: 'SPEC NO. 03 / GRID ACRYLIC',
          workIndex: 3
        },
        photoworks: {
          label: 'photoworks & renders',
          charm: 'assets/charm-photoworks-04.png',
          spec: 'SPEC NO. 04 / EMBOSSED WHITE',
          workIndex: 0
        },
        illustration: {
          label: 'playful illustration',
          charm: 'assets/charm-illustration-05.png',
          spec: 'SPEC NO. 05 / TIGER MASCOT',
          workIndex: 1
        },
        '3dtech': {
          label: '3D tech & worlds',
          charm: 'assets/charm-3dtech-06.png',
          spec: 'SPEC NO. 06 / CIRCUIT PRISM',
          workIndex: 0
        }
      };

      this.currentDiscipline = 'editorial';
      this.isTyping = false;

      this.initEvents();
    }

    initEvents() {
      this.pills.forEach((pill) => {
        pill.addEventListener('click', () => {
          const disc = pill.dataset.discipline;
          if (disc) {
            sound.playTick();
            this.setDiscipline(disc);
          }
        });
      });
    }

    setDiscipline(discipline) {
      if (!this.disciplineData[discipline] || this.isTyping) return;
      this.currentDiscipline = discipline;
      const data = this.disciplineData[discipline];

      // Update pills
      this.pills.forEach(p => {
        p.classList.toggle('active', p.dataset.discipline === discipline);
        p.setAttribute('aria-selected', p.dataset.discipline === discipline ? 'true' : 'false');
      });

      // Update pinned charm image on yellow mat
      if (this.pinnedImg && data.charm) {
        this.pinnedImg.style.opacity = '0';
        this.pinnedImg.style.transform = 'rotate(-14deg) scale(0.95)';
        setTimeout(() => {
          this.pinnedImg.src = data.charm;
          this.pinnedImg.style.opacity = '1';
          this.pinnedImg.style.transform = 'rotate(-8deg) scale(1)';
        }, 180);
      }

      // Animate handwriting text typewriter
      this.typeHandwriting(data.label);
    }

    typeHandwriting(targetText) {
      if (!this.handwrittenEl) return;
      this.isTyping = true;
      const current = this.handwrittenEl.textContent || '';
      
      // Fast backspace
      let backspaceIdx = current.length;
      const backspaceInterval = setInterval(() => {
        if (backspaceIdx > 0) {
          this.handwrittenEl.textContent = current.slice(0, backspaceIdx - 1);
          backspaceIdx--;
        } else {
          clearInterval(backspaceInterval);
          // Type new letters
          let typeIdx = 0;
          const typeInterval = setInterval(() => {
            if (typeIdx <= targetText.length) {
              this.handwrittenEl.textContent = targetText.slice(0, typeIdx);
              typeIdx++;
              sound.playTick();
            } else {
              clearInterval(typeInterval);
              this.isTyping = false;
            }
          }, 45);
        }
      }, 25);
    }
  }

  // =========================================================================
  // 4. FEATURED WORKS (FOLDER TABS & VIEWPORT CONTROLLER)
  // =========================================================================
  class FeaturedWorks {
    constructor() {
      this.tabs = Array.from(document.querySelectorAll('.folder-tab'));
      this.panels = Array.from(document.querySelectorAll('.work-panel'));
      this.viewPills = Array.from(document.querySelectorAll('.view-mode-pill'));
      this.matrixCards = Array.from(document.querySelectorAll('.matrix-card'));
      this.inspectButtons = Array.from(document.querySelectorAll('.btn-inspect-spec'));

      this.currentWorkIndex = 0;

      this.initEvents();
    }

    initEvents() {
      // Tab switching
      this.tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          const idx = parseInt(tab.dataset.work, 10);
          this.switchTab(idx);
          sound.playTick();
        });
      });

      // View mode buttons inside each panel
      this.viewPills.forEach((pill) => {
        pill.addEventListener('click', () => {
          const panelIdx = parseInt(pill.dataset.panel, 10);
          const mode = pill.dataset.mode;
          this.switchViewMode(panelIdx, mode);
          sound.playTick();
        });
      });

      // Matrix asset cards click to swap in viewport
      this.matrixCards.forEach((card) => {
        card.addEventListener('click', () => {
          const panelIdx = parseInt(card.dataset.panel, 10);
          const imgUrl = card.dataset.img;
          const videoUrl = card.dataset.video;
          const mode = card.dataset.mode;

          // Highlight matrix card
          const siblings = card.parentElement.querySelectorAll('.matrix-card');
          siblings.forEach(c => c.classList.remove('active'));
          card.classList.add('active');

          const viewImg = document.getElementById(`viewImg${panelIdx}`);
          const viewVideo = document.getElementById(`viewVideo${panelIdx}`);

          if (mode === 'video' && videoUrl && viewVideo) {
            viewImg?.classList.add('hidden');
            viewVideo.classList.remove('hidden');
            viewVideo.src = videoUrl;
            viewVideo.play().catch(() => {});
          } else if (imgUrl && viewImg) {
            viewVideo?.classList.add('hidden');
            if (viewVideo) viewVideo.pause();
            viewImg.classList.remove('hidden');
            viewImg.src = imgUrl;
          }

          sound.playClink(1.4, 0.12);
        });
      });

      // Inspect spec buttons
      this.inspectButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const workIdx = parseInt(btn.dataset.workIndex, 10);
          if (window.clampDrawer) {
            window.clampDrawer.open(workIdx);
          }
          sound.playClink(1.2, 0.15);
        });
      });
    }

    switchTab(index) {
      this.currentWorkIndex = index;

      this.tabs.forEach((t, i) => {
        t.classList.toggle('active', i === index);
        t.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });

      this.panels.forEach((p, i) => {
        p.classList.toggle('active', i === index);
        // Pause videos in hidden panels
        const vid = p.querySelector('video');
        if (vid && i !== index) vid.pause();
      });
    }

    switchViewMode(panelIdx, mode) {
      const viewImg = document.getElementById(`viewImg${panelIdx}`);
      const viewVideo = document.getElementById(`viewVideo${panelIdx}`);
      const panel = document.getElementById(`workPanel${panelIdx}`);
      
      const pills = panel?.querySelectorAll('.view-mode-pill');
      pills?.forEach(p => p.classList.toggle('active', p.dataset.mode === mode));

      if (mode === 'video' && viewVideo) {
        viewImg?.classList.add('hidden');
        viewVideo.classList.remove('hidden');
        viewVideo.play().catch(() => {});
      } else {
        viewVideo?.classList.add('hidden');
        if (viewVideo) viewVideo.pause();
        viewImg?.classList.remove('hidden');

        // Swap image source if alternate
        if (mode === 'sub') {
          const subCard = panel?.querySelector('.matrix-card:nth-child(2)');
          if (subCard && subCard.dataset.img && viewImg) {
            viewImg.src = subCard.dataset.img;
          }
        } else {
          const heroCard = panel?.querySelector('.matrix-card:nth-child(1)');
          if (heroCard && heroCard.dataset.img && viewImg) {
            viewImg.src = heroCard.dataset.img;
          }
        }
      }
    }
  }

  // =========================================================================
  // 5. PROJECT SPEC INSPECTOR DRAWER
  // =========================================================================
  class SpecDrawer {
    constructor() {
      this.drawer = document.getElementById('specDrawer');
      this.closeBtn = document.getElementById('drawerCloseBtn');
      this.titleEl = document.getElementById('drawerProjectTitle');
      this.summaryEl = document.getElementById('drawerSummary');
      this.tableEl = document.getElementById('drawerPipelineTable');
      this.swatchesEl = document.getElementById('drawerSwatches');
      this.deliverablesEl = document.getElementById('drawerDeliverables');

      this.projects = [
        {
          title: '01 / Into the Abyss: Deep Sea Submersible',
          summary: 'A cinematic underwater character and hard-surface vehicle sequence featuring retro brass diving hardware and high-pressure specimen collection apparatus.',
          pipeline: [
            ['3D Modeling', 'Blender 4.2 Subdivision Hard-Surface (840k Polys)'],
            ['Procedural Texturing', 'Substance 3D Painter + Custom Oxidation Maps'],
            ['Volumetric Lighting', 'Cycles GPU Raytracing (Path Guiding Active)'],
            ['Compositing', 'DaVinci Resolve / ACEScg Color Management'],
            ['Render Budget', '4K UHD @ 24fps (120s Cinematic Loop)']
          ],
          swatches: ['#091b1f', '#0f3c3a', '#c2a138', '#54e2b6', '#03080a'],
          deliverables: [
            'Master 4K Cinematic Sequence (Apple ProRes 4444 XQ)',
            'Turn-key Interactive GLTF Model Package',
            'Subdivision High-Poly Asset Library',
            'Production Key Art & Promo Posters'
          ]
        },
        {
          title: '02 / Autumn Things: Painterly 3D Motion',
          summary: 'A seasonal culinary visual narrative fusing stylized impasto oil paint brushstroke normals with physically accurate subsurface scattering.',
          pipeline: [
            ['Modeling', 'Cinema 4D Procedural Splines & Deformers'],
            ['Shader Dev', 'Octane Render Custom Displaced OSL Shaders'],
            ['Motion Design', 'Spring-based kinetic loops in After Effects'],
            ['Texture Maps', '8K Hand-painted diffuse and specular roughness']
          ],
          swatches: ['#ffb703', '#fb8500', '#d62828', '#8338ec', '#2b1e16'],
          deliverables: [
            '4 Animated Seamless Motion Loops (Instagram 9:16 & 1:1)',
            'Set of 6 Archival Giclée Print Editions',
            'Comprehensive Shader Material Pack'
          ]
        },
        {
          title: '03 / Brand System 02: Tactile Motel Keytag',
          summary: 'A tactile-first identity system centered on stamped motel keychains, die-cut stationery, and responsive digital identity tokens.',
          pipeline: [
            ['Identity System', 'Variable Grotesk & Monospace Typography'],
            ['3D Merch Renders', 'SolidWorks CAD export to Blender Cycles'],
            ['Print Spec', 'Spot UV, Hot Foil Stamping on 700gsm Cotton Stock']
          ],
          swatches: ['#ffffff', '#000000', '#f2de27', '#e2e2e2'],
          deliverables: [
            'Physical Keychain Production Master Files (CAD/STL)',
            'Brand Style Guide & Token Architecture',
            'Full Packaging Die-Lines'
          ]
        },
        {
          title: '04 / Flavors of Indonesia: Editorial Manifesto',
          summary: 'A 196-page culinary hardcover catalog documenting authentic Indonesian regional recipes with technical ingredients matrices.',
          pipeline: [
            ['Grid Architecture', 'Modular 12-Column Swiss Editorial System'],
            ['Binding Spec', 'Swiss-bound hardcover with fluorescent spine thread'],
            ['Color Separation', 'CMYK + 2 Pantone Neon Inks (Fluo Yellow & Orange)']
          ],
          swatches: ['#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557'],
          deliverables: [
            '196-Page Print-Ready PDF Files (Press Q4)',
            'Interactive Digital Edition & Web Reader',
            'Recipe Spec Cards & Promotional Kit'
          ]
        }
      ];

      this.initEvents();
    }

    initEvents() {
      this.closeBtn?.addEventListener('click', () => this.close());

      // Close on ESC
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.drawer?.classList.contains('open')) {
          this.close();
        }
      });
    }

    open(projectIndex = 0) {
      const data = this.projects[projectIndex] || this.projects[0];
      if (!this.drawer) return;

      if (this.titleEl) this.titleEl.textContent = data.title;
      if (this.summaryEl) this.summaryEl.textContent = data.summary;

      // Build table
      if (this.tableEl) {
        this.tableEl.innerHTML = data.pipeline.map(([lbl, val]) => `
          <div class="spec-table-row">
            <span class="st-label">${lbl}</span>
            <span class="st-val">${val}</span>
          </div>
        `).join('');
      }

      // Build swatches
      if (this.swatchesEl) {
        this.swatchesEl.innerHTML = data.swatches.map(color => `
          <div class="swatch-item" style="background-color: ${color};" title="${color}"></div>
        `).join('');
      }

      // Build deliverables
      if (this.deliverablesEl) {
        this.deliverablesEl.innerHTML = data.deliverables.map(item => `
          <li>${item}</li>
        `).join('');
      }

      this.drawer.classList.add('open');
      this.drawer.setAttribute('aria-hidden', 'false');
    }

    close() {
      this.drawer?.classList.remove('open');
      this.drawer?.setAttribute('aria-hidden', 'true');
    }
  }

  // =========================================================================
  // 6. ARCHIVE FILTER & LIGHTBOX MODAL
  // =========================================================================
  class ArchiveSystem {
    constructor() {
      this.filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
      this.cards = Array.from(document.querySelectorAll('.archive-card'));
      this.dialog = document.getElementById('archiveLightbox');
      this.backdrop = document.getElementById('lightboxBackdrop');
      this.closeBtn = document.getElementById('lightboxCloseBtn');
      this.imgEl = document.getElementById('lightboxImg');
      this.numEl = document.getElementById('lightboxNumber');
      this.catEl = document.getElementById('lightboxCategory');
      this.titleEl = document.getElementById('lightboxTitle');
      this.descEl = document.getElementById('lightboxDesc');
      this.yearEl = document.getElementById('lightboxYear');
      this.prevBtn = document.getElementById('lbPrevBtn');
      this.nextBtn = document.getElementById('lbNextBtn');

      this.currentCardIndex = 0;
      this.visibleCards = [...this.cards];

      this.initEvents();
    }

    initEvents() {
      // Filter buttons
      this.filterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          this.filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const filter = btn.dataset.filter;
          this.applyFilter(filter);
          sound.playTick();
        });
      });

      // Card clicks open lightbox
      this.cards.forEach((card, idx) => {
        card.addEventListener('click', () => {
          this.openLightbox(card, idx);
        });
      });

      // Lightbox close
      this.closeBtn?.addEventListener('click', () => this.closeLightbox());
      this.backdrop?.addEventListener('click', () => this.closeLightbox());

      // Prev & Next navigation
      this.prevBtn?.addEventListener('click', () => this.navigateLightbox(-1));
      this.nextBtn?.addEventListener('click', () => this.navigateLightbox(1));

      // Keyboard navigation
      window.addEventListener('keydown', (e) => {
        if (!this.dialog || !this.dialog.open) return;
        if (e.key === 'Escape') this.closeLightbox();
        if (e.key === 'ArrowLeft') this.navigateLightbox(-1);
        if (e.key === 'ArrowRight') this.navigateLightbox(1);
      });
    }

    applyFilter(category) {
      this.cards.forEach((card) => {
        const cat = card.dataset.category;
        const match = category === 'all' || cat === category;
        card.style.display = match ? 'block' : 'none';
      });

      this.visibleCards = this.cards.filter(c => c.style.display !== 'none');
    }

    openLightbox(card, globalIdx) {
      if (!this.dialog) return;
      this.currentCardIndex = this.visibleCards.indexOf(card);
      if (this.currentCardIndex === -1) this.currentCardIndex = 0;

      this.updateLightboxContent();
      this.dialog.showModal();
      sound.playClink(1.3, 0.18);
    }

    updateLightboxContent() {
      const card = this.visibleCards[this.currentCardIndex];
      if (!card) return;

      const img = card.querySelector('img');
      const num = card.dataset.index || '01';
      const cat = card.dataset.category || '3D TECH';
      const title = card.dataset.title || 'Archive Item';
      const desc = card.dataset.desc || 'Exploratory visual study.';
      const year = card.dataset.year || '2025';

      if (this.imgEl && img) this.imgEl.src = img.src;
      if (this.numEl) this.numEl.textContent = `#${num.padStart(2, '0')}`;
      if (this.catEl) this.catEl.textContent = cat.toUpperCase();
      if (this.titleEl) this.titleEl.textContent = title;
      if (this.descEl) this.descEl.textContent = desc;
      if (this.yearEl) this.yearEl.textContent = year;
    }

    navigateLightbox(direction) {
      if (!this.visibleCards.length) return;
      this.currentCardIndex = (this.currentCardIndex + direction + this.visibleCards.length) % this.visibleCards.length;
      this.updateLightboxContent();
      sound.playTick();
    }

    closeLightbox() {
      this.dialog?.close();
    }
  }

  // =========================================================================
  // 7. TELEMETRY, TIME CLOCK & CLIPBOARD UTILITIES
  // =========================================================================
  function initTelemetry() {
    const clockEl = document.getElementById('liveTimeClock');
    function updateClock() {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      if (clockEl) {
        clockEl.textContent = `${hours}:${minutes}:${seconds} UTC`;
      }
    }
    updateClock();
    setInterval(updateClock, 1000);

    // One-click copy email button
    const copyBtn = document.getElementById('copyEmailBtn');
    const toast = document.getElementById('toastNotification');
    const copyText = document.getElementById('copyBtnText');

    copyBtn?.addEventListener('click', async () => {
      sound.init();
      sound.playClink(1.5, 0.25);
      const email = 'hello@clamp.studio';
      try {
        await navigator.clipboard.writeText(email);
        if (copyText) copyText.textContent = 'COPIED!';
        if (toast) {
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 2800);
        }
        setTimeout(() => {
          if (copyText) copyText.textContent = 'COPY EMAIL';
        }, 3000);
      } catch (err) {
        // Fallback prompt
        window.prompt('Copy email:', email);
      }
    });

    // Back to top button
    const backToTop = document.getElementById('backToTopBtn');
    backToTop?.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // =========================================================================
  // 8. CUSTOM MAGNET CROSSHAIR CURSOR
  // =========================================================================
  function initCustomCursor() {
    const cursor = document.getElementById('customCursor');
    if (!cursor) return;

    let mouseX = -100;
    let mouseY = -100;
    let cursorX = -100;
    let cursorY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Render loop with smooth lerp
    function renderCursor() {
      cursorX += (mouseX - cursorX) * 0.28;
      cursorY += (mouseY - cursorY) * 0.28;
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    }
    renderCursor();

    // Hover state over interactive elements
    const interactiveTargets = document.querySelectorAll('a, button, .charm-item, .matrix-card, .archive-card, .d-pill');
    interactiveTargets.forEach(target => {
      target.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      target.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // =========================================================================
  // 9. NOISE OVERLAY GENERATOR
  // =========================================================================
  function initNoise() {
    const canvas = document.getElementById('noiseCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 200;
    const h = 200;
    canvas.width = w;
    canvas.height = h;

    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 30; // low opacity noise
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // =========================================================================
  // 10. MOBILE & TABLET NAVIGATION DRAWER & SCROLLSPY
  // =========================================================================
  class MobileNavigation {
    constructor() {
      this.toggleBtn = document.getElementById('mobileMenuToggle');
      this.drawer = document.getElementById('mobileNavDrawer');
      this.backdrop = document.getElementById('mobileNavBackdrop');
      this.closeBtn = document.getElementById('mobileNavCloseBtn');
      this.mobileLinks = Array.from(document.querySelectorAll('.mobile-nav-link, #mobileNavContactCta, #mobileMenuContactBtn'));
      this.desktopLinks = Array.from(document.querySelectorAll('.nav-link'));
      this.isOpen = false;

      this.initEvents();
      this.initScrollSpy();
      this.initHeaderScroll();
    }

    initEvents() {
      this.toggleBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });

      this.closeBtn?.addEventListener('click', () => this.close());
      this.backdrop?.addEventListener('click', () => this.close());

      this.mobileLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (href && href.startsWith('#')) {
            const target = document.querySelector(href);
            if (target) {
              e.preventDefault();
              this.close();
              setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth' });
              }, 250);
            }
          } else {
            this.close();
          }
        });
      });

      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth > 992 && this.isOpen) {
          this.close();
        }
      });
    }

    open() {
      if (this.isOpen) return;
      this.isOpen = true;
      this.drawer?.classList.add('open');
      this.drawer?.setAttribute('aria-hidden', 'false');
      this.toggleBtn?.classList.add('active');
      this.toggleBtn?.setAttribute('aria-expanded', 'true');
      this.toggleBtn?.setAttribute('aria-label', 'Close navigation menu');
      document.body.style.overflow = 'hidden';
      sound.playClink(1.3, 0.18);
    }

    close() {
      if (!this.isOpen) return;
      this.isOpen = false;
      this.drawer?.classList.remove('open');
      this.drawer?.setAttribute('aria-hidden', 'true');
      this.toggleBtn?.classList.remove('active');
      this.toggleBtn?.setAttribute('aria-expanded', 'false');
      this.toggleBtn?.setAttribute('aria-label', 'Open navigation menu');
      document.body.style.overflow = '';
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    initScrollSpy() {
      const sections = ['hero', 'dossier', 'featured', 'archive', 'studio', 'contact'];
      const sectionElements = sections.map(id => document.getElementById(id)).filter(Boolean);

      const updateActiveNav = () => {
        const scrollPos = window.scrollY + 200;
        let currentSectionId = 'hero';

        for (const sec of sectionElements) {
          const top = sec.offsetTop;
          const height = sec.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            currentSectionId = sec.id;
            break;
          }
        }

        // Update desktop links
        this.desktopLinks.forEach((link) => {
          link.classList.toggle('active', link.dataset.section === currentSectionId);
        });

        // Update mobile links
        document.querySelectorAll('.mobile-nav-link').forEach((link) => {
          link.classList.toggle('active', link.dataset.section === currentSectionId);
        });
      };

      window.addEventListener('scroll', updateActiveNav, { passive: true });
      updateActiveNav();
    }

    initHeaderScroll() {
      const header = document.getElementById('siteHeader');
      if (!header) return;

      const handleScroll = () => {
        header.classList.toggle('scrolled', window.scrollY > 30);
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }
  }

  // =========================================================================
  // 11. INITIALIZATION
  // =========================================================================
  window.addEventListener('DOMContentLoaded', () => {
    initNoise();
    initTelemetry();
    initCustomCursor();

    // Instantiate core modules
    window.clampPhysics = new KeychainPhysics();
    window.clampDossier = new ClampDossier();
    window.clampWorks = new FeaturedWorks();
    window.clampDrawer = new SpecDrawer();
    window.clampArchive = new ArchiveSystem();
    window.clampNav = new MobileNavigation();

    console.log('%c[CLAMP STUDIO] Systems Initialized.', 'color: #f2de27; font-weight: bold; font-family: monospace;');
  });

})();
