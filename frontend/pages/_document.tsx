import { ReactNode } from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Add any necessary meta tags, links, or other elements within the Head component */}
        </Head>
        <body>
          <div id="sparticlesContainer" className='' />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument;