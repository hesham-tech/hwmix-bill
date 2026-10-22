// أداة ساعة الأطفال التعليمية التفاعلية لتعليم قراءة الوقت بالساعات الرقمية وساعة العقارب

<template>
  <div class="kids-clock-tool-wrapper">
    <!-- ترويسة الأداة -->
    <header class="tool-header-banner mb-6">
      <div class="header-emoji">🕐</div>
      <h1 class="text-h4 font-weight-black mb-2">ساعة الأطفال التعليمية</h1>
      <p class="subtitle mb-0">حرّك العقارب أو اكتب الوقت وشاهد السحر التفاعلي! ✨</p>
    </header>

    <div class="main-container">
      <!-- عمود ساعة العقارب -->
      <div class="clock-column">
        <div class="clock-toggle-bar">
          <div class="toggle-info">
            <span class="toggle-icon">{{ showAnalog ? '👁️' : '🙈' }}</span>
            <span class="toggle-title">ساعة العقارب</span>
          </div>
          <label class="switch" title="إظهار / إخفاء ساعة العقارب">
            <input type="checkbox" v-model="showAnalog" aria-label="إظهار أو إخفاء ساعة العقارب" />
            <span class="slider"></span>
          </label>
        </div>

        <!-- قسم الساعة العقارب -->
        <section class="clock-section analog-section">
          <h2 class="section-title">⏰ ساعة العقارب</h2>
          <p class="section-hint">اسحب أي عقرب لتغيير الوقت</p>

          <!-- ساعة العقارب المستهدفة بالإخفاء -->
          <div class="canvas-wrapper" :class="{ 'clock-target-hidden': !showAnalog }">
            <canvas
              ref="canvasRef"
              width="340"
              height="340"
              @mousedown="onMouseDown"
              @touchstart="onTouchStart"
              @touchmove="onTouchMove"
              @touchend="onTouchEnd"
              @mousemove="onMouseMoveCanvas"
            ></canvas>
          </div>

          <!-- تلميح العقارب -->
          <div class="hand-legend">
            <span class="legend-item hour-legend">🔵 عقرب الساعات</span>
            <span class="legend-item minute-legend">🔴 عقرب الدقائق</span>
          </div>
        </section>
      </div>

      <!-- السهم في المنتصف -->
      <div class="arrow-divider">
        <div class="arrow-icon">⇄</div>
        <p class="arrow-label">مزامنة<br/>فورية</p>
      </div>

      <!-- عمود الساعة الرقمية -->
      <div class="clock-column">
        <div class="clock-toggle-bar">
          <div class="toggle-info">
            <span class="toggle-icon">{{ showDigital ? '👁️' : '🙈' }}</span>
            <span class="toggle-title">الساعة الرقمية</span>
          </div>
          <label class="switch" title="إظهار / إخفاء الساعة الرقمية">
            <input type="checkbox" v-model="showDigital" aria-label="إظهار أو إخفاء الساعة الرقمية" />
            <span class="slider"></span>
          </label>
        </div>

        <!-- قسم الساعة الرقمية -->
        <section class="clock-section digital-section">
          <h2 class="section-title">💻 الساعة الرقمية</h2>
          <p class="section-hint">اكتب الوقت هنا</p>

          <div class="digital-display">
            <!-- الساعة الرقمية المستهدفة بالإخفاء -->
            <div class="digital-clock-target" :class="{ 'clock-target-hidden': !showDigital }">
              <div class="digital-screen">
                <!-- حقل الساعة -->
                <div class="time-field">
                  <button class="stepper-btn up-btn" @click="stepHour(1)" aria-label="زيادة الساعة">▲</button>
                  <input
                    type="number"
                    ref="hoursInputRef"
                    class="time-input hours-input"
                    min="1"
                    max="12"
                    :value="formattedHours"
                    @input="onHoursInput"
                    @blur="onHoursBlur"
                    @keydown="filterKeys"
                    aria-label="الساعة"
                  />
                  <button class="stepper-btn down-btn" @click="stepHour(-1)" aria-label="تقليل الساعة">▼</button>
                </div>

                <span class="colon">:</span>

                <!-- حقل الدقائق -->
                <div class="time-field">
                  <button class="stepper-btn up-btn" @click="stepMinute(1)" aria-label="زيادة الدقائق">▲</button>
                  <input
                    type="number"
                    ref="minutesInputRef"
                    class="time-input minutes-input"
                    min="0"
                    max="59"
                    :value="formattedMinutes"
                    @input="onMinutesInput"
                    @blur="onMinutesBlur"
                    @keydown="filterKeys"
                    aria-label="الدقائق"
                  />
                  <button class="stepper-btn down-btn" @click="stepMinute(-1)" aria-label="تقليل الدقائق">▼</button>
                </div>
              </div>

              <!-- شاشة الوقت بالكلمات -->
              <div class="time-words-display">
                {{ timeWordsText }}
              </div>
            </div>

            <!-- أزرار الضبط -->
            <div class="control-btns">
              <button class="ctrl-btn now-btn" @click="setCurrentTime">
                🕑 الوقت الحالي
              </button>
              <button class="ctrl-btn reset-btn" @click="resetTime">
                🔄 إعادة ضبط
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- قسم التوضيح التعليمي -->
    <section class="education-section mt-10">
      <h2 class="text-h5 font-weight-bold mb-6 text-center">📚 كيف نقرأ الساعة؟</h2>
      <div class="tips-grid">
        <div class="tip-card">
          <div class="tip-icon">🔵</div>
          <h3 class="tip-title">عقرب الساعة</h3>
          <p class="tip-desc">العقرب <strong>القصير</strong> — يُخبرنا بالساعة، ويدور دورة كاملة كل 12 ساعة.</p>
        </div>
        <div class="tip-card">
          <div class="tip-icon">🔴</div>
          <h3 class="tip-title">عقرب الدقيقة</h3>
          <p class="tip-desc">العقرب <strong>الطويل</strong> — يُخبرنا بالدقائق، ويدور دورة كاملة كل ساعة (60 دقيقة).</p>
        </div>
        <div class="tip-card">
          <div class="tip-icon">🔢</div>
          <h3 class="tip-title">الأرقام على الساعة</h3>
          <p class="tip-desc">من <strong>1</strong> إلى <strong>12</strong> — كل رقم يمثل 5 دقائق عند عقرب الدقائق.</p>
        </div>
      </div>
    </section>

    <!-- تذييل الأداة الداخلي -->
    <footer class="tool-footer mt-8 py-4 text-center">
      <p class="text-caption text-grey mb-0">© جميع الحقوق محفوظة لـ <strong>هشام (أبو حبيبة)</strong></p>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'

