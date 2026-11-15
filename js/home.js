
/* =================================
   HOME - AUTOMATIC NEON HEART
   Sparkling Universe Edition
   Canvas 2D | Lightweight Animation
================================= */

(() => {
    const home = document.getElementById("home");
    const canvas = document.getElementById("drawCanvas");
    const replayButton = document.getElementById("clearDrawing");
    const enterButton = document.getElementById("enterWebsite");

    if (!home || !canvas || !replayButton || !enterButton) {
        console.error("Home elements not found");
        return;
    }

    const ctx = canvas.getContext("2d");

    const COLORS = [
        "#ff65c8",
        "#ff4f91",
        "#d58aff",
        "#b58aff"
    ];

    let width = 0;
    let height = 0;

    let heartPoints = [];
    let heartGlitters = [];
    let stars = [];
    let particles = [];

    let progress = 0;
    let animationId = null;
    let lastTime = 0;
    let completed = false;
    let currentColor = COLORS[0];

    const DRAW_SPEED = 0.65;
    const MAX_PARTICLES = 85;
    const STAR_COUNT = 120;
    const GLITTER_COUNT = 36;

    // สร้างพิกัดหัวใจ
    function createHeartPath() {
        const points = [];
        const count = 320;

        const scale = Math.min(width / 38, height / 34) * 0.82;

        for (let i = 0; i <= count; i++) {
            const t = (i / count) * Math.PI * 2;

            const x = 16 * Math.pow(Math.sin(t), 3);

            const y =
                13 * Math.cos(t) -
                5 * Math.cos(2 * t) -
                2 * Math.cos(3 * t) -
                Math.cos(4 * t);

            points.push({
                x: width / 2 + x * scale,
                y: height / 2 - y * scale
            });
        }

        return points;
    }

    // สร้างดาวพื้นหลัง
    function createStars() {
        stars = [];

        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 1.5 + 0.4,
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.002 + 0.001,
                brightness: Math.random() * 0.5 + 0.5
            });
        }
    }

    // สร้างประกายรอบเส้นหัวใจ
    function createHeartGlitters() {
        heartGlitters = [];

        for (let i = 0; i < GLITTER_COUNT; i++) {
            const index = Math.floor(
                (i / GLITTER_COUNT) * heartPoints.length
            );

            const point = heartPoints[index];

            heartGlitters.push({
                x: point.x + (Math.random() - 0.5) * 22,
                y: point.y + (Math.random() - 0.5) * 22,
                size: Math.random() * 1.8 + 0.7,
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.003 + 0.001
            });
        }
    }

    // ปรับขนาด Canvas
    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

        width = rect.width;
        height = rect.height;

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        heartPoints = createHeartPath();

        createStars();
        createHeartGlitters();

        drawFrame();
    }

    // สร้างอนุภาคแสง
    function createParticles(x, y, amount = 2) {
        for (let i = 0; i < amount; i++) {
            if (particles.length >= MAX_PARTICLES) break;

            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 1.2 + 0.2;

            particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                size: Math.random() * 2 + 0.5
            });
        }
    }

    // วาดดาวระยิบระยับ
    function drawStars(timestamp = 0) {
        ctx.save();

        for (const star of stars) {
            const twinkle =
                0.2 +
                Math.abs(
                    Math.sin(timestamp * star.speed + star.phase)
                ) * star.brightness;

            ctx.globalAlpha = twinkle;
            ctx.fillStyle = "#ffffff";

            ctx.beginPath();
            ctx.arc(
                star.x,
                star.y,
                star.size,
                0,
                Math.PI * 2
            );
            ctx.fill();

            // ดาวประกายสี่แฉกขนาดเล็ก
            if (star.size > 1.5) {
                ctx.globalAlpha = twinkle * 0.55;
                ctx.fillRect(
                    star.x - 3,
                    star.y - 0.35,
                    6,
                    0.7
                );

                ctx.fillRect(
                    star.x - 0.35,
                    star.y - 3,
                    0.7,
                    6
                );
            }
        }

        ctx.restore();
    }

    // วาดประกายรอบหัวใจ
    function drawHeartGlitters(timestamp = 0) {
        if (progress < 0.1) return;

        ctx.save();

        for (const glitter of heartGlitters) {
            const twinkle =
                Math.sin(
                    timestamp * glitter.speed + glitter.phase
                );

            const alpha = 0.2 + Math.abs(twinkle) * 0.8;
            const size = glitter.size * (0.7 + Math.abs(twinkle));

            ctx.globalAlpha = alpha;
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 1;
            ctx.shadowColor = currentColor;
            ctx.shadowBlur = 8;

            // ประกายสี่แฉก
            ctx.beginPath();

            ctx.moveTo(glitter.x - size * 2, glitter.y);
            ctx.lineTo(glitter.x + size * 2, glitter.y);

            ctx.moveTo(glitter.x, glitter.y - size * 2);
            ctx.lineTo(glitter.x, glitter.y + size * 2);

            ctx.stroke();

            // จุดแสงตรงกลาง
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(
                glitter.x,
                glitter.y,
                size * 0.55,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        ctx.restore();
    }

    // วาดเส้นหัวใจพร้อมแสง
    function drawHeart() {
        if (progress <= 0) return;

        const visibleCount = Math.floor(
            progress * (heartPoints.length - 1)
        );

        if (visibleCount < 2) return;

        function createPath() {
            ctx.beginPath();
            ctx.moveTo(heartPoints[0].x, heartPoints[0].y);

            for (let i = 1; i <= visibleCount; i++) {
                ctx.lineTo(
                    heartPoints[i].x,
                    heartPoints[i].y
                );
            }
        }

        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // ชั้นที่ 1: แสงฟุ้งรอบนอก
        ctx.save();
        createPath();

        ctx.strokeStyle = currentColor;
        ctx.lineWidth = 15;
        ctx.shadowColor = currentColor;
        ctx.shadowBlur = 35;
        ctx.globalAlpha = 0.45;

        ctx.stroke();
        ctx.restore();

        // ชั้นที่ 2: แสงนีออน
        ctx.save();
        createPath();

        ctx.strokeStyle = currentColor;
        ctx.lineWidth = 6;
        ctx.shadowColor = currentColor;
        ctx.shadowBlur = 22;

        ctx.stroke();
        ctx.restore();

        // ชั้นที่ 3: เส้นสว่างด้านใน
        ctx.save();
        createPath();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 12;

        ctx.stroke();
        ctx.restore();

        // ตำแหน่งปลายแสง
        const tip = heartPoints[
            Math.min(visibleCount, heartPoints.length - 1)
        ];

        // วงแสงรอบจุดปลาย
        ctx.save();

        const glow = ctx.createRadialGradient(
            tip.x, tip.y, 0,
            tip.x, tip.y, 25
        );

        glow.addColorStop(0, "#ffffff");
        glow.addColorStop(0.2, currentColor);
        glow.addColorStop(1, "transparent");

        ctx.fillStyle = glow;

        ctx.beginPath();
        ctx.arc(tip.x, tip.y, 25, 0, Math.PI * 2);
        ctx.fill();

        // จุดแกนกลาง
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, 3.5, 0, Math.PI * 2);

        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 15;

        ctx.fill();
        ctx.restore();

        // ประกายตามปลายแสง
        if (!completed && Math.random() < 0.9) {
            createParticles(tip.x, tip.y, 2);
        }
    }

    // อัปเดตอนุภาค
    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];

            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.018;

            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        }
    }

    // วาดอนุภาค
    function drawParticles() {
        ctx.save();

        for (const p of particles) {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = currentColor;
            ctx.shadowBlur = 12;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    // วาดทั้งฉาก
    function drawFrame(timestamp = 0) {
        ctx.clearRect(0, 0, width, height);

        drawStars(timestamp);
        drawHeart();
        drawHeartGlitters(timestamp);

        updateParticles();
        drawParticles();
    }

    // เมื่อวาดหัวใจเสร็จ
    function heartComplete() {
        completed = true;

        const centerX = width / 2;
        const centerY = height / 2;

        createParticles(centerX, centerY, 35);

        enterButton.disabled = false;
        enterButton.classList.add("ready");
    }

    // Animation หลัก
    function animate(timestamp) {
        if (!lastTime) lastTime = timestamp;

        const delta = Math.min(timestamp - lastTime, 32);
        lastTime = timestamp;

        if (!completed) {
            progress += (DRAW_SPEED * delta) / 1000;

            if (progress >= 1) {
                progress = 1;
                heartComplete();
            }
        }

        drawFrame(timestamp);

        if (!completed || particles.length > 0) {
            animationId = requestAnimationFrame(animate);
        } else {
            animationId = null;
        }
    }

    // เริ่มวาดหัวใจใหม่
    function startAnimation() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }

        progress = 0;
        completed = false;
        particles = [];
        lastTime = 0;

        currentColor =
            COLORS[Math.floor(Math.random() * COLORS.length)];

        enterButton.disabled = true;
        enterButton.classList.remove("ready");

        animationId = requestAnimationFrame(animate);
    }

    // เล่นหัวใจอีกครั้ง
    replayButton.addEventListener("click", startAnimation);

    // เข้าสู่เว็บไซต์เดิม
    enterButton.addEventListener("click", () => {
        if (!completed) return;

        home.classList.add("leaving");

        setTimeout(() => {
            home.style.display = "none";
        }, 850);
    });

    // เริ่มระบบ
    resizeCanvas();
    startAnimation();

    window.addEventListener("resize", resizeCanvas);

    // หยุด Animation เมื่อสลับแท็บ
    document.addEventListener("visibilitychange", () => {
        if (document.hidden && animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        } else if (!document.hidden && !completed && !animationId) {
            lastTime = 0;
            animationId = requestAnimationFrame(animate);
        }
    });
})();
