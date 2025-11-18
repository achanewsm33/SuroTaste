import aboutHero from "/src/assets/about-hero.png";


export default function About(){
  return(
    <section className="relative w-full">
      <div className="mx-auto sm:px-6">
        <div className="relative rounded overflow-hidden h-[320px] md:h-[420px]">
          <img
            src={aboutHero}
            alt="About Us"
            className="w-full h-full object-cover block"
          />

          {/* overlay untuk kontras tulisan */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <h1 className="font-museomoderno text-yellow-300 text-4xl md:text-5xl font-extrabold">
              About Us
            </h1>
          </div>
        </div>
      </div>
    </section>

  );
}