import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { router } from 'expo-router';

import { supabase } from '../services/supabase';
import { useCart } from '../context/CartContext';

type Product = {
  id: string;
  product_name: string;
  selling_price: number;
  image_url: string;
  category?: string | null;
  material?: string | null;
  description_en?: string | null;
  isDummy?: boolean;
};

type ArtForm = {
  name: string;
  image: string;
};

type Region = {
  name: string;
  image: string;
};

type Story = {
  title: string;
  subtitle: string;
  image: string;
};

const assetUri = (asset: any) => {
  return Image.resolveAssetSource(asset).uri;
};

const fallbackImage = assetUri(
  require('../../assets/buyer/market.png')
);

const dummyProducts: Product[] = [
  {
    id: 'dummy-madhubani',
    product_name: 'Madhubani Painting',
    selling_price: 1200,
    image_url: assetUri(
      require('../../assets/buyer/madhubani.png')
    ),
    category: 'Paintings',
    material: 'Handmade Paper',
    description_en:
      'Traditional Madhubani artwork inspired by the folk art of Bihar.',
    isDummy: true,
  },
  {
    id: 'dummy-textile',
    product_name: 'Handwoven Textile',
    selling_price: 950,
    image_url: assetUri(
      require('../../assets/buyer/textiles.png')
    ),
    category: 'Textiles',
    material: 'Cotton',
    description_en:
      'Beautiful handwoven Indian textile crafted by skilled artisans.',
    isDummy: true,
  },
  {
    id: 'dummy-pottery',
    product_name: 'Traditional Pottery',
    selling_price: 850,
    image_url: assetUri(
      require('../../assets/buyer/pottery.png')
    ),
    category: 'Pottery',
    material: 'Clay',
    description_en:
      'Handcrafted traditional pottery made using age-old artisan techniques.',
    isDummy: true,
  },
  {
    id: 'dummy-warli',
    product_name: 'Warli Folk Art',
    selling_price: 1100,
    image_url: assetUri(
      require('../../assets/buyer/warli.png')
    ),
    category: 'Paintings',
    material: 'Canvas',
    description_en:
      'Warli artwork inspired by the tribal traditions of Maharashtra.',
    isDummy: true,
  },
  {
    id: 'dummy-jewellery',
    product_name: 'Handmade Jewellery',
    selling_price: 750,
    image_url: assetUri(
      require('../../assets/buyer/jewellery.png')
    ),
    category: 'Jewellery',
    material: 'Mixed Metal',
    description_en:
      'Handmade statement jewellery inspired by traditional Indian craft.',
    isDummy: true,
  },
  {
    id: 'dummy-gond',
    product_name: 'Gond Folk Art',
    selling_price: 1350,
    image_url: assetUri(
      require('../../assets/buyer/gond.png')
    ),
    category: 'Paintings',
    material: 'Canvas',
    description_en:
      'Colourful Gond artwork inspired by tribal stories and nature.',
    isDummy: true,
  },
];

const artForms: ArtForm[] = [
  {
    name: 'Madhubani',
    image: assetUri(
      require('../../assets/buyer/madhubani.png')
    ),
  },
  {
    name: 'Kalamkari',
    image: assetUri(
      require('../../assets/buyer/kalamkari.png')
    ),
  },
  {
    name: 'Tanjore',
    image: assetUri(
      require('../../assets/buyer/tanjore.png')
    ),
  },
  {
    name: 'Gond',
    image: assetUri(
      require('../../assets/buyer/gond.png')
    ),
  },
  {
    name: 'Kalighat',
    image: assetUri(
      require('../../assets/buyer/kalighat.png')
    ),
  },
  {
    name: 'Warli',
    image: assetUri(
      require('../../assets/buyer/warli.png')
    ),
  },
];

