# Environment Configuration Guide

## 📁 ملفات Environment

### 🔧 Development (التطوير)
```env
# .env.development
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

### 🚀 Production (الإنتاج)
```env
# .env.production
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

---

## 🎯 كيفية الاستخدام

### Development Mode
```bash
npm run dev
# يستخدم: .env.development
# API URL: http://127.0.0.1:8000/api
```

### Production Build
```bash
npm run build
# يستخدم: .env.production
# API URL: https://api.yourdomain.com/api
```

---

## 🔄 الفرق بين Development و Production

| الميزة | Development | Production |
|--------|------------|------------|
| **Vite Proxy** | ✅ يعمل | ❌ لا يعمل |
| **Base URL** | من `.env.development` | من `.env.production` |
| **التشغيل** | `npm run dev` | `npm run build` → deploy |

---

## ⚙️ خيارات Production Deployment

### الخيار 1: Same Domain (نفس الدومين)
```nginx
# nginx.conf
server {
    listen 80;
    server_name yourdomain.com;
    
    # Frontend (Vue)
    location / {
        root /var/www/hwmix-bill/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API (Laravel)
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
**في هذه الحالة:**
```env
VITE_API_BASE_URL=/api
```

### الخيار 2: Subdomain (دومين فرعي)
```nginx
# api.yourdomain.com
server {
    listen 80;
    server_name api.yourdomain.com;
    root /var/www/hwmix-bill-api/public;
    # Laravel config...
}

# yourdomain.com
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/hwmix-bill/dist;
    # Vue config...
}
```
**في هذه الحالة:**
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

---

## 📝 ملاحظات مهمة

1. **الـ Vite Proxy في vite.config.js:**
   - يعمل فقط في Development (`npm run dev`)
   - يمكن تركه كما هو - لا يؤثر على Production

2. **Environment Variables:**
   - يجب أن تبدأ بـ `VITE_` لتكون accessible في الكود
   - يتم تحميلها تلقائياً حسب الـ mode

3. **CORS في Production:**
   - تأكد من إعداد CORS في Laravel للـ domain الخاص بك
   - ملف: `config/cors.php`

---

## 🔐 Security Tips

1. **لا ترفع `.env` على Git:**
   ```gitignore
   .env
   .env.local
   .env.*.local
   ```

2. **استخدم `.env.example` كنموذج:**
   - انسخها إلى `.env` للتطوير المحلي
   - لا تضع بيانات حساسة فيها

3. **في Production:**
   - استخدم HTTPS فقط
   - فعّل CORS بشكل صحيح
   - استخدم environment variables من الـ server
