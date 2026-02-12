// ARSEU Kulüp Yönetim Sistemi - JavaScript

// ========== Firebase Yapılandırması ==========
const firebaseConfig = {
    apiKey: "AIzaSyDummyKeyForDemo123456789",
    authDomain: "arseu-website.firebaseapp.com",
    databaseURL: "https://arseu-website-default-rtdb.firebaseio.com",
    projectId: "arseu-website",
    storageBucket: "arseu-website.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123def456"
};

// Firebase başlat
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ========== Online Kullanıcılar Sistemi ==========
const OnlineTracker = {
    currentUser: null,
    userRef: null,
    heartbeatInterval: null,
    
    init(username) {
        this.currentUser = username;
        const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.userRef = database.ref('onlineUsers/' + userId);
        
        // Kullanıcıyı online olarak işaretle
        this.userRef.set({
            username: username,
            joinedAt: firebase.database.ServerValue.TIMESTAMP,
            lastSeen: firebase.database.ServerValue.TIMESTAMP
        });
        
        // Sayfa kapatıldığında offline yap
        this.userRef.onDisconnect().remove();
        
        // Her 10 saniyede bir heartbeat gönder
        this.heartbeatInterval = setInterval(() => {
            this.userRef.update({
                lastSeen: firebase.database.ServerValue.TIMESTAMP
            });
        }, 10000);
        
        // Online kullanıcıları dinle
        this.listenToOnlineUsers();
    },
    
    listenToOnlineUsers() {
        const onlineRef = database.ref('onlineUsers');
        onlineRef.on('value', (snapshot) => {
            const users = snapshot.val();
            this.updateOnlineDisplay(users);
        });
    },
    
    updateOnlineDisplay(users) {
        const count = users ? Object.keys(users).length : 0;
        document.querySelector('.online-count').textContent = count;
        
        const listContainer = document.getElementById('onlineList');
        if (users) {
            const userList = Object.values(users);
            listContainer.innerHTML = userList.map(u => 
                `<div class="online-user">${u.username}</div>`
            ).join('');
        } else {
            listContainer.innerHTML = '<div class="online-user">Kimse online değil</div>';
        }
    },
    
    disconnect() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        if (this.userRef) {
            this.userRef.remove();
        }
    }
};

// ========== Giriş Sistemi ==========
const Auth = {
    users: JSON.parse(localStorage.getItem('arseu_users')) || [
        { username: 'arseu', password: '1234', role: 'admin' }
    ],
    
    isLoggedIn() {
        return sessionStorage.getItem('arseu_logged_in') === 'true';
    },
    
    login(username, password) {
        const user = this.users.find(u => u.username === username && u.password === password);
        if (user) {
            sessionStorage.setItem('arseu_logged_in', 'true');
            sessionStorage.setItem('arseu_user', username);
            return true;
        }
        return false;
    },
    
    logout() {
        OnlineTracker.disconnect();
        sessionStorage.removeItem('arseu_logged_in');
        sessionStorage.removeItem('arseu_user');
        window.location.reload();
    },
    
    addUser(username, password, role = 'user') {
        if (this.users.find(u => u.username === username)) {
            return false;
        }
        this.users.push({ username, password, role });
        localStorage.setItem('arseu_users', JSON.stringify(this.users));
        return true;
    }
};

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (Auth.login(username, password)) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainContainer').style.display = 'flex';
        initApp();
        OnlineTracker.init(username);
        showToast('Hoş geldiniz, ' + username + '!');
    } else {
        showToast('Kullanıcı adı veya şifre hatalı!', 'error');
        document.getElementById('password').value = '';
    }
}

// Sayfa yüklendiğinde kontrol
document.addEventListener('DOMContentLoaded', () => {
    if (Auth.isLoggedIn()) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainContainer').style.display = 'flex';
    }
});

