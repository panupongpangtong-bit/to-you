
/* =========================================
   TO YOU - LOVE WEBSITE
   File: js/main.js
   Universe, Shooting Stars & Light Heart
   Hidden Messages & Final Surprise
========================================= */

// =========================================
// 1. INITIALIZE CANVAS
// =========================================

const canvas = document.getElementById("universe");
const ctx = canvas?.getContext("2d");
const heart = document.getElementById("heart");

if (!canvas || !ctx || !heart) {
    throw new Error(
        "To You: ไม่พบ #universe หรือ #heart ใน index.html"
    );
}

let width = 0;
let height = 0;
let dpr = 1;

let stars = [];
let particles = [];
let shootingStars = [];
let burstParticles = [];

let animationTime = 0;
let heartDrawProgress = 0;
let heartPoints = [];
let heartPathLength = 0;


// =========================================
// 2. HIDDEN MESSAGES & FINAL SURPRISE
// =========================================

const hiddenMessages = [
    "ขอบคุณที่เข้ามาเป็นส่วนหนึ่งของจักรวาลเล็ก ๆ นี้ ❤️",
    "อยากเห็นเธอยิ้มได้ในทุก ๆ วัน",
    "ไม่ต้องเก่งไปทุกเรื่องก็ได้นะ ค่อย ๆ เรียนรู้ไป",
    "เธอมีคุณค่าในแบบที่เธอเป็น",
    "ขอให้ทุกความพยายามของเธอพาไปเจอสิ่งดี ๆ",
    "อย่าลืมพักผ่อนและดูแลตัวเองด้วยนะ",
    "มีคนคนหนึ่งคอยเอาใจช่วยเธออยู่เสมอ ✨",
    "ขอให้อนาคตของเธอสวยงามเหมือนดวงดาว"
];

let finalSurpriseActive = false;
let hiddenMessageIndex = 0;


// =========================================
// 3. CONFIGURATION
// =========================================

const CONFIG = {
    starCount: 160,
    particleCount: 45,
    maxDpr: 2
};

const HEART_CONFIG = {
    drawSpeed: 0.0045,
    particleCount: 75,
    glowColor: "#ff4fa3",
    coreColor: "#ffffff",
    outerColor: "#a855f7",
    lineWidth: 3
};


// =========================================
// 4. RANDOM HELPER
// =========================================

function random(min, max) {
    return Math.random() * (max - min) + min;
}


// =========================================
// 5. CREATE HEART PATH
// =========================================

function createHeartPath() {
    heartPoints = [];
    heartPathLength = 0;

    const totalPoints = 360;

    for (let i = 0; i <= totalPoints; i++) {
        const t = (i / totalPoints) * Math.PI * 2;

        const x = 16 * Math.pow(Math.sin(t), 3);

        const y =
            13 * Math.cos(t)
            - 5 * Math.cos(2 * t)
            - 2 * Math.cos(3 * t)
            - Math.cos(4 * t);

        const point = {
            x,
            y: -y
        };

        if (heartPoints.length > 0) {
            const previous = heartPoints[heartPoints.length - 1];

            const dx = point.x - previous.x;
            const dy = point.y - previous.y;

            heartPathLength += Math.hypot(dx, dy);
        }

        heartPoints.push(point);
    }
}


// =========================================
// 6. RESIZE CANVAS
// =========================================

function resizeCanvas() {
    dpr = Math.min(
        window.devicePixelRatio || 1,
        CONFIG.maxDpr
    );

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    createStars();
    createParticles();
}

window.addEventListener("resize", resizeCanvas);


// =========================================
// 7. CREATE & DRAW STARS
// =========================================

function createStars() {
    stars = [];

    for (let i = 0; i < CONFIG.starCount; i++) {
        stars.push({
            x: random(0, width),
            y: random(0, height),

            radius: random(0.4, 1.8),
            alpha: random(0.2, 1),

            speed: random(0.002, 0.012),
            phase: random(0, Math.PI * 2),

            color: Math.random() > 0.7
                ? "#ff9bd0"
                : "#ffffff",

            clickable: i % 12 === 0,
            index: i
        });
    }
}