const canvasRef = ref(null)
const hoursInputRef = ref(null)
const minutesInputRef = ref(null)

const showAnalog = ref(true)
const showDigital = ref(true)

const state = reactive({
  hours: 1,
  minutes: 0,
})

let dragging = null
let ctx = null
let W = 340
let H = 340
let CX = 170
let CY = 170
let RADIUS = 160

const arabicHours = [
  '', 'الواحدة', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة',
  'السادسة', 'السابعة', 'الثامنة', 'التاسعة', 'العاشرة',
  'الحادية عشرة', 'الثانية عشرة'
]

const formattedHours = computed(() => state.hours.toString().padStart(2, '0'))
const formattedMinutes = computed(() => state.minutes.toString().padStart(2, '0'))

const timeWordsText = computed(() => {
  const h = state.hours
  const m = state.minutes

  if (m === 0) {
    return `الساعة ${arabicHours[h]} تماماً`
  } else if (m === 30) {
    return `الساعة ${arabicHours[h]} والنصف`
  } else if (m === 15) {
    return `الساعة ${arabicHours[h]} والربع`
  } else if (m === 45) {
    const nextHour = h === 12 ? 1 : h + 1
    return `الساعة ${arabicHours[nextHour]} إلا الربع`
  } else if (m < 30) {
    return `الساعة ${arabicHours[h]} و${m} دقيقة`
  } else {
    const nextHour = h === 12 ? 1 : h + 1
    const remaining = 60 - m
    return `الساعة ${arabicHours[nextHour]} إلا ${remaining} دقيقة`
  }
})

// رسم الساعة
function drawClock() {
  if (!ctx) return
  ctx.clearRect(0, 0, W, H)

  drawFace()
  drawNumbers()
  drawTicks()
  drawHand('hour')
  drawHand('minute')
  drawCenter()
}

