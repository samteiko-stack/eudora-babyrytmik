import Script from 'next/script'
import { SiteStyles } from '@/components/site/SiteStyles'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteStyles />
      <div className="babysang-site w-mod-js">
        <Script id="webflow-mod-touch" strategy="afterInteractive">
          {`!function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);`}
        </Script>
        {children}
      </div>
    </>
  )
}
