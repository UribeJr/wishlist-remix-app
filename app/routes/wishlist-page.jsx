import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import db from "../db.server";

export const loader = async ({ request }) => {
  // Get customerId from query params (Shopify app proxy will pass it)
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customer_id");
  if (!customerId) {
    return json({ wishlists: [] });
  }
  const wishlists = await db.wishlist.findMany({ where: { customerId } });
  return json({ wishlists });
};

export default function WishlistPage() {
  const { wishlists } = useLoaderData();
  return (
    <div>
      <h2>Your Wishlist</h2>
      {wishlists.length === 0 ? (
        <p>Your wishlist is empty.</p>
      ) : (
        <ul>
          {wishlists.map(item => (
            <li key={item.productId}>
              Product ID: {item.productId}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}