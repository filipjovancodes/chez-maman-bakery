import { useEffect } from 'react';
import { useRouter } from 'next/router'; // Import useRouter
import { fetchInventory } from '../utils/inventoryProvider';

const Home = ({ inventoryData = [] }) => {
  const router = useRouter(); // Initialize useRouter

  // Comment out if multiple product website
  useEffect(() => {
    if (inventoryData.length > 0) {
      console.log(inventoryData[0])
      const firstCategory = inventoryData[0].categories[0];
      router.push(`/category/${firstCategory}`);
    }
  }, [inventoryData, router]);
  return
}

export async function getStaticProps() {
    const inventory = await fetchInventory();
  
    return {
      props: {
        inventoryData: inventory,
      },
    };
  }

export default Home;