import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Foydalanish shartlari - Inkly",
  description: "Inkly platformasidan foydalanish shartlari va qoidalari.",
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-5 py-24 md:py-32">
        <h1 className="mb-6 text-5xl md:text-7xl font-bold tracking-tight text-[#141414] leading-[1.1]">
          Foydalanish shartlari
        </h1>
        <p className="text-xl leading-relaxed text-[#6B7280]">
          So'nggi yangilanish: 15-Avgust, 2026-yil
        </p>
      </section>

      {/* Main Content */}
      <section className="border-t border-[#E8E3DD] bg-white">
        <div className="mx-auto max-w-4xl px-5 py-20 flex flex-col md:flex-row gap-12">
          
          {/* Sidebar / Quick Links (Hidden on small screens) */}
          <aside className="hidden md:block w-64 shrink-0 relative">
            <div className="sticky top-12 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-6">Mundarija</h3>
              <ul className="space-y-4 text-sm text-[#36565F] font-medium">
                <li><a href="#rights" className="hover:text-[#FF6A00] transition-colors">1. Kontentga bo'lgan huquqlar</a></li>
                <li><a href="#prohibited" className="hover:text-[#FF6A00] transition-colors">2. Taqiqlangan harakatlar</a></li>
                <li><a href="#liability" className="hover:text-[#FF6A00] transition-colors">3. Mas'uliyatni cheklash</a></li>
                <li><a href="#changes" className="hover:text-[#FF6A00] transition-colors">4. Shartlarga o'zgartirish</a></li>
              </ul>
            </div>
          </aside>

          {/* Terms text */}
          <article className="prose prose-inkly prose-lg max-w-none text-[#36565F]">
            <p className="lead text-[#141414]">
              Ushbu Foydalanish shartlari ("Shartlar") siz va Inkly platformasi o'rtasidagi munosabatlarni tartibga soladi. Platformadan ro'yxatdan o'tish yoki undan foydalanish orqali siz ushbu shartlarga rozi ekanligingizni bildirasiz.
            </p>

            <h2 id="rights" className="text-2xl md:text-3xl font-bold text-[#141414] mt-16 mb-6">1. Kontentga bo'lgan huquqlar</h2>
            <p>
              Siz Inkly platformasida chop etgan har bir maqola, matn, surat yoki boshqa materiallar ("Kontent") uchun to'liq huquqqa ega bo'lib qolasiz. Biz sizning intellektual mulkingizga da'vo qilmaymiz.
            </p>
            <p>
              Biroq, tizim ishlashi uchun siz bizga ushbu kontentni serverlarda saqlash, nusxalash va internet tarmog'ida ommaga namoyish etish bo'yicha cheklanmagan litsenziyani taqdim etasiz.
            </p>

            <h2 id="prohibited" className="text-2xl md:text-3xl font-bold text-[#141414] mt-16 mb-6">2. Taqiqlangan harakatlar va kontent</h2>
            <p>
              Platforma toza, madaniyatli va xavfsiz muhitni saqlashga intiladi. Quyidagi turdagi kontentlarni joylashtirish qat'iyan man etiladi:
            </p>
            <ul className="space-y-2">
              <li>O'zbekiston Respublikasi qonunchiligiga zid bo'lgan har qanday ma'lumotlar.</li>
              <li>O'zgalarning mualliflik huquqlarini to'g'ridan-to'g'ri buzuvchi materiallar (plagiat).</li>
              <li>Nafrat, zo'ravonlik, kamsitish yoki irqchilikni targ'ib qiluvchi matnlar.</li>
              <li>Spam, fishing havolalar yoki zararli dasturlarni tarqatuvchi postlar.</li>
              <li>Pornografik yoki 18+ yosh chegarasidagi keskin materiallar.</li>
            </ul>
            <p>
              Agar shu kabi materiallar aniqlansa, Inkly ma'muriyati kontentni ogohlantirishsiz o'chirish va foydalanuvchi akkauntini bloklash huquqini o'zida saqlab qoladi.
            </p>

            <h2 id="liability" className="text-2xl md:text-3xl font-bold text-[#141414] mt-16 mb-6">3. Mas'uliyatni cheklash</h2>
            <p>
              Inkly platformasi asosan axborot vositachisi hisoblanadi. Biz foydalanuvchilar tomonidan joylashtirilgan maqolalarning aniqligi, to'g'riligi yoki huquqiy oqibatlari uchun javobgarlikni zimmamizga olmaymiz. Har bir muallif o'zi yozgan matnga shaxsan o'zi javobgardir.
            </p>
            <p>
              Biz tizim uzluksiz ishlashiga harakat qilamiz, lekin server uzilishlari, ma'lumotlar yo'qolishi yoki texnik nosozliklar yuz berganda kompensatsiya to'lash majburiyatiga ega emasmiz.
            </p>

            <h2 id="changes" className="text-2xl md:text-3xl font-bold text-[#141414] mt-16 mb-6">4. Shartlarga o'zgartirish kiritish</h2>
            <p>
              Inkly ushbu shartlarga vaqt-vaqti bilan o'zgartirish kiritishi mumkin. Agar shartlarda jiddiy o'zgarishlar bo'lsa, sizni ro'yxatdan o'tgan pochtangiz yoki platformadagi bildirishnomalar orqali xabardor qilamiz.
            </p>
            <p>
              O'zgarishlardan so'ng platformadan foydalanishda davom etishingiz yangi shartlarni qabul qilganingizni anglatadi.
            </p>
            
          </article>
        </div>
      </section>
    </main>
  )
}
