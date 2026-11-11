
const desktop = document.getElementById("desktop");
const taskApps = document.getElementById("taskApps");

let zIndex = 20;
let windowCount = 0;

const notesKey = "webos_notes";

function toggleMenu() {

    const menu = document.getElementById("startMenu");

    menu.style.display =
        menu.style.display === "block" ? "none" : "block";
}

function updateClock() {

    const now = new Date();

    document.getElementById("time").textContent =
        now.toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit"
        });

    document.getElementById("date").textContent =
        now.toLocaleDateString("ru-RU");
}

setInterval(updateClock, 1000);
updateClock();

// Создание окна
function createWindow(title, content, appName) {

    windowCount++;

    const win = document.createElement("div");

    win.className = "window";

    win.style.left = Math.max(10, 100 + windowCount * 20) + "px";
    win.style.top = Math.max(10, 80 + windowCount * 15) + "px";
    win.style.zIndex = ++zIndex;

    win.innerHTML = `
        <div class="window-header">
            <strong>${title}</strong>

            <div class="window-controls">
                <button class="minimize">−</button>
                <button class="maximize">□</button>
                <button class="close">×</button>
            </div>
        </div>

        <div class="window-content">
            ${content}
        </div>
    `;

    desktop.appendChild(win);

    const header = win.querySelector(".window-header");

    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    header.addEventListener("pointerdown", e => {

        if (e.target.closest("button")) return;

        dragging = true;

        const rect = win.getBoundingClientRect();

        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        win.style.zIndex = ++zIndex;

        header.setPointerCapture(e.pointerId);
    });

    header.addEventListener("pointermove", e => {

        if (!dragging || win.classList.contains("maximized")) return;

        const bounds = desktop.getBoundingClientRect();

        const x = e.clientX - bounds.left - offsetX;
        const y = e.clientY - bounds.top - offsetY;

        win.style.left =
            Math.max(0, Math.min(x, bounds.width - win.offsetWidth)) + "px";

        win.style.top =
            Math.max(0, Math.min(y, bounds.height - win.offsetHeight)) + "px";
    });

    header.addEventListener("pointerup", () => {
        dragging = false;
    });

    header.addEventListener("pointercancel", () => {
        dragging = false;
    });

    win.addEventListener("pointerdown", () => {
        win.style.zIndex = ++zIndex;
    });

    win.querySelector(".close").onclick = () => {

        win.remove();

        const task = document.getElementById("task-" + appName);

        if (task) task.remove();
    };

    win.querySelector(".minimize").onclick = () => {
        win.style.display = "none";
    };

    win.querySelector(".maximize").onclick = () => {

        win.classList.toggle("maximized");

    };

    const task = document.createElement("button");

    task.id = "task-" + appName;
    task.textContent = title;
    task.onclick = () => {

        win.style.display = "block";
        win.style.zIndex = ++zIndex;

    };

    taskApps.appendChild(task);

    return win;
}

