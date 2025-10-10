import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineGrid,
  Text,
  DataTable,
  Badge,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

// Map Shopify domains to public URLs
const SHOP_DISPLAY_NAMES = {
  "centuryweb.myshopify.com": "centurymartialarts.com",
  "century-us-wholesale.myshopify.com": "wholesale.centurymartialarts.com",
  "gameness.myshopify.com": "gameness.com",
};

// Helper function to get display name for shop
const getShopDisplayName = (shop) => {
  return SHOP_DISPLAY_NAMES[shop] || shop || "Unknown Store";
};

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  // Fetch all wishlist data from the database
  const wishlists = await db.wishlist.findMany();

  // Calculate analytics per shop
  const shopAnalytics = {};
  
  wishlists.forEach((item) => {
    const shop = item.shop || "Unknown Store";
    
    if (!shopAnalytics[shop]) {
      shopAnalytics[shop] = {
        shop,
        displayName: getShopDisplayName(shop),
        totalItems: 0,
        uniqueCustomers: new Set(),
        uniqueProducts: new Set(),
        recentActivity: null,
      };
    }
    
    shopAnalytics[shop].totalItems++;
    if (item.customerId) shopAnalytics[shop].uniqueCustomers.add(item.customerId);
    if (item.productId) shopAnalytics[shop].uniqueProducts.add(item.productId);
    
    // Track most recent activity
    if (!shopAnalytics[shop].recentActivity || 
        new Date(item.createdAt) > new Date(shopAnalytics[shop].recentActivity)) {
      shopAnalytics[shop].recentActivity = item.createdAt;
    }
  });

  // Convert to array and calculate final metrics
  const analytics = Object.values(shopAnalytics).map((shop) => ({
    shop: shop.shop,
    displayName: shop.displayName,
    totalItems: shop.totalItems,
    uniqueCustomers: shop.uniqueCustomers.size,
    uniqueProducts: shop.uniqueProducts.size,
    recentActivity: shop.recentActivity,
    avgItemsPerCustomer: shop.uniqueCustomers.size > 0 
      ? (shop.totalItems / shop.uniqueCustomers.size).toFixed(1)
      : 0,
  }));

  // Calculate overall stats
  const totalWishlists = wishlists.length;
  const totalShops = analytics.length;
  const totalCustomers = new Set(wishlists.map(w => w.customerId)).size;
  const totalProducts = new Set(wishlists.map(w => w.productId)).size;

  return json({ 
    analytics,
    totalWishlists,
    totalShops,
    totalCustomers,
    totalProducts,
  });
};

export default function Index() {
  const { analytics, totalWishlists, totalShops, totalCustomers, totalProducts } = useLoaderData();

  // Prepare data for the table
  const rows = analytics.map((shop) => [
    shop.displayName,
    shop.totalItems,
    shop.uniqueCustomers,
    shop.uniqueProducts,
    shop.avgItemsPerCustomer,
    new Date(shop.recentActivity).toLocaleDateString(),
  ]);

  return (
    <Page>
      <TitleBar title="Wishlist Analytics Dashboard" />
      <BlockStack gap="500">
        {/* Overall Statistics */}
        <Layout>
          <Layout.Section>
            <InlineGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="400">
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm" fontWeight="medium">
                    Total Stores
                  </Text>
                  <Text as="p" variant="heading2xl">
                    {totalShops}
                  </Text>
                </BlockStack>
              </Card>
              
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm" fontWeight="medium">
                    Total Wishlist Items
                  </Text>
                  <Text as="p" variant="heading2xl">
                    {totalWishlists}
                  </Text>
                </BlockStack>
              </Card>
              
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm" fontWeight="medium">
                    Active Customers
                  </Text>
                  <Text as="p" variant="heading2xl">
                    {totalCustomers}
                  </Text>
                </BlockStack>
              </Card>
              
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm" fontWeight="medium">
                    Wishlisted Products
                  </Text>
                  <Text as="p" variant="heading2xl">
                    {totalProducts}
                  </Text>
                </BlockStack>
              </Card>
            </InlineGrid>
          </Layout.Section>
        </Layout>

        {/* Store Performance Table */}
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Store Performance Breakdown
                </Text>
                <DataTable
                  columnContentTypes={["text", "numeric", "numeric", "numeric", "numeric", "text"]}
                  headings={[
                    "Store",
                    "Total Items",
                    "Customers",
                    "Products",
                    "Avg Items/Customer",
                    "Last Activity",
                  ]}
                  rows={rows}
                  sortable={[true, true, true, true, true, true]}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
