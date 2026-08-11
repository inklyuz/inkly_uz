import { PenLine, Send, TrendingUp } from "lucide-react"

const steps = [
  {
    icon: PenLine,
    title: "Yozing",
    text: "Markdown muharririda maqola yozing. Qoralama sifatida saqlang, tayyor bo'lganda nashr qiling.",
  },
  {
    icon: Send,
    title: "Nashr qiling",
    text: "Bir bosishda saytda va Telegram kanalingizda chiqadi. Har bir maqola o'z manziliga ega bo'ladi.",
  },
  {
    icon: TrendingUp,
    title: "O'sing",
    text: "Ko'rishlar, reaksiyalar va izohlar orqali auditoriyangiz qanday o'sayotganini kuzating.",
  },
]

export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="border-y border-cream-300 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">Qanday ishlaydi</p>
          <h2 id="how-heading" className="mt-1.5 text-2xl font-bold tracking-tight text-balance text-ink-900 sm:text-3xl">
            Uch qadam — g&apos;oyadan auditoriyagacha
          </h2>
        </div>

        <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
          {steps.map((step) => (
            <div key={step.title} className="flex flex-col gap-4">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink-900 text-lime-400">
                <step.icon size={19} aria-hidden="true" />
              </span>
              <h3 className="text-lg font-semibold tracking-tight text-ink-900">{step.title}</h3>
              <p className="text-sm leading-relaxed text-ink-600">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
