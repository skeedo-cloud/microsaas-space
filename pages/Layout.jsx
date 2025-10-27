
import { useEffect } from 'react';

export default function Layout({ children, currentPageName }) {
  useEffect(() => {
    // Initialize Plausible Analytics
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = 'https://plausible.io/js/pa--rOUaDWPbJ9jH0-V3rezh.js';
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
      plausible.init()
    `;
    document.head.appendChild(script2);

    return () => {
      // Cleanup scripts on unmount
      if (script1.parentNode) {
        script1.parentNode.removeChild(script1);
      }
      if (script2.parentNode) {
        script2.parentNode.removeChild(script2);
      }
    };
  }, []);

  return (
    <>
      {children}
    </>
  );
}
