# JakSky

JakSky adalah platform video premium dengan akses gratis dan VIP, sistem komentar, rating, like/unlike, profil user, admin upload, moderator komentar, owner control, dan Customer Service.

## Fitur Utama

- Landing page premium
- Register dan login user
- Admin upload konten, thumbnail, dan video
- Filter konten: Semua, Terbaru, Favorit, Trending, VIP
- Detail video dengan like, unlike, rating, komentar, download
- Moderator panel untuk komentar dan CS Inbox
- Profile customization
- Owner/Admin/Moderator/User role
- Siap deploy ke Vercel

## Local Development

```bash
npm install
npm run dev
```

Buka:

```text
http://localhost:3000
```

## Environment Variables

Buat file `.env.local` untuk local development.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
BLOB_READ_WRITE_TOKEN=
NEXT_PUBLIC_SITE_URL=
```

Jangan commit `.env.local`.

## Deploy

Project ini siap deploy ke Vercel setelah build lokal sukses.

```bash
npm run build
```
