import Image from "next/image"

interface ProfileBannerProps {
    avatarUrl: string
    /** Backend'dan kelgan haqiqiy banner rasmi (user.cover). Mavjud bo'lsa,
     *  rangga asoslangan fallback o'rniga shu ishlatiladi. */
    coverUrl?: string | null
}

/**
 * YouTube kanal banneriga o'xshash: faqat fon.
 * Matn, avatar va statistikalar bu yerda YO'Q — ular ProfileHeader'da,
 * bannerdan pastda joylashadi.
 *
 * Ikki holat:
 * 1) Backend `cover` (banner) rasm bergan bo'lsa — o'sha rasm to'g'ridan
 *    to'g'ri banner sifatida ko'rsatiladi.
 * 2) Bo'lmasa — rang endi shu komponent ichida hisoblanmaydi: --glow-r/g/b
 *    CSS o'zgaruvchilari page.tsx darajasida BITTA <AvatarGlow> orqali
 *    o'rnatiladi (foydalanuvchi avatarining dominant rangi) va shu yerga
 *    meros bo'lib tushadi — mobil hero bilan bir xil manba.
 */
export function ProfileBanner({ avatarUrl, coverUrl }: ProfileBannerProps) {
    if (coverUrl) {
        return (
            <section className="relative h-[200px] w-full overflow-hidden bg-[#F3EDE7] sm:h-[240px] lg:h-[280px]">
                <Image
                    src={coverUrl}
                    alt=""
                    aria-hidden
                    fill
                    sizes="100vw"
                    priority
                    className="object-cover object-center"
                />

                {/* Pastga yengil to'qlashtirish — ostidagi oq kontent (ProfileHeader)
                    bilan tekis qo'shilishi uchun, xuddi rang-fallback variantidagi kabi */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: "linear-gradient(to top, rgba(0,0,0,0.28) 0%, transparent 45%)",
                    }}
                />
            </section>
        )
    }

    return (
        <section className="relative h-[200px] w-full overflow-hidden sm:h-[240px] lg:h-[280px]">

            {/* Baza — avatardan chiqarilgan rang (yoki brend rangi, agar avatar bo'lmasa/CORS xatosi bo'lsa) */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundColor: "rgb(var(--glow-r, 255), var(--glow-g, 106), var(--glow-b, 0))",
                }}
            />

            {/* Chap: aniq logo rasm, o'ngga qarab yo'qoladi */}
            {avatarUrl && (
                <div className="absolute left-0 top-0 h-full w-[45%] sm:w-[35%]">
                    <Image
                        src={avatarUrl}
                        alt=""
                        aria-hidden
                        fill
                        sizes="45vw"
                        className="object-cover object-center"
                        style={{
                            maskImage: "linear-gradient(to right, black 40%, transparent 100%)",
                            WebkitMaskImage: "linear-gradient(to right, black 40%, transparent 100%)",
                        }}
                    />
                </div>
            )}

            {/* Yorqinlik cho'qqisi — logo yonida */}
            <div
                className="absolute inset-0"
                style={{
                    background: "radial-gradient(55% 120% at 15% 40%, rgba(255,255,255,0.35) 0%, transparent 60%)",
                    mixBlendMode: "overlay",
                }}
            />

            {/* O'ngga borgan sari to'qlashtirish — rangning o'zi bilan multiply, qora yo'q */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundColor: "rgb(var(--glow-r, 255), var(--glow-g, 106), var(--glow-b, 0))",
                    maskImage: "linear-gradient(to right, transparent 35%, black 100%)",
                    WebkitMaskImage: "linear-gradient(to right, transparent 35%, black 100%)",
                    mixBlendMode: "multiply",
                    opacity: 0.7,
                }}
            />

            {/* Pastga to'qlashtirish — avatar/kontent joylashadigan chegara bilan tekis qo'shilish uchun */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundColor: "rgb(var(--glow-r, 255), var(--glow-g, 106), var(--glow-b, 0))",
                    maskImage: "linear-gradient(to top, black 0%, transparent 60%)",
                    WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 60%)",
                    mixBlendMode: "multiply",
                    opacity: 0.5,
                }}
            />
        </section>
    )
}
