import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Maxfiylik siyosati - Inkly",
  description: "Inkly platformasida foydalanuvchi ma'lumotlarini yig'ish va qayta ishlash qoidalari.",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-5 py-24 md:py-32">
        <h1 className="mb-6 text-5xl md:text-7xl font-bold tracking-tight text-[#141414] leading-[1.1]">
          Maxfiylik siyosati
        </h1>
        <p className="text-xl leading-relaxed text-[#6B7280]">
          Sizning shaxsiy ma'lumotlaringiz xavfsizligi biz uchun muhim.
        </p>
      </section>

      {/* Main Content */}
      <section className="border-t border-[#E8E3DD] bg-[#FAFAFA]">
        <div className="mx-auto max-w-4xl px-5 py-20 flex flex-col md:flex-row gap-12">
          
          {/* Sidebar / Quick Links (Hidden on small screens) */}
          <aside className="hidden md:block w-64 shrink-0 relative">
            <div className="sticky top-12 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-6">Mundarija</h3>
              <ul className="space-y-4 text-sm text-[#36565F] font-medium">
                <li><a href="#collected" className="hover:text-[#FF6A00] transition-colors">1. Yig'iladigan ma'lumotlar</a></li>
                <li><a href="#usage" className="hover:text-[#FF6A00] transition-colors">2. Ma'lumotlardan foydalanish</a></li>
                <li><a href="#thirdparty" className="hover:text-[#FF6A00] transition-colors">3. Uchinchi shaxslar</a></li>
                <li><a href="#cookies" className="hover:text-[#FF6A00] transition-colors">4. Cookie fayllari</a></li>
                <li><a href="#delete" className="hover:text-[#FF6A00] transition-colors">5. Ma'lumotlarni o'chirish</a></li>
              </ul>
            </div>
          </aside>

          {/* Privacy text */}
          <article className="prose prose-inkly prose-lg max-w-none text-[#36565F]">
            <p className="lead text-[#141414]">
              Inkly platformasida biz sizning shaxsiy ma'lumotlaringiz xavfsizligiga juda jiddiy qaraymiz. Ushbu siyosat qanday ma'lumotlar yig'ilishi va ulardan qanday foydalanilishini batafsil tushuntiradi.
            </p>

            <h2 id="collected" className="text-2xl md:text-3xl font-bold text-[#141414] mt-16 mb-6">1. Yig'iladigan ma'lumotlar</h2>
            <p>
              Platformadan foydalanish uchun ro'yxatdan o'tganingizda, biz quyidagi ma'lumotlarni so'rashimiz va saqlashimiz mumkin:
            </p>
            <ul className="space-y-2">
              <li><strong>Ro'yxatdan o'tish ma'lumotlari:</strong> Ismingiz (yoki taxallusingiz), elektron pochta manzilingiz va xavfsiz parolingiz (parollar doimiy shifrlangan holatda saqlanadi).</li>
              <li><strong>Profil ma'lumotlari:</strong> O'z ixtiyoringiz bilan kiritgan bio, ijtimoiy tarmoq havolalari yoki avatar rasmi.</li>
              <li><strong>Faollik tarixi:</strong> Tizimga kirish sanalari, chop etilgan maqolalar, IP manzil (tizim xavfsizligi va spamning oldini olish uchun).</li>
            </ul>

            <h2 id="usage" className="text-2xl md:text-3xl font-bold text-[#141414] mt-16 mb-6">2. Ma'lumotlardan qanday foydalanamiz?</h2>
            <p>Biz sizning ma'lumotlaringizni faqat tizim faoliyatini ta'minlash uchun, xususan quyidagi maqsadlarda ishlatamiz:</p>
            <ul className="space-y-2">
              <li>Platformada sizni identifikatsiya qilish va avtorizatsiya jarayonini ta'minlash.</li>
              <li>Parolni unutganda tiklash kodlari va xizmatga oid muhim xabarlarni elektron pochtangizga yuborish.</li>
              <li>Xatoliklarni tahlil qilish, tizim sifatini va tezligini oshirish.</li>
              <li>Noqonuniy harakatlar, firibgarlik yoki spam tarqalishini aniqlash va ularning oldini olish.</li>
            </ul>

            <h2 id="thirdparty" className="text-2xl md:text-3xl font-bold text-[#141414] mt-16 mb-6">3. Uchinchi shaxslarga uzatish</h2>
            <p>
              Biz sizning shaxsiy ma'lumotlaringizni <strong>hech qachon</strong> uchinchi shaxslarga sotmaymiz yoki reklama beruvchilar bilan bo'lishmaymiz.
            </p>
            <p>
              Sizning ma'lumotlaringiz faqatgina Qonunchilik doirasida, rasmiy sud yoki huquq-tartibot organlari tomonidan rasmiy so'rovnoma bilan talab qilingandagina oshkor etilishi mumkin (agar bu qonuniy asosga ega bo'lsa).
            </p>

            <h2 id="cookies" className="text-2xl md:text-3xl font-bold text-[#141414] mt-16 mb-6">4. Cookie fayllari (Cookies)</h2>
            <p>
              Platformamiz avtorizatsiya (sessiya) holatini saqlab qolish va sizning shaxsiy sozlamalaringizni eslab qolish uchun faqat eng zaruriy <strong>xavfsiz cookie</strong> (Secure / HttpOnly) fayllaridan foydalanadi. Biz uchinchi tomonlarning kuzatuvchi (obtrusive tracking) yoki reklama cookie-larini ishlatmaymiz.
            </p>

            <h2 id="delete" className="text-2xl md:text-3xl font-bold text-[#141414] mt-16 mb-6">5. Ma'lumotlarni o'chirish huquqi</h2>
            <p>
              Siz istalgan vaqtda o'z profilingizni va u yerdagi barcha maqolalaringizni to'liq o'chirib yuborish huquqiga egasiz. Akkaunt o'chirilgach, ma'lumotlar qayta tiklanmaydigan qilib serverlardan darhol va to'liq tozalanadi.
            </p>
            <p className="mt-8">
              Barcha savol va takliflaringiz bo'lsa bizga yozing: <a href="mailto:support@inkly.uz" className="text-[#FF6A00] font-medium hover:underline">support@inkly.uz</a>
            </p>
          </article>
        </div>
      </section>
    </main>
  )
}
