import { json } from "@remix-run/node";
// Import prisma db
import db from "../db.server";

// Define CORS headers to add to all responses
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // You can restrict this to your domain
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function loader({ request }) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId");
  const productId = url.searchParams.get("productId");
  const shop = url.searchParams.get("shop");
  let wishlist = [];

  if (customerId && productId && shop) {
    wishlist = await db.wishlist.findMany({
      where: { customerId, productId, shop },
    });
  } else if (customerId && shop) {
    wishlist = await db.wishlist.findMany({
      where: { customerId, shop },
    });
  }

  return json(
    { ok: true, data: wishlist },
    {
      headers: {
        ...CORS_HEADERS,
      },
    }
  );
}

export async function action({ request }) {
  // Handle CORS preflight request immediately
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: CORS_HEADERS,
    });
  }

  const method = request.method;
  let data = await request.formData();
  data = Object.fromEntries(data);

  const customerId = data.customerId;
  const productId = data.productId;
  const shop = data.shop;
  const variantId = data.variantId;
  const notes = data.notes || "";
  const has = data.has ? parseInt(data.has) : 0;
  const needs = data.needs ? parseInt(data.needs) : 0;

  if (!customerId || !variantId || !shop) {
    return json(
      { ok: false, message: "Missing required fields", method },
      {
        headers: CORS_HEADERS,
      }
    );
  }

  switch (method) {
    case "POST": {
      const wishlist = await db.wishlist.create({
        data: { customerId, productId, variantId, shop, notes },
      });
      return json(
        { message: "Item added to wishlist", method: "Post", wishlist },
        { headers: CORS_HEADERS }
      );
    }

    case "PUT": {
      const wishlist_update = await db.wishlist.updateMany({
        where: { customerId, variantId },
        data: { notes, has, needs },
      });
      return json(
        { message: "Wishlist item updated", method: "Put", wishlist: wishlist_update },
        { headers: CORS_HEADERS }
      );
    }

    case "DELETE": {
      const wishlist_delete = await db.wishlist.deleteMany({
        where: { customerId, productId, variantId, shop },
      });
      return json(
        { message: "Item removed from wishlist", method: "Delete", wishlist: wishlist_delete },
        { headers: CORS_HEADERS }
      );
    }

    default:
      return json(
        { ok: false, message: "Method not allowed" },
        { status: 405, headers: CORS_HEADERS }
      );
  }
}
