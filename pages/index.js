import Head from 'next/head'
import { Center, Footer, Tag, Showcase, DisplaySmall, DisplayMedium } from '../components'
import { titleIfy, slugify } from '../utils/helpers'
import { fetchInventory } from '../utils/inventoryProvider'
import CartLink from '../components/CartLink'
import Image from '../components/Image'

const Home = ({ inventoryData = [], categories: categoryData = [] }) => {
  // Removed slicing to display all items
  const inventory = inventoryData;
  const categories = categoryData;

  function enlargeImage(src) {
    var enlargedImage = document.createElement("img");
    enlargedImage.src = src;
    enlargedImage.style.position = "fixed";
    enlargedImage.style.top = "0";
    enlargedImage.style.left = "0";
    enlargedImage.style.right = "0";
    enlargedImage.style.bottom = "0";
    enlargedImage.style.margin = "auto";
    enlargedImage.style.zIndex = "9999";
    enlargedImage.style.maxWidth = "90%";
    enlargedImage.style.maxHeight = "90%";
    
    // Append the enlarged image to the body
    document.body.appendChild(enlargedImage);
    
    // Close the enlarged image when clicked away
    function closeImage(event) {
      if (event.target !== enlargedImage) {
        document.body.removeChild(enlargedImage);
        document.removeEventListener('click', closeImage);
      }
    }

    // Close the enlarged image when clicked
    enlargedImage.onclick = function(event) {
      event.stopPropagation(); // Prevents the click from bubbling up to the document
      document.body.removeChild(enlargedImage);
      document.removeEventListener('click', closeImage);
    };

    // Add event listener only after the image is appended to the DOM
    document.addEventListener('click', closeImage);
  }

  return (
    <>
      <CartLink />
      <div className="w-full">
        <Head>
          <title>Chez Maman Bakery - Home</title>
          <meta name="description" content="Chez Maman Bakery - Home" />
          <meta property="og:title" content="Chez Maman Bakery - Home" key="title" />
        </Head>
        
        {/* Large photo and call to action section */}
        <div 
          className="relative bg-light-blue opacity-80 p-6 pb-10 smpb-6 flex flex-col items-center justify-center mt-2"
          style={{
            width: '99vw', // 100% of the viewport width
            height: '60vh', // 100% of the viewport height
            backgroundImage: 'url(/background.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Tagline */}
          <div className="text-5xl text-white mb-8 text-center p-4">Experience The Heavenly Delight of Sourdough Cookies</div>

          {/* Shop Now Link */}
          <a 
            className="text-white border border-white font-bold tracking-wider bg-transparent hover:bg-black text-black font-semibold hover:text-white py-4 px-12 border-2 border-black hover:border-transparent"
            href="/categories"  // Link to the general category page
          >
            Shop Now
          </a>
        </div>

        {/* Informational Section */}
        <div className="py-12 bg-gray-100">
          <div className="max-w-99vw mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                This is not your ordinary cookie
              </h2>
              <p className="mb-4 mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Welcome to Chez Maman Bakery, home to the finest sourdough cookies crafted with love and expertise. Indulge in the delightfully tangy flavor and irresistible texture of our sourdough cookies, each bite bursting with delight.
              </p>

              <div class="text-gray-100">l</div>
              {/* Shop Now Link */}
              <a 
                className="text-sm font-bold tracking-wider bg-transparent hover:bg-black text-black font-semibold hover:text-white py-4 px-12 border-2 border-black hover:border-transparent"
                href="/categories"  // Link to the general category page
              >
                Shop Now
              </a>
            </div>
          </div>
        </div>

        {/* Try Section */}
        <div className="py-12 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center">
            {/* Left Side (Text) */}
            <div className="w-full lg:w-1/2 lg:text-center lg:pr-6">
              <h2 className="text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Experience this
              </h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                When you bite into a sourdough cookie you'll soon realize what makes it so irresistible.
              </p>

              {/* Try it Link */}
              <div className="flex justify-center mt-4">
                <a 
                  className="text-sm font-bold tracking-wider bg-transparent hover:bg-black text-black font-semibold hover:text-white py-4 px-12 border-2 border-black hover:border-transparent"
                  href="/categories"  // Link to the general category page
                >
                  Try it
                </a>
              </div>
            </div>
            {/* Right Side (Image) */}
            <div className="w-full lg:w-1/2 mt-6 lg:mt-0">
              <img src="/experience.jpeg" alt="Image" className="mx-auto lg:max-w-full" />
              {/* Replace "/your-image.jpg" with the path to your image */}
            </div>
          </div>
        </div>
        
        {/* DisplayMedium section for categories */}
        <div className="grid gap-4 my-4 lg:my-8 md:grid-cols-2 grid-cols-1">
          {categories.map((category, index) => (
            <DisplayMedium
              key={index}
              imageSrc={category.image}
              subtitle={`${category.itemCount} items`}
              title={titleIfy(category.name)}
              link={`/category/${slugify(category.name)}`}
            />
          ))}
        </div>

        {/* About Us */}
        <div className="py-12 bg-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                About Us
              </h2>
              <p class="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Welcome to Chez Maman Bakery, where every bite tells a story of passion, creativity, and the love of a mother. Founded by a dedicated mother of two, Chez Maman Bakery is more than just a bakery – it's a labor of love, inspired by the desire to create something truly special for her family and community.
              </p>

              <p class="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Join us at Chez Maman Bakery and experience the warmth and comfort of homemade sourdough cookies, crafted with love and shared with joy.
              </p>
            </div>
          </div>
        </div>

        {/* Email input */}
        <div className="bg-white py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-3xl leading-8 font-extrabold tracking-tight sm:text-4xl">
                We are sweet
              </h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Join the family and get the sweetest offers, news and more!
              </p>
            </div>
            <div className="mt-12 max-w-lg mx-auto sm:flex sm:justify-center lg:justify-center">
              <form className="sm:flex">
                <input
                  aria-label="Email address"
                  type="email"
                  required
                  className="w-full px-4 py-3 sm:max-w-xs border border-black placeholder-gray-500 sm:rounded-r-none sm:rounded-l-md sm:px-6 sm:py-4 focus:outline-none"
                  placeholder="Enter your email"
                />
                <button
                  type="submit"
                  className="mt-3 w-full sm:mt-0 sm:w-auto px-4 py-3 sm:rounded-r-md sm:rounded-l-none sm:px-8 sm:py-4 bg-white text-gray-900 font-semibold shadow transition duration-300 hover:bg-gray-50 focus:ring-2 focus:ring-white focus:ring-offset-gray-800 focus:outline-none border border-black"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mt-10 grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {/* Testimonial 1 */}
              <img className="rounded-lg shadow-lg overflow-hidden image-container" src="/testimonial1.jpeg" alt="Testimonial 1" onClick={() => enlargeImage("/testimonial1.jpeg")} />
              {/* Testimonial 2 */}
              <img className="rounded-lg shadow-lg overflow-hidden image-container" src="/testimonial2.jpeg" alt="Testimonial 2" onClick={() => enlargeImage("/testimonial2.jpeg")} />
              {/* Testimonial 3 */}
              <img className="rounded-lg shadow-lg overflow-hidden image-container" src="/testimonial3.jpeg" alt="Testimonial 3" onClick={() => enlargeImage("/testimonial3.jpeg")} />
              {/* Testimonial 4 */}
              <img className="rounded-lg shadow-lg overflow-hidden image-container" src="/testimonial4.jpeg" alt="Testimonial 4" onClick={() => enlargeImage("/testimonial4.jpeg")} />
              {/* Testimonial 5 */}
              <img className="rounded-lg shadow-lg overflow-hidden image-container" src="/testimonial5.jpeg" alt="Testimonial 5" onClick={() => enlargeImage("/testimonial5.jpeg")} />
            </div>
          </div>
          
        </div>

        {/* Testimonials Picture Gallery */}
        <div className="py-12 bg-white">
          
        </div>

        {/* Trending Now section */}
        {/* <div className="pt-10 pb-6 flex flex-col items-center">
          <h2 className="text-4xl mb-3">Trending Now</h2>
          <p className="text-gray-600 text-sm">Find the perfect piece or accessory to finish off your favorite room in the house.</p>
        </div> */}

        {/* DisplaySmall section for inventory items */}
        {/* <div className="my-8 flex flex-col lg:flex-row justify-between">
          {inventory.map((item, index) => (
            <DisplaySmall
              key={index}
              imageSrc={item.image}
              title={item.name}
              subtitle={item.categories.join(', ')} // Display all categories
              link={`/product/${slugify(item.name)}`}
            />
          ))}
        </div> */}
      </div>
    </>
  )
}

export async function getStaticProps() {
  const inventory = await fetchInventory()

  const inventoryCategorized = inventory.reduce((acc, next) => {
    const categories = next.categories
    categories.forEach(c => {
      const index = acc.findIndex(item => item.name === c)
      if (index !== -1) {
        const item = acc[index]
        item.itemCount = item.itemCount + 1
        acc[index] = item
      } else {
        const item = {
          name: c,
          image: next.image,
          itemCount: 1
        }
        acc.push(item)
      }
    })
    return acc
  }, [])

  return {
    props: {
      inventoryData: inventory,
      categories: inventoryCategorized
    }
  }
}

export default Home
