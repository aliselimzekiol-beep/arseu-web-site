// ARSEU Kulüp Yönetim Sistemi - JavaScript

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

// ========== LocalStorage Veri Yönetimi ==========
const DataStore = {
    shifts: JSON.parse(localStorage.getItem('arseu_shifts')) || {},
    workSchedule: JSON.parse(localStorage.getItem('arseu_work')) || {},
    news: JSON.parse(localStorage.getItem('arseu_news')) || [],
    projects: JSON.parse(localStorage.getItem('arseu_projects')) || [],
    ads: JSON.parse(localStorage.getItem('arseu_ads')) || [],
    currentWeek: parseInt(localStorage.getItem('arseu_week')) || 0,

    save() {
        localStorage.setItem('arseu_shifts', JSON.stringify(this.shifts));
        localStorage.setItem('arseu_work', JSON.stringify(this.workSchedule));
        localStorage.setItem('arseu_news', JSON.stringify(this.news));
        localStorage.setItem('arseu_projects', JSON.stringify(this.projects));
        localStorage.setItem('arseu_ads', JSON.stringify(this.ads));
        localStorage.setItem('arseu_week', this.currentWeek.toString());
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

    if (!DataStore.shifts[weekKey]) DataStore.shifts[weekKey] = {};
    if (!DataStore.shifts[weekKey][day]) DataStore.shifts[weekKey][day] = {};

    DataStore.shifts[weekKey][day][shiftNum] = person;
    DataStore.save();

    document.getElementById('shiftPerson').value = '';
    renderShifts();
    updateShiftSelectOptions();
    showToast('Nöbet başarıyla eklendi!');
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
    if (DataStore.shifts[weekKey] && DataStore.shifts[weekKey][day]) {
        delete DataStore.shifts[weekKey][day][shiftNum];
        DataStore.save();
        renderShifts();
        showToast('Nöbet silindi!');
    }
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

    // Kullanıcının başka bir teneffüsü var mı kontrol et
    const existingShift = Object.entries(DataStore.workSchedule).find(([_, worker]) => worker === name);
    if (existingShift) {
        const [oldShift] = existingShift;
        delete DataStore.workSchedule[oldShift];
        showToast(`Önceki seçiminiz (${shiftTimes[oldShift]}) iptal edildi.`);
    }

    DataStore.workSchedule[shiftNum] = name;
    DataStore.save();

    document.getElementById('workName').value = '';
    renderWorkSchedule();
    showToast('Çalışma teneffüsünüz seçildi!');
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

    DataStore.news.push({
        title,
        content,
        author,
        date: new Date().toISOString()
    });
    DataStore.save();

    document.getElementById('newsTitle').value = '';
    document.getElementById('newsContent').value = '';
    document.getElementById('newsAuthor').value = '';
    renderNews();
    showToast('Haber başarıyla yayınlandı!');
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
    DataStore.projects.push({
        title,
        description,
        technologies,
        author,
        link,
        date: new Date().toISOString()
    });
    DataStore.save();

    document.getElementById('projectTitle').value = '';
    document.getElementById('projectDesc').value = '';
    document.getElementById('projectTech').value = '';
    document.getElementById('projectAuthor').value = '';
    document.getElementById('projectLink').value = '';
    renderProjects();
    showToast('Proje başarıyla sunuldu!');
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
    
    const newAd = {
        id: 'ad_' + Date.now(),
        title,
        content,
        company,
        image,
        link,
        expiry,
        type,
        date: new Date().toISOString()
    };

    DataStore.ads.push(newAd);
    DataStore.save();

    document.getElementById('adTitle').value = '';
    document.getElementById('adContent').value = '';
    document.getElementById('adCompany').value = '';
    document.getElementById('adImage').value = '';
    document.getElementById('adLink').value = '';
    document.getElementById('adExpiry').value = '';
    document.getElementById('adType').value = 'sponsor';
    renderAds();
    showToast('Reklam başarıyla eklendi!');
}

function deleteAd(adId) {
    if (!confirm('Bu reklamı silmek istediğinize emin misiniz?')) return;

    DataStore.ads = DataStore.ads.filter(ad => ad.id !== adId);
    DataStore.save();
    renderAds();
    showToast('Reklam silindi!');
}

// ========== Başlatma ==========
function initApp() {
    renderShifts();
    renderWorkSchedule();
    renderNews();
    renderProjects();
    renderAds();
    updateShiftSelectOptions();
    ChatSystem.renderMessages();
    ChatSystem.clearOldMessages(); // Eski mesajları temizle

    const currentUser = sessionStorage.getItem('arseu_user');
}

document.addEventListener('DOMContentLoaded', () => {
    if (Auth.isLoggedIn()) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainContainer').style.display = 'flex';
        initApp();
    }
});

