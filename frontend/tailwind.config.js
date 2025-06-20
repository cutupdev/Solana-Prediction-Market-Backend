/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      '4xs': '280px',
      // => @media (min-width: 280px) { ... }
      '3.5xs': '320px',
      // => @media (min-width: 320px) { ... }
      '3xs': '375px',
      // => @media (min-width: 375px) { ... }
      '2xs': '414px',
      // => @media (min-width: 414px) { ... }
      xs: '520px',
      // => @media (min-width: 414px) { ... }
      sm: '640px',
      // => @media (min-width: 640px) { ... }
      sm2: '724px',
      // => @media (min-width: 724px) { ... }
      md: '768px',
      // => @media (min-width: 768px) { ... }
      md2: '896px',
      // => @media (min-width: 896px) { ... }
      lg: '1024px',
      // => @media (min-width: 1024px) { ... }
      lg2: '1158px',
      // => @media (min-width: 1024px) { ... }
      xl: '1280px',
      // => @media (min-width: 1280px) { ... }
      '1.5xl': '1348px',
      // => @media (min-width: 1348px) { ... }
      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
      '3xl': '1820px'
      // => @media (min-width: 1820px) { ... }
    },
    extend: {
      fontFamily: {
        odibee: ["Odibee Sans", "cursive"],
      },

      boxShadow: {
        'card': '0px 0px 10px 1px rgba(173, 26, 175, 0.25)'
      },
      screens: {
        'custom-xs': { 'min': '382px' },
        'custom-lg': { 'min': '1082px' },
        'custom-xl': { 'min': '1400px' },
      },
      backgroundImage: {
        "card": "url('/Card.png')"
      }
    },
    colors: {
      "main-bg": "#000C49",
      "bg-secondary": "#130B22",
      "bg-purple": '#0A0219',
      "main-blue": "#1845F3",
      "thick-grey": "#242221",
      "box-border": "#193975",
      "boxBlack": "#0d0f1166",
      "card-bg": '#010518',
      "slate-grey": "#66758a",
      "greyBg": "#111417",
      "white": "white",
      "brightGreen": "#ccc704",
      "slightYellow": "#201e1b",
      "textGrey": "#666666",
      "modalBack": "#1F2A37",
      "modalLine": "#384250",
      "mycellium": '#090E33',
      "myText": "rgb(38, 195, 255)",
      "icon-bg": "#0EA5E9"
    },
  },
  plugins: [],
}