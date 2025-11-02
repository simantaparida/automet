import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Custom Document Component
 * Customizes the HTML document structure
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="Automet - Field Job & Asset Tracker for Indian AMC vendors" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