// ========== Mesajlaşma Sistemi ==========
const ChatSystem = {
    messages: JSON.parse(localStorage.getItem('arseu_chat')) || [],

    save() {
        localStorage.setItem('arseu_chat', JSON.stringify(this.messages));
    },

    addMessage(user, text) {
        this.messages.push({
            user: user,
            text: text,
            timestamp: Date.now()
        });
        // Sadece son 50 mesajı sakla
        if (this.messages.length > 50) {
            this.messages = this.messages.slice(-50);
        }
        this.save();
        this.renderMessages();
    },

    renderMessages() {
        const container = document.getElementById('groupChat');
        if (!container) return;

        container.innerHTML = this.messages.map(msg => `
            <div class="message group-message">
                <strong>${msg.user}:</strong> ${msg.text}
                <small style="display: block; color: #888; font-size: 0.75rem; margin-top: 5px;">
                    ${new Date(msg.timestamp).toLocaleTimeString('tr-TR')}
                </small>
            </div>
        `).join('');

        // En son mesaja kaydır
        container.scrollTop = container.scrollHeight;
    },

    clearOldMessages() {
        // 24 saatten eski mesajları temizle
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        this.messages = this.messages.filter(msg => msg.timestamp > oneDayAgo);
        this.save();
    }
};

function sendGroupMessage() {
    const input = document.getElementById('groupMessage');
    const text = input.value.trim();
    const user = sessionStorage.getItem('arseu_user') || 'Misafir';

    if (!text) {
        showToast('Lütfen bir mesaj yazın!', 'error');
        return;
    }

    ChatSystem.addMessage(user, text);
    input.value = '';
}

