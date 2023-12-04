import Link from 'next/link';

const Custom404 = () => {
    return (
        <div className="container mx-auto p-4">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col">
          <div className="mb-4">
            <h1 className="text-2xl font-bold">Oops! The page you are looking for does not exist.</h1>
          </div>
  
          <div className="flex justify-between items-center">
            <Link href="/">
              <p className="text-blue-500 hover:text-blue-700 text-xl">Go back to homepage</p>
            </Link>
          </div>
        </div>
      </div>
    );
};

export default Custom404;

// <h1>404 - Page Not Found</h1>
{/* <p>Oops! The page you are looking for does not exist. It might have been moved or deleted.</p>
<Link href="/">
    <a className={styles.homeLink}>Go back home</a>
</Link> */}