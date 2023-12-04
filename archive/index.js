import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useContext } from 'react';
import { FaTimes, FaLongArrowAltRight } from 'react-icons/fa';
import { SiteContext } from '../context/mainContext'; // Import SiteContext from your context
import { titleIfy, slugify } from '../utils/helpers';
import { fetchInventory } from '../utils/inventoryProvider';
import CartLink from '../components/CartLink';
import { Center, Footer, Tag, Showcase, DisplaySmall, DisplayMedium } from '../components'
import DENOMINATION from '../utils/currencyProvider';
import { useRouter } from 'next/router'; // Import useRouter

const Home = ({ inventoryData = [] }) => {

  const router = useRouter(); // Initialize useRouter

  // Comment out if multiple product website
  useEffect(() => {
    if (inventoryData.length > 0) {
      console.log(inventoryData[0])
      const firstCategory = inventoryData[0].categories[0];
      router.push(`/category/${firstCategory}`);
    }
  }, [inventoryData, router]);
  return
  

  const { addToCart, isProductInCart } = useContext(SiteContext); // Access addToCart from SiteContext
  

  useEffect(() => {
  }, []);

  const handleAddToCart = (product) => {
    if (!isProductInCart(product)) {
      addToCart({ ...product, quantity: 1 }); 
    } else {
      // Redirect to /cart if item is already added to cart
      router.push('/cart');
    }
  };

  return (
    <>
      <CartLink />
      <div className="w-full">
        <Head>
          <title>Jamstack ECommerce</title>
          <meta
            name="description"
            content="Jamstack ECommerce Next provides a way to quickly get up and running with a fully configurable ECommerce site using Next.js."
          />
          <meta property="og:title" content="Jamstack ECommerce" key="title" />
        </Head>
        <div className="my-8 flex flex-wrap justify-between">
          {inventoryData.map((product) => (
            <div key={product.id} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4">
              <DisplayMedium imageSrc={product.image} title={product.name} subtitle={product.categories[0]} link={`/product/${slugify(product.name)}`}/>
              <p className="text-center m-0 mt-2 text-gray-900 font-bold">{DENOMINATION + product.price}</p>
              <div className="flex flex-col mt-2">
                <button
                  onClick={() => handleAddToCart(product)}
                  className={"bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark mt-2"}
                >
                  {isProductInCart(product) ? (
                    <p className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark mt-2">
                      Added! Click to View Cart
                    </p>
                  ) : (
                    <p className={`bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark mt-2`}>
                      Add to Cart
                    </p>
                  )}
                </button>
                <Link href="/checkout">
                  <p 
                    onClick={() => handleAddToCart(product)}
                    className="text-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark mt-2"
                  >
                    Buy Now
                  </p>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export async function getStaticProps() {
  const inventory = await fetchInventory();

  return {
    props: {
      inventoryData: inventory,
    },
  };
}

export default Home;