// ========== ARSEU AI Asistan ==========
const ARSEUAI = {
    // AI yanıtları için basit bir knowledge base
    knowledge: {
        'merhaba': 'Merhaba! ARSEU ailesine hoş geldiniz. Bugün size nasıl yardımcı olabilirim?',
        'nasılsın': 'Harikayım, teşekkür ederim! Sizler için buradayım.',
        'nöbet': 'Satış nöbetleri haftalık olarak düzenlenir. Her teneffüs için bir kişi görev alır. Nöbet almak için Satış Nöbetleri sekmesine gidebilirsiniz.',
        'satış': 'Satış nöbetlerimiz Pazartesi-Cuma arası 7 teneffüstür. Her teneffüste 1 kişi görev alır.',
        'teneffüs': 'Okulumuzda 7 teneffüs vardır: 08:40, 10:00, 11:20, 12:40, 14:00, 15:20, 16:40',
        'cuma': 'Cuma günleri altı saat ders vardır ve çalışma programı için Cuma Altı sekmesinden teneffüs seçebilirsiniz.',
        'çalışma': 'Cuma altı çalışma programı için kendi teneffüsünüzü seçebilirsiniz. Her teneffüs bir kişiyle sınırlıdır.',
        'ai': 'AI Projeleri sekmesinden yapay zeka projelerimizi görebilir ve kendi projenizi sunabilirsiniz.',
        'yapay zeka': 'AI Projeleri sekmesinden yapay zeka ile geliştirilen projeleri keşfedebilirsiniz.',
        'proje': 'Yeni bir AI projesi sunmak için AI Projeleri sekmesine gidin. Projelerinizi tüm kulüp üyeleri görebilir.',
        'haber': 'Haberler sekmesinden kulübümüzün son duyurularını takip edebilirsiniz.',
        'duyuru': 'Haberler sekmesinden tüm duyurulara ulaşabilirsiniz.',
        'reklam': 'Reklamlar sekmesinden sponsorlarımızı ve ilanları görebilirsiniz.',
        'sponsor': 'Reklam panosundan kulübümüzün sponsorlarını görebilirsiniz.',
        'saat': () => `Şu an saat: ${new Date().toLocaleTimeString('tr-TR')}`,
        'tarih': () => `Bugün: ${new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
        'yardım': 'Size şunlar hakkında yardımcı olabilirim: nöbetler, satış, teneffüsler, cuma çalışması, AI projeleri, haberler, reklamlar. Sorularınızı Türkçe yazabilirsiniz.',
        'help': 'Yardım menüsü: nöbet, satış, teneffüs, cuma, çalışma, ai, proje, haber, duyuru, reklam, sponsor',
        'teşekkür': 'Rica ederim! Başka bir konuda yardıma ihtiyacınız var mı?',
        'görüşürüz': 'Görüşürüz! İyi günler dilerim. 👋',
        'bay': 'Hoşça kalın! Tekrar görüşmek üzere. 👋',
        'selam': 'Selam! Nasıl yardımcı olabilirim?'
    },

    // Yanıt üret
    generateResponse(input) {
        const lowerInput = input.toLowerCase().trim();

        // Özel selamlama kontrolü
        if (lowerInput === 'selam' || lowerInput === 'selamün aleyküm') {
            return 'Aleyküm selam! ARSEU ailesine hoş geldiniz. Size nasıl yardımcı olabilirim?';
        }

        // Anahtar kelime eşleştirme
        for (let keyword in this.knowledge) {
            if (lowerInput.includes(keyword)) {
                const response = this.knowledge[keyword];
                // Eğer fonksiyon ise çalıştır
                if (typeof response === 'function') {
                    return response();
                }
                return response;
            }
        }

        // Varsayılan yanıtlar
        const defaultResponses = [
            'Bu konuda size yardımcı olmak isterdim ancak tam anlayamadım. "yardım" yazarak neler yapabileceğimi öğrenebilirsiniz.',
            'Üzgünüm, bu soruyu anlayamadım. Başka bir şekilde sorabilir misiniz?',
            'Hmm, bu konuda bilgim yetersiz. Size yardımcı olabileceğim başka konular: nöbetler, projeler, haberler...',
            'Anlayamadım, ama öğrenmeye çalışıyorum! Başka nasıl yardımcı olabilirim?'
        ];

        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
};

function sendAIMessage() {
    const input = document.getElementById('aiMessage');
    const text = input.value.trim();
    const user = sessionStorage.getItem('arseu_user') || 'Misafir';

    if (!text) {
        showToast('Lütfen bir soru yazın!', 'error');
        return;
    }

    const container = document.getElementById('aiChat');

    // Kullanıcı mesajını ekle
    container.innerHTML += `
        <div class="message user-message">
            <strong>${user}:</strong> ${text}
        </div>
    `;

    // AI yanıtını üret ve ekle
    setTimeout(() => {
        const aiResponse = ARSEUAI.generateResponse(text);
        container.innerHTML += `
            <div class="message ai-message">
                <strong>ARSEU AI:</strong> ${aiResponse}
            </div>
        `;
        container.scrollTop = container.scrollHeight;
    }, 500); // 0.5 saniye gecikme (düşünüyor hissi)

    input.value = '';
    container.scrollTop = container.scrollHeight;
}

// Enter tuşu ile mesaj gönderme
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('groupMessage')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendGroupMessage();
    });

    document.getElementById('aiMessage')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendAIMessage();
    });
});
