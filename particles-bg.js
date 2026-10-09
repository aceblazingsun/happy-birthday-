// =========================================================================
// React Bits <Particles /> Component — Vanilla & WebGL Integration
// Colors: Burnt Orange (#c85a28, #e06d3b) & Ivory (#faf5ee, #f2e9dc)
// =========================================================================

const container = document.getElementById('particles-bg');

if (container) {
  const particleColors = ['#c85a28', '#e06d3b', '#faf5ee', '#f2e9dc'];
  const particleCount = 200;
  const particleSpread = 10;
  const speed = 0.08;
  const particleBaseSize = 90;
  const sizeRandomness = 1;
  const cameraDistance = 20;
  const disableRotation = false;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const moveParticlesOnHover = true;
  const particleHoverFactor = 0.8;
  const alphaParticles = true;

  const hexToRgb = hex => {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const int = parseInt(hex.slice(0, 6), 16);
    return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
  };

  // Try loading WebGL OGL engine (from React Bits)
  (async function initParticles() {
    try {
      const { Renderer, Camera, Geometry, Program, Mesh } = await import('https://esm.sh/ogl');

      const renderer = new Renderer({
        dpr: pixelRatio,
        depth: false,
        alpha: true
      });
      const gl = renderer.gl;
      container.appendChild(gl.canvas);
      gl.clearColor(0, 0, 0, 0);

      const camera = new Camera(gl, { fov: 15 });
      camera.position.set(0, 0, cameraDistance);

      const resize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height);
        camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
      };
      window.addEventListener('resize', resize, false);
      resize();

      const mouse = { x: 0, y: 0 };
      if (moveParticlesOnHover) {
        window.addEventListener('mousemove', e => {
          mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });
      }

      const count = particleCount;
      const positions = new Float32Array(count * 3);
      const randoms = new Float32Array(count * 4);
      const colors = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        let x, y, z, len;
        do {
          x = Math.random() * 2 - 1;
          y = Math.random() * 2 - 1;
          z = Math.random() * 2 - 1;
          len = x * x + y * y + z * z;
        } while (len > 1 || len === 0);
        const r = Math.cbrt(Math.random());
        positions.set([x * r, y * r, z * r], i * 3);
        randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
        const col = hexToRgb(particleColors[Math.floor(Math.random() * particleColors.length)]);
        colors.set(col, i * 3);
      }

      const vertex = `
        attribute vec3 position;
        attribute vec4 random;
        attribute vec3 color;
        
        uniform mat4 modelMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpread;
        uniform float uBaseSize;
        uniform float uSizeRandomness;
        
        varying vec4 vRandom;
        varying vec3 vColor;
        
        void main() {
          vRandom = random;
          vColor = color;
          
          vec3 pos = position * uSpread;
          pos.z *= 10.0;
          
          vec4 mPos = modelMatrix * vec4(pos, 1.0);
          float t = uTime;
          mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
          mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
          mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);
          
          vec4 mvPos = viewMatrix * mPos;

          if (uSizeRandomness == 0.0) {
            gl_PointSize = uBaseSize;
          } else {
            gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
          }

          gl_Position = projectionMatrix * mvPos;
        }
      `;

      const fragment = `
        precision highp float;
        
        uniform float uTime;
        uniform float uAlphaParticles;
        varying vec4 vRandom;
        varying vec3 vColor;
        
        void main() {
          vec2 uv = gl_PointCoord.xy;
          float d = length(uv - vec2(0.5));
          
          if(uAlphaParticles < 0.5) {
            if(d > 0.5) {
              discard;
            }
            gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
          } else {
            float circle = smoothstep(0.5, 0.4, d) * 0.85;
            gl_FragColor = vec4(vColor + 0.15 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
          }
        }
      `;

      const geometry = new Geometry(gl, {
        position: { size: 3, data: positions },
        random: { size: 4, data: randoms },
        color: { size: 3, data: colors }
      });

      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          uTime: { value: 0 },
          uSpread: { value: particleSpread },
          uBaseSize: { value: particleBaseSize * pixelRatio },
          uSizeRandomness: { value: sizeRandomness },
          uAlphaParticles: { value: alphaParticles ? 1 : 0 }
        },
        transparent: true,
        depthTest: false
      });

      const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });

      let lastTime = performance.now();
      let elapsed = 0;

      const update = t => {
        requestAnimationFrame(update);
        const delta = t - lastTime;
        lastTime = t;
        elapsed += delta * speed;

        program.uniforms.uTime.value = elapsed * 0.001;

        if (moveParticlesOnHover) {
          particles.position.x = -mouse.x * particleHoverFactor;
          particles.position.y = -mouse.y * particleHoverFactor;
        }

        if (!disableRotation) {
          particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
          particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
          particles.rotation.z += 0.01 * speed;
        }

        renderer.render({ scene: particles, camera });
      };

      requestAnimationFrame(update);
    } catch (err) {
      // Offline fallback: High-performance 2D Canvas particles
      initCanvas2DFallback();
    }
  })();

  // Offline Canvas2D Fallback
  function initCanvas2DFallback() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    container.appendChild(canvas);

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });

    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 2.8 + 1,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: -Math.random() * 0.45 - 0.1,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
      opacity: Math.random() * 0.7 + 0.2
    }));

    function animate() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.y < -10) p.y = h + 10;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(animate);
    }
    animate();
  }
}
