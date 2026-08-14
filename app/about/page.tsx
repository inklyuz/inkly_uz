import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Biz haqimizda - Inkly",
  description: "Inkly platformasi haqida ma'lumot. Erkin ijodkorlar uchun eng qulay yozish maydoni.",
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-5 py-24 md:py-32">
        <h1 className="mb-6 text-5xl md:text-7xl font-bold tracking-tight text-[#141414] leading-[1.1]">
          Biz haqimizda
        </h1>
        <p className="text-xl md:text-2xl leading-relaxed text-[#36565F] max-w-2xl font-light">
          <strong>Inkly</strong> — erkin ijodkorlar, jurnalistlar va o'z fikrlarini yozib qoldirishni yaxshi ko'radigan insonlar uchun yaratilgan, chalg'ituvchi unsurlardan xoli platformadir.
        </p>
      </section>

      {/* Main Content */}
      <section className="border-t border-[#E8E3DD] bg-[#FAFAFA]">
        <div className="mx-auto max-w-4xl px-5 py-20 md:py-28 flex flex-col gap-16 md:gap-24">
          
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-[#141414] mb-4">Bizning maqsadimiz</h2>
            </div>
            <div className="prose prose-inkly text-lg text-[#36565F]">
              <p>
                Hozirgi axborot asrida diqqatni jamlash tobora qiyinlashib bormoqda. Murakkab interfeyslar, tinimsiz bildirishnomalar va keraksiz tugmalar yozuvchi uchun eng kerakli narsa — ilhomni bo'g'ib qo'yishi mumkin.
              </p>
              <p>
                Inkly aynan shu muammoga yechim sifatida dunyoga keldi. Biz yozuvchilarga fikrlarini erkin ifoda etishlari uchun barcha qulayliklarga ega, ammo shu bilan birga nihoyatda sodda va sokin muhitni taqdim etamiz. Sizning ishingiz faqat yozish; matnning qanday qilib mukammal ko'rinishi haqida biz qayg'uramiz.
              </p>
            </div>
          </div>

          <div className="border-t border-[#E8E3DD] pt-16 md:pt-24">
            <h2 className="text-3xl font-bold tracking-tight text-[#141414] mb-12">Nima uchun aynan Inkly?</h2>
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <div className="p-8 rounded-2xl bg-white border border-[#E8E3DD] shadow-sm transition-shadow hover:shadow-md">
                <div className="w-12 h-12 rounded-full bg-[#FF6A00]/10 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-[#FF6A00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#141414] mb-3">Minimalizm</h3>
                <p className="text-[#6B7280] leading-relaxed">
                  Hech qanday ortiqcha elementlarsiz toza interfeys. Sizning diqqatingizni yozishdan chalg'itadigan hech narsa yo'q.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-white border border-[#E8E3DD] shadow-sm transition-shadow hover:shadow-md">
                <div className="w-12 h-12 rounded-full bg-[#FF6A00]/10 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-[#FF6A00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#141414] mb-3">Xavfsizlik</h3>
                <p className="text-[#6B7280] leading-relaxed">
                  Ma'lumotlaringiz xavfsiz va ishonchli saqlanadi. Loyihalar ustida xavotirsiz ishlashingiz mumkin.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-white border border-[#E8E3DD] shadow-sm transition-shadow hover:shadow-md">
                <div className="w-12 h-12 rounded-full bg-[#FF6A00]/10 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-[#FF6A00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#141414] mb-3">Tipografiya</h3>
                <p className="text-[#6B7280] leading-relaxed">
                  Maxsus tanlangan shriftlar va satr oraliqlari asarlaringizni nafaqat o'qishga oson, balki vizual jihatdan go'zal qiladi.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-white border border-[#E8E3DD] shadow-sm transition-shadow hover:shadow-md">
                <div className="w-12 h-12 rounded-full bg-[#FF6A00]/10 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-[#FF6A00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#141414] mb-3">Oson tahrirlash</h3>
                <p className="text-[#6B7280] leading-relaxed">
                  Zamonaviy block-editor orqali matn, rasm, havola va boshqa unsurlarni birgina klik bilan qo'shish imkoniyati.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-start border-t border-[#E8E3DD] pt-16 md:pt-24">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-[#141414] mb-4">Bizning jamoa</h2>
            </div>
            <div className="prose prose-inkly text-lg text-[#36565F]">
              <p>
                Biz texnologiyalar, dizayn va sifatli matnlar ustida qayg'uradigan yosh va tajribali mutaxassislar jamoasimiz. Bizning eng katta orzumiz — O'zbekiston va dunyo bo'ylab sifatli hamda savodli maqolalar ko'payishiga o'z hissamizni qo'shishdir.
              </p>
              <p>
                Inkly platformasini tanlaganingiz uchun tashakkur. Fikrlaringiz o'z o'quvchilarini topishiga chin dildan ishonamiz!
              </p>
            </div>
          </div>

        </div>
      </section>
    </main>
  )
}
