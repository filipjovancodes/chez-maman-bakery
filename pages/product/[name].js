import { useState, useEffect, useRef } from 'react'
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

  const [selectedAttribute, setSelectedAttribute] = useState(false);
  const [numberOfitems, updateNumberOfItems] = useState(1)
  const { products, title } = props
  const product = products[0]
  const { price, image, image_support, name, description } = product
  const { context: { addToCart, isProductInCart }} = props
  const [selectedImage, setSelectedImage] = useState('');

  

   // Set the main image as the selected image initially
  useState(() => {
    setSelectedImage(image);
  }, [image]);

  const router = useRouter();

  // Function to change the main image when hovering or clicking on a thumbnail
  const isVideo = (file) => {
    return file.endsWith('.mp4');
  };

  // Function to change the main image or video when clicking on a thumbnail
  const handleMediaChange = (media) => {
    setSelectedImage(media);
  };

  const videoRefs = useRef(new Map()); // useRef to hold the video elements

  // Create video elements for all .mp4 files initially and store them in videoRefs
  useEffect(() => {
    image_support.forEach((media) => {
      if (isVideo(media) && !videoRefs.current.has(media)) {
        const videoElement = (
          <video 
            key={media}
            src={media} 
            alt={name} 
            className="max-h-full max-w-full"
            controls
            style={{ height: 'auto', width: 'auto', maxHeight: '100%', maxWidth: '100%' }}
          />
        );
        videoRefs.current.set(media, videoElement);
      }
    });
  }, [image_support, name]);

  const renderMedia = (mediaSrc) => {
    if (isVideo(mediaSrc)) {
      return videoRefs.current.get(mediaSrc) || (
        <video 
          src={mediaSrc} 
          alt={name} 
          className="max-h-full max-w-full"
          controls
          style={{ height: 'auto', width: 'auto', maxHeight: '100%', maxWidth: '100%' }}
        />
      );
    } else {
      // For images, continue as before
      return (
        <Image 
          src={mediaSrc} 
          alt={name} 
          className="max-h-full max-w-full"
          style={{ height: 'auto', width: 'auto', maxHeight: '100%', maxWidth: '100%' }}
        />
      );
    }
  };

  const handleAddToCart = () => {
    if (!isProductInCart(product)) {
      addToCart({ ...product, quantity: numberOfitems, attributes: selectedAttribute });
    } else {
      router.push('/cart');
    }
  };

  const handleAttributeSelection = (attribute) => {
    setSelectedAttribute(attribute);
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
      <div className="flex flex-col md:flex-row py-4 my-0 mx-auto max-w-7xl">
        <div className="flex flex-col items-center w-full md:w-1/2">
          {/* Fixed size container for the selected media */}
          <div className="w-full py-16 px-10 flex justify-center items-center" style={{ height: '500px', width: '500px' }}>
            {renderMedia(selectedImage)}
          </div>
          {/* Thumbnails container */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            {/* Main product image or video thumbnail */}
            <div
              className={`h-24 w-24 cursor-pointer ${selectedImage === image ? 'border-2 border-blue-500' : ''}`}
              onClick={() => handleMediaChange(image)}
              onMouseOver={() => handleMediaChange(image)}
            >
              {renderMedia(image, true)}
            </div>
            {/* Support images or video thumbnails */}
            {image_support.map((img, index) => (
              <div
                key={index}
                className={`h-24 w-24 cursor-pointer ${selectedImage === img ? 'border-2 border-blue-500' : ''}`}
                onClick={() => handleMediaChange(img)}
                onMouseOver={() => handleMediaChange(img)}
              >
                {renderMedia(img, true)}
              </div>
            ))}
          </div>
        </div>
        <div className="pt-2 px-0 md:px-10 pb-8 w-full md:w-1/2">
          <h1 className="
           sm:mt-0 mt-2 text-5xl font-light leading-large
          ">{name}</h1>
          <h2 className="text-2xl tracking-wide sm:py-8 py-6">${price}</h2>
          {/* Attiribute Selection */}
          {Boolean(product.attributes) &&
            <div className="attribute-selection">
              <h3>{Object.keys(products[0].attributes)}</h3>
              {products.map((product) => (
                <button
                  key={Object.values(product.attributes)}
                  className={`attribute-option ${selectedAttribute[Object.values(product.attributes)] === Object.values(product.attributes) 
                      ? 'border border-black bg-white text-black'
                      : 'border border-grey bg-white text-black'
                  } px-4 py-2 w-4/5 mb-2 mx-auto block text-sm`}
                  onClick={() => handleAttributeSelection(Object.values(product.attributes))}
                >
                  {Object.values(product.attributes)}
                </button>
              ))}
            </div>
          }
          {/* Quantity Selection */}
          <div className="my-6">
            <QuantityPicker
              increment={increment}
              decrement={decrement}
              numberOfitems={numberOfitems}
            />
          </div>
          {/* Add to Cart */}
          {Boolean(product.attributes) ?
            <button
              onClick={() => handleAddToCart(product, true)}
              disabled={!selectedAttribute}
              className={`border border-black px-4 py-2 ${isProductInCart(product) ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'} w-4/5 mb-16 mx-auto block text-sm`}
            >
              {isProductInCart(product) ? 'Added! Click to View Cart' : 'Add to Cart'}
            </button>
            :
            <button
              onClick={() => handleAddToCart(product, true)}
              className={`border border-black px-4 py-2 ${isProductInCart(product) ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'} w-4/5 mb-16 mx-auto block text-sm`}
            >
              {isProductInCart(product) ? 'Added! Click to View Cart' : 'Add to Cart'}
            </button>
          }
          {/* Description */}
          <p className="text-gray-600 leading-7">
            {description.split('\n\n').map((paragraph, idx) => (
              <React.Fragment key={idx}>
                {paragraph}
                <br /><br />
              </React.Fragment>
            ))}
          </p>
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
  // const product = inventory.find(item => slugify(item.name) === slugify(name))
  const products = inventory.filter(item => slugify(item.name) === slugify(name));

  return {
    props: {
      products,
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