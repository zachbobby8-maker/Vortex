/**
 * FLUX WEAVE STUDIO
 * The Forge of the 5th Industrial Revolution
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const manifoldView = document.getElementById('manifold-view');
  const loomView = document.getElementById('loom-view');
  const enterStudioBtn = document.getElementById('enter-studio-btn');
  const canvasContainer = document.getElementById('canvas-container');
  const consoleOutput = document.getElementById('console-output');
  const weaveBtns = document.querySelectorAll('.weave-btn');
  const xpBar = document.getElementById('xp-bar');
  const levelDisplay = document.getElementById('level-display');
  const rankTitle = document.getElementById('rank-title');
  const resonanceVal = document.getElementById('resonance-val');
  const deployBtn = document.getElementById('deploy-btn');
  const resetViewBtn = document.getElementById('reset-view-btn');
  
  // New DOM Elements
  const deployAiBtn = document.getElementById('deploy-ai-btn');
  const openCodexBtn = document.getElementById('open-codex-btn');
  const closeCodexBtn = document.getElementById('close-codex-btn');
  const codexModal = document.getElementById('codex-modal');

  // App State
  const STATE = {
    view: 'manifold', // 'manifold' | 'loom'
    xp: 0,
    level: 1,
    resonance: 0,
    maxResonance: 100,
    activeThreads: [],
    mouseX: 0,
    mouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0,
    time: 0,
    aiDeployed: false
  };

  const RANKS = [
    { threshold: 0, title: 'Novice Weaver' },
    { threshold: 100, title: 'Lattice Apprentice' },
    { threshold: 300, title: 'Syntropic Maker' },
    { threshold: 600, title: 'Master Architect' },
    { threshold: 1000, title: 'Vortex Prime' }
  ];

  const WEAVE_TYPES = {
    'nodes': { color: 0xfb923c, name: 'Node Topology', desc: 'Civilian & logistical clusters injected via Navier-Stokes routing.' },
    'military': { color: 0xef4444, name: 'Military Advanced', desc: 'Orbital strike grid & defensive manifolds locked.' },
    'ecommerce': { color: 0x00f2fe, name: 'E-commerce Weave', desc: 'Decentralized storefront logic synced.' },
    'governance': { color: 0x4facfe, name: 'Governance Weave', desc: 'Consensus module integrated.' },
    'supply': { color: 0xf9d423, name: 'Supply Chain Braid', desc: 'CNT-Aerogel tracking layer established.' },
    'ai': { color: 0x4ade80, name: 'AI Neural Thread', desc: 'Autonomous logic injected into Lattice.' }
  };

  // -----------------------------------------------------------------
  // VIEW TRANSITION & MODALS
  // -----------------------------------------------------------------
  enterStudioBtn.addEventListener('click', () => {
    // Fade out manifold
    manifoldView.style.opacity = '0';
    manifoldView.style.pointerEvents = 'none';

    // Init 3D Scene
    initThreeJS();

    setTimeout(() => {
      manifoldView.classList.add('hidden');
      loomView.classList.remove('hidden');
      
      // Fade in Loom
      setTimeout(() => {
        loomView.style.opacity = '1';
        loomView.style.pointerEvents = 'auto';
        logToConsole('Vortex Engine Connection Established.', '#00f2fe');
        logToConsole('Awaiting syntropic configuration...');
      }, 100);
    }, 1000);
  });

  // Modal Logic
  openCodexBtn.addEventListener('click', () => {
    codexModal.classList.remove('hidden');
    // small delay to allow display:block to apply before animating opacity
    setTimeout(() => {
      codexModal.classList.remove('opacity-0', 'pointer-events-none');
      codexModal.querySelector('.glass-panel').classList.remove('scale-95');
      codexModal.querySelector('.glass-panel').classList.add('scale-100');
    }, 10);
  });

  closeCodexBtn.addEventListener('click', () => {
    codexModal.classList.add('opacity-0', 'pointer-events-none');
    codexModal.querySelector('.glass-panel').classList.remove('scale-100');
    codexModal.querySelector('.glass-panel').classList.add('scale-95');
    setTimeout(() => {
      codexModal.classList.add('hidden');
    }, 300);
  });

  // -----------------------------------------------------------------
  // THREE.JS SETUP: THE LOOM
  // -----------------------------------------------------------------
  let scene, camera, renderer, coreLattice, particleSystem;
  let aiAgentGroup; // Holds the AI visual object
  const particles = []; 
  const threads = [];   
  
  function initThreeJS() {
    // 1. Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050508);
    scene.fog = new THREE.FogExp2(0x050508, 0.002);

    // 2. Camera setup
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 0, 150);

    // 3. Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainer.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00f2fe, 2, 300);
    pointLight.position.set(0, 0, 50);
    scene.add(pointLight);

    // 5. Create Core Object (Möbius-Toroid)
    createCoreLattice();
    
    // 6. Create background particles
    createAmbientParticles();

    // 7. Event listeners for Interaction
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onMouseMove, false);

    // 8. Start Animation Loop
    animate();
  }

  function createCoreLattice() {
    const geometry = new THREE.TorusKnotGeometry(25, 6, 200, 32, 2, 3);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x050508,
      transparent: true,
      opacity: 0.8
    });
    
    const wireframeMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending
    });

    const mesh = new THREE.Mesh(geometry, material);
    const wireframe = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      wireframeMaterial
    );

    coreLattice = new THREE.Group();
    coreLattice.add(mesh);
    coreLattice.add(wireframe);
    scene.add(coreLattice);
  }

  function createAmbientParticles() {
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 2000;
    const posArray = new Float32Array(particleCount * 3);
    const scaleArray = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 600;
    }
    for (let i = 0; i < particleCount; i++) {
      scaleArray[i] = Math.random();
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particleGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1));

    const particleMaterial = new THREE.PointsMaterial({
      size: 1.5,
      color: 0x4facfe,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
  }

  // AI Agent Setup (Triggered via UI)
  function spawnAIAgent() {
    const geo = new THREE.OctahedronGeometry(4, 0);
    const mat = new THREE.MeshBasicMaterial({ 
      color: 0xa855f7, 
      wireframe: true,
      transparent: true,
      opacity: 0.8
    });
    const mesh = new THREE.Mesh(geo, mat);
    
    // Core glow
    const coreGeo = new THREE.OctahedronGeometry(2, 0);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mesh.add(coreMesh);

    aiAgentGroup = new THREE.Group();
    aiAgentGroup.add(mesh);
    
    // Add point light to the agent
    const agentLight = new THREE.PointLight(0xa855f7, 1.5, 100);
    aiAgentGroup.add(agentLight);

    scene.add(aiAgentGroup);
  }

  // UI Event for AI Agent
  deployAiBtn.addEventListener('click', () => {
    if (STATE.aiDeployed) {
      logToConsole('AI Agent is already deployed.', '#a855f7');
      return;
    }
    STATE.aiDeployed = true;
    
    logToConsole('Initializing AI Agent on the workspace...', '#a855f7');
    spawnAIAgent();
    
    addXP(50);
    updateResonance(10);
    logToConsole('> AI Agent active. Autonomous Navier-Stokes routing enabled.', '#a855f7');
    
    // UI Update
    deployAiBtn.classList.remove('border-[rgba(168,85,247,0.4)]');
    deployAiBtn.classList.add('border-purple-500', 'bg-purple-500/20');
    deployAiBtn.innerHTML = `
      <svg class="w-5 h-5 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
      <span class="text-white font-bold">Agent Active</span>
    `;
  });

  // Interaction
  function onMouseMove(event) {
    STATE.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    STATE.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    requestAnimationFrame(animate);
    
    STATE.time += 0.01;
    STATE.targetMouseX += (STATE.mouseX - STATE.targetMouseX) * 0.05;
    STATE.targetMouseY += (STATE.mouseY - STATE.targetMouseY) * 0.05;

    if (coreLattice) {
      coreLattice.rotation.y += 0.005;
      coreLattice.rotation.x += 0.002;
      coreLattice.rotation.z += 0.001;
      
      coreLattice.position.x = STATE.targetMouseX * 15;
      coreLattice.position.y = STATE.targetMouseY * 15;
    }

    if (particleSystem) {
      particleSystem.rotation.y -= 0.001;
      particleSystem.rotation.x -= 0.0005;
    }

    // Animate AI Agent Orbit
    if (aiAgentGroup && coreLattice) {
      const orbitSpeed = 1.5;
      const orbitRadiusX = 45;
      const orbitRadiusZ = 35;
      
      aiAgentGroup.position.x = coreLattice.position.x + Math.cos(STATE.time * orbitSpeed) * orbitRadiusX;
      aiAgentGroup.position.z = coreLattice.position.z + Math.sin(STATE.time * orbitSpeed) * orbitRadiusZ;
      aiAgentGroup.position.y = coreLattice.position.y + Math.sin(STATE.time * 2) * 15;
      
      aiAgentGroup.children[0].rotation.x += 0.02;
      aiAgentGroup.children[0].rotation.y += 0.03;
    }

    updateThreads();

    camera.position.x += (STATE.targetMouseX * 10 - camera.position.x) * 0.02;
    camera.position.y += (STATE.targetMouseY * 10 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  // -----------------------------------------------------------------
  // WEAVING LOGIC
  // -----------------------------------------------------------------
  weaveBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type');
      addThreadToLattice(type);
    });
  });

  resetViewBtn.addEventListener('click', () => {
    STATE.mouseX = 0;
    STATE.mouseY = 0;
    STATE.targetMouseX = 0;
    STATE.targetMouseY = 0;
    if (coreLattice) {
      anime({
        targets: coreLattice.rotation,
        x: 0,
        y: 0,
        z: 0,
        duration: 1500,
        easing: 'easeOutCubic'
      });
    }
  });

  function addThreadToLattice(type) {
    const threadData = WEAVE_TYPES[type];
    if (!threadData) return;

    // 1. UI Effects
    addXP(25);
    updateResonance(15);
    
    // Log specifics if AI is active
    if (STATE.aiDeployed) {
      logToConsole(`Agent computing Navier-Stokes tensor for [${threadData.name}]...`, '#a855f7');
      setTimeout(() => {
        logToConsole(`Weaving Thread: ${threadData.name}`, `#${threadData.color.toString(16)}`);
        logToConsole(`> ${threadData.desc}`);
      }, 400);
    } else {
      logToConsole(`Weaving Thread: ${threadData.name}...`, `#${threadData.color.toString(16)}`);
      logToConsole(`> ${threadData.desc}`);
    }

    const btn = document.querySelector(`[data-type="${type}"]`);
    anime({
      targets: btn,
      scale: [0.95, 1],
      opacity: [0.7, 1],
      duration: 300,
      easing: 'easeOutQuad'
    });

    createThreadCurve(threadData.color);
  }

  function createThreadCurve(hexColor) {
    const startVector = new THREE.Vector3(
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200 + 100
    );

    const endVector = new THREE.Vector3(
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 30
    );

    const midVector = new THREE.Vector3(
      (startVector.x + endVector.x) / 2 + (Math.random() - 0.5) * 100,
      (startVector.y + endVector.y) / 2 + (Math.random() - 0.5) * 100,
      (startVector.z + endVector.z) / 2 + (Math.random() - 0.5) * 100
    );

    const curve = new THREE.CatmullRomCurve3([startVector, midVector, endVector]);
    
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
      color: hexColor, 
      transparent: true, 
      opacity: 0.3,
      blending: THREE.AdditiveBlending 
    });
    const line = new THREE.Line(geometry, material);
    scene.add(line);

    const pulseGeo = new THREE.SphereGeometry(0.8, 8, 8);
    const pulseMat = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    });
    const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
    scene.add(pulseMesh);

    threads.push({
      curve: curve,
      pulse: pulseMesh,
      line: line,
      progress: 0,
      speed: 0.002 + Math.random() * 0.003
    });

    if (coreLattice) {
      const wireframe = coreLattice.children[1];
      const origColor = wireframe.material.color.clone();
      const newColor = new THREE.Color(hexColor);
      
      const colorObj = { r: origColor.r, g: origColor.g, b: origColor.b };
      anime({
        targets: colorObj,
        r: newColor.r,
        g: newColor.g,
        b: newColor.b,
        duration: 500,
        easing: 'easeOutQuad',
        update: function() {
          wireframe.material.color.setRGB(colorObj.r, colorObj.g, colorObj.b);
          wireframe.material.opacity = 0.8;
        },
        complete: function() {
          anime({
            targets: colorObj,
            r: origColor.r,
            g: origColor.g,
            b: origColor.b,
            duration: 1500,
            easing: 'easeInOutQuad',
            update: function() {
              wireframe.material.color.setRGB(colorObj.r, colorObj.g, colorObj.b);
              wireframe.material.opacity = 0.2;
            }
          });
        }
      });
    }
  }

  function updateThreads() {
    threads.forEach(t => {
      t.progress += t.speed;
      if (t.progress > 1) {
        t.progress = 0;
      }
      
      const pt = t.curve.getPointAt(t.progress);
      t.pulse.position.copy(pt);
      
      const scale = 1 + Math.sin(t.progress * Math.PI) * 1.5;
      t.pulse.scale.set(scale, scale, scale);
    });
  }

  // -----------------------------------------------------------------
  // UI & PROGRESSION LOGIC
  // -----------------------------------------------------------------
  function addXP(amount) {
    STATE.xp += amount;
    
    let newLevel = 1;
    let nextThreshold = RANKS[RANKS.length-1].threshold;
    let currentThreshold = 0;

    for (let i = 0; i < RANKS.length; i++) {
      if (STATE.xp >= RANKS[i].threshold) {
        newLevel = i + 1;
        currentThreshold = RANKS[i].threshold;
        if (i < RANKS.length - 1) {
          nextThreshold = RANKS[i+1].threshold;
        }
      }
    }

    if (newLevel > STATE.level) {
      STATE.level = newLevel;
      levelDisplay.textContent = `LVL ${STATE.level}`;
      rankTitle.textContent = RANKS[newLevel - 1].title;
      
      levelDisplay.classList.add('glitch-effect', 'text-sinter-gold');
      setTimeout(() => levelDisplay.classList.remove('glitch-effect', 'text-sinter-gold'), 1000);
      
      logToConsole(`>>> RANK UP: ${RANKS[newLevel - 1].title} <<<`, '#f9d423');
    }

    const range = nextThreshold - currentThreshold;
    const currentInLevel = STATE.xp - currentThreshold;
    let percentage = (currentInLevel / range) * 100;
    if (percentage > 100) percentage = 100;
    
    xpBar.style.width = `${percentage}%`;
  }

  function updateResonance(amount) {
    const prevRes = STATE.resonance;
    STATE.resonance += amount;
    
    if (STATE.resonance >= STATE.maxResonance) {
      STATE.resonance = STATE.maxResonance;
      
      if (deployBtn.disabled) {
        deployBtn.disabled = false;
        deployBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        deployBtn.classList.add('shadow-[0_0_15px_rgba(0,242,254,0.5)]');
        logToConsole(`>>> LATTICE HARMONY REACHED (100%). READY TO DEPLOY. <<<`, '#00f2fe');
      }
    }

    const obj = { val: prevRes };
    anime({
      targets: obj,
      val: STATE.resonance,
      round: 1,
      duration: 1000,
      easing: 'easeOutExpo',
      update: function() {
        resonanceVal.textContent = obj.val + '%';
        if(obj.val >= 100) {
          resonanceVal.classList.add('text-sinter-cyan');
        }
      }
    });
  }

  function logToConsole(msg, color = '#9ca3af') {
    const line = document.createElement('div');
    line.style.color = color;
    line.textContent = `> ${msg}`;
    consoleOutput.appendChild(line);
    
    consoleOutput.scrollTop = consoleOutput.scrollHeight;

    while (consoleOutput.childNodes.length > 25) {
      consoleOutput.removeChild(consoleOutput.firstChild);
    }
  }

  deployBtn.addEventListener('click', () => {
    logToConsole('Initiating Deployment Protocol...', '#f9d423');
    
    if (coreLattice) {
      anime({
        targets: coreLattice.scale,
        x: [1, 10],
        y: [1, 10],
        z: [1, 10],
        duration: 2000,
        easing: 'easeInExpo',
        complete: () => {
          logToConsole('COMPUTATIONAL FABRIC DEPLOYED TO LATTICE.', '#00f2fe');
          logToConsole('Syntropic reward issued to Architect wallet.');
          
          anime({
            targets: coreLattice.scale,
            x: [0.1, 1],
            y: [0.1, 1],
            z: [0.1, 1],
            duration: 1500,
            easing: 'easeOutElastic(1, .8)'
          });
          
          STATE.resonance = 0;
          resonanceVal.textContent = '0%';
          resonanceVal.classList.remove('text-sinter-cyan');
          deployBtn.disabled = true;
          deployBtn.classList.add('opacity-50', 'cursor-not-allowed');
          deployBtn.classList.remove('shadow-[0_0_15px_rgba(0,242,254,0.5)]');
          
          threads.forEach(t => {
            scene.remove(t.line);
            scene.remove(t.pulse);
          });
          threads.length = 0;
        }
      });
    }
  });

});
