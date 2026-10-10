const itemsList = document.getElementById('itemsList');
const addItemBtn = document.getElementById('addItemBtn');
const durationInput = document.getElementById('durationInput');
const spinsInput = document.getElementById('spinsInput');

let items = [];
let spinSettings = {
    duration: 4,
    spins: 5
};

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
        durationInput.value = spinSettings.duration;
        spinsInput.value = spinSettings.spins;
    }
}

function saveItems() {
    localStorage.setItem('rouletteItems', JSON.stringify(items));
}

function saveSettings() {
    spinSettings.duration = parseInt(durationInput.value) || 4;
    spinSettings.spins = parseInt(spinsInput.value) || 5;
    localStorage.setItem('rouletteSettings', JSON.stringify(spinSettings));
}

function renderItems() {
    itemsList.innerHTML = '';
    items.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'item-row';
        
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = item.name;
        nameInput.placeholder = '項目名';
        nameInput.addEventListener('input', (e) => {
            items[index].name = e.target.value;
            saveItems();
        });
        
        const weightLabel = document.createElement('label');
        weightLabel.textContent = '割合:';
        
        const weightInput = document.createElement('input');
        weightInput.type = 'number';
        weightInput.value = item.weight;
        weightInput.min = 0;
        weightInput.max = 10;
        weightInput.addEventListener('input', (e) => {
            let value = parseInt(e.target.value) || 0;
            if (value < 0) value = 0;
            if (value > 10) value = 10;
            items[index].weight = value;
            saveItems();
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-button';
        deleteBtn.textContent = '削除';
        deleteBtn.addEventListener('click', () => {
            if (items.length > 1) {
                items.splice(index, 1);
                saveItems();
                renderItems();
            }
        });
        
        row.appendChild(nameInput);
        row.appendChild(weightLabel);
        row.appendChild(weightInput);
        row.appendChild(deleteBtn);
        itemsList.appendChild(row);
    });
}

addItemBtn.addEventListener('click', () => {
    items.push({ name: `項目${items.length + 1}`, weight: 5 });
    saveItems();
    renderItems();
});

durationInput.addEventListener('input', saveSettings);
spinsInput.addEventListener('input', saveSettings);

loadItems();
renderItems();
