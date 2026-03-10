import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Dark mode は常時 dark（class による切り替えは Phase 7 で追加）
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // accent は teal をそのまま使う（bg-accent-500, text-accent-400 など）
        accent: colors.teal,
      },
      // サイドバー幅を設計トークンとして定義
      width: {
        sidebar: '17rem', // 272px
      },
    },
  },
  plugins: [],
} satisfies Config
