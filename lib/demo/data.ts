import type {
  CategoryPublicResponse,
  CommentResponse,
  CreatorPublicResponse,
  Page,
  PostAuthor,
  PostCategory,
  PostListItem,
  PostResponse,
  UserPublicResponse,
} from "@/types/api"

/**
 * Demo kontent — backend (https://inkly.uz/api/v1) mavjud bo'lmaganda
 * sahifalar bo'sh qolmasligi uchun ishlatiladi.
 */

const authors: Record<string, PostAuthor> = {
  sardor: {
    username: "sardor",
    slug: "sardor",
    full_name: "Sardor Yo'ldoshev",
    avatar: null,
    is_verified: true,
  },
  malika: {
    username: "malika",
    slug: "malika",
    full_name: "Malika Karimova",
    avatar: null,
    is_verified: true,
  },
  jasur: {
    username: "jasur",
    slug: "jasur",
    full_name: "Jasur Rahmonov",
    avatar: null,
    is_verified: false,
  },
  nilufar: {
    username: "nilufar",
    slug: "nilufar",
    full_name: "Nilufar Abdullayeva",
    avatar: null,
    is_verified: false,
  },
}

export const demoCategories: CategoryPublicResponse[] = [
  {
    uuid: "cat-1",
    name: "Texnologiya",
    slug: "texnologiya",
    description: "Dasturlash, mahsulot va internet haqida maqolalar.",
    icon: null,
    post_count: 24,
  },
  {
    uuid: "cat-2",
    name: "Madaniyat",
    slug: "madaniyat",
    description: "Adabiyot, kino, musiqa va shahar hayoti.",
    icon: null,
    post_count: 18,
  },
  {
    uuid: "cat-3",
    name: "Til va yozuv",
    slug: "til-va-yozuv",
    description: "O'zbek tili, tarjima va yozuv mahorati.",
    icon: null,
    post_count: 12,
  },
  {
    uuid: "cat-4",
    name: "Biznes",
    slug: "biznes",
    description: "Startaplar, iqtisod va mahalliy bozor.",
    icon: null,
    post_count: 9,
  },
  {
    uuid: "cat-5",
    name: "Ta'lim",
    slug: "talim",
    description: "O'qish, o'rganish va bilim ulashish.",
    icon: null,
    post_count: 7,
  },
]

const cat = (slug: string): PostCategory => {
  const found = demoCategories.find((c) => c.slug === slug)!
  return { uuid: found.uuid, name: found.name, slug: found.slug, icon: found.icon }
}

const body = (intro: string) => `${intro}

## Nega bu muhim

Har bir yozuvchi o'z ovozini topish uchun vaqt sarflaydi. Muhim narsa — boshlash
va to'xtamaslik. Birinchi maqolangiz mukammal bo'lmasligi mumkin, lekin u sizning
uslubingizni shakllantiradi.

> Yozish — fikrlashning eng halol shakli. Agar fikr chalkash bo'lsa, matn ham
> chalkash bo'ladi.

## Amaliy qadamlar

1. Kuniga 20 daqiqa yozing — hech qanday bahona qabul qilmang
2. Bir mavzuni tanlang va uni chuqur o'rganing
3. Matnni ovoz chiqarib o'qing — ritm shu yerda ko'rinadi
4. Nashr qilishdan qo'rqmang, tahrir keyin ham bo'ladi

Agar siz o'zbek tilida yozayotgan bo'lsangiz, bu ish yanada qadrli. Bizning
tilimizda hali yozilmagan mavzular juda ko'p — texnologiya, dizayn, iqtisod,
shahar hayoti. Har bir yangi matn shu bo'shliqni to'ldiradi.

### Qisqacha xulosa

Auditoriya bir kechada yig'ilmaydi. Ammo izchil yozgan har bir kishi oxir-oqibat
o'z o'quvchisini topadi. Muhimi — jarayonni yaxshi ko'rish.`

interface DemoPostSeed {
  slug: string
  title: string
  excerpt: string
  author: keyof typeof authors
  cover: string | null
  categories: string[]
  published_at: string
  likes: number
  dislikes: number
  comments: number
  views: number
  intro: string
}

