import Link from 'next/link';
import Head from 'next/head';

const ContactPage = () => {
    return (
        <div className="container mx-auto p-4">
          <Head>
            <title>Contact Us - Chez Maman Bakery</title>
            <meta name="description" content="Contact Chez Maman Bakery for inquiries and feedback." />
            <meta property="og:title" content="Contact Us - Chez Maman Bakery" key="title" />
          </Head>
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col">
            <div className="mb-4">
              <h1 className="text-2xl font-bold">Contact Us</h1>
              <p className="text-gray-600">We'd love to hear from you!</p>
            </div>
            <form>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="name"
                  type="text"
                  placeholder="Your name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="email"
                  type="email"
                  placeholder="Your email"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="message">
                  Message
                </label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="message"
                  rows="5"
                  placeholder="Your message"
                ></textarea>
              </div>
              <div className="flex justify-between items-center">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                >
                  Send Message
                </button>
                <Link href="/">
                  <p className="text-blue-500 hover:text-blue-700">Go back to homepage</p>
                </Link>
              </div>
            </form>
          </div>
        </div>
    );
};

export default ContactPage;
