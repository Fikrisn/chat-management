# Chat Management Admin - React + TypeScript + Vite + Bun

Aplikasi ini adalah **Frontend Admin Panel** untuk manajemen chat, dibangun menggunakan **React** (Vite), **TypeScript**, dan dijalankan dengan runtime **Bun**.  
Fokus utama aplikasi ini adalah membantu admin mengelola channel notifikasi, template pesan, user, kategori, pembayaran, dan order secara efisien.

---

## 🚀 Fitur Utama

- **Manajemen Channel:** Kelola berbagai channel notifikasi (WhatsApp, Telegram, Email, SMS, In-App, dll).
- **Manajemen Template:** Buat, edit, dan hapus template pesan untuk berbagai channel.
- **Manajemen User:** Pantau dan kelola user serta customer aktif.
- **Manajemen Kategori:** Atur kategori pesan dan channel sesuai kebutuhan bisnis.
- **Manajemen Pembayaran:** Integrasi dan pengelolaan metode pembayaran.
- **Order Management:** Pantau dan kelola transaksi pembayaran serta status order.
- **Notifikasi Real-Time:** Notifikasi order terbaru langsung di header admin.
- **Dashboard Overview:** Statistik dan insight aktivitas sistem secara real-time.
- **Responsif:** Tampilan optimal di desktop, tablet, dan mobile.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Bahasa:** [TypeScript](https://www.typescriptlang.org/)
- **Runtime:** [Bun](https://bun.sh/)
- **Linting:** [ESLint](https://eslint.org/) + [typescript-eslint](https://typescript-eslint.io/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 📦 Struktur Project

```
chat-management/
├── public/              # Static assets
├── src/                 # Source code utama (React + TypeScript)
│   ├── components/      # Komponen UI (Sidebar, Header, dll)
│   ├── pages/           # Halaman utama (Dashboard, Channel, Users, dll)
│   ├── data/            # Mock data JSON untuk development
│   └── ...              # File lain
├── tsconfig.json        # Konfigurasi TypeScript
├── vite.config.ts       # Konfigurasi Vite
├── bunfig.toml          # Konfigurasi Bun (jika ada)
├── package.json         # Dependencies & scripts
└── README.md            # Dokumentasi
```

---

## ⚡️ Cara Menjalankan Project

1. **Install dependencies dengan Bun**
   ```sh
   bun install
   ```

2. **Jalankan development server**
   ```sh
   bun run dev
   ```
   atau langsung:
   ```sh
   vite
   ```

3. **Build untuk production**
   ```sh
   bun run build
   ```

4. **Preview production build**
   ```sh
   bun run preview
   ```

---

## 🌐 Deploy ke Vercel

1. **Push project ke GitHub**
2. **Import repository ke Vercel** melalui dashboard [Vercel](https://vercel.com/import)
3. **Vercel otomatis mendeteksi Vite + React + TypeScript**
4. **Build & deploy**, dapatkan URL seperti `https://your-app.vercel.app`

---

## 🔒 Konfigurasi ESLint & TypeScript

Untuk pengembangan produksi, gunakan konfigurasi ESLint yang mendukung type-aware lint rules dan React:

```js
// eslint.config.js
import tseslint from 'typescript-eslint'
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      reactX.configs['recommended-typescript'],
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

---

## 📚 Dokumentasi & Referensi

- [Bun](https://bun.sh/)
- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [ESLint](https://eslint.org/)
- [typescript-eslint](https://typescript-eslint.io/)

---

## ✨ Kontribusi

Jika ingin berkontribusi, silakan fork repo ini dan buat pull request.  
Pastikan kode sudah di lint dan mengikuti style guide yang ada.

---

## 📞 Kontak

Untuk pertanyaan atau support, silakan hubungi admin melalui email yang tertera di profil repo.

---

**Selamat menggunakan Chat Management Admin!**
