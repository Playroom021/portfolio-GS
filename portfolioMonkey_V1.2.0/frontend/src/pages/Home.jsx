import NavBar from "../components/NavBar";
import Hero from "../components/Hero.jsx"
import HeroAlt001 from "../components/HeroAlt001.jsx"
import Sidebar from "../components/Sidebar.jsx"
import Home002 from "../components/Home002.jsx"
export default function Home() {

  return (
    <div className="flex min-h-screen bg-[#212121] text-white">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <Home002 />

        <section
          id="projects"
          className="min-h-screen p-8 md:p-12"
        >
          <h2 className="text-3xl font-semibold">Projects</h2>
        </section>

        <section
          id="about"
          className="min-h-screen p-8 md:p-12"
        >
          <h2 className="text-3xl font-semibold">About me</h2>
        </section>

        <section
          id="reviews"
          className="min-h-screen p-8 md:p-12"
        >
          <h2 className="text-3xl font-semibold">Reviews</h2>
        </section>
      </main>
    </div>
  );
}



// import NavBar from "../components/NavBar";
// import Hero from "../components/Hero.jsx"
// import HeroAlt001 from "../components/HeroAlt001.jsx"
// import Sidebar from "../components/Sidebar.jsx"

// export default function Home() {

//     return(
//     <>
//         {/* <NavBar/> */}
//         <Sidebar/>
//         <Hero/>
//         <HeroAlt001/>
    
//     </>
//     )

// }
