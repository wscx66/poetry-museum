const canvas = document.getElementById("artCanvas");
const finalImage = document.querySelector(".final-image");
const hotspotGrid = document.getElementById("hotspotGrid");
const imageOverlay = document.getElementById("imageOverlay");
const closeImageBtn = document.getElementById("closeImageBtn");
const zoomedPiece = document.getElementById("zoomedPiece");

if (canvas) {
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const particles = [];
    const particleCount = 320;

    const targetWidth = window.innerWidth <= 700 ? 300 : 480;
    const targetHeight = window.innerWidth <= 700 ? 300 : 480;
    const offsetX = canvas.width / 2 - targetWidth / 2;
    const offsetY = canvas.height / 2 - targetHeight / 2 + 32;

    let settledCount = 0;
    let imageRevealStarted = false;
    let startTime = performance.now();

    for (let i = 0; i < particleCount; i++) {
        let startX, startY;
        const side = Math.floor(Math.random() * 4);

        if (side === 0) {
            startX = Math.random() * canvas.width;
            startY = -100 - Math.random() * 200;
        } else if (side === 1) {
            startX = Math.random() * canvas.width;
            startY = canvas.height + 100 + Math.random() * 200;
        } else if (side === 2) {
            startX = -100 - Math.random() * 200;
            startY = Math.random() * canvas.height;
        } else {
            startX = canvas.width + 100 + Math.random() * 200;
            startY = Math.random() * canvas.height;
        }

        particles.push({
            x: startX,
            y: startY,
            tx: offsetX + Math.random() * targetWidth,
            ty: offsetY + Math.random() * targetHeight,
            vx: 0,
            vy: 0,
            r: 3 + Math.random() * 1.8,
            alpha: 1,
            settled: false
        });
    }

    function revealImage() {
        if (!imageRevealStarted) {
            imageRevealStarted = true;

            if (finalImage) {
                finalImage.classList.add("show");
            }

            setTimeout(() => {
                if (hotspotGrid) {
                    hotspotGrid.classList.add("active");
                }
            }, 1400);
        }
    }

    function animate(now) {
        if (!imageRevealStarted) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
        } else {
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        settledCount = 0;

        for (const p of particles) {
            const dx = p.tx - p.x;
            const dy = p.ty - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (!p.settled) {
                p.vx += dx * 0.022;
                p.vy += dy * 0.022;

                p.vx *= 0.82;
                p.vy *= 0.82;

                p.x += p.vx;
                p.y += p.vy;

                if (dist < 3) {
                    p.settled = true;
                    p.x = p.tx;
                    p.y = p.ty;
                    p.vx = 0;
                    p.vy = 0;
                }
            } else {
                settledCount++;

                if (imageRevealStarted && p.alpha > 0) {
                    p.alpha -= 0.02;
                    if (p.alpha < 0) p.alpha = 0;
                }
            }

            if (p.alpha > 0) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(220,235,255,${p.alpha})`;
                ctx.shadowBlur = 12;
                ctx.shadowColor = "rgba(200,220,255,0.95)";
                ctx.fill();
            }
        }

        ctx.shadowBlur = 0;

        if (!imageRevealStarted && settledCount > particleCount * 0.72) {
            revealImage();
        }

        if (!imageRevealStarted && now - startTime > 4000) {
            revealImage();
        }

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

/* 点击九宫格 → 显示对应分块的裁切放大图 */
function openPieceViewer(index) {
    if (!imageOverlay || !zoomedPiece) return;

    const row = Math.floor(index / 3);
    const col = index % 3;

    // 3x3 分块，每块对应背景图的一个区域
    zoomedPiece.style.backgroundPosition = `${col * 50}% ${row * 50}%`;

    imageOverlay.classList.remove("hidden");
}

function closeImageViewer() {
    if (!imageOverlay) return;
    imageOverlay.classList.add("hidden");
}

if (hotspotGrid) {
    hotspotGrid.addEventListener("click", (e) => {
        const target = e.target.closest(".hotspot");
        if (!target) return;

        const index = Number(target.dataset.index);
        openPieceViewer(index);
    });
}

if (closeImageBtn) {
    closeImageBtn.addEventListener("click", closeImageViewer);
}

if (imageOverlay) {
    imageOverlay.addEventListener("click", (e) => {
        if (e.target === imageOverlay) {
            closeImageViewer();
        }
    });
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeImageViewer();
    }
});
/* 星星光标 + 拖尾 */
const starCursor = document.getElementById("starCursor");
const starTrailContainer = document.getElementById("starTrailContainer");

console.log("starCursor =", starCursor);
console.log("starTrailContainer =", starTrailContainer);

if (starCursor && starTrailContainer) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let lastTrailTime = 0;

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.22;
        cursorY += (mouseY - cursorY) * 0.22;

        starCursor.style.left = `${cursorX}px`;
        starCursor.style.top = `${cursorY}px`;

        requestAnimationFrame(animateCursor);
    }

    function createTrail(x, y) {
        const now = Date.now();
        if (now - lastTrailTime < 22) return;
        lastTrailTime = now;

        const dot = document.createElement("div");
        dot.className = "star-trail";

        const offsetX = (Math.random() - 0.5) * 10;
        const offsetY = (Math.random() - 0.5) * 10;

        dot.style.left = `${x + offsetX}px`;
        dot.style.top = `${y + offsetY}px`;

        const size = 8 + Math.random() * 8;
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;

        starTrailContainer.appendChild(dot);

        setTimeout(() => {
            dot.remove();
        }, 800);
    }

    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        createTrail(e.clientX, e.clientY);
    });

    window.addEventListener("mouseleave", () => {
        starCursor.style.opacity = "0";
    });

    window.addEventListener("mouseenter", () => {
        starCursor.style.opacity = "1";
    });

    animateCursor();
}