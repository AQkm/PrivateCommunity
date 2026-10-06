
function App() {
  return (
    <main className="min-h-screen px-5 py-6 sm:px-10 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col sm:min-h-[calc(100vh-5rem)]">
        <header className="flex items-center justify-between">
          <a className="flex min-h-11 items-center gap-3" href="#home" aria-label="Family Portal home">
            <span className="brand-mark" aria-hidden="true">f</span>
            <span className="text-sm font-semibold tracking-tight text-stone-800">our little corner</span>
          </a>
        </header>

        <section className="grid flex-1 items-center gap-12 py-14 md:grid-cols-[1.05fr_0.95fr] md:gap-16 md:py-16" id="home">
          <div className="relative z-10 mx-auto max-w-xl md:mx-0">
            <p className="eyebrow"><span aria-hidden="true">✳</span> A space just for us</p>
            <h1 className="mt-6 text-[clamp(3.25rem,10vw,6.5rem)] font-semibold leading-[0.94] tracking-[-0.075em] text-stone-900">
              Family<br /><span className="font-serif font-normal italic text-terracotta">Portal</span>
            </h1>
            <p className="mt-7 max-w-md text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
              The little moments, the big milestones, and everything in between — all in one private place for the people who matter most.
            </p>
            <a className="explore-button mt-9 inline-flex min-h-12 items-center justify-center gap-3 rounded-full px-6 text-sm font-semibold" href="#gallery" data-testid="explore-gallery">
              Explore Gallery <span aria-hidden="true">↗</span>
            </a>
            <p className="mt-4 text-xs text-stone-500">A home for your family’s favorite memories.</p>
          </div>

          <div className="photo-stage mx-auto w-full max-w-lg" aria-label="A warm family photo collage illustration">
            <div className="photo-card photo-card-back" aria-hidden="true">
              <div className="sunset-scene"><span className="scene-sun" /><span className="scene-hill scene-hill-one" /><span className="scene-hill scene-hill-two" /></div>
              <span className="photo-caption">slow sunday</span>
            </div>
            <div className="photo-card photo-card-main" aria-hidden="true">
              <div className="garden-scene"><span className="garden-sky" /><span className="garden-sun" /><span className="garden-hill" /><span className="garden-flower flower-one">✿</span><span className="garden-flower flower-two">✿</span><span className="garden-flower flower-three">✿</span><span className="garden-flower flower-four">✿</span></div>
              <span className="photo-caption">together is our favorite place</span>
            </div>
            <div className="floating-note" aria-hidden="true"><span>✿</span> made of moments</div>
            <div className="stage-sparkle sparkle-one" aria-hidden="true">✳</div>
            <div className="stage-sparkle sparkle-two" aria-hidden="true">✦</div>
          </div>
        </section>

        <section id="gallery" aria-labelledby="gallery-title" className="scroll-mt-8 border-t border-stone-200/80 py-12 sm:py-16">
          <p className="eyebrow">Shared memories</p>
          <h2 id="gallery-title" data-testid="gallery-title" className="mt-3 font-serif text-3xl font-normal text-stone-900 sm:text-4xl">
            The family gallery
          </h2>
          <div className="mt-7 rounded-3xl border border-dashed border-stone-300 bg-white/60 px-6 py-12 text-center sm:px-10">
            <p className="font-serif text-xl italic text-stone-700">Your gallery is ready for its first memory.</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
              Photos shared with your family will find a home here.
            </p>
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-stone-200/80 pt-5 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Made with love, for the people we love.</span>
          <span>Private by nature <span className="text-terracotta" aria-hidden="true">♥</span></span>
        </footer>
      </div>
    </main>
  );
}

export default App;