const seeds: DemoPostSeed[] = [
  {
    slug: "ozbek-tilida-yozish-haqida",
    title: "O'zbek tilida yozish: nimadan boshlash kerak",
    excerpt:
      "Ona tilida yozishni boshlash uchun sizga mukammal g'oya kerak emas. Sizga faqat izchillik va bir necha oddiy qoida kifoya.",
    author: "sardor",
    cover: "/demo/cover-writing.png",
    categories: ["til-va-yozuv", "madaniyat"],
    published_at: "2026-08-04T09:20:00Z",
    likes: 312,
    dislikes: 4,
    comments: 27,
    views: 8420,
    intro:
      "Ko'p yillar davomida men ingliz tilida yozdim, chunki auditoriya kattaroq edi. Keyin bir narsani tushundim: o'zbek tilida yozganda men o'zim bo'lib qolaman.",
  },
  {
    slug: "toshkent-metrosi-dizayni",
    title: "Toshkent metrosi: yer ostidagi dizayn muzeyi",
    excerpt:
      "Har bir bekat o'z davrining estetikasini saqlab qolgan. Bu maqolada metroning vizual tilini o'qishni o'rganamiz.",
    author: "malika",
    cover: "/demo/cover-tashkent.png",
    categories: ["madaniyat"],
    published_at: "2026-08-02T14:05:00Z",
    likes: 486,
    dislikes: 7,
    comments: 41,
    views: 12310,
    intro:
      "Toshkent metrosi shunchaki transport emas — bu ochiq havodagi, aniqrog'i yer ostidagi dizayn arxivi. Marmar, mozaika va yorug'lik bilan ishlangan har bir bekat alohida hikoya.",
  },
  {
    slug: "mahalliy-startap-uchun-mahsulot",
    title: "Mahalliy bozor uchun mahsulot qurish",
    excerpt:
      "Silicon Valley kitoblari foydali, lekin Chorsu bozorida ishlamaydi. Mahalliy kontekstni tushunish haqida.",
    author: "jasur",
    cover: "/demo/cover-code.png",
    categories: ["biznes", "texnologiya"],
    published_at: "2026-07-29T07:40:00Z",
    likes: 208,
    dislikes: 11,
    comments: 19,
    views: 6180,
    intro:
      "Birinchi startapimni yopganimda tushundim: muammoni to'g'ri tanlash mahsulotni to'g'ri qurishdan muhimroq. Va muammo har doim mahalliy bo'ladi.",
  },
  {
    slug: "kitob-oqish-odati",
    title: "Kuniga 30 bet: kitob o'qish odatini qanday qurdim",
    excerpt: "Bir yilda 24 kitob. Sir hech qanday ilovada emas — oddiy tizim va kechki vaqtni himoya qilishda.",
    author: "nilufar",
    cover: "/demo/cover-books.png",
    categories: ["talim", "madaniyat"],
    published_at: "2026-07-25T18:15:00Z",
    likes: 174,
    dislikes: 2,
    comments: 15,
    views: 4930,
    intro:
      "Men uzoq vaqt kitob o'qishni xohlardim, lekin har kuni telefon g'olib chiqardi. Yechim juda oddiy bo'lib chiqdi: o'qishni ish emas, dam olish deb qabul qilish.",
  },
  {
    slug: "frontend-2026",
    title: "2026-yilda frontend: nimani o'rganish kerak",
    excerpt: "Har oyda yangi framework chiqadi. Lekin asosiy narsalar o'zgarmagan — mana ular.",
    author: "sardor",
    cover: null,
    categories: ["texnologiya"],
    published_at: "2026-07-21T11:00:00Z",
    likes: 395,
    dislikes: 18,
    comments: 52,
    views: 15870,
    intro:
      "Yangi boshlovchilar menga tez-tez yozadi: qaysi framework'ni o'rganay? Javobim bir necha yildan beri o'zgarmadi — avval platformani o'rgan, keyin asbobni.",
  },
  {
    slug: "tarjima-mahorati",
    title: "Tarjima — qayta yozish san'ati",
    excerpt: "Yaxshi tarjima so'zma-so'z bo'lmaydi. U asl matnning ritmini boshqa tilda qayta quradi.",
    author: "malika",
    cover: null,
    categories: ["til-va-yozuv"],
    published_at: "2026-07-16T08:30:00Z",
    likes: 141,
    dislikes: 3,
    comments: 11,
    views: 3720,
    intro:
      "Birinchi tarjimam juda aniq edi va shuning uchun juda yomon edi. Har bir so'z joyida turgan, lekin matn nafas olmayotgan edi.",
  },
  {
    slug: "remote-ishlash-ozbekistonda",
    title: "O'zbekistondan masofadan ishlash: 3 yillik tajriba",
    excerpt: "Vaqt mintaqasi, to'lovlar, muloqot va charchoq. Hech kim aytmaydigan tafsilotlar.",
    author: "jasur",
    cover: null,
    categories: ["biznes", "texnologiya"],
    published_at: "2026-07-09T16:45:00Z",
    likes: 267,
    dislikes: 9,
    comments: 34,
    views: 9250,
    intro:
      "Uch yil oldin Toshkentdan turib Berlindagi kompaniyada ishlay boshladim. Bu erkinlik, lekin erkinlik ham o'z tartibini talab qiladi.",
  },
  {
    slug: "yozuv-uslubi-tozalash",
    title: "Matnni tozalash: 7 ta oddiy tahrir qoidasi",
    excerpt: "Har bir jumladan bitta so'zni olib tashlang. Matn darhol kuchliroq bo'ladi.",
    author: "nilufar",
    cover: null,
    categories: ["til-va-yozuv", "talim"],
    published_at: "2026-07-02T10:10:00Z",
    likes: 189,
    dislikes: 5,
    comments: 22,
    views: 5410,
    intro:
      "Tahrir — yozishning eng yoqimli qismi, chunki bu yerda matn haqiqatan ham shakl oladi. Mana men har doim qo'llaydigan yetti qoida.",
  },
  {
    slug: "podkast-boshlash",
    title: "O'zbek tilida podkast boshlash tajribasi",
    excerpt: "Mikrofon eng arzon qismi bo'lib chiqdi. Eng qimmati — izchillik va tahrir vaqti.",
    author: "sardor",
    cover: null,
    categories: ["madaniyat", "biznes"],
    published_at: "2026-06-24T13:25:00Z",
    likes: 122,
    dislikes: 6,
    comments: 9,
    views: 3110,
    intro:
      "Podkast boshlash haqida bir yil o'yladim va bir kunda boshladim. Mana o'sha bir kunda va keyingi ellik epizodda o'rganganlarim.",
  },
]