function drawStars() {
    // คำนวณตำแหน่งหัวใจเพียงครั้งเดียวต่อเฟรม
    const center = finalSurpriseActive
        ? getHeartCenter()
        : null;

    const scale = center && center.width && center.height
        ? Math.min(
            center.width / 36,
            center.height / 34
        ) * 0.95
        : 0;

    stars.forEach((star) => {

        // Final Surprise: ดาวเคลื่อนมารวมเป็นรูปหัวใจ
        if (
            finalSurpriseActive &&
            center &&
            scale &&
            heartPoints.length
        ) {
            const pointIndex = Math.floor(
                (star.index / stars.length) * heartPoints.length
            );

            const target = heartPoints[pointIndex];

            const targetX = center.x + target.x * scale;
            const targetY = center.y + target.y * scale;

            star.x += (targetX - star.x) * 0.035;
            star.y += (targetY - star.y) * 0.035;
        }

        const twinkle = Math.sin(
            animationTime * star.speed + star.phase
        );

        const alpha = star.alpha * (0.55 + twinkle * 0.35);

        ctx.save();

        // ดาวที่แตะได้จะมีประกายเด่นกว่า
        if (star.clickable && !finalSurpriseActive) {
            ctx.shadowBlur = 12;
            ctx.shadowColor = "#ff4fa3";
        }

        ctx.beginPath();

        ctx.arc(
            star.x,
            star.y,
            star.clickable ? star.radius + 0.5 : star.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = star.clickable
            ? "#ff9bd0"
            : star.color;

        ctx.globalAlpha = Math.max(0.1, alpha);

        ctx.fill();

        ctx.restore();
    });
}


// =========================================
// 8. SHOOTING STARS
// =========================================

function createShootingStar() {
    shootingStars.push({
        x: random(0, width),
        y: random(0, height * 0.5),

        length: random(40, 100),
        speed: random(5, 10),

        opacity: 1
    });
}

function drawShootingStars() {
    for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];

        ctx.beginPath();

        ctx.moveTo(star.x, star.y);

        ctx.lineTo(
            star.x - star.length,
            star.y + star.length * 0.35
        );

        ctx.strokeStyle =
            `rgba(255, 190, 230, ${star.opacity})`;

        ctx.lineWidth = 1.5;

        ctx.stroke();

        star.x += star.speed;
        star.y += star.speed * 0.35;

        star.opacity -= 0.012;

        if (star.opacity <= 0) {
            shootingStars.splice(i, 1);
        }
    }
}


// =========================================
// 9. HEART PARTICLES ORBITING AROUND HEART
// =========================================

function createParticles() {
    particles = [];

    for (let i = 0; i < CONFIG.particleCount; i++) {
        particles.push({
            angle: random(0, Math.PI * 2),

            distance: random(90, 145),
            speed: random(0.002, 0.009),

            radius: random(1, 3),
            alpha: random(0.3, 0.9),

            phase: random(0, Math.PI * 2)
        });
    }
}

function getHeartCenter() {
    const rect = heart.getBoundingClientRect();

    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,

        width: rect.width,
        height: rect.height
    };
}

function drawParticles() {
    const center = getHeartCenter();

    if (!center.width || !center.height) {
        return;
    }

    particles.forEach((particle) => {
        particle.angle += particle.speed;

        const wave =
            Math.sin(
                animationTime * 0.025 + particle.phase
            ) * 5;

        const distance = particle.distance + wave;

        const x =
            center.x + Math.cos(particle.angle) * distance;

        const y =
            center.y + Math.sin(particle.angle) * distance;

        const twinkle =
            Math.sin(animationTime * 0.04 + particle.phase);

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            particle.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#ff82c2";

        ctx.globalAlpha =
            particle.alpha * (0.5 + twinkle * 0.5);

        ctx.shadowBlur = 12;
        ctx.shadowColor = "#ff4fa3";

        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    });
}


// =========================================
// 10. DRAW HEART AS GLOWING LIGHT TRAIL
// =========================================

