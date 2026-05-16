<template>
  <div class="saas-page" dir="rtl">
    <!-- Navbar -->
    <nav class="saas-nav">
      <div class="nav-inner">
        <div class="brand">
          <div class="brand-logo">
            <span class="logo-h">H</span>
          </div>
          <div class="brand-text-group">
            <span class="brand-name">HWNiX</span>
            <span class="brand-tagline">الثقة في كل اختيار</span>
          </div>
          <span class="brand-badge">SaaS</span>
        </div>
        <div class="nav-links">
          <router-link to="/" class="nav-link">المتجر</router-link>
          <a href="#features" class="nav-link">المميزات</a>
          <a href="#pricing" class="nav-link">الأسعار</a>
          <router-link to="/login" class="btn-ghost">دخول</router-link>
          <router-link to="/register?type=tenant" class="btn-primary-nav">ابدأ مجاناً ←</router-link>
        </div>
        <button class="menu-toggle" @click="mobileDrawer = !mobileDrawer">☰</button>
      </div>
    </nav>

    <!-- Mobile Menu -->
    <div v-if="mobileDrawer" class="mobile-menu">
      <router-link to="/login" class="mobile-link" @click="mobileDrawer=false">دخول</router-link>
      <router-link to="/register?type=tenant" class="btn-primary-full" @click="mobileDrawer=false">ابدأ مشروعك مجاناً</router-link>
    </div>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-badge">✦ النظام المحاسبي الأول للشركات العربية</div>
      <h1 class="hero-title">
        توقف عن إضاعة وقتك<br>
        <span class="highlight">ادر أعمالك بذكاء</span>
      </h1>
      <p class="hero-sub">
        نظام HWNix يوفر عليك ساعات يومياً — فواتير، مخازن، تقسيط، وتقارير مالية في مكان واحد آمن وسريع.
      </p>
      <div class="hero-cta">
        <router-link to="/register?type=tenant" class="btn-hero">ابدأ تجربتك المجانية ← </router-link>
        <a href="#features" class="btn-outline-hero">شاهد كيف يعمل</a>
      </div>
      <p class="hero-note">✓ بدون بطاقة ائتمان &nbsp;✓ إعداد في 5 دقائق &nbsp;✓ دعم فني 24/7</p>
    </section>

    <!-- Social Proof Bar -->
    <div class="proof-bar">
      <span>يثق بنا أكثر من</span>
      <strong>+100 شركة</strong>
      <span>في 5 دول عربية</span>
      <span class="stars">★★★★★ 4.9/5</span>
    </div>

    <!-- Features -->
    <section class="features" id="features">
      <div class="section-header">
        <h2>كل ما تحتاجه في مكان واحد</h2>
        <p>لا تحتاج 5 أنظمة مختلفة — HWNix يغطي كل شيء</p>
      </div>
      <div class="features-grid">
        <div v-for="f in features" :key="f.title" class="feature-card">
          <div class="feature-icon">{{ f.icon }}</div>
          <h3>{{ f.title }}</h3>
          <p>{{ f.desc }}</p>
          <div class="feature-benefit">✓ {{ f.benefit }}</div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="how-it-works">
      <div class="section-header light">
        <h2>ابدأ خلال 5 دقائق فقط</h2>
        <p>أبسط نظام تسجيل في السوق</p>
      </div>
      <div class="steps-grid">
        <div v-for="(s, i) in steps" :key="i" class="step-item">
          <div class="step-num">{{ i + 1 }}</div>
          <h4>{{ s.title }}</h4>
          <p>{{ s.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="stats-section">
      <div class="stats-grid">
        <div v-for="s in stats" :key="s.label" class="stat-item">
          <div class="stat-value">{{ s.value }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="testimonials">
      <div class="section-header">
        <h2>ماذا يقول عملاؤنا؟</h2>
      </div>
      <div class="testimonials-grid">
        <div v-for="t in testimonials" :key="t.name" class="testimonial-card">
          <div class="stars-sm">★★★★★</div>
          <p>"{{ t.text }}"</p>
          <div class="testimonial-author">
            <strong>{{ t.name }}</strong>
            <span>{{ t.role }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="final-cta" id="pricing">
      <h2>جاهز لتحويل طريقة إدارة أعمالك؟</h2>
      <p>انضم الآن واحصل على شهر مجاني بدون أي التزامات</p>
      <router-link to="/register?type=tenant" class="btn-hero-lg">ابدأ مشروعك الآن مجاناً ←</router-link>
      <div class="cta-guarantees">
        <span>✓ إلغاء في أي وقت</span>
        <span>✓ بياناتك محمية 100%</span>
        <span>✓ دعم فني مخصص</span>
      </div>
    </section>

    <!-- Footer -->
    <footer class="saas-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <span class="brand-icon">⚡</span>
          <strong>HWNix Solutions</strong>
        </div>
        <div class="footer-links">
          <router-link to="/">المتجر الرئيسي</router-link>
          <router-link to="/login">تسجيل الدخول</router-link>
        </div>
        <div class="footer-copy">© {{ new Date().getFullYear() }} HWNix — جميع الحقوق محفوظة</div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const mobileDrawer = ref(false);

const features = [
  { icon: '🧾', title: 'فواتير احترافية في ثوانٍ', desc: 'أصدر فواتير ضريبية نظامية مع QR والباركود بضغطة واحدة.', benefit: 'وفّر 3 ساعات يومياً على إدارة الفواتير' },
  { icon: '📦', title: 'مخزن تحت السيطرة دائماً', desc: 'تتبع المنتجات والمستودعات لحظة بلحظة مع تنبيهات النفاد.', benefit: 'لا خسائر بسبب نقص أو زيادة المخزون' },
  { icon: '💳', title: 'تقسيط ذكي بدون متاعب', desc: 'جدولة آلية للأقساط مع تذكيرات تلقائية للعملاء.', benefit: 'حصّل ديونك أسرع بنسبة 40%' },
  { icon: '📊', title: 'قرارات بالأرقام لا بالتخمين', desc: 'تقارير مالية لحظية — أرباح، تدفق نقدي، وضرائب.', benefit: 'اعرف وضعك المالي في أي لحظة' },
  { icon: '👥', title: 'فريقك بصلاحيات دقيقة', desc: 'أضف موظفين وحدد صلاحيات كل شخص بدقة متناهية.', benefit: 'أمان كامل وتحكم تام في بياناتك' },
  { icon: '🔒', title: 'أمان بنكي لبياناتك', desc: 'تشفير كامل وحماية متعددة الطبقات لجميع بياناتك.', benefit: 'نومك هادئ وبياناتك محمية' },
];

const steps = [
  { title: 'سجّل شركتك', desc: 'أدخل اسم شركتك وبياناتك الأساسية خلال دقيقتين.' },
  { title: 'خصّص نظامك', desc: 'أضف منتجاتك وموظفيك والفروع بسهولة تامة.' },
  { title: 'ابدأ الإدارة الذكية', desc: 'أصدر فواتير، تابع المخزون، وراجع تقاريرك فوراً.' },
];

const stats = [
  { value: '+100', label: 'شركة تثق بنا' },
  { value: '+1M', label: 'فاتورة صدرت' },
  { value: '99.9%', label: 'وقت تشغيل مضمون' },
  { value: '24/7', label: 'دعم فني متاح' },
];

const testimonials = [
  { text: 'قبل HWNix كنت أضيع ساعات في الفواتير، الآن الأمر لا يأخذ دقائق. استثمار يستحق كل قرش.', name: 'أحمد الشمري', role: 'مدير مطعم — الرياض' },
  { text: 'نظام التقسيط رائع جداً، وفّر عليّ متابعة العملاء يدوياً وزاد تحصيلي بشكل ملحوظ.', name: 'سارة الزهراني', role: 'صاحبة محل أثاث — جدة' },
  { text: 'التقارير المالية ساعدتني أتخذ قرار توسعة فرعي الجديد بثقة. أنصح به بشدة.', name: 'خالد العتيبي', role: 'مدير شركة مقاولات — الكويت' },
];
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Montserrat:wght@400;600;700;800&display=swap');

* { box-sizing: border-box; }

.saas-page {
  font-family: 'Cairo', 'Montserrat', sans-serif;
  color: #1e293b;
  background: #fff;
  direction: rtl;
}

/* Navbar */
.saas-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e2e8f0;
}
.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand { display: flex; align-items: center; gap: 8px; }
.brand-icon { font-size: 1.4rem; }
.brand-name { font-size: 1.2rem; font-weight: 800; color: #312e81; }
.brand-badge { font-size: 0.65rem; background: #312e81; color: #fff; padding: 2px 8px; border-radius: 20px; font-weight: 700; }
.nav-links { display: flex; align-items: center; gap: 24px; }
.nav-link { text-decoration: none; color: #475569; font-weight: 600; font-size: 0.9rem; transition: color .2s; }
.nav-link:hover { color: #312e81; }
.btn-ghost { text-decoration: none; color: #312e81; font-weight: 700; padding: 8px 16px; border: 2px solid #312e81; border-radius: 8px; font-size: 0.9rem; transition: all .2s; }
.btn-ghost:hover { background: #312e81; color: #fff; }
.btn-primary-nav { text-decoration: none; background: #f59e0b; color: #fff; font-weight: 800; padding: 10px 20px; border-radius: 8px; font-size: 0.9rem; transition: all .2s; box-shadow: 0 4px 12px rgba(245,158,11,.35); }
.btn-primary-nav:hover { background: #d97706; transform: translateY(-1px); }
.menu-toggle { display: none; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #312e81; }

/* Mobile */
.mobile-menu { position: fixed; inset: 0; top: 65px; background: #fff; z-index: 99; display: flex; flex-direction: column; gap: 16px; padding: 32px 24px; border-top: 1px solid #e2e8f0; }
.mobile-link { text-decoration: none; color: #312e81; font-weight: 700; font-size: 1.1rem; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
.btn-primary-full { text-decoration: none; background: #f59e0b; color: #fff; font-weight: 800; padding: 16px; border-radius: 10px; text-align: center; font-size: 1rem; }

/* Hero */
.hero {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e40af 100%);
  color: #fff;
  text-align: center;
  padding: 100px 24px 80px;
}
.hero-badge { display: inline-block; background: rgba(245,158,11,.2); border: 1px solid rgba(245,158,11,.4); color: #fcd34d; padding: 6px 20px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; margin-bottom: 28px; }
.hero-title { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 900; line-height: 1.15; margin-bottom: 24px; letter-spacing: -1px; }
.highlight { color: #fcd34d; }
.hero-sub { font-size: 1.15rem; opacity: 0.88; max-width: 600px; margin: 0 auto 40px; line-height: 1.8; }
.hero-cta { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 24px; }
.btn-hero { text-decoration: none; background: #f59e0b; color: #fff; font-weight: 800; padding: 16px 36px; border-radius: 10px; font-size: 1.05rem; box-shadow: 0 8px 24px rgba(245,158,11,.5); transition: all .25s; }
.btn-hero:hover { background: #d97706; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(245,158,11,.6); }
.btn-outline-hero { text-decoration: none; border: 2px solid rgba(255,255,255,.5); color: #fff; font-weight: 700; padding: 16px 32px; border-radius: 10px; font-size: 1.05rem; transition: all .25s; }
.btn-outline-hero:hover { background: rgba(255,255,255,.1); border-color: #fff; }
.hero-note { font-size: 0.85rem; opacity: 0.7; letter-spacing: 0.5px; }

/* Proof Bar */
.proof-bar { background: #f8fafc; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 16px 24px; display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; font-size: 0.95rem; color: #475569; }
.proof-bar strong { color: #312e81; font-size: 1.1rem; }
.stars { color: #f59e0b; font-weight: 700; }

/* Features */
.features { padding: 80px 24px; max-width: 1200px; margin: 0 auto; }
.section-header { text-align: center; margin-bottom: 56px; }
.section-header h2 { font-size: 2rem; font-weight: 900; color: #1e1b4b; margin-bottom: 12px; }
.section-header p { color: #64748b; font-size: 1.05rem; }
.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
.feature-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; transition: all .3s; }
.feature-card:hover { border-color: #312e81; transform: translateY(-4px); box-shadow: 0 20px 40px rgba(49,46,129,.1); }
.feature-icon { font-size: 2.5rem; margin-bottom: 16px; }
.feature-card h3 { font-size: 1.15rem; font-weight: 800; color: #1e1b4b; margin-bottom: 10px; }
.feature-card p { color: #64748b; line-height: 1.7; font-size: 0.95rem; margin-bottom: 16px; }
.feature-benefit { font-size: 0.85rem; color: #16a34a; font-weight: 700; background: #f0fdf4; padding: 6px 12px; border-radius: 6px; display: inline-block; }

/* How it works */
.how-it-works { background: linear-gradient(135deg, #1e1b4b, #312e81); padding: 80px 24px; }
.section-header.light h2 { color: #fff; }
.section-header.light p { color: rgba(255,255,255,.75); }
.steps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 32px; max-width: 1000px; margin: 0 auto; }
.step-item { text-align: center; color: #fff; }
.step-num { width: 56px; height: 56px; background: #f59e0b; border-radius: 50%; font-size: 1.4rem; font-weight: 900; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 8px 20px rgba(245,158,11,.4); }
.step-item h4 { font-size: 1.1rem; font-weight: 800; margin-bottom: 10px; }
.step-item p { opacity: 0.8; font-size: 0.95rem; line-height: 1.7; }

/* Stats */
.stats-section { background: #f8fafc; padding: 64px 24px; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0; max-width: 900px; margin: 0 auto; text-align: center; }
.stat-item { padding: 32px 16px; border-left: 1px solid #e2e8f0; }
.stat-item:last-child { border-left: none; }
.stat-value { font-size: 2.5rem; font-weight: 900; color: #312e81; margin-bottom: 8px; }
.stat-label { color: #64748b; font-size: 0.95rem; font-weight: 600; }

/* Testimonials */
.testimonials { padding: 80px 24px; max-width: 1200px; margin: 0 auto; }
.testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
.testimonial-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; }
.stars-sm { color: #f59e0b; font-size: 1.1rem; margin-bottom: 16px; }
.testimonial-card p { color: #334155; line-height: 1.8; font-size: 0.95rem; margin-bottom: 20px; font-style: italic; }
.testimonial-author { display: flex; flex-direction: column; gap: 2px; }
.testimonial-author strong { color: #1e1b4b; font-size: 0.95rem; }
.testimonial-author span { color: #64748b; font-size: 0.85rem; }

/* Final CTA */
.final-cta { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 80px 24px; text-align: center; color: #fff; }
.final-cta h2 { font-size: 2rem; font-weight: 900; margin-bottom: 16px; }
.final-cta p { font-size: 1.05rem; opacity: 0.9; margin-bottom: 36px; }
.btn-hero-lg { text-decoration: none; background: #1e1b4b; color: #fff; font-weight: 800; padding: 18px 48px; border-radius: 12px; font-size: 1.1rem; display: inline-block; transition: all .25s; box-shadow: 0 8px 24px rgba(0,0,0,.25); }
.btn-hero-lg:hover { background: #312e81; transform: translateY(-2px); }
.cta-guarantees { margin-top: 24px; display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; font-size: 0.9rem; opacity: 0.9; font-weight: 600; }

/* Footer */
.saas-footer { background: #1e1b4b; padding: 32px 24px; }
.footer-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
.footer-brand { display: flex; align-items: center; gap: 8px; color: #fff; font-size: 1.05rem; }
.footer-links { display: flex; gap: 20px; }
.footer-links a { text-decoration: none; color: rgba(255,255,255,.65); font-size: 0.9rem; transition: color .2s; }
.footer-links a:hover { color: #fff; }
.footer-copy { color: rgba(255,255,255,.45); font-size: 0.8rem; }

/* Brand Logo */
.brand-logo {
  width: 38px; height: 38px;
  background: linear-gradient(135deg, #1A3D8F, #6A5AE0);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(26,61,143,.35);
  flex-shrink: 0;
}
.logo-h { color: #fff; font-size: 1.25rem; font-weight: 900; font-family: 'Montserrat', sans-serif; line-height: 1; }
.brand-text-group { display: flex; flex-direction: column; gap: 0; }
.brand-name { font-size: 1.1rem; font-weight: 900; color: #1A3D8F; font-family: 'Montserrat', sans-serif; line-height: 1.1; letter-spacing: -0.5px; }
.brand-tagline { font-size: 0.6rem; color: #6A5AE0; font-weight: 700; letter-spacing: 0.5px; }
.brand-badge { font-size: 0.6rem; background: linear-gradient(135deg, #1A3D8F, #6A5AE0); color: #fff; padding: 2px 8px; border-radius: 20px; font-weight: 700; align-self: flex-start; }

/* Color overrides */
.btn-ghost { border-color: #1A3D8F !important; color: #1A3D8F !important; }
.btn-ghost:hover { background: #1A3D8F !important; color: #fff !important; }
.btn-primary-nav { background: linear-gradient(135deg, #2D5DDB, #6A5AE0) !important; box-shadow: 0 4px 16px rgba(106,90,224,.4) !important; }
.btn-primary-nav:hover { background: linear-gradient(135deg, #1A3D8F, #2D5DDB) !important; box-shadow: 0 8px 24px rgba(106,90,224,.5) !important; }
.btn-primary-full { background: linear-gradient(135deg, #2D5DDB, #6A5AE0) !important; }

.hero { background: linear-gradient(140deg, #0d1b4b 0%, #1A3D8F 45%, #2D5DDB 75%, #6A5AE0 100%) !important; }
.hero-badge { background: rgba(106,90,224,.2) !important; border-color: rgba(106,90,224,.45) !important; color: #c4b5fd !important; }
.btn-hero { background: linear-gradient(135deg, #2D5DDB, #6A5AE0) !important; box-shadow: 0 8px 24px rgba(106,90,224,.5) !important; }
.btn-hero:hover { background: linear-gradient(135deg, #1A3D8F, #2D5DDB) !important; }
.highlight { background: linear-gradient(90deg, #c4b5fd, #93c5fd); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

.proof-bar { background: #F5F7FA !important; }
.proof-bar strong { color: #1A3D8F !important; }
.stars { color: #6A5AE0 !important; }

.section-header h2 { color: #1A3D8F !important; }
.feature-card:hover { border-color: #6A5AE0 !important; box-shadow: 0 20px 40px rgba(106,90,224,.12) !important; }
.feature-benefit { color: #2D5DDB !important; background: #eff6ff !important; }

.how-it-works { background: linear-gradient(140deg, #0d1b4b, #1A3D8F, #2D5DDB) !important; }
.step-num { background: linear-gradient(135deg, #2D5DDB, #6A5AE0) !important; box-shadow: 0 8px 20px rgba(106,90,224,.4) !important; }

.stat-value { color: #1A3D8F !important; }

.final-cta { background: linear-gradient(135deg, #1A3D8F, #2D5DDB, #6A5AE0) !important; }
.btn-hero-lg { background: #fff !important; color: #1A3D8F !important; }
.btn-hero-lg:hover { background: #F5F7FA !important; color: #1A3D8F !important; }

.saas-footer { background: #0d1b4b !important; }

/* Responsive */
@media (max-width: 768px) {
  .nav-links { display: none; }
  .menu-toggle { display: block; }
  .stat-item { border-left: none; border-bottom: 1px solid #e2e8f0; }
  .stat-item:last-child { border-bottom: none; }
  .footer-inner { flex-direction: column; text-align: center; }
}
</style>