export const demoPosts: PostResponse[] = seeds.map((seed, i) => ({
  uuid: `post-${i + 1}`,
  slug: seed.slug,
  title: seed.title,
  excerpt: seed.excerpt,
  content: body(seed.intro),
  cover: seed.cover,
  status: "published",
  visibility: "public",
  published_at: seed.published_at,
  created_at: seed.published_at,
  updated_at: seed.published_at,
  author: authors[seed.author],
  likes_count: seed.likes,
  dislikes_count: seed.dislikes,
  comments_count: seed.comments,
  views_count: seed.views,
  reacted: null,
  categories: seed.categories.map(cat),
}))

export const demoPostList: PostListItem[] = demoPosts.map(({ content, reacted, ...rest }) => rest)

export const demoUsers: Record<string, UserPublicResponse> = {
  sardor: {
    full_name: "Sardor Yo'ldoshev",
    username: "sardor",
    slug: "sardor",
    bio: "Dasturchi va yozuvchi. O'zbek tilida texnologiya haqida yozaman. Inkly asoschilaridan biri.",
    avatar: null,
    cover: "/demo/cover-tashkent.png",
    website: "https://sardor.uz",
    location: "Toshkent, O'zbekiston",
    socials: {
      telegram: "sardoryoldoshev",
      instagram: null,
      youtube: null,
      github: "sardor",
      twitter: null,
    },
    is_verified: true,
  },
  malika: {
    full_name: "Malika Karimova",
    username: "malika",
    slug: "malika",
    bio: "Muharrir va tarjimon. Adabiyot, shahar va madaniyat haqida.",
    avatar: null,
    cover: null,
    website: null,
    location: "Samarqand",
    socials: {
      telegram: "malikakarimova",
      instagram: "malika.k",
      youtube: null,
      github: null,
      twitter: null,
    },
    is_verified: true,
  },
  jasur: {
    full_name: "Jasur Rahmonov",
    username: "jasur",
    slug: "jasur",
    bio: "Mahsulot menejeri. Startaplar va mahalliy bozor haqida yozaman.",
    avatar: null,
    cover: null,
    website: null,
    location: "Toshkent",
    socials: { telegram: "jasurr", instagram: null, youtube: null, github: "jasur", twitter: null },
    is_verified: false,
  },
  nilufar: {
    full_name: "Nilufar Abdullayeva",
    username: "nilufar",
    slug: "nilufar",
    bio: "O'qituvchi. Kitoblar, ta'lim va yozuv mahorati haqida.",
    avatar: null,
    cover: null,
    website: null,
    location: "Buxoro",
    socials: { telegram: null, instagram: null, youtube: null, github: null, twitter: null },
    is_verified: false,
  },
}

export const demoCreators: CreatorPublicResponse[] = Object.values(demoUsers).map((user, i) => ({
  uuid: `creator-${i + 1}`,
  username: user.username,
  slug: user.slug,
  full_name: user.full_name,
  avatar_url: user.avatar,
  cover_url: user.cover,
  bio: user.bio,
  description: user.bio,
  is_verified: user.is_verified,
  created_at: "2025-11-02T10:00:00Z",
}))

export const demoComments: CommentResponse[] = [
  {
    uuid: "comment-1",
    content: "Juda kerakli maqola. Ayniqsa izchillik haqidagi qism menga to'g'ri keldi.",
    created_at: "2026-08-05T12:00:00Z",
    updated_at: "2026-08-05T12:00:00Z",
    author: authors.nilufar,
  },
  {
    uuid: "comment-2",
    content: "Rahmat! Ona tilida bunday matnlar ko'proq bo'lishini juda xohlardim.",
    created_at: "2026-08-06T09:30:00Z",
    updated_at: "2026-08-06T09:30:00Z",
    author: authors.jasur,
  },
]

export function paginate<T>(items: T[], page = 1, pageSize = 20): Page<T> {
  const total = items.length
  const start = (page - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    page,
    page_size: pageSize,
    total,
    total_pages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export function filterDemoPosts(params: {
  author?: string
  category?: string
  search?: string
}): PostListItem[] {
  const query = params.search?.trim().toLowerCase()
  return demoPostList.filter((post) => {
    if (params.author && post.author.username !== params.author.replace(/^@/, "")) return false
    if (params.category && !post.categories.some((c) => c.slug === params.category)) return false
    if (query) {
      const haystack = `${post.title} ${post.excerpt ?? ""}`.toLowerCase()
      if (!haystack.includes(query)) return false
    }
    return true
  })
}
