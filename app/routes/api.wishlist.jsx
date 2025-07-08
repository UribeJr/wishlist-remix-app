import { json } from "@remix-run/node";
 // Importing CORS utility
import { cors } from "remix-utils/cors";
//Import prisma db
import db from "../db.server";

export async function loader({request}) {
    const url = new URL(request.url);
    const customerId = url.searchParams.get("customerId");
    const productId = url.searchParams.get("productId");
    const shop = url.searchParams.get("shop");
    //  Start with empty array
    let wishlist = [];
    // If all fields are provided fetch the wishlist data
    if (customerId && productId && shop) {
        wishlist = await db.wishlist.findMany({
            where: {
                customerId,
                productId,
                shop,
            },
        });
    }
    else if (customerId && shop) {
        // If only customerId and shop are provided, fetch all products in the wishlist for that customer
        wishlist = await db.wishlist.findMany({
            where: {
                customerId,
                shop,
            },
        });

    }
    //return with cors
    return await cors(request, json({ ok: true, data: wishlist }));
}

export async function action({ request }) {
    const method = request.method;
    let data = await request.formData();
    data = Object.fromEntries(data);
    const customerId = data.customerId;
    const productId = data.productId;
    const shop = data.shop;
    const variantId = data.variantId;
    const notes = data.notes || "";
    const has = data.has ? parseInt(data.has) : 0; // Default to 0 if not provided
    const needs = data.needs ? parseInt(data.needs) : 0; // Default to 0 if not provided

    // if variant id is provided return ok status message with cors 
    // if (variantId) {
    //     return await cors(request, json({ ok: true, message: "Variant ID provided", variantId }));
    // }   

    // Validate required fields above
    if (!customerId || !variantId || !shop) {

        return json({
            ok: false,
            message: "Missing required fields",
            method: method,
        });
    }

    switch(method) {
        case "POST":
            const wishlist = await db.wishlist.create({
                data: {
                    customerId,
                    productId,
                    variantId,
                    shop,
                    notes,
                },
            });
            const response = json({
                message: "Item added to wishlist",
                method: "Post",
                wishlist: wishlist,
            });
            return await cors (request, response);

        case "PUT":
            // Handle updating an item in the wishlist
            const wishlist_update = await db.wishlist.updateMany({
                where: {
                    customerId,
                    variantId,
                },
                data: {
                    notes, // Update notes if provided
                    has,
                    needs,
                },
            });
            const responseUpdate = json({
                message: "Wishlist item updated",
                method: "Put",
                wishlist: wishlist_update,
            });
            return await cors(request, responseUpdate);

        case "DELETE":
            // Handle removing an item from the wishlist
            const wishlist_delete = await db.wishlist.deleteMany({
                where: {
                    customerId,
                    productId,
                    variantId,
                    shop,
                },
            });
            const responseDelete = json({
                message: "Item removed from wishlist",
                method: "Delete",
                wishlist: wishlist_delete,
            });
            return await cors(request, responseDelete);
        default:
            return json({ ok: false, message: "Method not allowed" }, { status: 405 });
    }
}