function drawFace() {
  ctx.save()
  ctx.shadowColor = 'rgba(108,99,255,0.18)'
  ctx.shadowBlur = 24

  const grad = ctx.createRadialGradient(CX - RADIUS * 0.2, CY - RADIUS * 0.2, 0, CX, CY, RADIUS)
  grad.addColorStop(0, '#ffffff')
  grad.addColorStop(0.7, '#f8f9ff')
  grad.addColorStop(1, '#eef0ff')

  ctx.beginPath()
  ctx.arc(CX, CY, RADIUS, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()
  ctx.restore()

  // حلقة خارجية
  ctx.beginPath()
  ctx.arc(CX, CY, RADIUS, 0, Math.PI * 2)
  ctx.lineWidth = 5
  ctx.strokeStyle = '#6c63ff'
  ctx.stroke()

  // حلقة ثانوية
  ctx.beginPath()
  ctx.arc(CX, CY, RADIUS - 8, 0, Math.PI * 2)
  ctx.lineWidth = 1.5
  ctx.strokeStyle = 'rgba(108,99,255,0.15)'
  ctx.stroke()
}

function drawNumbers() {
  const fontSize = RADIUS * 0.14
  ctx.font = `bold ${fontSize}px 'Segoe UI', Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let num = 1; num <= 12; num++) {
    const angle = (num * Math.PI / 6) - Math.PI / 2
    const x = CX + Math.cos(angle) * (RADIUS * 0.76)
    const y = CY + Math.sin(angle) * (RADIUS * 0.76)

    ctx.save()
    ctx.beginPath()
    ctx.arc(x, y, fontSize * 0.9, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(108,99,255,0.08)'
    ctx.fill()
    ctx.restore()

    ctx.fillStyle = '#2d3748'
    ctx.fillText(num.toString(), x, y)
  }
}

function drawTicks() {
  for (let i = 0; i < 60; i++) {
    const angle = (i * Math.PI / 30) - Math.PI / 2
    const isHour = i % 5 === 0
    const outer = RADIUS - 4
    const inner = isHour ? outer - RADIUS * 0.09 : outer - RADIUS * 0.055
    const x1 = CX + Math.cos(angle) * outer
    const y1 = CY + Math.sin(angle) * outer
    const x2 = CX + Math.cos(angle) * inner
    const y2 = CY + Math.sin(angle) * inner

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineWidth = isHour ? 3.5 : 2
    ctx.strokeStyle = isHour ? '#6c63ff' : 'rgba(108, 99, 255, 0.7)'
    ctx.lineCap = 'round'
    ctx.stroke()
  }
}

function drawHand(type) {
  let angle, length, width, color

  if (type === 'hour') {
    const totalMinutes = state.hours * 60 + state.minutes
    angle = (totalMinutes / 720) * Math.PI * 2 - Math.PI / 2
    length = RADIUS * 0.50
    width = 8
    color = '#4a90e2'
  } else {
    angle = (state.minutes / 60) * Math.PI * 2 - Math.PI / 2
    length = RADIUS * 0.73
    width = 5
    color = '#e74c3c'
  }

  const tipX = CX + Math.cos(angle) * length
  const tipY = CY + Math.sin(angle) * length
  const tailX = CX - Math.cos(angle) * (length * 0.18)
  const tailY = CY - Math.sin(angle) * (length * 0.18)

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(tailX, tailY)
  ctx.lineTo(tipX, tipY)
  ctx.lineWidth = width
  ctx.strokeStyle = color
  ctx.lineCap = 'round'

  ctx.shadowColor = color
  ctx.shadowBlur = 4
  ctx.stroke()
  ctx.restore()

  ctx.beginPath()
  ctx.arc(tipX, tipY, width * 0.7, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
}

function drawCenter() {
  ctx.beginPath()
  ctx.arc(CX, CY, 10, 0, Math.PI * 2)
  ctx.fillStyle = '#6c63ff'
  ctx.fill()

  ctx.beginPath()
  ctx.arc(CX, CY, 5, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
}

function getAngle(clientX, clientY) {
  if (!canvasRef.value) return 0
  const rect = canvasRef.value.getBoundingClientRect()
  const x = (clientX - rect.left) * (W / rect.width) - CX
  const y = (clientY - rect.top) * (H / rect.height) - CY
  return Math.atan2(y, x) + Math.PI / 2
}

function getHandAbsAngle(type) {
  if (type === 'hour') {
    const totalMin = state.hours * 60 + state.minutes
    return (totalMin / 720) * Math.PI * 2
  }
  return (state.minutes / 60) * Math.PI * 2
}

function pointToSegmentDist(px, py, x1, y1, x2, y2) {
  const A = px - x1, B = py - y1
  const C = x2 - x1, D = y2 - y1
  const dot = A * C + B * D
  const lenSq = C * C + D * D
  let t = lenSq !== 0 ? dot / lenSq : -1
  t = Math.max(0, Math.min(1, t))
  const nearX = x1 + t * C
  const nearY = y1 + t * D
  return Math.hypot(px - nearX, py - nearY)
}

function detectHand(clientX, clientY) {
  if (!canvasRef.value) return null
  const rect = canvasRef.value.getBoundingClientRect()
  const px = (clientX - rect.left) * (W / rect.width)
  const py = (clientY - rect.top) * (H / rect.height)

  const hands = [
    { type: 'minute', length: RADIUS * 0.73 },
    { type: 'hour', length: RADIUS * 0.50 },
  ]

  for (const hand of hands) {
    const angle = getHandAbsAngle(hand.type)
    const tipX = CX + Math.cos(angle - Math.PI / 2) * hand.length
    const tipY = CY + Math.sin(angle - Math.PI / 2) * hand.length

    const dist = Math.hypot(px - tipX, py - tipY)
    if (dist < 22) return hand.type

    const distToLine = pointToSegmentDist(px, py, CX, CY, tipX, tipY)
    if (distToLine < 14) return hand.type
  }
  return null
}

function applyAngle(type, rawAngle) {
  let a = rawAngle % (Math.PI * 2)
  if (a < 0) a += Math.PI * 2

  if (type === 'hour') {
    let hours = (a / (Math.PI * 2)) * 12
    hours = Math.round(hours) % 12
    if (hours === 0) hours = 12
    state.hours = hours
  } else {
    let minutes = Math.round((a / (Math.PI * 2)) * 60) % 60
    if (state.minutes >= 45 && minutes <= 15) {
      state.hours = (state.hours % 12) + 1
    } else if (state.minutes <= 15 && minutes >= 45) {
      state.hours = ((state.hours - 2 + 12) % 12) + 1
    }
    state.minutes = minutes
  }
}

// أحداث الماوس واللمس
function onMouseDown(e) {
  e.preventDefault()
  dragging = detectHand(e.clientX, e.clientY)
  if (dragging && canvasRef.value) {
    canvasRef.value.style.cursor = 'grabbing'
  }
}

function onWindowMouseMove(e) {
  if (!dragging) return
  const angle = getAngle(e.clientX, e.clientY)
  applyAngle(dragging, angle)
  drawClock()
}

function onWindowMouseUp() {
  dragging = null
  if (canvasRef.value) {
    canvasRef.value.style.cursor = 'grab'
  }
}

function onMouseMoveCanvas(e) {
  if (dragging || !canvasRef.value) return
  const hand = detectHand(e.clientX, e.clientY)
  canvasRef.value.style.cursor = hand ? 'grab' : 'default'
}

function onTouchStart(e) {
  if (e.touches.length > 0) {
    const touch = e.touches[0]
    dragging = detectHand(touch.clientX, touch.clientY)
  }
}

function onTouchMove(e) {
  if (!dragging || e.touches.length === 0) return
  e.preventDefault()
  const touch = e.touches[0]
  const angle = getAngle(touch.clientX, touch.clientY)
  applyAngle(dragging, angle)
  drawClock()
}

function onTouchEnd() {
  dragging = null
}

// الأحداث الرقمية
function onHoursInput(e) {
  let val = parseInt(e.target.value, 10)
  if (!isNaN(val)) {
    if (val < 1) val = 1
    if (val > 12) val = 12
    state.hours = val
    drawClock()
  }
}

function onHoursBlur(e) {
  let val = parseInt(e.target.value, 10)
  if (isNaN(val) || val < 1) val = 1
  if (val > 12) val = 12
  state.hours = val
  e.target.value = state.hours.toString().padStart(2, '0')
  drawClock()
}

function onMinutesInput(e) {
  let val = parseInt(e.target.value, 10)
  if (!isNaN(val)) {
    if (val < 0) val = 0
    if (val > 59) val = 59
    state.minutes = val
    drawClock()
  }
}

function onMinutesBlur(e) {
  let val = parseInt(e.target.value, 10)
  if (isNaN(val) || val < 0) val = 0
  if (val > 59) val = 59
  state.minutes = val
  e.target.value = state.minutes.toString().padStart(2, '0')
  drawClock()
}

function filterKeys(e) {
  const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']
  if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) {
    e.preventDefault()
  }
}

function stepHour(direction) {
  state.hours = ((state.hours - 1 + direction + 12) % 12) + 1
  drawClock()
}

function stepMinute(direction) {
  if (direction === 1) {
    if (state.minutes === 59) {
      state.minutes = 0
      state.hours = (state.hours % 12) + 1
    } else {
      state.minutes += 1
    }
  } else {
    if (state.minutes === 0) {
      state.minutes = 59
      state.hours = ((state.hours - 2 + 12) % 12) + 1
    } else {
      state.minutes -= 1
    }
  }
  drawClock()
}

function setCurrentTime() {
  const now = new Date()
  let h = now.getHours() % 12
  if (h === 0) h = 12
  state.hours = h
  state.minutes = now.getMinutes()
  drawClock()
}

function resetTime() {
  state.hours = 1
  state.minutes = 0
  drawClock()
}

function resizeCanvas() {
  if (!canvasRef.value) return
  const maxSize = Math.min(
    window.innerWidth > 768 ? 340 : window.innerWidth > 400 ? 280 : 240,
    340
  )
  canvasRef.value.width = maxSize
  canvasRef.value.height = maxSize
  W = maxSize
  H = maxSize
  CX = W / 2
  CY = H / 2
  RADIUS = Math.min(W, H) / 2 - 10
  drawClock()
}

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    resizeCanvas()
    drawClock()
  }
  window.addEventListener('mousemove', onWindowMouseMove)
  window.addEventListener('mouseup', onWindowMouseUp)
  window.addEventListener('resize', resizeCanvas)
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onWindowMouseMove)
  window.removeEventListener('mouseup', onWindowMouseUp)
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<style scoped>
.kids-clock-tool-wrapper {
  --primary: #6c63ff;
  --secondary: #ff6584;
  --accent: #43d39e;
  --bg: #f0f4ff;
  --card-bg: #ffffff;
  --text: #2d3748;
  --text-light: #718096;
  --hour-color: #4a90e2;
  --minute-color: #e74c3c;
  --shadow: 0 8px 32px rgba(108, 99, 255, 0.13);
  --radius: 24px;

  direction: rtl;
  user-select: none;
}

.tool-header-banner {
  text-align: center;
  padding: 30px 20px;
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
  color: #fff;
  border-radius: var(--radius);
  box-shadow: 0 8px 24px rgba(108, 99, 255, 0.25);
}

.header-emoji {
  font-size: 48px;
  margin-bottom: 8px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.main-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 24px;
  padding: 20px 0;
  max-width: 1000px;
  margin: 0 auto;
}

.clock-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  flex: 0 0 380px;
  max-width: 380px;
  width: 100%;
}

.clock-toggle-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: var(--card-bg);
  padding: 10px 18px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(108, 99, 255, 0.08);
  border: 1px solid rgba(108, 99, 255, 0.12);
}

.toggle-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-icon {
  font-size: 1.25rem;
}

.toggle-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
  cursor: pointer;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #cbd5e1;
  transition: 0.25s;
  border-radius: 34px;
}

.slider::before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.25s;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.switch input:checked + .slider {
  background-color: var(--primary);
}

.switch input:checked + .slider::before {
  transform: translateX(22px);
}

.clock-section {
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 24px 20px;
  width: 380px;
  height: 520px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(108, 99, 255, 0.08);
}

.clock-target-hidden {
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

.clock-section::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 5px;
}

.analog-section::before {
  background: linear-gradient(90deg, var(--hour-color), var(--minute-color));
}

.digital-section::before {
  background: linear-gradient(90deg, var(--primary), var(--accent));
}

.section-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--primary);
}

.section-hint {
  font-size: 0.88rem;
  color: var(--text-light);
  background: #f7f8ff;
  padding: 6px 16px;
  border-radius: 20px;
}

.canvas-wrapper {
  position: relative;
  cursor: grab;
  border-radius: 50%;
  box-shadow:
    0 0 0 6px #f0f4ff,
    0 0 0 10px rgba(108,99,255,0.12),
    0 8px 32px rgba(108,99,255,0.2);
  transition: opacity 0.25s ease, visibility 0.25s ease;
}

canvas {
  display: block;
  border-radius: 50%;
  touch-action: none;
}

.hand-legend {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.legend-item {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 12px;
  background: #f7f8ff;
}

.hour-legend { color: var(--hour-color); }
.minute-legend { color: var(--minute-color); }

.arrow-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.arrow-icon {
  font-size: 2.8rem;
  color: var(--primary);
  animation: pulse-arrow 2s ease-in-out infinite;
}

@keyframes pulse-arrow {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
}

.arrow-label {
  font-size: 0.8rem;
  color: var(--text-light);
  text-align: center;
  font-weight: 600;
  line-height: 1.4;
  background: rgba(108,99,255,0.08);
  padding: 4px 10px;
  border-radius: 10px;
}

.digital-display {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  gap: 14px;
}

.digital-clock-target {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  transition: opacity 0.25s ease, visibility 0.25s ease;
}

.digital-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  direction: ltr;
  background: #f8faff;
  border: 2px solid rgba(108, 99, 255, 0.18);
  border-radius: 20px;
  padding: 14px 20px;
  box-shadow: 0 4px 16px rgba(108, 99, 255, 0.08);
  width: 100%;
  max-width: 300px;
}

.time-field {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.time-input {
  width: 72px;
  height: 60px;
  font-size: 2.3rem;
  font-weight: 800;
  text-align: center;
  background: #ffffff;
  border: 2px solid rgba(108, 99, 255, 0.22);
  border-radius: 14px;
  outline: none;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
  -moz-appearance: textfield;
  appearance: textfield;
}

.time-input::-webkit-inner-spin-button,
.time-input::-webkit-outer-spin-button {
  display: none;
}

.hours-input { color: var(--hour-color); }
.minutes-input { color: var(--minute-color); }

.hours-input:focus { border-color: var(--hour-color); box-shadow: 0 0 12px rgba(74, 144, 226, 0.35); }
.minutes-input:focus { border-color: var(--minute-color); box-shadow: 0 0 12px rgba(231, 76, 60, 0.35); }

.colon {
  font-size: 2.6rem;
  font-weight: 900;
  color: var(--primary);
  animation: blink-colon 1s step-start infinite;
  margin: 0 4px;
  align-self: center;
  padding-bottom: 6px;
  font-family: 'Courier New', monospace;
}

@keyframes blink-colon {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}

.stepper-btn {
  width: 36px;
  height: 28px;
  border: 1px solid rgba(108, 99, 255, 0.2);
  border-radius: 8px;
  background: #ffffff;
  color: var(--primary);
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1;
}

.stepper-btn:hover {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.time-words-display {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--primary);
  background: linear-gradient(135deg, #f0f4ff, #e8f0fe);
  border: 2px solid rgba(108, 99, 255, 0.2);
  border-radius: 14px;
  padding: 12px 20px;
  text-align: center;
  width: 100%;
  max-width: 320px;
  min-height: 52px;
  box-shadow: 0 2px 8px rgba(108, 99, 255, 0.08);
}

.control-btns {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.ctrl-btn {
  padding: 10px 18px;
  border: none;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.ctrl-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}

.now-btn {
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
  color: #fff;
  box-shadow: 0 4px 12px rgba(108, 99, 255, 0.3);
}

.reset-btn {
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  color: var(--text);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.07);
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}

.tip-card {
  background: var(--card-bg);
  border-radius: 18px;
  padding: 22px 18px;
  box-shadow: 0 4px 16px rgba(108, 99, 255, 0.08);
  text-align: center;
  border-top: 4px solid var(--primary);
  border: 1px solid rgba(108, 99, 255, 0.1);
  border-top-width: 4px;
}

.tip-icon {
  font-size: 2.2rem;
  margin-bottom: 10px;
}

.tip-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--primary);
}

.tip-desc {
  font-size: 0.9rem;
  color: var(--text-light);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
    padding: 16px 8px;
  }

  .clock-column {
    flex: 1 1 100%;
    max-width: 100%;
  }

  .clock-section {
    width: 100%;
    height: auto;
    min-height: 480px;
  }
}
</style>
