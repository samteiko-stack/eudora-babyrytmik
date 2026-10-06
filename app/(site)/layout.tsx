import Script from 'next/script'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="stylesheet" href="/css/babysang.css" />
      <div className="babysang-site w-mod-js">
        <Script id="webflow-mod-touch" strategy="afterInteractive">
          {`!function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);`}
        </Script>
        {children}
      </div>
    </>
  )
}
