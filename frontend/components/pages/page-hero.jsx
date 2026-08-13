"use client"

import Image from "next/image"
import { useSelector } from "react-redux"

export function PageHero({ pageKey, eyebrow, title, description, image }) {
  const { data: siteContent } = useSelector((state) => state.siteContent || { data: {} })
  
  let finalEyebrow = eyebrow;
  let finalTitle = title;
  let finalDescription = description;
  let finalImage = image;

  if (pageKey && siteContent?.page_heroes?.content) {
    try {
      const heroes = JSON.parse(siteContent.page_heroes.content);
      if (heroes[pageKey]) {
        if (heroes[pageKey].eyebrow) finalEyebrow = heroes[pageKey].eyebrow;
        if (heroes[pageKey].title) finalTitle = heroes[pageKey].title;
        if (heroes[pageKey].description) finalDescription = heroes[pageKey].description;
        if (heroes[pageKey].image) finalImage = heroes[pageKey].image;
      }
    } catch(e) {}
  }

  return (
    <section className="relative overflow-hidden bg-[#faf9f6] pt-8 pb-16 md:pt-12 md:pb-24 border-b border-border/40">
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] -translate-y-1/2 translate-x-1/3 rounded-full bg-accent/10 blur-[120px]" />
      <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] translate-y-1/2 -translate-x-1/3 rounded-full bg-navy/5 blur-[100px]" />

      <div className="mx-auto max-w-7xl px-4">
        <div className={`grid gap-12 items-center ${finalImage ? 'lg:grid-cols-[1.1fr_0.9fr]' : 'lg:grid-cols-1'}`}>
          <div className="max-w-3xl relative z-10">
            {finalEyebrow && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white border border-border/60 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-navy shadow-sm mb-6">
                <span className="size-1.5 rounded-full bg-lime animate-pulse" />
                {finalEyebrow}
              </span>
            )}
            <h1 className="font-serif text-4xl font-bold leading-[1.15] tracking-tight text-navy md:text-5xl lg:text-6xl">
              {finalTitle}
            </h1>
            {finalDescription && (
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground font-medium whitespace-pre-line">
                {finalDescription}
              </p>
            )}
          </div>
          
          {finalImage && (
            <div className="relative z-10 mx-auto w-full max-w-lg lg:max-w-none">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] rounded-bl-[5rem] shadow-2xl ring-4 ring-white">
                <Image
                  src={finalImage}
                  alt={finalTitle || "Hero Image"}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/30 to-transparent" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
