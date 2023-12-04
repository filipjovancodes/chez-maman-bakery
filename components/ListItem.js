import React from 'react';
import Link from 'next/link';
import DENOMINATION from '../utils/currencyProvider';
import Image from './Image';
import { slugify } from '../utils/helpers'

const ListItem = ({ item, handleAddToCart, isProductInCart, cart, stripePromise }) => (
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

      {/* Add to Cart Button */}
      <button
        onClick={() => handleAddToCart(item, true)}
        className={`border border-black px-4 py-2 ${isProductInCart(item) ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'} w-4/5 mb-2 mx-auto block text-sm`}
      >
        {isProductInCart(item) ? 'Added! Click to View Cart' : 'Add to Cart'}
      </button>
    </div>
  </div>
);

export default ListItem;