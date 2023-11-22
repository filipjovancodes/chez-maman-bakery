import { useState, useEffect } from 'react'
import { ContextProviderComponent, SiteContext } from '../context/mainContext'
import { FaShoppingCart, FaCircle } from 'react-icons/fa';
import Link from "next/link"
import { colors } from '../theme'
const { primary } = colors

function CartLink(props) {
  const [renderClientSideComponent, setRenderClientSideComponent] = useState(false)
  useEffect(() => {
    setRenderClientSideComponent(true)
  }, [])
  let { context: { numberOfItemsInCart = 0 }} = props
  return (
    <div>
      <div className="fixed
      sm:top-53 right-24 desktop:right-flexiblemargin
      top-40 z-10">
        <div className="flex flex-1 justify-end pr-4 relative">
          <Link href="/cart" aria-label="Cart">

            <FaShoppingCart />

          </Link>
          {renderClientSideComponent && numberOfItemsInCart > 0 && (
            <span className="absolute top-0 right-0 bg-primary text-white rounded-full p-1 text-xs">
              {numberOfItemsInCart}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function CartLinkWithContext(props) {
  return (
    <ContextProviderComponent>
      <SiteContext.Consumer>
        {
          context => <CartLink {...props} context={context} />
        }
      </SiteContext.Consumer>
    </ContextProviderComponent>
  )
}

export default CartLinkWithContext