const regions: Region[] = [
  {
    name: 'Andhra Pradesh',
    image: assetUri(
      require('../../assets/buyer/andhra.png')
    ),
  },
  {
    name: 'Maharashtra',
    image: assetUri(
      require('../../assets/buyer/gujarat.png')
    ),
  },
  {
    name: 'Manipur',
    image: assetUri(
      require('../../assets/buyer/chhattisgarh.png')
    ),
  },
];

const stories: Story[] = [
  {
    title: 'Hands Behind the Craft',
    subtitle:
      'Discover the stories and traditions behind handmade Indian art.',
    image: assetUri(
      require('../../assets/buyer/potterArtisan.png')
    ),
  },
  {
    title: 'Crafted Across Generations',
    subtitle:
      'Meet artisan communities preserving India’s cultural heritage.',
    image: assetUri(
      require('../../assets/buyer/saariArtisan.png')
    ),
  },
];

const categories = [
  'All',
  'Paintings',
  'Textiles',
  'Pottery',
  'Jewellery',
];

export default function BuyerScreen() {
  const {
    cartCount,
    addToCart,
  } = useCart();

  const [products, setProducts] = useState<Product[]>(
    []
  );

  const [searchText, setSearchText] =
    useState('');

  const [activeCategory, setActiveCategory] =
    useState('All');

  const [loading, setLoading] =
    useState(true);

  const [showAllArtForms, setShowAllArtForms] =
    useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const { data, error } =
        await supabase
          .from('products')
          .select(
            'id, product_name, selling_price, image_url, category, material, description_en'
          )
          .order('created_at', {
            ascending: false,
          });

      if (error) {
        console.log(
          'Product fetch error:',
          error
        );

        setProducts([]);
        return;
      }

      const cleanProducts: Product[] =
        (data || []).map((product: any) => ({
          ...product,
          selling_price: Number(
            product.selling_price
          ),
          image_url:
            product.image_url ||
            fallbackImage,
          isDummy: false,
        }));

      setProducts(cleanProducts);
    } catch (error) {
      console.log(
        'Buyer fetch error:',
        error
      );

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const marketplaceProducts =
    useMemo(() => {
      let combined: Product[] = [
        ...products,
      ];

      if (combined.length < 6) {
        const numberNeeded =
          6 - combined.length;

        combined = [
          ...combined,
          ...dummyProducts.slice(
            0,
            numberNeeded
          ),
        ];
      }

      if (activeCategory !== 'All') {
        combined = combined.filter(
          (product) =>
            product.category
              ?.toLowerCase()
              .includes(
                activeCategory.toLowerCase()
              )
        );
      }

      const query =
        searchText
          .trim()
          .toLowerCase();

      if (query) {
        combined = combined.filter(
          (product) =>
            product.product_name
              .toLowerCase()
              .includes(query) ||
            product.category
              ?.toLowerCase()
              .includes(query) ||
            product.material
              ?.toLowerCase()
              .includes(query)
        );
      }

      return combined;
    }, [
      products,
      activeCategory,
      searchText,
    ]);

  const openProduct = (
    product: Product
  ) => {
    if (product.isDummy) {
      openDummyProduct(product);
      return;
    }

    router.push({
      pathname: '/product/[id]',
      params: {
        id: product.id,
      },
    });
  };

  const openDummyProduct = (
    product: Product
  ) => {
    Alert.alert(
      product.product_name,
      `₹${product.selling_price.toLocaleString(
        'en-IN'
      )}\n\n${
        product.description_en ||
        'Handcrafted artisan product.'
      }`,
      [
        {
          text: 'Close',
          style: 'cancel',
        },
        {
          text: 'Add to Bag',
          onPress: () =>
            addDummyToBag(product),
        },
        {
          text: 'Buy Now',
          onPress: () =>
            buyDummyNow(product),
        },
      ]
    );
  };

  const addDummyToBag = (
    product: Product
  ) => {
    addToCart(product);

    Alert.alert(
      'Added to Bag 🛍️',
      `${product.product_name} has been added to your bag.`,
      [
        {
          text: 'Continue Shopping',
          style: 'cancel',
        },
        {
          text: 'View Bag',
          onPress: () =>
            router.push('/bag'),
        },
      ]
    );
  };

  const buyDummyNow = (
    product: Product
  ) => {
    addToCart(product);
    router.push('/checkout');
  };

  const handleMenu = () => {
    Alert.alert(
      'Menu',
      'What would you like to open?',
      [
        {
          text: 'Continue Shopping',
          style: 'cancel',
        },
        {
          text: 'View Bag',
          onPress: () =>
            router.push('/bag'),
        },
      ]
    );
  };

  const handleNotifications = () => {
    Alert.alert(
      'Notifications',
      'You are all caught up!'
    );
  };

  const handleRegion = (
    region: string
  ) => {
    Alert.alert(
      region,
      `Explore traditional artisan crafts from ${region}.`
    );
  };

  const handleStory = (
    title: string
  ) => {
    Alert.alert(
      title,
      'Discover the artisan stories, traditions and craftsmanship behind every handmade product.'
    );
  };

  const handleWishlist = () => {
    Alert.alert(
      'Wishlist ♡',
      'Your wishlist will appear here.'
    );
  };

  const handleOrders = () => {
    Alert.alert(
      'Orders',
      'Your placed orders will appear here.'
    );
  };

  const handleAccount = () => {
    Alert.alert(
      'Account',
      'Choose an option',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: handleLogout,
        },
      ]
    );
  };

  const handleLogout = async () => {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      Alert.alert(
        'Error',
        error.message
      );
      return;
    }

    router.replace('/login');
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* HEADER */}

        <View style={styles.topHeader}>
          <Pressable
            style={styles.headerIconButton}
            onPress={handleMenu}
          >
            <Text style={styles.headerIcon}>
              ☰
            </Text>
          </Pressable>

          <View style={styles.brandContainer}>
            <Text style={styles.brandSmall}>
              HANDMADE IN INDIA
            </Text>

            <Text style={styles.brandName}>
                Kalaकार
            </Text>
          </View>

          <View style={styles.headerRight}>
            <Pressable
              style={styles.headerIconButton}
              onPress={
                handleNotifications
              }
            >
              <Text
                style={
                  styles.smallHeaderIcon
                }
              >
                🔔
              </Text>
            </Pressable>

            <Pressable
              style={styles.cartButton}
              onPress={() =>
                router.push('/bag')
              }
            >
              <Text
                style={
                  styles.smallHeaderIcon
                }
              >
                🛍️
              </Text>

              {cartCount > 0 && (
                <View
                  style={styles.cartBadge}
                >
                  <Text
                    style={
                      styles.cartBadgeText
                    }
                  >
                    {cartCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* SEARCH */}

        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <Text
              style={styles.searchIcon}
            >
              🔍
            </Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Search handmade products..."
              placeholderTextColor="#94867C"
              value={searchText}
              onChangeText={setSearchText}
            />

            {searchText.length > 0 && (
              <Pressable
                onPress={() =>
                  setSearchText('')
                }
              >
                <Text
                  style={
                    styles.clearSearch
                  }
                >
                  ✕
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* HERO */}

        <View style={styles.heroWrapper}>
          <Image
            source={{
              uri: assetUri(
                require('../../assets/buyer/India.png')
              ),
            }}
            style={styles.heroImage}
          />

          <View style={styles.heroOverlay} />

          <View style={styles.heroContent}>
            <Text
              style={styles.heroSmall}
            >
              STORIES FROM INDIA
            </Text>

            <Text
              style={styles.heroTitle}
            >
              Handmade with{'\n'}heart.
            </Text>

            <Text
              style={styles.heroSubtitle}
            >
              Discover authentic crafts
              made by Indian artisans.
            </Text>

            <Pressable
              style={styles.heroButton}
              onPress={() => {
                setActiveCategory(
                  'All'
                );
                setSearchText('');
              }}
            >
              <Text
                style={
                  styles.heroButtonText
                }
              >
                Explore Crafts
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ART FORMS */}

        <View style={styles.section}>
          <View
            style={styles.sectionHeader}
          >
            <View>
              <Text
                style={
                  styles.sectionEyebrow
                }
              >
                DISCOVER
              </Text>

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Browse by Popular Art
                Forms
              </Text>
            </View>

            <Pressable
              onPress={() =>
                setShowAllArtForms(
                  !showAllArtForms
                )
              }
            >
              <Text style={styles.viewMore}>
                {showAllArtForms
                  ? 'Show less'
                  : 'View more'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.artGrid}>
            {artForms
              .slice(
                0,
                showAllArtForms ? 6 : 6
              )
              .map((item) => (
                <Pressable
                  key={item.name}
                  style={
                    styles.artCard
                  }
                  onPress={() =>
                    setSearchText(
                      item.name
                    )
                  }
                >
                  <Image
                    source={{
                      uri: item.image,
                    }}
                    style={
                      styles.artImage
                    }
                  />

                  <View
                    style={
                      styles.artOverlay
                    }
                  />

                  <Text
                    style={styles.artName}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              ))}
          </View>
        </View>

        {/* REGIONS */}

        <View style={styles.section}>
          <View
            style={styles.sectionHeader}
          >
            <View>
              <Text
                style={
                  styles.sectionEyebrow
                }
              >
                EXPLORE INDIA
              </Text>

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Browse by State /
                Region
              </Text>
            </View>

            <Pressable
              onPress={() =>
                Alert.alert(
                  'Regions',
                  'More regional collections coming soon.'
                )
              }
            >
              <Text style={styles.viewMore}>
                View all
              </Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.regionScroll
            }
          >
            {regions.map((region) => (
              <Pressable
                key={region.name}
                style={styles.regionCard}
                onPress={() =>
                  handleRegion(
                    region.name
                  )
                }
              >
                <Image
                  source={{
                    uri: region.image,
                  }}
                  style={
                    styles.regionImage
                  }
                />

                <View
                  style={
                    styles.regionOverlay
                  }
                />

                <Text
                  style={
                    styles.regionName
                  }
                >
                  {region.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* MARKETPLACE */}

        <View style={styles.section}>
          <View
            style={styles.sectionHeader}
          >
            <View>
              <Text
                style={
                  styles.sectionEyebrow
                }
              >
                SHOP HANDMADE
              </Text>

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Artisan Marketplace
              </Text>
            </View>

            {loading && (
              <Text
                style={
                  styles.loadingText
                }
              >
                Loading...
              </Text>
            )}
          </View>

          {/* FILTERS */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            style={styles.categoryScroll}
          >
            {categories.map(
              (category) => {
                const selected =
                  activeCategory ===
                  category;

                return (
                  <Pressable
                    key={category}
                    onPress={() =>
                      setActiveCategory(
                        category
                      )
                    }
                    style={[
                      styles.categoryPill,
                      selected &&
                        styles.categoryPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selected &&
                          styles.categoryTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </ScrollView>

          {/* PRODUCTS */}

          {marketplaceProducts.length ===
          0 ? (
            <View
              style={styles.emptyState}
            >
              <Text
                style={
                  styles.emptyEmoji
                }
              >
                🪔
              </Text>

              <Text
                style={
                  styles.emptyTitle
                }
              >
                No products found
              </Text>

              <Text
                style={
                  styles.emptySubtitle
                }
              >
                Try another search or
                category.
              </Text>

              <Pressable
                style={
                  styles.resetButton
                }
                onPress={() => {
                  setSearchText('');
                  setActiveCategory(
                    'All'
                  );
                }}
              >
                <Text
                  style={
                    styles.resetButtonText
                  }
                >
                  Show all products
                </Text>
              </Pressable>
            </View>
          ) : (
            <View
              style={
                styles.productGrid
              }
            >
              {marketplaceProducts.map(
                (product) => (
                  <Pressable
                    key={product.id}
                    style={
                      styles.productCard
                    }
                    onPress={() =>
                      openProduct(product)
                    }
                  >
                    <View
                      style={
                        styles.productImageWrapper
                      }
                    >
                      <Image
                        source={{
                          uri:
                            product.image_url ||
                            fallbackImage,
                        }}
                        style={
                          styles.productImage
                        }
                      />

                      {product.isDummy && (
                        <View
                          style={
                            styles.demoBadge
                          }
                        >
                          <Text
                            style={
                              styles.demoBadgeText
                            }
                          >
                            Featured
                          </Text>
                        </View>
                      )}

                      <Pressable
                        style={
                          styles.heartButton
                        }
                        onPress={(
                          event
                        ) => {
                          event.stopPropagation();
                          Alert.alert(
                            'Wishlist ♡',
                            `${product.product_name} saved to your wishlist.`
                          );
                        }}
                      >
                        <Text
                          style={
                            styles.heartText
                          }
                        >
                          ♡
                        </Text>
                      </Pressable>
                    </View>

                    <View
                      style={
                        styles.productInfo
                      }
                    >
                      <Text
                        style={
                          styles.productCategory
                        }
                        numberOfLines={1}
                      >
                        {product.category ||
                          'Handicraft'}
                      </Text>

                      <Text
                        style={
                          styles.productName
                        }
                        numberOfLines={2}
                      >
                        {
                          product.product_name
                        }
                      </Text>

                      <View
                        style={
                          styles.productBottom
                        }
                      >
                        <Text
                          style={
                            styles.productPrice
                          }
                        >
                          ₹
                          {product.selling_price.toLocaleString(
                            'en-IN'
                          )}
                        </Text>

                        {product.isDummy && (
                          <Pressable
                            style={
                              styles.quickAdd
                            }
                            onPress={(
                              event
                            ) => {
                              event.stopPropagation();
                              addDummyToBag(
                                product
                              );
                            }}
                          >
                            <Text
                              style={
                                styles.quickAddText
                              }
                            >
                              +
                            </Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  </Pressable>
                )
              )}
            </View>
          )}
        </View>

        {/* STORIES */}

        <View
          style={[
            styles.section,
            styles.storySection,
          ]}
        >
          <Text
            style={styles.sectionEyebrow}
          >
            MEET THE MAKERS
          </Text>

          <Text
            style={styles.sectionTitle}
          >
            The Untold Stories
          </Text>

          <Text
            style={
              styles.storyIntro
            }
          >
            Behind every handmade piece
            is an artisan, a tradition
            and a story.
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.storyScroll
            }
          >
            {stories.map(
              (story) => (
                <Pressable
                  key={story.title}
                  style={
                    styles.storyCard
                  }
                  onPress={() =>
                    handleStory(
                      story.title
                    )
                  }
                >
                  <Image
                    source={{
                      uri: story.image,
                    }}
                    style={
                      styles.storyImage
                    }
                  />

                  <View
                    style={
                      styles.storyContent
                    }
                  >
                    <Text
                      style={
                        styles.storyTitle
                      }
                    >
                      {story.title}
                    </Text>

                    <Text
                      style={
                        styles.storySubtitle
                      }
                      numberOfLines={3}
                    >
                      {story.subtitle}
                    </Text>

                    <Text
                      style={
                        styles.readStory
                      }
                    >
                      Read story →
                    </Text>
                  </View>
                </Pressable>
              )
            )}
          </ScrollView>
        </View>

        <View style={{ height: 105 }} />
      </ScrollView>

      {/* BOTTOM NAV */}

      <View style={styles.bottomNav}>
        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.push('/buyer')
          }
        >
          <Text
            style={[
              styles.navIcon,
              styles.activeNav,
            ]}
          >
            ⌂
          </Text>

          <Text
            style={[
              styles.navLabel,
              styles.activeNav,
            ]}
          >
            Home
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={handleWishlist}
        >
          <Text
            style={styles.navIcon}
          >
            ♡
          </Text>

          <Text
            style={styles.navLabel}
          >
            Wishlist
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() =>
            router.push('/explore')
          }
        >
          <View
            style={
              styles.discoverButton
            }
          >
            <Text
              style={
                styles.discoverIcon
              }
            >
              ✦
            </Text>
          </View>

          <Text
            style={styles.navLabel}
          >
            Discover
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={handleOrders}
        >
          <Text
            style={styles.navIcon}
          >
            ▣
          </Text>

          <Text
            style={styles.navLabel}
          >
            Orders
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={handleAccount}
        >
          <Text
            style={styles.navIcon}
          >
            ◯
          </Text>

          <Text
            style={styles.navLabel}
          >
            Account
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF8EF',
  },

  scrollContent: {
    paddingBottom: 20,
  },

  /* HEADER */

  topHeader: {
    backgroundColor: '#8C3D0B',
    paddingTop: 48,
    paddingBottom: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerIcon: {
    fontSize: 25,
    color: '#FFFFFF',
  },

  smallHeaderIcon: {
    fontSize: 19,
  },

  brandContainer: {
    flex: 1,
    alignItems: 'center',
  },

  brandSmall: {
    fontSize: 8,
    letterSpacing: 1.6,
    color: '#F1D5BD',
    fontWeight: '700',
  },

  brandName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  cartButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cartBadge: {
    position: 'absolute',
    right: -1,
    top: 0,
    backgroundColor: '#F3C64E',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  cartBadgeText: {
    color: '#6F2804',
    fontSize: 9,
    fontWeight: '800',
  },

  /* SEARCH */

  searchSection: {
    backgroundColor: '#8C3D0B',
    paddingHorizontal: 18,
    paddingBottom: 16,
  },

  searchBox: {
    height: 45,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },

  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#33251D',
  },

  clearSearch: {
    fontSize: 15,
    color: '#7B6B61',
  },

  /* HERO */

  heroWrapper: {
    height: 220,
    position: 'relative',
    overflow: 'hidden',
  },

  heroImage: {
    width: '100%',
    height: '100%',
  },

  heroOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor:
    'rgba(49, 24, 8, 0.47)',
},

  heroContent: {
    position: 'absolute',
    left: 24,
    top: 28,
    right: 20,
  },

  heroSmall: {
    color: '#FFDFAF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.7,
    marginBottom: 7,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: 8,
  },

  heroSubtitle: {
    color: '#F6EEE8',
    fontSize: 12,
    lineHeight: 18,
    width: 230,
    marginBottom: 15,
  },

  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#D9691D',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 5,
  },

  heroButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  /* GENERAL SECTION */

  section: {
    paddingHorizontal: 18,
    paddingTop: 24,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  sectionEyebrow: {
    color: '#B45418',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.7,
    marginBottom: 4,
  },

  sectionTitle: {
    color: '#3D2B20',
    fontSize: 19,
    fontWeight: '800',
  },

  viewMore: {
    color: '#A84D16',
    fontSize: 10,
    fontWeight: '700',
  },

  loadingText: {
    color: '#9A897E',
    fontSize: 10,
  },

  /* ART FORMS */

  artGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  artCard: {
    width: '31.5%',
    height: 105,
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: 10,
    position: 'relative',
  },

  artImage: {
    width: '100%',
    height: '100%',
  },

 artOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor:
    'rgba(40, 19, 7, 0.20)',
},

  artName: {
    position: 'absolute',
    left: 7,
    right: 7,
    bottom: 7,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    textShadowColor:
      'rgba(0,0,0,0.45)',
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 2,
  },

  /* REGIONS */

  regionScroll: {
    gap: 10,
    paddingRight: 15,
  },

  regionCard: {
    width: 145,
    height: 92,
    borderRadius: 7,
    overflow: 'hidden',
    position: 'relative',
  },

  regionImage: {
    width: '100%',
    height: '100%',
  },

  regionOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor:
    'rgba(40,20,5,0.25)',
},
  regionName: {
    position: 'absolute',
    bottom: 9,
    left: 9,
    right: 9,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  /* CATEGORIES */

  categoryScroll: {
    marginBottom: 14,
  },

  categoryPill: {
    borderWidth: 1,
    borderColor: '#DEC7B5',
    backgroundColor: '#FFFDF9',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
    marginRight: 7,
  },

  categoryPillActive: {
    backgroundColor: '#8C3D0B',
    borderColor: '#8C3D0B',
  },

  categoryText: {
    color: '#6C5749',
    fontSize: 10,
    fontWeight: '600',
  },

  categoryTextActive: {
    color: '#FFFFFF',
  },

  /* PRODUCTS */

  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  productCard: {
    width: '48.3%',
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
    overflow: 'hidden',
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#EFE4DA',
  },

  productImageWrapper: {
    width: '100%',
    height: 150,
    position: 'relative',
    backgroundColor: '#EFE7DE',
  },

  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  demoBadge: {
    position: 'absolute',
    left: 7,
    top: 7,
    backgroundColor: '#E36B1F',
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  demoBadgeText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '800',
  },

  heartButton: {
    position: 'absolute',
    right: 7,
    top: 7,
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor:
      'rgba(255,255,255,0.93)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  heartText: {
    fontSize: 17,
    color: '#773609',
  },

  productInfo: {
    padding: 10,
  },

  productCategory: {
    color: '#A45A29',
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },

  productName: {
    color: '#37271E',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    minHeight: 34,
  },

  productBottom: {
    marginTop: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  productPrice: {
    color: '#8C3D0B',
    fontSize: 14,
    fontWeight: '800',
  },

  quickAdd: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#D9691D',
    justifyContent: 'center',
    alignItems: 'center',
  },

  quickAddText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '500',
  },

  /* EMPTY */

  emptyState: {
    alignItems: 'center',
    paddingVertical: 35,
  },

  emptyEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 16,
    color: '#3E2D22',
    fontWeight: '800',
  },

  emptySubtitle: {
    fontSize: 11,
    color: '#8D7B6F',
    marginTop: 4,
  },

  resetButton: {
    backgroundColor: '#8C3D0B',
    marginTop: 13,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },

  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  /* STORIES */

  storySection: {
    paddingTop: 25,
  },

  storyIntro: {
    color: '#7C695C',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
    marginBottom: 13,
  },

  storyScroll: {
    gap: 11,
    paddingRight: 15,
  },

  storyCard: {
    width: 230,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFE1D5',
  },

  storyImage: {
    width: '100%',
    height: 110,
  },

  storyContent: {
    padding: 12,
  },

  storyTitle: {
    color: '#3A291F',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },

  storySubtitle: {
    color: '#826F62',
    fontSize: 10,
    lineHeight: 15,
  },

  readStory: {
    color: '#A64E17',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 9,
  },

  /* BOTTOM NAV */

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 76,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EADDD2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 7,
  },

  navItem: {
    width: '20%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  navIcon: {
    color: '#8A786C',
    fontSize: 20,
    marginBottom: 3,
  },

  navLabel: {
    color: '#8A786C',
    fontSize: 8,
    fontWeight: '600',
  },

  activeNav: {
    color: '#8C3D0B',
    fontWeight: '800',
  },

  discoverButton: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: '#D9691D',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -24,
    marginBottom: 3,
    borderWidth: 3,
    borderColor: '#FFF8EF',
  },

  discoverIcon: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});