// ========== Firebase Veri Yönetimi ==========
const DataStore = {
    shifts: {},
    workSchedule: {},
    news: [],
    projects: [],
    ads: [],
    currentWeek: 0,

    // Firebase referansları
    refs: {
        shifts: database.ref('shifts'),
        workSchedule: database.ref('workSchedule'),
        news: database.ref('news'),
        projects: database.ref('projects'),
        ads: database.ref('ads')
    },

    // Verileri dinlemeye başla
    init() {
        // Nöbetleri dinle
        this.refs.shifts.on('value', (snapshot) => {
            this.shifts = snapshot.val() || {};
            renderShifts();
            updateShiftSelectOptions();
        });

        // Çalışma programını dinle
        this.refs.workSchedule.on('value', (snapshot) => {
            this.workSchedule = snapshot.val() || {};
            renderWorkSchedule();
        });

        // Haberleri dinle
        this.refs.news.on('value', (snapshot) => {
            const newsData = snapshot.val();
            this.news = newsData ? Object.values(newsData) : [];
            renderNews();
        });

        // Projeleri dinle
        this.refs.projects.on('value', (snapshot) => {
            const projectsData = snapshot.val();
            this.projects = projectsData ? Object.values(projectsData) : [];
            renderProjects();
        });

        // Reklamları dinle
        this.refs.ads.on('value', (snapshot) => {
            const adsData = snapshot.val();
            this.ads = adsData ? Object.values(adsData) : [];
            renderAds();
        });
    },

    getShiftsForWeek(weekOffset) {
        const weekKey = this.getWeekKey(weekOffset);
        return this.shifts[weekKey] || {};
    },

    getWeekKey(offset) {
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (offset * 7)));
        return startOfWeek.toISOString().split('T')[0];
    }
};

// ========== Toast Bildirimleri ==========
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.4s ease reverse';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ========== Navigasyon ==========
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(btn.dataset.section).classList.add('active');
    });
});

// ========== Satış Nöbetleri ==========
const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];

