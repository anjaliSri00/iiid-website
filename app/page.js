import Hero from './components/sections/Hero'
import Programs from './components/sections/Programs'
import About from './components/sections/About'
import Certification from './components/sections/Certification'

export default function page() {
  return (
    <>
    <div className='max-w-screen-3xl overflow-x-hidden w-full min-h-screen h-full'>
      <Hero />
      <Programs />
      <About />
      {/* <Certification /> */}
      </div>
    </>
  )
}