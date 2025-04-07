export const Files = {
  public:{
    directory: {
      "index.html": {
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
  </html>`,
        },
      },
    },
  },
   src:{
    directory:{
      "App.css": {
        file: {
          contents: `
      @tailwind base;
      @tailwind components;
      @tailwind utilities;`,
        },
      },
    }
   },    
  "tailwind.config.js": {
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
  }`,
    },
  },
  "postcss.config.js": {
    file: {
      contents: `
  const config = {
    plugins: {
      tailwindcss: {},
    },
  };
  
  export default config;
  `,
    },
  },
  "package.json": {
    file: {
      contents: JSON.stringify(
        {
          name: "bolt-project",
          version: "0.1.0",
          private: true,
          dependencies: {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "react-scripts": "^5.0.1",
            "web-vitals": "^2.1.4",
            "@webcontainer/api": "latest"
          },
          devDependencies: {
           "vite": "^5.2.0"
         },
          scripts: {
            "dev": "vite",
             "build": "react-scripts build",
            "preview": "vite preview"
          },
          eslintConfig: {
            extends: ["react-app", "react-app/jest"],
          },
          browserslist: {
            production: [">0.2%", "not dead", "not op_mini all"],
            development: [
              "last 1 chrome version",
              "last 1 firefox version",
              "last 1 safari version",
            ],
          },
        },
        null,
        2
      ),
    },
  },
};
