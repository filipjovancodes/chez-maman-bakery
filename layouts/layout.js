import Link from 'next/link';
import { slugify } from '../utils/helpers';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { navItemLength } from '../ecommerce.config';
import { Analytics } from '@vercel/analytics/react';

export default function Layout({ children, categories }) {
  if (categories.length > navItemLength) {
    categories = categories.slice(0, navItemLength);
  }
  return (
    <div>
      <nav className="bg-light-blue">
        <div className="flex items-center">
          {/* <!-- Home and Category Links --> */}
          <div className="flex items-center justify-center flex-1 ml-4">
            
          <Link href="/" aria-label="Home">
              <p className="text-white text-smaller ml-4 mr-4">Home</p>
            </Link>

            {categories.map((category, index) => (
              <Link href={`/category/${slugify(category)}`} key={index} aria-label={category}>
                <p className="text-white text-smaller ml-4 mr-4">{category.charAt(0).toUpperCase() + category.slice(1)}</p>
              </Link>
            ))}

            <Link href="/categories" aria-label="All categories">
              <p className="text-white text-smaller ml-4 mr-4">All</p>
            </Link>

            <Link href="/contact" aria-label="Contact us">
              <p className="text-white text-smaller ml-4 mr-4">Contact</p>
            </Link>

            <Link href="/about-us" aria-label="About us">
              <p className="text-white text-smaller ml-4 mr-4">About Us</p>
            </Link>

            <Link href="/cart" aria-label="Cart">
              <p className="text-white text-smaller ml-4 mr-4">Cart</p>
            </Link>
            
          </div>

        {/* <!-- Logo --> */}
        <div className="flex items-center justify-center flex-1">
          {/* <div class="mr-4">Chez Maman Bakery</div> */}
          <img src="/logo.ico" alt="logo" width="100" height="100"/> {/* style={{'border-radius': 100}} */}
        </div>

          <div className="flex items-center justify-center flex-1 ml-4">
            <p className="text-light-blue text-smaller ml-4 mr-4">Home</p>

            {categories.map((category, index) => (
              <p className="text-light-blue text-smaller ml-4 mr-4">{category.charAt(0).toUpperCase() + category.slice(1)}</p>
            ))}

            <p className="text-light-blue text-smaller ml-4 mr-4">All</p>

            <p className="text-light-blue text-smaller ml-4 mr-4">Contact</p>
          
            <p className="text-light-blue text-smaller ml-4 mr-4">About Us</p>

            <p className="text-light-blue text-smaller ml-4 mr-4">Cart</p>
          </div>

        </div>
      </nav>

      <div className="mobile:px-10 px-4 pb-10 flex justify-center">
        <main className="w-fw">{children}</main>
      </div>
      <footer className="flex justify-center">
        <div className="sm:flex-row sm:items-center flex-col flex w-fw px-12 py-8 desktop:px-0 border-solid border-t border-gray-300">
          {/* Contact Section */}
          <div className="flex flex-col items-center mb-4">
            <h3 className="text-lg font-semibold mb-2">Contact Us</h3>
            {/* Additional Text */}
            <p className="text-sm text-center mt-2">We are an online store offering local delivery and you'll also find us at markets around the city. Please email us at <Link href="mailto:chezmaman@gmail.com" className="underline">chezmaman@gmail.com</Link> for any inquiries or feel free to call at +1 (778)-123-4567.</p>
            <Link target="_blank" rel="noopener noreferrer" className="text-sm font-semibold mx-2 mt-4" href="https://www.instagram.com/chezmamanbakery">
              <img src="/instagram.jpeg" alt="Instagram" className="w-1 h-1" />
            </Link>
            {/* You can replace "/instagram-icon.png" with the path to your Instagram icon */}
            <span className="block text-gray-700 text-xs mt-4">Copyright © 2024 Chez Maman Bakery. All rights reserved.</span>
          </div>
          {/* Instagram Link */}
        </div>
      </footer>
      <ToastContainer autoClose={3000} />
      <Analytics />
    </div>
  );
}
