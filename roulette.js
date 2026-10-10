const canvas = document.getElementById('rouletteCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');

let items = [];
let currentRotation = 0;
let isSpinning = false;
let spinSettings = {
    duration: 4,
    spins: 5
};

const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

function loadItems() {
    const saved = localStorage.getItem('rouletteItems');
    if (saved) {
        items = JSON.parse(saved);
    } else {
        items = [
            { name: '項目1', weight: 5 },
            { name: '項目2', weight: 3 },
            { name: '項目3', weight: 2 }
        ];
        saveItems();
    }

    const savedSettings = localStorage.getItem('rouletteSettings');
    if (savedSettings) {
        spinSettings = JSON.parse(savedSettings);
    }
}

function saveItems() {
    localStorage.setItem('rouletteItems', JSON.stringify(items));
}

function drawRoulette() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 10;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (items.length === 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ccc';
        ctx.fill();
        return;
    }
    
    const sliceAngle = (Math.PI * 2) / items.length;
    
    items.forEach((item, index) => {
        const startAngle = currentRotation + index * sliceAngle;
        const endAngle = startAngle + sliceAngle;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 3;
        ctx.fillText(item.name || '', radius - 20, 5);
        ctx.restore();
    });
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function spin() {
    if (isSpinning || items.length === 0) return;
    
    isSpinning = true;
    spinBtn.disabled = true;
    
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    
    if (totalWeight === 0) {
        alert('割合の合計が0です。項目の割合を設定してください。');
        isSpinning = false;
        spinBtn.disabled = false;
        return;
    }
    
    let random = Math.random() * totalWeight;
    let selectedIndex = 0;
    
    for (let i = 0; i < items.length; i++) {
        random -= items[i].weight;
        if (random <= 0) {
            selectedIndex = i;
            break;
        }
    }
    
    const sliceAngle = (Math.PI * 2) / items.length;
    const targetAngle = (items.length - 1 - selectedIndex) * sliceAngle + sliceAngle / 2;
    const spins = spinSettings.spins + Math.random() * 2;
    const totalRotation = spins * Math.PI * 2 + targetAngle;
    
    const duration = spinSettings.duration * 1000;
    const startTime = performance.now();
    const startRotation = currentRotation;
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOut = 1 - Math.pow(1 - progress, 3);
        currentRotation = startRotation + totalRotation * easeOut;
        
        drawRoulette();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isSpinning = false;
            spinBtn.disabled = false;
            showResult(items[selectedIndex].name);
        }
    }
    
    requestAnimationFrame(animate);
}

function showResult(text) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    
    const result = document.createElement('div');
    result.className = 'result';
    result.textContent = text || '（項目なし）';
    
    document.body.appendChild(overlay);
    document.body.appendChild(result);
    
    overlay.addEventListener('click', () => {
        document.body.removeChild(overlay);
        document.body.removeChild(result);
    });
    
    result.addEventListener('click', () => {
        document.body.removeChild(overlay);
        document.body.removeChild(result);
    });
}

spinBtn.addEventListener('click', spin);

loadItems();
drawRoulette();
