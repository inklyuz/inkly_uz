import Image from "next/image"

import { AvatarGlow } from "@/components/profile/avatar-glow"

interface ProfileBannerProps {
    avatarUrl: string
}

/**
 * YouTube kanal banneriga o'xshash: faqat fon.
 * Matn, avatar va statistikalar bu yerda YO'Q — ular ProfileHeader'da,
 * bannerdan pastda joylashadi.
 */
export function ProfileBanner({ avatarUrl }: ProfileBannerProps) {
    return (
        <AvatarGlow avatarUrl={avatarUrl}>
            <section className="relative h-[200px] w-full overflow-hidden sm:h-[240px] lg:h-[280px]">

                {/* Baza — logo rangi */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundColor: "rgb(var(--glow-r, 255), var(--glow-g, 140), var(--glow-b, 60))",
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
                        backgroundColor: "rgb(var(--glow-r, 255), var(--glow-g, 140), var(--glow-b, 60))",
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
                        backgroundColor: "rgb(var(--glow-r, 255), var(--glow-g, 140), var(--glow-b, 60))",
                        maskImage: "linear-gradient(to top, black 0%, transparent 60%)",
                        WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 60%)",
                        mixBlendMode: "multiply",
                        opacity: 0.5,
                    }}
                />
            </section>
        </AvatarGlow>
    )
}