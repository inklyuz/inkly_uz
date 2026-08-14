import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Aloqa - Inkly",
  description: "Inkly jamoasi bilan bog'lanish uchun aloqa ma'lumotlari.",
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="mx-auto max-w-4xl px-5 py-24 md:py-32">
        <h1 className="mb-6 text-5xl md:text-7xl font-bold tracking-tight text-[#141414] leading-[1.1]">
          Biz bilan bog'laning
        </h1>
        <p className="text-xl md:text-2xl leading-relaxed text-[#36565F] max-w-2xl font-light">
          Fikr, mulohaza va takliflaringiz biz uchun juda muhim! Agar loyiha bo'yicha savollaringiz, hamkorlik takliflaringiz bo'lsa bizga yozing.
        </p>
      </section>

      {/* Main Content */}
      <section className="border-t border-[#E8E3DD] bg-[#FAFAFA]">
        <div className="mx-auto max-w-4xl px-5 py-20 md:py-28">
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            
            {/* Email Support Card */}
            <a 
              href="mailto:support@inkly.uz"
              className="group block p-10 rounded-3xl bg-white border border-[#E8E3DD] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-full bg-[#FF6A00]/10 flex items-center justify-center mb-8 group-hover:bg-[#FF6A00] transition-colors duration-300">
                <svg className="w-7 h-7 text-[#FF6A00] group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#141414] mb-2">Yordam va qo'llab-quvvatlash</h3>
              <p className="text-[#6B7280] mb-6 leading-relaxed">Texnik muammolar, tizimda ishlash va umumiy savollar uchun asosiy elektron pochta manzilimiz.</p>
              <p className="text-lg font-medium text-[#FF6A00]">support@inkly.uz &rarr;</p>
            </a>

            {/* Business Email Card */}
            <a 
              href="mailto:hello@inkly.uz"
              className="group block p-10 rounded-3xl bg-white border border-[#E8E3DD] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-full bg-[#141414]/5 flex items-center justify-center mb-8 group-hover:bg-[#141414] transition-colors duration-300">
                <svg className="w-7 h-7 text-[#141414] group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#141414] mb-2">Hamkorlik va takliflar</h3>
              <p className="text-[#6B7280] mb-6 leading-relaxed">Biznes hamkorlik, reklama va o'zaro manfaatli takliflar yuzasidan murojaatlar uchun manzil.</p>
              <p className="text-lg font-medium text-[#141414]">hello@inkly.uz &rarr;</p>
            </a>

            {/* Telegram Channel Card */}
            <a 
              href="https://t.me/inkly_uz"
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-10 rounded-3xl bg-white border border-[#E8E3DD] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-full bg-[#24A1DE]/10 flex items-center justify-center mb-8 group-hover:bg-[#24A1DE] transition-colors duration-300">
                <svg className="w-7 h-7 text-[#24A1DE] group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#141414] mb-2">Telegram kanal</h3>
              <p className="text-[#6B7280] mb-6 leading-relaxed">Inkly haqidagi eng so'nggi yangiliklar, foydali ma'lumotlar va yangilanishlarni kuzatib boring.</p>
              <p className="text-lg font-medium text-[#24A1DE]">@inkly_uz &rarr;</p>
            </a>
            
            {/* Telegram Bot Card */}
            <a 
              href="https://t.me/inkly_uz_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-10 rounded-3xl bg-white border border-[#E8E3DD] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-full bg-[#24A1DE]/10 flex items-center justify-center mb-8 group-hover:bg-[#24A1DE] transition-colors duration-300">
                <svg className="w-7 h-7 text-[#24A1DE] group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#141414] mb-2">Avtorizatsiya boti</h3>
              <p className="text-[#6B7280] mb-6 leading-relaxed">Tizimga xavfsiz kirish uchun hamda ba'zi tezkor buyruqlar uchun mo'ljallangan maxsus bot.</p>
              <p className="text-lg font-medium text-[#24A1DE]">@inkly_uz_bot &rarr;</p>
            </a>

          </div>

          <div className="mt-16 text-center">
            <p className="text-[#6B7280]">
              Barcha murojaatlarga iloji boricha tez fursatlarda (odatda 24-48 soat ichida) javob berishga harakat qilamiz.<br/>Inkly bilan birga ekanligingiz uchun rahmat!
            </p>
          </div>

        </div>
      </section>
    </main>
  )
}
