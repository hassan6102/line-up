export type Id = { id: string }
export type Orderable = { order: number; visible: boolean }

export type Doctor = Id & Orderable & {
  name: string; specialty: string; qualifications: string; experienceYears: number
  bio: string; imageUrl: string; imagePath?: string
}
export type Service = Id & Orderable & {
  title: string; description: string; details: string; imageUrl: string; imagePath?: string
}
export type Package = Id & Orderable & {
  name: string; sessions: number; price: number; oldPrice?: number | null
  description: string; features: string[]; featured: boolean
}
export type Testimonial = Id & {
  name: string; rating: number; comment: string; imageUrl: string; imagePath?: string
  approved: boolean; visible: boolean
}
export type GalleryItem = Id & Orderable & {
  imageUrl: string; imagePath: string; caption: string; category: string
}
export type Faq = Id & Orderable & { question: string; answer: string }

export type BookingStatus = 'new' | 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type Booking = Id & {
  name: string; phone: string; serviceId: string; serviceTitle: string
  doctorId: string; doctorName: string; date: string; time: string; notes: string
  status: BookingStatus; createdAt: number // milliseconds (يُحوَّل من serverTimestamp عند القراءة)
}
export const BOOKING_TIMES = ['', 'صباحاً', 'مساءً'] as const

export type WorkingHour = { days: string; time: string }
export type TitleText = { title: string; text: string }
export type SiteContent = {
  clinicName: string; logoUrl: string; logoUrlPath?: string
  heroTitle: string; heroSubtitle: string; marketingText: string
  heroKicker: string; heroImageUrl: string; heroImageUrlPath?: string; heroBadgeTitle: string; heroBadgeText: string; heroNote: string
  trustItems: TitleText[]; trustCtaLabel: string
  about: string; aboutCtaLabel: string; valueItems: TitleText[]; vision: string; mission: string; features: string[]
  footerTagline: string; footerDisclaimer: string; privacyText: string; bookingSideNote: string
  phone: string; whatsapp: string; email: string
  instagram: string; facebook: string; tiktok: string
  workingHours: WorkingHour[]; paymentMethods: string[]
  address: string; mapUrl: string
}
export type SiteSettings = {
  seoTitle: string; seoDescription: string; ogImageUrl: string; ogImageUrlPath?: string
  sections: Record<string, boolean>
}
export const SECTION_KEYS = ['about','features','team','services','packages','testimonials','gallery','payments','faq','hours','contact'] as const
export const BOOKING_STATUS: Record<BookingStatus, string> = { new: 'جديد', pending: 'قيد الانتظار', confirmed: 'مؤكد', completed: 'مكتمل', cancelled: 'ملغي' }
