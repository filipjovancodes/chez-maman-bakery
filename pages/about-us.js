import Link from 'next/link';
import Head from 'next/head';

const AboutPage = () => {
    return (
        <div className="container mx-auto p-4">
          <Head>
            <title>About Us - Chez Maman Bakery</title>
            <meta name="description" content="Learn about Chez Maman Bakery - our story, mission, and values." />
            <meta property="og:title" content="About Us - Chez Maman Bakery" key="title" />
          </Head>
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col">
            <div className="mb-4">
              <h1 className="text-2xl font-bold">About Us</h1>
            </div>
            <div className="mb-4">
              <h2 className="text-lg font-bold mb-2">Our Story</h2>
              <p className="text-gray-600">Insert your story here. Tell customers how your bakery was founded, what inspired you, and any other relevant details.</p>
            </div>
            <div className="mb-4">
              <h2 className="text-lg font-bold mb-2">Our Mission</h2>
              <p className="text-gray-600">Explain your bakery's mission. What are your goals and values? How do you aim to serve your customers and community?</p>
            </div>
            <div className="mb-4">
              <h2 className="text-lg font-bold mb-2">Our Team</h2>
              <p className="text-gray-600">Introduce your team members. Highlight their expertise, passion for baking, and any other relevant information.</p>
            </div>
            <div className="flex justify-between items-center">
              <Link href="/">
                <p className="text-blue-500 hover:text-blue-700">Go back to homepage</p>
              </Link>
            </div>
          </div>
        </div>
    );
};

export default AboutPage;