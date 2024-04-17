import { useEffect, useRef, useMemo, useState } from 'react';

const Background = () => {
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const timeRef = useRef(0); // Store time in a ref to avoid dependency in useEffect
  const Particles = useRef([]);

  const random = (v1, v2) => Math.floor(v1 + Math.random() * (v2 - v1));
  const noise = (x, y, z) => {
    const a = (x * 100) * (y * 100) * (z * 100);
    return Math.sin(a) * 1000;
  };

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleBackgroundClick = () => {
    for (let p of Particles.current) {
      p.isMoving = !p.isMoving;
    }

    // Change tail length
    const newTailLength = random(50, 100); // Adjust the range as needed
    for (let p of Particles.current) {
      p.tailLength = newTailLength;
    }

    // Change color of all particles to different shades of red upon click
    for (let p of Particles.current) {
      p.hue = random(10, 30); // Random hue within range of red
      p.sat = random(80, 160); // Random saturation
      p.light = random(80, 160); // Random lightness
    }

    // Toggle glow effect
    for (let p of Particles.current) {
      p.glow = !p.glow;
    }
  };

  const background = useMemo(() => (color) => {
    if (!ctxRef.current) return;
    ctxRef.current.fillStyle = color;
    ctxRef.current.fillRect(0, 0, width, height);
  }, [width, height]);

  useEffect(() => {
    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.lx = x;
        this.ly = y;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0;
        this.hue = random(5, 10); // Darker color scheme
        this.sat = 100; // Full saturation
        this.light = random(12, 19); // Dimmer color
        this.size = random(2, 5); // Random particle size between 2 and 4
        this.initialSize = this.size; // Store initial size for resetting
        this.tail = [];
        this.tailLength = random(100, 200); // Tail length
        this.fadeIn = Math.random() > 0.5; // Randomly select if particle should fade in/out
        this.highlight = Math.random() > 0.35; // Randomly select if particle should be highlighted
        this.glow = Math.random() > 0.85; // Randomly select if particle should have a subtle glow
        this.isMoving = true; // Initial movement state
        this.targetX = null; // Target X coordinate for movement
        this.targetY = null; // Target Y coordinate for movement
        this.grow = true; // Initial growth state
        this.maxSize = this.size * 2; // Maximum size for growth
        this.growthRate = 0.8; // Rate of growth
        this.growthDuration = 3000; // Duration of growth in milliseconds
        this.shrinkDuration = 3000; // Duration of shrinking in milliseconds
        this.cycleDuration = this.growthDuration + this.shrinkDuration; // Total cycle duration
        this.cycleStart = timeRef.current; // Start time of current cycle
      }

      render() {
        const gradient = ctxRef.current.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, `hsla(${this.hue}, ${this.sat}%, ${this.light}%, 0.1)`);
        gradient.addColorStop(0.9, 'transparent');
        ctxRef.current.fillStyle = gradient;
        ctxRef.current.beginPath();
        ctxRef.current.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctxRef.current.fill();
        ctxRef.current.closePath();

        // Add fading tail
        for (let i = 0; i < this.tail.length; i++) {
          const alpha = Math.max(0, 0.35 - (i / this.tail.length) * 0.75); // Make the tail 40% less visible
          ctxRef.current.beginPath();
          ctxRef.current.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.light}%, ${alpha})`;
          ctxRef.current.arc(this.tail[i].x, this.tail[i].y, this.size * (1 - i / this.tail.length), 1, Math.PI * 2);
          ctxRef.current.fill();
          ctxRef.current.closePath();
        }
      }

      update() {
        const cycleProgress = (timeRef.current - this.cycleStart) % this.cycleDuration; // Progress within current cycle

        // Determine if in growth phase or shrinking phase
        if (cycleProgress < this.growthDuration) {
          this.size += this.growthRate; // Grow particle
        } else {
          this.size -= this.growthRate; // Shrink particle
        }

        this.size = Math.max(0.8, Math.min(this.size, this.maxSize)); // Clamp size within limits
        this.follow();
        this.vx += this.ax;
        this.vy += this.ay;
        var p = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        var a = Math.atan2(this.vy, this.vx);
        var m = Math.min(0.30, p); // Slower movement around the screen
        this.vx = Math.cos(a) * m;
        this.vy = Math.sin(a) * m;
        this.x += this.vx;
        this.y += this.vy;
        this.ax = 0;
        this.ay = 0;
        this.edges();

        // Add current position to tail
        this.tail.push({ x: this.x, y: this.y });

        if (this.isMoving && this.targetX !== null && this.targetY !== null) {
          const dx = this.targetX - this.x;
          const dy = this.targetY - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const speed = 5; // Adjust speed as needed

          if (distance > 5) {
            this.vx = (dx / distance) * speed;
            this.vy = (dy / distance) * speed;
          } else {
            this.vx = 0.3;
            this.vy = 2;
          }
        } else {
          // Apply slower movement and fading tail
          this.ax = (Math.random() - 1) * 0.1; // Reduce jitter intensity by 50%
          this.ay = (Math.random() + 8) * 0.06; // Reduce jitter intensity by 50%
        }

        // Update particle position
        this.x += this.vx;
        this.y += this.vy;

        // Limit tail length
        if (this.tail.length > this.tailLength) {
          this.tail.shift();
        }

        // Randomly fade in/out
        if (Math.random() > 0.4) {
          this.light = Math.min(this.light + 1, 50);
        } else {
          this.light = Math.max(this.light - 1, 20);
        }

        // Highlight particles
        if (this.highlight) {
          ctxRef.current.beginPath();
          ctxRef.current.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.light + 5}%, 0.05)`;
          ctxRef.current.arc(this.x, this.y, this.size + 2, 0, Math.PI * 1);
          ctxRef.current.fill();
          ctxRef.current.closePath();
        }
      }

      follow() {
        let angle = (noise(this.x * 0.09, this.y * 0.09, timeRef.current * 0.09)) * Math.PI * 0.9 - Math.PI * 0.05;
        this.ax += Math.cos(angle);
        this.ay += Math.sin(angle);
      }

      edges() {
        const widthLimit = width * 1; // Increase width limit by 30%
        const heightLimit = height * 1; // Increase height limit by 30%

        if (this.x < 0) {
          this.x = widthLimit;
          this.updatePrev();
        }
        if (this.x > widthLimit) {
          this.x = 0;
          this.updatePrev();
        }
        if (this.y < 0) {
          this.y = heightLimit;
          this.updatePrev();
        }
        if (this.y > heightLimit) {
          this.y = 0;
          this.updatePrev();
        }
      }

      updatePrev() {
        this.lx = this.x;
        this.ly = this.y;
      }
    }

    Particles.current = [];
    for (let i = 0; i < width * height * 0.000099; i++) {
      // Increased number of particles by 20%
      Particles.current.push(new Particle(Math.random() * width, Math.random() * height));
    }

    const setup = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctxRef.current = ctx;
    };

    const draw = () => {
      timeRef.current++;
      background('#080808'); // 15% dimmer background
      for (let p of Particles.current) {
        p.update();
        p.render();
      }
      requestAnimationFrame(draw);
    };

    setup();
    const animationFrameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationFrameId);
  }, [background, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={handleBackgroundClick}
    />
  );
};

export default Background;
