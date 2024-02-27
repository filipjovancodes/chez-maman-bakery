import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DENOMINATION from '../utils/currencyProvider';
import Image from './Image';
import { slugify } from '../utils/helpers'

const ListItem = ({ items, handleAddToCart, isProductInCart }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false); // Track if item is added to cart

  const item = items[0];

  let attributeName;
  if (Boolean(item.attributes)) {
    attributeName = Object.keys(item.attributes)[0];
  }

  // Effect to reset addedToCart when selectedVariant changes
  useEffect(() => {
    if (selectedVariant || addedToCart) {
      setAddedToCart(false);
    }
  }, [selectedVariant, addedToCart]);

  const handleCartButtonClick = () => {
    // If the item is already added to cart, reset the state and return
    if (addedToCart) {
      setAddedToCart(false);
      return;
    }

    // If not added to cart, add it and set the state
    handleAddToCart(item, true);
    setAddedToCart(true);
  };

  const handleVariantChange = (e) => {
    const selectedIndex = e.target.value;
    setSelectedVariant(items[selectedIndex]);
  };

  return (
    <div className="w-100 md:w-1/2 lg:w-1/4 p1 sm:p-2">
      <Link href={`/product/${slugify(item.name)}`} aria-label={item.name}>
        <div className="h-72 flex justify-center items-center bg-light border-2 border-light-300 hover:bg-light-300">
          <div className="flex flex-column justify-center items-center">
            <Image alt={item.name} src={item.image} className="w-3/5" />
          </div>
        </div>
      </Link>
      <div>
        <p className="m-4 text-center text-l font-semibold mb-1">{item.name}</p>
        <p className="text-center text-gray-700 mb-1">{`${DENOMINATION}${item.price}`}</p>

        {/* Dropdown for selecting attribute if available */}
        {Boolean(item.attributes) && (
          <select
            onChange={handleVariantChange}
            className={`text-center border border-black px-4 py-2 w-4/5 mb-2 mx-auto block text-sm`}
          >
            <option value="" disabled selected>
              {attributeName}
            </option>
            {Object.values(items).map((item, index) => (
              <option key={item.variant_id} value={index}>{`${item.attributes[attributeName]}`}</option>
            ))}
          </select>
        )}

        {/* Add to Cart Button */}
        {Boolean(item.attributes) ?
          <button
            onClick={() => handleAddToCart(item, true)}
            disabled={!selectedVariant}
            className={`border border-black px-4 py-2 ${isProductInCart(item) ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'} w-4/5 mb-2 mx-auto block text-sm`}
          > 
            {isProductInCart(item) ? 'Added! Click to View Cart' : 'Add to Cart'}
          </button>
          :
          <button
            onClick={() => handleAddToCart(item, true)}
            className={`border border-black px-4 py-2 ${isProductInCart(item) ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'} w-4/5 mb-2 mx-auto block text-sm`}
          >
            {isProductInCart(item) ? 'Added! Click to View Cart' : 'Add to Cart'}
          </button>
        }
      </div>
    </div>
  );
}

export default ListItem;

