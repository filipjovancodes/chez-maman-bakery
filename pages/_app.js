import '../styles/globals.css'
import Layout from '../layouts/layout'
import fetchCategories from '../utils/categoryProvider'
import { ContextProviderComponent } from '../context/mainContext';

function Ecommerce({ Component, pageProps, categories }) {
  return (
    <Layout categories={categories}>
      <ContextProviderComponent>
        <Component {...pageProps} />
      </ContextProviderComponent>
    </Layout>
  )
}

Ecommerce.getInitialProps = async () => {
  const categories = await fetchCategories()
  return {
    categories
  }
}

export default Ecommerce

// export default function AppWrapper(props) {
//   // Wrap the entire app with the context provider
//   return (
//     <ContextProviderComponent>
//       <Ecommerce {...props} />
//     </ContextProviderComponent>
//   );
// }