function renderShifts() {
    const grid = document.getElementById('shiftsGrid');
    const currentShifts = DataStore.getShiftsForWeek(DataStore.currentWeek);
    
    document.getElementById('currentWeek').textContent = DataStore.currentWeek === 0 
        ? 'Bu Hafta' 
        : DataStore.currentWeek === 1 
            ? 'Gelecek Hafta' 
            : `${DataStore.currentWeek} Hafta Sonra`;
    
    grid.innerHTML = days.map(day => {
        const dayShifts = currentShifts[day] || {};
        return `
            <div class="day-card">
                <h3>${day}</h3>
                ${[1, 2, 3, 4, 5, 6, 7].map(num => {
                    const person = dayShifts[num];
                    return `
                        <div class="shift-item ${person ? 'assigned' : ''}">
                            <span class="shift-number">${num}. Teneffüs</span>
                            <span class="person-name">${person || '-'}</span>
                            ${person ? `<button class="delete-btn" onclick="deleteShift('${day}', ${num})">Sil</button>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }).join('');
}

function addShift() {
    const day = document.getElementById('shiftDay').value;
    const shiftNum = document.getElementById('shiftNumber').value;
    const person = document.getElementById('shiftPerson').value.trim();

    if (!person) {
        showToast('Lütfen bir isim girin!', 'error');
        return;
    }

    const weekKey = DataStore.getWeekKey(DataStore.currentWeek);

    // Firebase'e kaydet
    const shiftRef = database.ref(`shifts/${weekKey}/${day}/${shiftNum}`);
    shiftRef.set(person)
        .then(() => {
            document.getElementById('shiftPerson').value = '';
            showToast('Nöbet başarıyla eklendi!');
        })
        .catch((error) => {
            showToast('Hata: ' + error.message, 'error');
        });
}

// Form'daki teneffüs seçeneklerini güncelle (dolanları disabled yap)
function updateShiftSelectOptions() {
    const daySelect = document.getElementById('shiftDay');
    const shiftSelect = document.getElementById('shiftNumber');

    if (!daySelect || !shiftSelect) return;

    const day = daySelect.value;
    const weekKey = DataStore.getWeekKey(DataStore.currentWeek);
    const currentShifts = DataStore.shifts[weekKey]?.[day] || {};

    Array.from(shiftSelect.options).forEach(option => {
        const shiftNum = option.value;
        if (currentShifts[shiftNum]) {
            option.disabled = true;
            option.textContent = `${shiftNum}. Teneffüs - ${currentShifts[shiftNum]} (DOLU)`;
        } else {
            option.disabled = false;
            option.textContent = `${shiftNum}. Teneffüs`;
        }
    });
}

function deleteShift(day, shiftNum) {
    const weekKey = DataStore.getWeekKey(DataStore.currentWeek);
    database.ref(`shifts/${weekKey}/${day}/${shiftNum}`).remove()
        .then(() => showToast('Nöbet silindi!'))
        .catch((error) => showToast('Hata: ' + error.message, 'error'));
}

document.getElementById('prevWeek')?.addEventListener('click', () => {
    DataStore.currentWeek = Math.max(-4, DataStore.currentWeek - 1);
    renderShifts();
    updateShiftSelectOptions();
});

document.getElementById('nextWeek')?.addEventListener('click', () => {
    DataStore.currentWeek = Math.min(4, DataStore.currentWeek + 1);
    renderShifts();
    updateShiftSelectOptions();
});

// Gün değiştiğinde teneffüs seçeneklerini güncelle
document.getElementById('shiftDay')?.addEventListener('change', updateShiftSelectOptions);

// ========== Cuma Altı Çalışma ==========
const shiftTimes = {
    1: '08:40-09:00',
    2: '10:00-10:20',
    3: '11:20-11:40',
    4: '12:40-13:00',
    5: '14:00-14:20',
    6: '15:20-15:40',
    7: '16:40-17:00'
};

function renderWorkSchedule() {
    const container = document.getElementById('workSchedule');
    
    container.innerHTML = Object.entries(shiftTimes).map(([num, time]) => {
        const worker = DataStore.workSchedule[num];
        return `
            <div class="work-shift-item ${worker ? 'taken' : 'available'}">
                <div class="work-shift-info">
                    <span class="shift-time">${time}</span>
                    <span class="shift-status ${worker ? 'taken' : 'available'}">
                        ${worker ? 'Dolu' : 'Müsait'}
                    </span>
                </div>
                <span class="worker-name">${worker || '-'}</span>
            </div>
        `;
    }).join('');
}

function selectWorkShift() {
    const name = document.getElementById('workName').value.trim();
    const shiftNum = document.getElementById('workShift').value;

    if (!name) {
        showToast('Lütfen adınızı girin!', 'error');
        return;
    }

    // Eğer bu teneffüs doluysa uyarı ver
    if (DataStore.workSchedule[shiftNum]) {
        showToast('Bu teneffüs zaten dolu!', 'error');
        return;
    }

    const updates = {};

    // Kullanıcının başka bir teneffüsü var mı kontrol et
    const existingShift = Object.entries(DataStore.workSchedule).find(([_, worker]) => worker === name);
    if (existingShift) {
        const [oldShift] = existingShift;
        updates[`workSchedule/${oldShift}`] = null;
    }

    updates[`workSchedule/${shiftNum}`] = name;

    database.ref().update(updates)
        .then(() => {
            document.getElementById('workName').value = '';
            showToast('Çalışma teneffüsünüz seçildi!');
        })
        .catch((error) => showToast('Hata: ' + error.message, 'error'));
}

// ========== Haberler ==========
function renderNews() {
    const container = document.getElementById('newsList');
    
    if (DataStore.news.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888; padding: 40px;">Henüz haber bulunmuyor.</p>';
        return;
    }
    
    container.innerHTML = DataStore.news
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(news => `
            <div class="news-item">
                <h4>${news.title}</h4>
                <p>${news.content}</p>
                <div class="news-meta">
                    <span class="news-author">${news.author}</span>
                    <span class="news-date">${new Date(news.date).toLocaleDateString('tr-TR')}</span>
                </div>
            </div>
        `).join('');
}

function addNews() {
    const title = document.getElementById('newsTitle').value.trim();
    const content = document.getElementById('newsContent').value.trim();
    const author = document.getElementById('newsAuthor').value.trim();

    if (!title || !content || !author) {
        showToast('Lütfen tüm alanları doldurun!', 'error');
        return;
    }

    const newsRef = database.ref('news').push();
    newsRef.set({
        title,
        content,
        author,
        date: new Date().toISOString()
    })
    .then(() => {
        document.getElementById('newsTitle').value = '';
        document.getElementById('newsContent').value = '';
        document.getElementById('newsAuthor').value = '';
        showToast('Haber başarıyla yayınlandı!');
    })
    .catch((error) => showToast('Hata: ' + error.message, 'error'));
}

// ========== AI Projeleri ==========
function renderProjects() {
    const container = document.getElementById('projectsGrid');
    
    if (DataStore.projects.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888; padding: 40px;">Henüz proje sunulmamış.</p>';
        return;
    }
    
    container.innerHTML = DataStore.projects
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(project => `
            <div class="project-card">
                <h4>${project.title}</h4>
                <p class="project-desc">${project.description}</p>
                ${project.technologies ? `
                    <div class="project-tech">
                        ${project.technologies.split(',').map(tech => 
                            `<span class="tech-tag">${tech.trim()}</span>`
                        ).join('')}
                    </div>
                ` : ''}
                <div class="project-meta">
                    <span class="project-author">${project.author}</span>
                    ${project.link ? `<a href="${project.link}" target="_blank" class="project-link">Projeyi Gör &rarr;</a>` : ''}
                </div>
            </div>
        `).join('');
}

function addProject() {
    const title = document.getElementById('projectTitle').value.trim();
    const description = document.getElementById('projectDesc').value.trim();
    const technologies = document.getElementById('projectTech').value.trim();
    const author = document.getElementById('projectAuthor').value.trim();
    const link = document.getElementById('projectLink').value.trim();
    
    if (!title || !description || !author) {
        showToast('Lütfen gerekli alanları doldurun!', 'error');
        return;
    }
    
    const projectRef = database.ref('projects').push();
    projectRef.set({
        title,
        description,
        technologies,
        author,
        link,
        date: new Date().toISOString()
    })
    .then(() => {
        document.getElementById('projectTitle').value = '';
        document.getElementById('projectDesc').value = '';
        document.getElementById('projectTech').value = '';
        document.getElementById('projectAuthor').value = '';
        document.getElementById('projectLink').value = '';
        showToast('Proje başarıyla sunuldu!');
    })
    .catch((error) => showToast('Hata: ' + error.message, 'error'));
}

// ========== Reklamlar ==========
function renderAds() {
    const container = document.getElementById('adsGrid');
    const now = new Date();
    
    // Süresi geçmemiş reklamları filtrele
    const activeAds = DataStore.ads.filter(ad => {
        if (!ad.expiry) return true;
        return new Date(ad.expiry) >= now;
    });
    
    if (activeAds.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888; padding: 40px;">Henüz aktif reklam bulunmuyor.</p>';
        return;
    }
    
    const typeColors = {
        sponsor: '#667eea',
        ilan: '#51cf66',
        duyuru: '#ffd93d',
        etkinlik: '#ff6b6b'
    };
    
    const typeLabels = {
        sponsor: 'Sponsor',
        ilan: 'İlan',
        duyuru: 'Duyuru',
        etkinlik: 'Etkinlik'
    };
    
    container.innerHTML = activeAds
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(ad => `
            <div class="ad-card">
                <div class="ad-type-badge" style="background: ${typeColors[ad.type] || '#667eea'}">
                    ${typeLabels[ad.type] || ad.type}
                </div>
                ${ad.image ? `<img src="${ad.image}" alt="${ad.title}" class="ad-image" onerror="this.style.display='none'">` : ''}
                <div class="ad-content">
                    <h4>${ad.title}</h4>
                    <p>${ad.content}</p>
                    <div class="ad-meta">
                        <span class="ad-company">${ad.company}</span>
                        ${ad.expiry ? `<span class="ad-expiry">Bitiş: ${new Date(ad.expiry).toLocaleDateString('tr-TR')}</span>` : ''}
                    </div>
                    ${ad.link ? `<a href="${ad.link}" target="_blank" class="ad-link">Detaylar &rarr;</a>` : ''}
                </div>
                <button class="ad-delete-btn" onclick="deleteAd('${ad.id}')">×</button>
            </div>
        `).join('');
}

function addAd() {
    const title = document.getElementById('adTitle').value.trim();
    const content = document.getElementById('adContent').value.trim();
    const company = document.getElementById('adCompany').value.trim();
    const image = document.getElementById('adImage').value.trim();
    const link = document.getElementById('adLink').value.trim();
    const expiry = document.getElementById('adExpiry').value;
    const type = document.getElementById('adType').value;
    
    if (!title || !content || !company) {
        showToast('Lütfen gerekli alanları doldurun!', 'error');
        return;
    }
    
    const adRef = database.ref('ads').push();
    adRef.set({
        id: adRef.key,
        title,
        content,
        company,
        image,
        link,
        expiry,
        type,
        date: new Date().toISOString()
    })
    .then(() => {
        document.getElementById('adTitle').value = '';
        document.getElementById('adContent').value = '';
        document.getElementById('adCompany').value = '';
        document.getElementById('adImage').value = '';
        document.getElementById('adLink').value = '';
        document.getElementById('adExpiry').value = '';
        document.getElementById('adType').value = 'sponsor';
        showToast('Reklam başarıyla eklendi!');
    })
    .catch((error) => showToast('Hata: ' + error.message, 'error'));
}

function deleteAd(adId) {
    if (!confirm('Bu reklamı silmek istediğinize emin misiniz?')) return;

    database.ref(`ads/${adId}`).remove()
        .then(() => showToast('Reklam silindi!'))
        .catch((error) => showToast('Hata: ' + error.message, 'error'));
}

// ========== Başlatma ==========
function initApp() {
    // Firebase veri dinleyicilerini başlat
    DataStore.init();
    updateShiftSelectOptions(); // Form'daki teneffüs seçeneklerini güncelle

    // Eğer kullanıcı zaten giriş yapmışsa, online tracker'ı başlat
    const currentUser = sessionStorage.getItem('arseu_user');
    if (currentUser) {
        OnlineTracker.init(currentUser);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (Auth.isLoggedIn()) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainContainer').style.display = 'flex';
        initApp();
    }
});

// Sayfa kapatıldığında online durumunu temizle
window.addEventListener('beforeunload', () => {
    OnlineTracker.disconnect();
});
