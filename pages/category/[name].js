import Head from 'next/head'
import ListItem from '../../components/ListItem'
import { titleIfy, slugify } from '../../utils/helpers'
import fetchCategories from '../../utils/categoryProvider'
import inventoryForCategory from '../../utils/inventoryForCategory'
import CartLink from '../../components/CartLink'
import { useEffect, useContext } from 'react'
import { SiteContext } from '../../context/mainContext';
import { useRouter } from 'next/router'; // Import useRouter
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const Category = (props) => {

  const { inventory, title } = props
  const { cart, addToCart, isProductInCart } = useContext(SiteContext); // Access addToCart from SiteContext
  const router = useRouter(); // Initialize useRouter
  
  useEffect(() => {
  }, []);

  const handleAddToCart = (product, render_bool) => {
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
      <Head>
        <title>Jamstack ECommerce - {title}</title>
        <meta name="description" content={`Jamstack ECommerce - ${title}`} />
        <meta property="og:title" content={`Jamstack ECommerce - ${title}`} key="title" />
      </Head>
      <div className="flex flex-col items-center">
        <div className="max-w-fw flex flex-col w-full">
          <div className="pt-4 sm:pt-10 pb-8">
            <h1 className="text-5xl font-light">{titleIfy(title)}</h1>
          </div>

          <div>
            <div className="flex flex-1 flex-wrap flex-row">
              {
                inventory.map((item, index) => {
                  return (
                    <ListItem
                      key={index}
                      item={item}
                      handleAddToCart={handleAddToCart}
                      isProductInCart={isProductInCart}
                      cart={cart}
                      stripePromise={stripePromise}
                    />
                  )
                })
              }
            </div>
          </div>
          </div>
      </div>
    </>
  )
}

export async function getStaticPaths () {
  const categories = await fetchCategories()
  const paths = categories.map(category => {
    return { params: { name: slugify(category) }}
  })
  return {
    paths,
    fallback: false
  }
}

export async function getStaticProps ({ params }) {
  const category = params.name.replace(/-/g," ")
  const inventory = await inventoryForCategory(category)
  return {
    props: {
      inventory,
      title: category
    }
  }
}

export default Category