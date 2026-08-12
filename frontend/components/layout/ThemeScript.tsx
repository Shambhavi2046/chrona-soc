'use client';

export default function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var savedTheme = localStorage.getItem('chrona-theme');
              var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              
              if (savedTheme === 'light') {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
              } else if (savedTheme === 'dark') {
                document.documentElement.classList.remove('light');
                document.documentElement.classList.add('dark');
              } else if (savedTheme === 'system' || !savedTheme) {
                if (prefersDark) {
                  document.documentElement.classList.remove('light');
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                }
              }
            } catch (e) {}
          })();
        `,
      }}
    />
  );
}
