import { useState } from 'react'
import React from 'react';
import Head from 'next/head'
import Button from '../../components/Button'
import Image from '../../components/Image'
import QuantityPicker from '../../components/QuantityPicker'
import { fetchInventory } from '../../utils/inventoryProvider'
import { slugify } from '../../utils/helpers'
import CartLink from '../../components/CartLink'
import { SiteContext, ContextProviderComponent } from '../../context/mainContext'
import { useRouter } from 'next/router'; // Import useRouter

const ItemView = (props) => {
  const [numberOfitems, updateNumberOfItems] = useState(1)
  const { product } = props
  const { price, image, name, description } = product
  const { context: { addToCart, isProductInCart }} = props
  const router = useRouter(); // Initialize useRouter

  const handleAddToCart = (product, render_bool) => {
    if (!isProductInCart(product)) {
      addToCart({ ...product, quantity: numberOfitems }); 
    } else {
      // Redirect to /cart if item is already added to cart
      router.push('/cart');
    }
  };

  function increment() {
    updateNumberOfItems(numberOfitems + 1)
  }

  function decrement() {
    if (numberOfitems === 1) return
    updateNumberOfItems(numberOfitems - 1)
  }

  return (
    <>
      <CartLink />
      <div className="sm:py-12 md:flex-row py-4 w-full flex flex-1 flex-col my-0 mx-auto">
        <div className="w-full md:w-1/2 h-120 flex flex-1 bg-light hover:bg-light-200">
          <div className="py-16 p10 flex flex-1 justify-center items-center">
            <Image src={image} alt="Inventory item" className="max-h-full" />
          </div>
        </div>
        <div className="pt-2 px-0 md:px-10 pb-8 w-full md:w-1/2">
          <h1 className="
           sm:mt-0 mt-2 text-5xl font-light leading-large
          ">{name}</h1>
          <h2 className="text-2xl tracking-wide sm:py-8 py-6">${price}</h2>
          <p className="text-gray-600 leading-7">
            {description.split('\n\n').map((paragraph, idx) => (
              <React.Fragment key={idx}>
                {paragraph}
                <br /><br />
              </React.Fragment>
            ))}
          </p>
          <div className="my-6">
            <QuantityPicker
              increment={increment}
              decrement={decrement}
              numberOfitems={numberOfitems}
            />
          </div>
          <button
            onClick={() => handleAddToCart(product, true)}
            className={`border border-black px-4 py-2 ${isProductInCart(product) ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'} w-4/5 mb-2 mx-auto block text-sm`}
          >
            {isProductInCart(product) ? 'Added! Click to View Cart' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </>
  )
}

export async function getStaticPaths () {
  const inventory = await fetchInventory()
  const paths = inventory.map(item => {
    return { params: { name: slugify(item.name) }}
  })
  return {
    paths,
    fallback: false
  }
}

export async function getStaticProps ({ params }) {
  const name = params.name.replace(/-/g," ")
  const inventory = await fetchInventory()
  const product = inventory.find(item => slugify(item.name) === slugify(name))

  return {
    props: {
      product,
    }
  }
}

function ItemViewWithContext(props) {
  return (
    <ContextProviderComponent>
      <SiteContext.Consumer>
        {
          context => <ItemView {...props} context={context} />
        }
      </SiteContext.Consumer>
    </ContextProviderComponent>
  )
}

export default ItemViewWithContext