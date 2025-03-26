export const Files = {
    public: {
      directory: {
        'index.html': {
          file: {
            contents: `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
      <div id="root"></div>
    </body>
  </html>`
          }
        }
      }
    },
    'App.css': {
      file: {
        contents: `
    @tailwind base;
    @tailwind components;
    @tailwind utilities;`
      }
    },
    'tailwind.config.js': {
      file: {
        contents: `
  /** @type {import('tailwindcss').Config} */
  module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }`
      }
    },
    'postcss.config.js': {
      file: {
        contents: `
  /** @type {import('postcss-load-config').Config} */
  const config = {
    plugins: {
      tailwindcss: {},
    },
  };
  
  export default config;
  `
      }
    },
    'package.json': {
        file: {
          contents: `
            {
              "postcss": "^8",
    "tailwindcss": "^3.4.1",
    autoprefixer: "^10.0.0",
    "uuid": "^11.1.0",
    "tailwind-merge": "^2.4.0",
    "tailwindcss-animate": "^1.0.7",
    "lucide-react": "^0.469.0",
    "react-router-dom": "^7.1.1",
    "firebase": "^11.1.0",
    "@google/generative-ai": "^0.21.0",
    "date-fns": "^4.1.0",
    "react-chartjs-2": "^5.3.0",
    "chart.js": "^4.4.7",
              "scripts": {
                "start": "npm run dev"
              }
            }`,
        },
    }
  };
  