function drawLightHeart() {
    const center = getHeartCenter();

    if (
        !center.width ||
        !center.height ||
        heartPoints.length === 0
    ) {
        return;
    }

    const scale = Math.min(
        center.width / 36,
        center.height / 34
    ) * 0.95;

    const progress = Math.min(heartDrawProgress, 1);

    const pulse = progress >= 1
        ? 1 + Math.sin(animationTime * 0.06) * 0.025
        : 1;

    const points = heartPoints.map((point) => ({
        x: center.x + point.x * scale * pulse,
        y: center.y + point.y * scale * pulse
    }));

    // Calculate drawing progress

    const scaledTotalLength = heartPathLength * scale;
    const targetLength = scaledTotalLength * progress;

    let travelled = 0;

    const visiblePoints = [points[0]];

    for (let i = 1; i < points.length; i++) {
        const previous = points[i - 1];
        const current = points[i];

        const segmentLength = Math.hypot(
            current.x - previous.x,
            current.y - previous.y
        );

        if (travelled + segmentLength <= targetLength) {
            visiblePoints.push(current);
            travelled += segmentLength;
        } else {
            const remaining = targetLength - travelled;

            if (remaining > 0 && segmentLength > 0) {
                const ratio = remaining / segmentLength;

                visiblePoints.push({
                    x: previous.x +
                        (current.x - previous.x) * ratio,

                    y: previous.y +
                        (current.y - previous.y) * ratio
                });
            }

            break;
        }
    }

    if (visiblePoints.length < 2) {
        heartDrawProgress = Math.min(
            1,
            heartDrawProgress + HEART_CONFIG.drawSpeed
        );

        return;
    }

    // Gradient

    const gradient = ctx.createLinearGradient(
        center.x - center.width * 0.5,
        center.y - center.height * 0.5,

        center.x + center.width * 0.5,
        center.y + center.height * 0.5
    );

    gradient.addColorStop(0, "#ff9bd0");
    gradient.addColorStop(0.5, "#ffffff");
    gradient.addColorStop(1, "#a855f7");

    ctx.save();

    ctx.beginPath();

    ctx.moveTo(
        visiblePoints[0].x,
        visiblePoints[0].y
    );

    for (let i = 1; i < visiblePoints.length; i++) {
        ctx.lineTo(
            visiblePoints[i].x,
            visiblePoints[i].y
        );
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Pink glow

    ctx.strokeStyle = HEART_CONFIG.glowColor;
    ctx.lineWidth = HEART_CONFIG.lineWidth + 2;

    ctx.shadowBlur = 28;
    ctx.shadowColor = HEART_CONFIG.glowColor;

    ctx.stroke();

    // Gradient edge

    ctx.strokeStyle = gradient;
    ctx.lineWidth = HEART_CONFIG.lineWidth;

    ctx.shadowBlur = 16;
    ctx.shadowColor = HEART_CONFIG.outerColor;

    ctx.stroke();

    // White core

    ctx.strokeStyle = HEART_CONFIG.coreColor;
    ctx.lineWidth = 1;

    ctx.shadowBlur = 10;
    ctx.shadowColor = "#ffffff";

    ctx.stroke();

    ctx.restore();

    // Tiny lights along the heart

    const visibleCount = Math.max(
        1,
        Math.floor(points.length * progress)
    );

    for (let i = 0; i < HEART_CONFIG.particleCount; i++) {
        const index = Math.floor(
            (i / HEART_CONFIG.particleCount) * visibleCount
        );

        const point = points[index];

        if (!point) continue;

        const flicker =
            0.35 +
            (Math.sin(animationTime * 0.08 + i) + 1) * 0.325;

        ctx.beginPath();

        ctx.arc(
            point.x,
            point.y,
            1.1,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = flicker;

        ctx.shadowBlur = 12;
        ctx.shadowColor = HEART_CONFIG.glowColor;

        ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Moving spark

    if (progress < 1) {
        const tip = visiblePoints[visiblePoints.length - 1];

        ctx.save();

        ctx.beginPath();

        ctx.arc(
            tip.x,
            tip.y,
            4,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#ffffff";

        ctx.shadowBlur = 25;
        ctx.shadowColor = HEART_CONFIG.glowColor;

        ctx.fill();

        ctx.restore();
    }

    // Continue drawing

    if (heartDrawProgress < 1) {
        heartDrawProgress = Math.min(
            1,
            heartDrawProgress + HEART_CONFIG.drawSpeed
        );
    }
}


// =========================================
// 11. HEART CLICK BURST
// =========================================

function createBurst(x, y) {
    const colors = [
        "#ff4fa3",
        "#ff9bd0",
        "#a855f7",
        "#6c8cff",
        "#ffffff"
    ];

    for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = random(1, 5);

        burstParticles.push({
            x,
            y,

            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,

            radius: random(1, 4),
            alpha: 1,

            color: colors[
                Math.floor(Math.random() * colors.length)
            ]
        });
    }
}

function drawBurst() {
    for (let i = burstParticles.length - 1; i >= 0; i--) {
        const p = burstParticles[i];

        p.x += p.vx;
        p.y += p.vy;

        p.alpha -= 0.018;

        p.vx *= 0.98;
        p.vy *= 0.98;

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            p.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);

        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;

        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        if (p.alpha <= 0) {
            burstParticles.splice(i, 1);
        }
    }
}


// =========================================
// 12. HEART INTERACTION
// =========================================

heart.addEventListener("click", () => {
    const center = getHeartCenter();

    createBurst(center.x, center.y);
});


// =========================================
// 13. DOM ELEMENTS
// =========================================

const openLetter = document.getElementById("openLetter");
const closeLetter = document.getElementById("closeLetter");
const letterModal = document.getElementById("letterModal");

const nextPage = document.getElementById("nextPage");
const secondPage = document.getElementById("secondPage");
const closeSecondPage = document.getElementById("closeSecondPage");

const hiddenMessage = document.getElementById("hiddenMessage");
const hiddenMessageText = document.getElementById("hiddenMessageText");
const closeHiddenMessage = document.getElementById("closeHiddenMessage");

const finalSurprise = document.getElementById("finalSurprise");
const finalSurpriseButton = document.getElementById("finalSurpriseButton");
const closeFinalSurprise = document.getElementById("closeFinalSurprise");


// =========================================
// 14. MANAGE BODY SCROLL
// =========================================

function updatePageScroll() {
    const modalIds = [
        letterModal,
        secondPage,
        hiddenMessage,
        finalSurprise
    ];

    const hasOpenModal = modalIds.some(
        (modal) => modal?.classList.contains("active")
    );

    document.body.style.overflow = hasOpenModal
        ? "hidden"
        : "";
}


// =========================================
// 15. LETTER MODAL
// =========================================

function showLetter() {
    if (!letterModal) return;

    letterModal.classList.add("active");
    letterModal.setAttribute("aria-hidden", "false");

    updatePageScroll();
}

function hideLetter() {
    if (!letterModal) return;

    letterModal.classList.remove("active");
    letterModal.setAttribute("aria-hidden", "true");

    updatePageScroll();
}

openLetter?.addEventListener("click", showLetter);
closeLetter?.addEventListener("click", hideLetter);

letterModal?.addEventListener("click", (event) => {
    if (event.target === letterModal) {
        hideLetter();
    }
});


// =========================================
// 16. SECOND MESSAGE PAGE
// =========================================

function showSecondPage() {
    if (!secondPage) return;

    letterModal?.classList.remove("active");
    letterModal?.setAttribute("aria-hidden", "true");

    secondPage.classList.add("active");
    secondPage.setAttribute("aria-hidden", "false");

    updatePageScroll();
}

function hideSecondPage() {
    if (!secondPage) return;

    secondPage.classList.remove("active");
    secondPage.setAttribute("aria-hidden", "true");

    updatePageScroll();
}

nextPage?.addEventListener("click", showSecondPage);
closeSecondPage?.addEventListener("click", hideSecondPage);

secondPage?.addEventListener("click", (event) => {
    if (event.target === secondPage) {
        hideSecondPage();
    }
});


// =========================================
// 17. HIDDEN MESSAGES
// =========================================

function showHiddenMessage(message) {
    if (!hiddenMessage || !hiddenMessageText) return;

    hiddenMessageText.textContent = message;

    hiddenMessage.classList.add("active");
    hiddenMessage.setAttribute("aria-hidden", "false");

    updatePageScroll();
}

function hideHiddenMessage() {
    if (!hiddenMessage) return;

    hiddenMessage.classList.remove("active");
    hiddenMessage.setAttribute("aria-hidden", "true");

    updatePageScroll();
}

closeHiddenMessage?.addEventListener(
    "click",
    hideHiddenMessage
);

hiddenMessage?.addEventListener("click", (event) => {
    if (event.target === hiddenMessage) {
        hideHiddenMessage();
    }
});


// =========================================
// 18. STAR INTERACTION
// =========================================

window.addEventListener("pointerdown", (event) => {

    // ป้องกันการแตะดาวผ่านปุ่มหรือหน้าต่างข้อความ
    const targetElement = event.target instanceof Element
        ? event.target
        : null;

    if (
        targetElement?.closest(
            "button, a, input, textarea, select, " +
            ".letter-card, .second-page-content, " +
            ".hidden-message-card, .final-surprise-content, .heart"
        )
    ) {
        return;
    }

    // ปิดการแตะดาวเมื่อมีหน้าต่างอื่นเปิดอยู่
    if (
        finalSurpriseActive ||
        hiddenMessage?.classList.contains("active") ||
        letterModal?.classList.contains("active") ||
        secondPage?.classList.contains("active")
    ) {
        return;
    }

    const rect = canvas.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // เลือกดาวที่อยู่ใกล้ตำแหน่งแตะที่สุด
    const selectedStar = stars
        .filter((star) => star.clickable)
        .map((star) => ({
            star,
            distance: Math.hypot(
                mouseX - star.x,
                mouseY - star.y
            )
        }))
        .filter((item) => item.distance < 22)
        .sort((a, b) => a.distance - b.distance)[0]?.star;

    if (selectedStar) {

        const message = hiddenMessages[
            hiddenMessageIndex % hiddenMessages.length
        ];

        hiddenMessageIndex++;

        createBurst(selectedStar.x, selectedStar.y);
        showHiddenMessage(message);
    }
});


// =========================================
// 19. FINAL SURPRISE
// =========================================

function showFinalSurprise() {
    if (!finalSurprise) return;

    finalSurpriseActive = true;

    finalSurprise.classList.add("active");
    finalSurprise.setAttribute("aria-hidden", "false");

    const center = getHeartCenter();

    createBurst(center.x, center.y);

    updatePageScroll();
}

function hideFinalSurprise() {
    if (!finalSurprise) return;

    finalSurprise.classList.remove("active");
    finalSurprise.setAttribute("aria-hidden", "true");

    finalSurpriseActive = false;

    // ให้ดาวกลับไปกระจายทั่วจักรวาล
    createStars();

    updatePageScroll();
}

finalSurpriseButton?.addEventListener(
    "click",
    showFinalSurprise
);

closeFinalSurprise?.addEventListener(
    "click",
    hideFinalSurprise
);

finalSurprise?.addEventListener("click", (event) => {
    if (event.target === finalSurprise) {
        hideFinalSurprise();
    }
});


// =========================================
// 20. KEYBOARD INTERACTION
// =========================================

document.addEventListener("keydown", (event) => {

    if (event.key !== "Escape") return;

    hideLetter();
    hideSecondPage();
    hideHiddenMessage();
    hideFinalSurprise();

});


// =========================================
// 21. MAIN ANIMATION LOOP
// =========================================

function animate() {
    ctx.clearRect(0, 0, width, height);

    animationTime++;

    drawStars();
    drawShootingStars();
    drawLightHeart();
    drawParticles();
    drawBurst();

    requestAnimationFrame(animate);
}


// =========================================
// 22. START APPLICATION
// =========================================

function initialize() {
    resizeCanvas();
    createHeartPath();

    // Reset Hidden Messages
    hiddenMessage?.classList.remove("active");
    hiddenMessage?.setAttribute("aria-hidden", "true");

    // Reset Final Surprise
    finalSurprise?.classList.remove("active");
    finalSurprise?.setAttribute("aria-hidden", "true");

    finalSurpriseActive = false;
    hiddenMessageIndex = 0;

    // Show HTML heart
    heart.style.opacity = "1";
    heart.style.visibility = "visible";
    heart.style.color = "#ff4fa3";
    heart.style.cursor = "pointer";

    heart.style.textShadow = `
        0 0 10px #ff4fa3,
        0 0 25px #ff4fa3,
        0 0 45px #a855f7
    `;

    // Initial modal state
    letterModal?.classList.remove("active");
    secondPage?.classList.remove("active");

    letterModal?.setAttribute("aria-hidden", "true");
    secondPage?.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";

    // Start animation
    animate();

    console.log(
        "%c To You ❤️ ",
        "color: #ff4fa3; font-size: 25px; font-weight: bold;"
    );

    console.log("A little universe made just for you.");
}


// =========================================
// 23. SHOOTING STAR GENERATOR
// =========================================

setInterval(() => {
    if (Math.random() > 0.4) {
        createShootingStar();
    }
}, 2500);


// =========================================
// 24. RUN APPLICATION
// =========================================

initialize();
