// GELİŞMİŞ ARSEU AI Asistan - ChatGPT+ Gemini Seviyesi
const ARSEUAI = {
    conversationHistory: JSON.parse(localStorage.getItem('arseu_ai_history')) || [],
    
    getUserName() {
        // Auth kontrolü
        if (typeof Auth === 'undefined' || !Auth) {
            console.error('Auth objesi bulunamadı!');
            return 'Misafir';
        }
        return Auth.getCurrentUserDisplayName();
    },
    
    saveHistory() {
        if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20);
        }
        localStorage.setItem('arseu_ai_history', JSON.stringify(this.conversationHistory));
    },
    
    addToHistory(role, message) {
        this.conversationHistory.push({
            role: role,
            message: message,
            timestamp: Date.now(),
            user: this.getUserName()
        });
        this.saveHistory();
    },

    generateResponse(input) {
        try {
            const lowerInput = input.toLowerCase().trim();
            const userName = this.getUserName();
            
            this.addToHistory('user', input);
        
        // Selamlama
        if (lowerInput.match(/^(merhaba|selam|hey|hi|hello)/)) {
            const hour = new Date().getHours();
            let greeting = hour < 12 ? 'Günaydın' : hour < 18 ? 'İyi günler' : 'İyi akşamlar';
            const responses = [
                `${greeting} ${userName}! 👋 ARSEU AI Asistanı olarak size yardımcı olmaktan mutluluk duyarım. Bugün nasıl yardımcı olabilirim?`,
                `Merhaba ${userName}! 🌟 Ben ARSEU'nun yapay zeka asistanıyım. Size nasıl destek olabilirim?`,
                `Selam ${userName}! 🚀 ARSEU Kulübü AI Asistanı olarak buradayım. Ne hakkında konuşmak istersiniz?`
            ];
            const response = responses[Math.floor(Math.random() * responses.length)];
            this.addToHistory('assistant', response);
            return response;
        }
        
        // Nöbet ve Satış
        if (lowerInput.match(/(nöbet|satış|teneffüs|vardiya)/)) {
            const response = `📅 **Satış Nöbetleri Sistemi**\n\nARSEU'da satış nöbetleri haftalık olarak düzenlenir:\n\n• **Günler:** Pazartesi - Cuma\n• **Teneffüs Sayısı:** 7 adet\n• **Her Teneffüs:** 1 kişi görev alır\n• **Teneffüs Saatleri:**\n  - 08:40, 10:00, 11:20, 12:40, 14:00, 15:20, 16:40\n\nNöbet almak için "Satış Nöbetleri" sekmesine gidebilirsiniz. ✨`;
            this.addToHistory('assistant', response);
            return response;
        }
        
        // Cuma Altı
        if (lowerInput.match(/(cuma|altı|çalışma programı)/)) {
            const response = `📚 **Cuma Altı Çalışma Programı**\n\nCuma günleri özel çalışma programımız:\n\n• **Ders Saati:** 6 saat (08:40 - 17:00)\n• **Teneffüs Seçimi:** Herkes kendi teneffüsünü seçebilir\n• **Kontenjan:** Her teneffüs için 1 kişi\n• **Seçim:** "Cuma Altı" sekmesinden yapılır\n\nKendi çalışma teneffüsünüzü seçmeyi unutmayın! 🎯`;
            this.addToHistory('assistant', response);
            return response;
        }
        
        // AI Projeleri
        if (lowerInput.match(/(ai|yapay zeka|proje|teknoloji)/)) {
            const response = `🤖 **AI Projeleri ve Yapay Zeka**\n\nARSEU'da yapay zeka çalışmaları:\n\n• **Proje Sunumu:** Kendi AI projenizi sunabilirsiniz\n• **Teknolojiler:** ChatGPT, Midjourney, Stable Diffusion vb.\n• **İnceleme:** Tüm projeleri görüntüleyebilirsiniz\n• **İşbirliği:** Başka projelere katılabilirsiniz\n\nYeni proje sunmak için "AI Projeleri" sekmesini ziyaret edin. 💡`;
            this.addToHistory('assistant', response);
            return response;
        }
        
        // Haberler
        if (lowerInput.match(/(haber|duyuru|bilgi|güncelleme)/)) {
            const response = `📰 **Haberler ve Duyurular**\n\nKulübümüzden son haberler:\n\n• **Haber Ekleme:** Yetkili kullanıcılar haber ekleyebilir\n• **Takip:** Tüm duyuruları görüntüleyebilirsiniz\n• **Kategoriler:** Etkinlikler, duyurular, önemli bilgiler\n\n"Haberler" sekmesinden güncellemeleri takip edebilirsiniz. 📢`;
            this.addToHistory('assistant', response);
            return response;
        }
        
        // Reklamlar
        if (lowerInput.match(/(reklam|sponsor|ilan|etkinlik)/)) {
            const response = `📢 **Reklam ve Sponsorluk**\n\nReklam panomuz:\n\n• **Türler:** Sponsor, İlan, Duyuru, Etkinlik\n• **Görsel:** Reklamlara fotoğraf eklenebilir\n• **Bitiş Tarihi:** Otomatik sona erme özelliği\n• **Sponsorlar:** Kulübümüzün destekçileri\n\n"Reklamlar" sekmesinden tüm ilanları görebilirsiniz. 💼`;
            this.addToHistory('assistant', response);
            return response;
        }
        
        // Mesajlaşma
        if (lowerInput.match(/(mesaj|chat|sohbet|konuşma|iletişim)/)) {
            const response = `💬 **Mesajlaşma Sistemi**\n\nGrup sohbet özellikleri:\n\n• **Genel Sohbet:** Tüm üyelerle iletişim\n• **24 Saat:** Mesajlar 24 saat saklanır\n• **AI Asistan:** Ben de sohbete katılabilirim\n• **Enter:** Hızlı mesaj gönderme\n\n"Mesajlar & AI" sekmesinden sohbete katılın. 🗨️`;
            this.addToHistory('assistant', response);
            return response;
        }
        
        // Zaman
        if (lowerInput.match(/(saat|zaman|tarih|bugün|gün)/)) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('tr-TR');
            const dateStr = now.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const response = `⏰ **Güncel Zaman Bilgisi**\n\n🕐 **Saat:** ${timeStr}\n📅 **Tarih:** ${dateStr}\n\nTürkiye saati (UTC+3) gösterilmektedir. ⏱️`;
            this.addToHistory('assistant', response);
            return response;
        }
        
        // Yardım
        if (lowerInput.match(/(yardım|help|nasıl|ne yapabilirsin|yeteneklerin)/)) {
            const response = `🆘 **ARSEU AI Asistan - Yardım Menüsü**

**Konuşabileceğim konular:**

📅 Nöbetler ve satış sistemleri
📚 Cuma altı çalışma programı
🤖 AI projeleri ve yapay zeka
📰 Haberler ve duyurular
📢 Reklamlar ve sponsorluklar
💬 Mesajlaşma ve sohbet
⏰ Saat ve tarih bilgisi
👤 Hesap yönetimi

**Özel Komutlar:**
• "merhaba" - Selamlaşma
• "nasılsın" - Hal hatır sorma
• "teşekkür" - Teşekkür etme
• "görüşürüz" - Vedalaşma
• **"reklam oluştur" - AI otomatik reklam yaratır**

Sorularınızı doğal dilde sorabilirsiniz! 💬`;
            this.addToHistory('assistant', response);
            return response;
        }
        
        // Kişisel bilgiler
        if (lowerInput.match(/(adım|ben kimim|profilim|hesabım)/)) {
            const response = `👤 **Kullanıcı Bilgileriniz**\n\n• **Adınız:** ${userName}\n• **Kulüp:** ARSEU\n• **Durum:** Aktif Üye\n\nSize ${userName} olarak hitap ediyorum. Başka nasıl yardımcı olabilirim? 😊`;
            this.addToHistory('assistant', response);
            return response;
        }
        
        // Teşekkür
        if (lowerInput.match(/(teşekkür|sağol|eyvallah|harika|mükemmel)/)) {
            const responses = [
                `Rica ederim ${userName}! 😊 Başka bir konuda yardıma ihtiyacınız var mı?`,
                `Ne demek ${userName}! 🌟 Size yardımcı olabildiğim için mutluyum.`,
                `Çok teşekkürler ${userName}! 🎯 Size hizmet etmek benim için bir onur.`
            ];
            const response = responses[Math.floor(Math.random() * responses.length)];
            this.addToHistory('assistant', response);
            return response;
        }
        
        // Vedalaşma
        if (lowerInput.match(/(görüşürüz|bay|hoşça kal|allah ısmarladık)/)) {
            const responses = [
                `Görüşürüz ${userName}! 👋 İyi günler dilerim. Tekrar beklerim!`,
                `Hoşça kal ${userName}! 🌟 Kendine iyi bak. Bir sonraki konuşmamıza kadar!`,
                `Güle güle ${userName}! 🚀 Yeni projelerde görüşmek üzere!`
            ];
            const response = responses[Math.floor(Math.random() * responses.length)];
            this.addToHistory('assistant', response);
            return response;
        }
        
        // Şaka
        if (lowerInput.match(/(şaka|eğlence|komik|espri)/)) {
            const jokes = [
                `Neden bilgisayarlar çay demleyemez? Çünkü çok fazla "byte" alır! 😄 ${userName}, umarım gülersiniz!`,
                `Bir programcı neden soğuk algınlığına yakalanmaz? Çünkü her zaman "C++" ile başlar! 🤣`,
                `Yapay zeka ile ilgili en iyi şey ne biliyor musunuz ${userName}? Asla "ctrl+alt+delete" yapmamam! 😎`
            ];
            const response = jokes[Math.floor(Math.random() * jokes.length)];
            this.addToHistory('assistant', response);
            return response;
        }
        
        // Motivasyon
        if (lowerInput.match(/(motivasyon|başarı|çalış|öğren)/)) {
            const quotes = [
                `"Başarı, küçük çabaların tekrar tekrar toplanmasıdır." ${userName}, bugün ne öğrenmek istersiniz? 🎯`,
                `"Yapay zeka geleceği şekillendiriyor ve siz bu geleceğin bir parçasısınız!" 🚀`,
                `"Her büyük proje küçük bir adımla başlar." ${userName}, başlamak için en iyi zaman şimdi! 💡`
            ];
            const response = quotes[Math.floor(Math.random() * quotes.length)];
            this.addToHistory('assistant', response);
            return response;
        }
        
        // AI Hakkında
        if (lowerInput.match(/(sen nesin|sen kimsin|ai mısın|bot musun)/)) {
            const response = `🤖 **Ben Kimim?**\n\nBen ARSEU AI Asistanıyım!\n\n**Özelliklerim:**\n• 💬 Doğal dil işleme\n• 🧠 Bağlamsal hafıza\n• 🎯 Kişiselleştirilmiş yanıtlar\n• ⚡ Anlık yanıt üretme\n• 📚 ARSEU bilgi tabanı erişimi\n• 📢 Otomatik reklam oluşturma\n\nSizin için buradayım! Size nasıl yardımcı olabilirim? ✨`;
            this.addToHistory('assistant', response);
            return response;
        }
        
        // Reklam Oluşturma
        if (lowerInput.match(/(reklam oluştur|reklam yap|yeni reklam|ilan oluştur)/)) {
            return this.createAdvertisement(userName);
        }
        
        // Varsayılan yanıt
        const defaultResponses = [
            `${userName}, bu konuda size yardımcı olmak isterdim ancak henüz bu konuyu öğreniyorum. 🤔\n\nSize yardımcı olabileceğim konular:\n• Satış nöbetleri\n• Cuma altı çalışması\n• AI projeleri\n• Haberler ve duyurular\n• Mesajlaşma sistemi\n\n"yardım" yazarak tüm yeteneklerimi görebilirsiniz!`,
            
            `Üzgünüm ${userName}, tam olarak anlayamadım. 😅\n\nAncak şu konularda uzmanım:\n📅 Nöbet sistemi\n📚 Cuma çalışmaları\n🤖 Yapay zeka projeleri\n💬 Sohbet ve iletişim\n\nBaşka nasıl yardımcı olabilirim?`,
            
            `${userName}, ilginç bir soru! 💭\n\nHenüz bu konuda bilgi sahibi değilim ama öğrenmeye açığım. Şu anda size şunlar hakkında yardımcı olabilirim:\n\n• ARSEU kulüp işlemleri\n• Nöbet ve çalışma sistemleri\n• Proje yönetimi\n• Genel bilgiler\n\nBaşka bir şey sormak ister misiniz?`
        ];
        
        const response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
        this.addToHistory('assistant', response);
        return response;
        
        } catch (error) {
            console.error('AI Hatası:', error);
            return `Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin. (Hata: ${error.message})`;
        }
    },
    
    // Reklam Oluşturma Fonksiyonu
    createAdvertisement(userName) {
        const ads = [
            {
                title: "🎓 ARSEU Eğitim Programı",
                content: "Yapay zeka ve teknoloji eğitimlerimize katılın! Uzman eğitmenlerle geleceği şekillendirin.",
                company: "ARSEU Akademi",
                type: "duyuru"
            },
            {
                title: "☕ Kahve Molası",
                content: "Tenefüslerde taze kahve ve atıştırmalıklar! %20 indirimli fiyatlarla sizleri bekliyoruz.",
                company: "ARSEU Kafeterya",
                type: "sponsor"
            },
            {
                title: "📚 Ders Notları",
                content: "Tüm derslerin özet notları ve çalışma materyalleri ARSEU platformunda! Ücretsiz erişim.",
                company: "ARSEU Eğitim",
                type: "ilan"
            },
            {
                title: "🚀 Kariyer Günleri",
                content: "Sektörün önde gelen firmaları ile tanışma fırsatı! CV hazırlama workshopları ve mülakat simülasyonları.",
                company: "ARSEU Kariyer",
                type: "etkinlik"
            },
            {
                title: "💻 Laptop Kampanyası",
                content: "Öğrencilere özel laptop indirimleri! Teknoloji partnerlerimizden %15 ek indirim.",
                company: "TechStore",
                type: "sponsor"
            },
            {
                title: "🎯 Proje Yarışması",
                content: "En iyi AI projesi ödülü: 5000 TL! Başvurular başladı. Son tarih: 30 Haziran.",
                company: "ARSEU Yönetim",
                type: "etkinlik"
            },
            {
                title: "📱 Mobil Uygulama",
                content: "ARSEU artık cebinizde! Mobil uygulamamızı indirin, tüm özelliklere anında erişin.",
                company: "ARSEU Tech",
                type: "duyuru"
            },
            {
                title: "🤝 Mentorluk Programı",
                content: "Deneyimli üyelerden birebir mentorluk! Kariyerinizi hızlandırın.",
                company: "ARSEU Gelişim",
                type: "ilan"
            }
        ];
        
        // Rastgele bir reklam seç
        const selectedAd = ads[Math.floor(Math.random() * ads.length)];
        
        // Reklam objesini oluştur
        const newAd = {
            id: 'ad_' + Date.now(),
            title: selectedAd.title,
            content: selectedAd.content,
            company: selectedAd.company,
            image: null,
            link: null,
            expiry: null,
            type: selectedAd.type,
            date: new Date().toISOString(),
            createdBy: userName,
            isAutoGenerated: true
        };
        
        // DataStore'a ekle
        if (typeof DataStore !== 'undefined') {
            DataStore.ads.push(newAd);
            DataStore.save();
            
            // Eğer renderAds fonksiyonu varsa çağır
            if (typeof renderAds === 'function') {
                renderAds();
            }
            
            const response = `📢 **Reklam Oluşturuldu!**\n\n**${selectedAd.title}**\n\n${selectedAd.content}\n\n🏢 **Firma:** ${selectedAd.company}\n🏷️ **Tür:** ${selectedAd.type.toUpperCase()}\n👤 **Oluşturan:** ${userName} (AI tarafından otomatik)\n\n✅ Reklam başarıyla yayınlandı! Reklamlar sekmesinden görüntüleyebilirsiniz.`;
            
            this.addToHistory('assistant', response);
            return response;
        } else {
            const response = `❌ Üzgünüm ${userName}, şu anda reklam oluşturma sistemi aktif değil. Lütfen daha sonra tekrar deneyin.`;
            this.addToHistory('assistant', response);
            return response;
        }
    },
    
    clearHistory() {
        this.conversationHistory = [];
        localStorage.removeItem('arseu_ai_history');
    }
};