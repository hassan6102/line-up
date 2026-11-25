"use client"

import { useState } from 'react'
import { Activity, ArrowLeft, ArrowUpLeft, Check, Clock3, CreditCard, Mail, MapPin, Menu, Phone, Plus, Quote, ShieldCheck, Star, X, HeartPulse } from 'lucide-react'
import Link from 'next/link'
import { SiteProvider, useSite } from '@/components/site/site-provider'
import { BookingForm } from '@/components/site/booking-form'
import { whatsappLink } from '@/lib/services/site-data'

const fmt = (n: number) => new Intl.NumberFormat('ar-EG').format(n)

function Notice({ children, retry }: { children: React.ReactNode; retry?: () => void }) {
  return <div className="data-state">{children}{retry && <button className="button button-outline" onClick={retry}>إعادة المحاولة</button>}</div>
}
function Block({ loading, error, empty, text, retry, children }: { loading: boolean; error: string | null; empty: boolean; text: string; retry: () => void; children: React.ReactNode }) {
  if (loading) return <Notice><span className="spinner" /> جارٍ التحميل…</Notice>
  if (error) return <Notice retry={retry}>{error}</Notice>
  if (empty) return <Notice>{text}</Notice>
  return <>{children}</>
}

function Site() {
  const { data, loading, error: globalError, reload } = useSite()
  const { content: c, settings, doctors, services, packages, testimonials, gallery, faqs, errors } = data
  const TRUST_ICONS = [HeartPulse, Activity, ShieldCheck]
  const on = (k: string) => settings.sections[k] !== false
  const [menuOpen, setMenuOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(0)
  const [photo, setPhoto] = useState<string | null>(null)
  const wa = whatsappLink(c.whatsapp, `مرحباً، أرغب في الاستفسار عن موعد في ${c.clinicName}.`)
  const nav = [
    on('about') && { label: 'عن العيادة', href: '#about' }, on('services') && { label: 'خدماتنا', href: '#services' }, on('team') && { label: 'فريقنا', href: '#team' },
    on('packages') && { label: 'الباقات', href: '#packages' }, on('gallery') && { label: 'المعرض', href: '#gallery' }, on('faq') && { label: 'الأسئلة', href: '#faq' },
  ].filter(Boolean) as { label: string; href: string }[]
  const sh = (k: keyof typeof errors) => ({ loading, error: globalError ?? errors[k] ?? null, retry: reload })
  const brand = <a className="brand" href="#home" aria-label={`${c.clinicName} - الرئيسية`}>
    {c.logoUrl ? <img src={c.logoUrl} alt="" className="brand-logo" /> : <span className="brand-mark"><Activity /></span>}
    <span className="brand-name">{c.clinicName.split(' ').slice(0, 2).join(' ')}<small>PHYSIOTHERAPY CLINIC</small></span></a>

  return <main dir="rtl">
    {c.marketingText && <div className="announcement"><span className="announcement-dot" /> {c.marketingText}</div>}
    <header className="site-header">
      {brand}
      <nav className={menuOpen ? 'main-nav open' : 'main-nav'} aria-label="التنقل الرئيسي">{nav.map((l) => <a key={l.href} onClick={() => setMenuOpen(false)} href={l.href}>{l.label}</a>)}</nav>
      <a className="header-cta" href="#booking">احجز استشارة <ArrowLeft size={16} /></a>
      <button className="menu-toggle" aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
    </header>

    <section className="hero" id="home">
      <div className="hero-copy">{c.heroKicker && <div className="eyebrow"><span /> {c.heroKicker}</div>}<h1>{c.heroTitle}</h1><p className="hero-description">{c.heroSubtitle}</p>
        <div className="hero-actions"><a className="button button-primary" href="#booking">ابدأ رحلتك <ArrowLeft size={17} /></a>{on('services') && <a className="button button-text" href="#services">اكتشف خدماتنا</a>}</div>
        {c.heroNote && <div className="hero-note"><ShieldCheck size={18} /><span>{c.heroNote}</span></div>}</div>
      <div className="hero-visual"><img src={c.heroImageUrl || '/clinic-hero.png'} alt={c.heroImageUrl ? c.clinicName : 'أخصائية علاج طبيعي تساعد مراجعاً على تحسين حركة الكتف'} fetchPriority="high" /><div className="image-wash" />
        {(c.heroBadgeTitle || c.heroBadgeText) && <div className="hero-stamp"><span className="stamp-icon"><HeartPulse /></span><div><strong>{c.heroBadgeTitle}</strong><small>{c.heroBadgeText}</small></div></div>}</div>
    </section>

    {c.trustItems.length > 0 && <section className="trust-strip" aria-label="مبادئ الرعاية">
      {c.trustItems.slice(0, 3).map((t, i) => { const Icon = TRUST_ICONS[i % TRUST_ICONS.length]; return <div key={`${t.title}-${i}`}><span className="trust-icon"><Icon /></span><p><strong>{t.title}</strong><small>{t.text}</small></p></div> })}
      {c.trustCtaLabel && <a href="#booking" className="strip-link button button-outline">{c.trustCtaLabel} <ArrowLeft size={16} /></a>}</section>}

    {on('about') && <section className="section about-section" id="about"><div className="section-kicker">عن العيادة</div>
      <div className="about-grid"><div><h2>الحركة ليست مجرد خطوة.<br /><span>إنها شعور بالحياة.</span></h2></div><div className="about-copy"><p>{c.about}</p>{c.aboutCtaLabel && <a className="button button-outline about-cta" href="#contact">{c.aboutCtaLabel} <ArrowLeft size={16} /></a>}</div></div>
      {c.valueItems.length > 0 && <div className="values-row">{c.valueItems.map((v, i) => <div key={`${v.title}-${i}`}><span>{fmt(i + 1).padStart(2, '٠')}</span><strong>{v.title}</strong><p>{v.text}</p></div>)}</div>}
      {(c.vision || c.mission) && <div className="values-row vm-row">{c.vision && <div><span>الرؤية</span><p>{c.vision}</p></div>}{c.mission && <div><span>الرسالة</span><p>{c.mission}</p></div>}</div>}</section>}

    {on('features') && c.features.length > 0 && <section className="section features-section"><div className="section-heading"><div><div className="section-kicker">لماذا Line Up</div><h2>مميزات <span>العيادة.</span></h2></div></div>
      <div className="features-grid">{c.features.map((f) => <div key={f} className="feature"><span><Check size={18} /></span>{f}</div>)}</div></section>}

    {on('services') && <section className="section services-section" id="services"><div className="section-heading"><div><div className="section-kicker">خدماتنا</div><h2>رعاية تبدأ من <span>احتياجك.</span></h2></div></div>
      <Block {...sh('services')} empty={!services.length} text="ستظهر الخدمات هنا قريباً.">
        <div className="service-grid">{services.map((s, i) => <Link href={`/services/${s.id}`} className="service-card" key={s.id}>
          {s.imageUrl ? <img src={s.imageUrl} alt="" className="service-img" loading="lazy" /> : <div className="service-top"><span className="service-icon"><Activity /></span><span className="service-number">{fmt(i + 1)}</span></div>}
          <h3>{s.title}</h3><p>{s.description}</p><span className="card-more">التفاصيل <ArrowUpLeft size={16} /></span></Link>)}</div></Block></section>}

    {on('team') && <section className="team-section" id="team"><div className="section team-inner"><div className="section-heading"><div><div className="section-kicker light">فريقنا</div><h2>خبرة إنسانية،<br /><span>واهتمام يرافقك.</span></h2></div></div>
      <Block {...sh('doctors')} empty={!doctors.length} text="سيتم عرض فريق العيادة هنا قريباً.">
        <div className="doctor-grid">{doctors.map((d) => <article className="doctor-card" key={d.id}>{d.imageUrl ? <img src={d.imageUrl} alt={d.name} loading="lazy" /> : <div className="doctor-noimg"><Activity /></div>}
          <div><h3>{d.name}</h3><p>{d.specialty}</p>{d.qualifications && <small>{d.qualifications}</small>}{d.experienceYears > 0 && <small>خبرة {fmt(d.experienceYears)} سنة</small>}{d.bio && <small>{d.bio}</small>}</div></article>)}</div></Block></div></section>}

    {on('packages') && <section className="section package-section" id="packages"><div className="section-heading"><div><div className="section-kicker">الباقات والأسعار</div><h2>تفاصيل واضحة،<br /><span>قبل كل خطوة.</span></h2></div></div>
      <Block {...sh('packages')} empty={!packages.length} text="الأسعار قيد التحديث. تواصل معنا لمعرفة التفاصيل.">
        <div className="packages-grid">{packages.map((p) => <article className={`package-card${p.featured ? ' featured' : ''}`} key={p.id}>{p.featured && <em className="pkg-flag">الأكثر طلباً</em>}
          <span>{p.name}</span><h3>{fmt(p.sessions)} جلسات</h3>{p.description && <p>{p.description}</p>}
          <div className="pkg-price">{p.oldPrice ? <del>{fmt(p.oldPrice)}</del> : null}<strong>{fmt(p.price)}</strong></div>
          {p.features.length > 0 && <ul>{p.features.map((f) => <li key={f}><Check size={15} />{f}</li>)}</ul>}<a href="#booking">احجز الآن <ArrowLeft size={16} /></a></article>)}</div></Block></section>}

    {on('testimonials') && testimonials.length > 0 && <section className="review-section"><div className="section review-inner"><div className="review-heading"><div className="section-kicker light">تجارب العملاء</div><h2>الثقة تبدأ<br />من تجربة <span>إنسانية.</span></h2></div>
      <div className="review-grid">{testimonials.map((r) => <article key={r.id} className="review-card"><Quote /><div className="stars">{Array.from({ length: Math.min(5, Math.max(0, r.rating)) }, (_, i) => <Star key={i} size={14} fill="currentColor" />)}</div><p>{r.comment}</p>
        <div className="reviewer">{r.imageUrl && <img src={r.imageUrl} alt="" />}<strong>{r.name}</strong></div></article>)}</div></div></section>}

    {on('gallery') && <section className="section gallery-section" id="gallery"><div className="section-heading"><div><div className="section-kicker">من داخل العيادة</div><h2>مساحة تساعدك<br /><span>على الشعور بالراحة.</span></h2></div></div>
      <Block {...sh('gallery')} empty={!gallery.length} text="سيتم عرض صور العيادة هنا قريباً.">
        <div className="gallery-flex">{gallery.map((g) => <button className="gallery-tile" key={g.id} onClick={() => setPhoto(g.imageUrl)} aria-label={`تكبير: ${g.caption}`}><img src={g.imageUrl} alt={g.caption} loading="lazy" /><span>{g.caption}</span></button>)}</div></Block></section>}

    {on('payments') && c.paymentMethods.length > 0 && <section className="section payments-section"><div className="section-kicker">طرق الدفع</div><div className="chips-row">{c.paymentMethods.map((m) => <span key={m} className="pay-chip"><CreditCard size={16} />{m}</span>)}</div></section>}

    <section className="booking-section" id="booking"><div className="section booking-grid"><div className="booking-copy"><div className="section-kicker light">خطوتك الأولى</div><h2>جاهز تبدأ<br />رحلتك؟</h2>
      <p>أرسل طلب موعد وسيتواصل معك فريق العيادة لمناقشة الوقت المناسب وتأكيد التفاصيل.</p><div className="booking-reminder"><Clock3 /><span>إرسال الطلب لا يعني تأكيد الموعد</span></div>{c.bookingSideNote && <div className="booking-side-note">{c.bookingSideNote}</div>}</div><BookingForm /></div></section>

    {on('faq') && <section className="section faq-section" id="faq"><div className="section-heading"><div><div className="section-kicker">هل لديك سؤال؟</div><h2>إجابات <span>بكل وضوح.</span></h2></div></div>
      <Block {...sh('faqs')} empty={!faqs.length} text="ستظهر الأسئلة الشائعة هنا.">
        <div className="faq-list">{faqs.map((f, i) => <article className={faqOpen === i ? 'faq-item expanded' : 'faq-item'} key={f.id}><button onClick={() => setFaqOpen(faqOpen === i ? null : i)} aria-expanded={faqOpen === i}><span>{f.question}</span><span className="faq-toggle">{faqOpen === i ? <X /> : <Plus />}</span></button>{faqOpen === i && <p>{f.answer}</p>}</article>)}</div></Block></section>}

    {(on('contact') || on('hours')) && <section className="contact-section" id="contact"><div className="section contact-inner"><div><div className="section-kicker light">نحن على بُعد رسالة</div><h2>خلّينا نبدأ<br /><span>الحديث.</span></h2></div>
      <div className="contact-details">
        {on('hours') && c.workingHours.length > 0 && <div><span>مواعيد العمل</span>{c.workingHours.map((h) => <p key={h.days}>{h.days} — {h.time}</p>)}</div>}
        {on('contact') && <>{c.phone && <div><span>الهاتف</span><a href={`tel:${c.phone}`} dir="ltr">{c.phone}</a></div>}
          {c.address && <div><span>العنوان</span><p>{c.address}</p>{c.mapUrl && <a href={c.mapUrl} target="_blank" rel="noreferrer" className="inline-link"><MapPin size={15} /> افتح الخريطة</a>}</div>}
          {c.email && <div><span>البريد</span><a href={`mailto:${c.email}`} dir="ltr"><Mail size={14} /> {c.email}</a></div>}
          {c.whatsapp && <a className="button button-white" href={wa} target="_blank" rel="noreferrer">تواصل عبر واتساب <ArrowLeft size={16} /></a>}</>}
      </div></div></section>}

    <footer className="site-footer"><div className="footer-main">{brand}<p>{c.footerTagline}</p>
      <nav aria-label="روابط التذييل">{nav.map((l) => <a href={l.href} key={l.href}>{l.label}</a>)}<Link href="/privacy">سياسة الخصوصية</Link></nav>
      <div className="footer-connect">{c.phone ? <a href={`tel:${c.phone}`}><Phone /> اتصل بنا</a> : null}{[['Instagram', c.instagram], ['Facebook', c.facebook], ['TikTok', c.tiktok]].filter(([, u]) => u).map(([n, u]) => <a key={n} href={u} target="_blank" rel="noreferrer">{n}</a>)}<a href="#booking">طلب موعد <ArrowLeft /></a></div></div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} {c.clinicName}. جميع الحقوق محفوظة.</span><span>{c.footerDisclaimer}</span><a href="#home">العودة للأعلى ↑</a></div></footer>
    <a className="floating-contact" href={c.whatsapp ? wa : '#booking'} target={c.whatsapp ? '_blank' : undefined} rel="noreferrer" aria-label="تواصل مع العيادة"><span>{c.whatsapp ? 'واتساب' : 'احجز الآن'}</span><Phone /></a>
    {photo && <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setPhoto(null)}><button aria-label="إغلاق" onClick={() => setPhoto(null)}><X /></button><img src={photo} alt="صورة مكبرة" /></div>}
  </main>
}
export function ClinicSite() { return <SiteProvider><Site /></SiteProvider> }
