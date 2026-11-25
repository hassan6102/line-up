import type { SiteContent, SiteSettings } from './index'
import { SECTION_KEYS } from './index'

// نصوص افتراضية للتصميم الأصلي فقط (قابلة للتعديل بالكامل من /admin/content). لا بيانات اتصال أو أسعار أو أشخاص وهميين.
export const defaultContent: SiteContent = {
  clinicName: 'Line Up Physiotherapy Clinic', logoUrl: '',
  heroTitle: 'حركتك هي بداية حياتك.',
  heroSubtitle: 'رعاية علاج طبيعي تنطلق من فهم احتياجاتك، وترافقك بخطوات مدروسة نحو حركة أكثر راحة وثقة.',
  marketingText: '',
  heroKicker: 'عناية حركية أقرب إليك', heroImageUrl: '', heroBadgeTitle: 'كل خطوة تفرق', heroBadgeText: 'نرافقك في رحلة التعافي',
  heroNote: 'رعاية فردية، وخطة تناسب احتياجك',
  trustItems: [
    { title: 'رعاية تتمحور حولك', text: 'استماع وفهم لاحتياجاتك' },
    { title: 'خطوات مدروسة', text: 'خطة تأهيل تناسب حالتك' },
    { title: 'اهتمام بكل التفاصيل', text: 'من أول تواصل حتى المتابعة' },
  ],
  trustCtaLabel: 'لنتحدث عن احتياجك',
  about: 'في Line Up نؤمن أن رحلة التأهيل تبدأ بالاستماع. نعمل على تقديم تجربة رعاية إنسانية تساعد كل شخص على فهم احتياجاته الحركية واستكشاف خيارات التأهيل المناسبة له.',
  aboutCtaLabel: 'تعرف على العيادة',
  valueItems: [
    { title: 'نفهم احتياجك', text: 'نبدأ بالاستماع والتقييم قبل اقتراح أي مسار.' },
    { title: 'نخطط معك', text: 'أهداف واضحة وخطوات تأهيل تتناسب معك.' },
    { title: 'نتابع تقدمك', text: 'اهتمام مستمر وتواصل في كل مرحلة.' },
  ],
  vision: '', mission: '', features: [],
  footerTagline: 'نرافقك بخطوات مدروسة نحو حركة أكثر راحة وثقة.',
  footerDisclaimer: 'المعلومات للتوعية ولا تُغني عن التقييم الطبي المتخصص.',
  bookingSideNote: 'نحن هنا لأجلك.',
  privacyText: [
    'نحترم خصوصيتك. عند إرسال طلب حجز نجمع: الاسم، رقم الهاتف، الخدمة المطلوبة، الطبيب والموعد المفضلين (إن وُجدا)، وأي ملاحظات تكتبها.',
    'نستخدم هذه البيانات للتواصل معك بشأن طلبك وتأكيد الموعد فقط، ولا نعرضها للزوار الآخرين.',
    'تُخزَّن البيانات في خدمة Google Firebase، ويطّلع عليها فريق العيادة المصرّح له فقط.',
    'لطلب تعديل بياناتك أو حذفها تواصل معنا عبر بيانات التواصل في الموقع.',
  ].join('\n\n'),
  phone: '', whatsapp: '', email: '', instagram: '', facebook: '', tiktok: '',
  workingHours: [], paymentMethods: [], address: '', mapUrl: '',
}
export const defaultSettings: SiteSettings = {
  seoTitle: 'Line Up Physiotherapy Clinic | رعاية علاج طبيعي تبدأ بك',
  seoDescription: 'رعاية علاج طبيعي وتأهيل حركي ترافقك بخطوات مدروسة نحو حركة أكثر راحة وثقة.',
  ogImageUrl: '',
  sections: Object.fromEntries(SECTION_KEYS.map((k) => [k, true])),
}
