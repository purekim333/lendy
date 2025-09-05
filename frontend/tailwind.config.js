/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      maxWidth: { app: "420px" },            // 앱 고정 폭
      colors: { "sky-bg": "#ecf3ff" },       // 하늘색 배경
      boxShadow: { app: "0 20px 60px rgba(0,0,0,.15)" },
      borderRadius: { app: "16px" },

    },
  },
  plugins: [],
}