// Приложения
function openApp(name) {

    document.getElementById("startMenu").style.display = "none";

    const apps = {

        files: {
            title: "📁 Файловый менеджер",
            content: `
                <h3>Мои файлы</h3>
                <br>
                <div class="file-item">📄 Документы</div>
                <div class="file-item">🖼️ Изображения</div>
                <div class="file-item">🎵 Музыка</div>
                <div class="file-item">📦 Загрузки</div>
                <p style="color:#aaa;margin-top:15px;font-size:12px">
                    Это демонстрационный файловый менеджер.
                </p>
            `
        },

        notes: {
            title: "📝 Заметки",
            content: `
                <h3>Мои заметки</h3>
                <br>
                <textarea id="noteText" placeholder="Пиши здесь..."></textarea>
                <br><br>
                <button class="app-button" onclick="saveNotes()">
                    💾 Сохранить
                </button>
                <p id="noteStatus" style="margin-top:10px"></p>
            `
        },

        calculator: {
            title: "🧮 Калькулятор",
            content: `
                <div class="calc-display" id="calcDisplay">0</div>

                <div class="calc-grid">
                    <button onclick="calcClear()">C</button>
                    <button onclick="calcAdd('(')">(</button>
                    <button onclick="calcAdd(')')">)</button>
                    <button onclick="calcAdd('/')">÷</button>

                    <button onclick="calcAdd('7')">7</button>
                    <button onclick="calcAdd('8')">8</button>
                    <button onclick="calcAdd('9')">9</button>
                    <button onclick="calcAdd('*')">×</button>

                    <button onclick="calcAdd('4')">4</button>
                    <button onclick="calcAdd('5')">5</button>
                    <button onclick="calcAdd('6')">6</button>
                    <button onclick="calcAdd('-')">−</button>

                    <button onclick="calcAdd('1')">1</button>
                    <button onclick="calcAdd('2')">2</button>
                    <button onclick="calcAdd('3')">3</button>
                    <button onclick="calcAdd('+')">+</button>

                    <button onclick="calcAdd('0')">0</button>
                    <button onclick="calcAdd('.')">.</button>
                    <button onclick="calcBack()">⌫</button>
                    <button onclick="calcResult()">=</button>
                </div>
            `
        },

        browser: {
            title: "🌐 Быстрый браузер",
            content: `
                <h3>Открыть сайт</h3>
                <input id="urlInput" placeholder="Например: https://example.com">
                <button class="app-button" onclick="openWebsite()">
                    Открыть
                </button>
                <p class="browser-note">
                    Сайты откроются в новой вкладке браузера.
                </p>
            `
        },

        music: {
            title: "🎵 Музыкальный плеер",
            content: `
                <h3>Моя музыка</h3>
                <br>
                <input type="file" id="musicFile" accept="audio/*">
                <br><br>
                <audio id="audioPlayer" controls style="width:100%">
                </audio>
                <p style="color:#aaa;margin-top:12px">
                    Выбери аудиофайл на своём устройстве.
                </p>
            `
        },

        settings: {
            title: "⚙️ Настройки",
            content: `
                <h3>Настройки рабочего стола</h3>
                <br>
                <p>Выбери цвет фона:</p>

                <button class="app-button"
                    onclick="changeBackground('purple')">
                    🟣 Фиолетовый
                </button>

                <button class="app-button"
                    onclick="changeBackground('blue')">
                    🔵 Синий
                </button>

                <button class="app-button"
                    onclick="changeBackground('green')">
                    🟢 Зелёный
                </button>

                <button class="app-button"
                    onclick="changeBackground('dark')">
                    ⚫ Тёмный
                </button>

                <br><br>
                <p>WEB OS v1.0</p>
            `
        }

    };

    if (!apps[name]) return;

    const win = createWindow(
        apps[name].title,
        apps[name].content,
        name
    );

    if (name === "notes") {

        const saved = localStorage.getItem(notesKey) || "";

        win.querySelector("#noteText").value = saved;

    }

    if (name === "music") {

        const fileInput = win.querySelector("#musicFile");

        const player = win.querySelector("#audioPlayer");

        fileInput.addEventListener("change", () => {

            const file = fileInput.files[0];

            if (file) {
                player.src = URL.createObjectURL(file);
                player.play();
            }

        });

    }

}

// Заметки
function saveNotes() {

    const text = document.getElementById("noteText").value;

    localStorage.setItem(notesKey, text);

    document.getElementById("noteStatus").textContent =
        "✅ Заметка сохранена!";

}

// Калькулятор
let calcExpression = "";

function calcAdd(value) {

    calcExpression += value;

    document.getElementById("calcDisplay").textContent =
        calcExpression;

}

function calcClear() {

    calcExpression = "";

    document.getElementById("calcDisplay").textContent = "0";

}

function calcBack() {

    calcExpression = calcExpression.slice(0, -1);

    document.getElementById("calcDisplay").textContent =
        calcExpression || "0";

}

function calcResult() {

    try {

        if (!/^[0-9+\-*/().\s]+$/.test(calcExpression)) {
            throw new Error("Недопустимое выражение");
        }

        const result = Function(
            '"use strict"; return (' + calcExpression + ')'
        )();

        if (!Number.isFinite(result)) {
            throw new Error("Ошибка вычисления");
        }

        calcExpression = String(result);

        document.getElementById("calcDisplay").textContent =
            calcExpression;

    } catch {

        document.getElementById("calcDisplay").textContent =
            "Ошибка";

        calcExpression = "";

    }

}

// Браузер
function openWebsite() {

    let url = document.getElementById("urlInput").value.trim();

    if (!url) return;

    if (!/^https?:\/\//i.test(url)) {
        url = "https://" + url;
    }

    try {
        const parsed = new URL(url);

        if (!["http:", "https:"].includes(parsed.protocol)) return;

        window.open(parsed.href, "_blank", "noopener");
    } catch {
        alert("Проверь адрес сайта.");
    }

}

// Обои
function changeBackground(color) {

    const backgrounds = {

        purple: "linear-gradient(135deg,#30135d,#7949bd,#12152c)",

        blue: "linear-gradient(135deg,#102c60,#176e9b,#101426)",

        green: "linear-gradient(135deg,#103d34,#20866b,#101426)",

        dark: "linear-gradient(135deg,#08080d,#202030,#08080d)"

    };

    desktop.style.background = backgrounds[color];

}

