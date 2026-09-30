import {
  useLocalSearchParams,
  router,
} from 'expo-router';

import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';

import { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';

import { supabase } from '../../services/supabase';

export default function ProductDetails() {
  const { id } = useLocalSearchParams();

  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [artisan, setArtisan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.log(
          'PRODUCT DETAILS ERROR:',
          error
        );

        setProduct(null);
        return;
      }

      setProduct(data);

      const {
        data: artisanData,
        error: artisanError,
      } = await supabase.rpc(
        'get_artisan_contact',
        {
          artisan_uuid: data.artisan_id,
        }
      );

      if (artisanError) {
        console.log(
          'ARTISAN CONTACT ERROR:',
          artisanError
        );
      } else if (
        artisanData &&
        artisanData.length > 0
      ) {
        setArtisan(artisanData[0]);
      }
    } catch (error) {
      console.log('ERROR:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  /* ADD TO BAG */

  const handleAddToBag = () => {
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

  /* BUY NOW */

  const handleBuyNow = () => {
    addToCart(product);

    router.push('/checkout');
  };

  /* WHATSAPP */

  const handleWhatsApp = async () => {
    if (!artisan?.phone) {
      Alert.alert(
        'Contact unavailable',
        'The artisan has not added a WhatsApp number yet.'
      );

      return;
    }

    const phoneNumber = `91${artisan.phone}`;

    const message = `Hi ${
      artisan.full_name || 'Artisan'
    }! I'm interested in your product "${product.product_name}" listed on ArtisanAI.`;

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;

    const supported =
      await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        'WhatsApp Not Available',
        'Please install WhatsApp to contact the artisan.'
      );
    }
  };

  /* LOADING */

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#7A3E22"
        />

        <Text style={styles.loadingText}>
          Loading product...
        </Text>
      </View>
    );
  }

  /* PRODUCT NOT FOUND */

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIcon}>
          <Text style={styles.errorEmoji}>
            🔎
          </Text>
        </View>

        <Text style={styles.errorText}>
          Product not found
        </Text>

        <Pressable
          style={styles.errorBackButton}
          onPress={() => router.back()}
        >
          <Text
            style={styles.errorBackButtonText}
          >
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <Text style={styles.backIcon}>
            ‹
          </Text>
        </Pressable>

        <Text style={styles.headerTitle}>
          Product Details
        </Text>

        <Pressable
          onPress={() => router.push('/bag')}
          style={styles.headerButton}
        >
          <Text style={styles.headerBagIcon}>
            🛍️
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 190,
        }}
      >

        {/* PRODUCT IMAGE */}

        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: product.image_url,
            }}
            style={styles.productImage}
          />

          <View style={styles.handmadeBadge}>
            <Text style={styles.handmadeBadgeText}>
              ✨ Handmade
            </Text>
          </View>
        </View>

        {/* PRODUCT INFORMATION */}

        <View style={styles.content}>

          {product.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {product.category}
              </Text>
            </View>
          )}

          <Text style={styles.productName}>
            {product.product_name}
          </Text>

          <View style={styles.artisanRow}>
            <Text style={styles.artisanDot}>
              ●
            </Text>

            <Text style={styles.artisan}>
              Crafted by Indian Artisan
            </Text>
          </View>

          {/* PRICE */}

          <View style={styles.priceSection}>
            <Text style={styles.price}>
              ₹
              {Number(
                product.selling_price
              ).toLocaleString('en-IN')}
            </Text>

            <View style={styles.fairPriceBadge}>
              <Text
                style={styles.fairPriceText}
              >
                Fair Artisan Price
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* ABOUT */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              About this product
            </Text>

            <Text style={styles.description}>
              {product.description_en ||
                'A beautiful handcrafted product made by an Indian artisan.'}
            </Text>
          </View>

          {/* MATERIAL */}

          {product.material && (
            <View style={styles.infoSection}>
              <View style={styles.infoIconBox}>
                <Text style={styles.infoIcon}>
                  🧵
                </Text>
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>
                  Material
                </Text>

                <Text style={styles.infoValue}>
                  {product.material}
                </Text>
              </View>
            </View>
          )}

          {/* CATEGORY */}

          {product.category && (
            <View style={styles.infoSection}>
              <View style={styles.infoIconBox}>
                <Text style={styles.infoIcon}>
                  🎨
                </Text>
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>
                  Art Form
                </Text>

                <Text style={styles.infoValue}>
                  {product.category}
                </Text>
              </View>
            </View>
          )}

          {/* ARTISAN */}

          <Text style={styles.sectionTitle}>
            Meet the Artisan
          </Text>

          <View style={styles.artisanBox}>

            <View style={styles.artisanAvatar}>
              <Text style={styles.artisanEmoji}>
                👩🏽‍🎨
              </Text>
            </View>

            <View style={styles.artisanInfo}>

              <Text style={styles.artisanLabel}>
                ARTISAN
              </Text>

              <Text style={styles.artisanName}>
                {artisan?.full_name ||
                  'Indian Artisan'}
              </Text>

              <Text
                style={styles.artisanLocation}
              >
                🇮🇳 Indian Handicrafts
              </Text>

            </View>

            <Text style={styles.artisanArrow}>
              ›
            </Text>

          </View>

          {/* SUPPORT MESSAGE */}

          <View style={styles.supportCard}>
            <Text style={styles.supportEmoji}>
              🤎
            </Text>

            <View style={styles.supportContent}>
              <Text style={styles.supportTitle}>
                Supporting Indian Artisans
              </Text>

              <Text style={styles.supportText}>
                Your purchase directly supports
                traditional artisans and their
                communities.
              </Text>
            </View>
          </View>

        </View>

      </ScrollView>

      {/* BOTTOM SHOPPING BAR */}

      <View style={styles.bottomBar}>

        <Pressable
          style={styles.addBagButton}
          onPress={handleAddToBag}
        >
          <Text style={styles.addBagIcon}>
            🛍️
          </Text>

          <Text style={styles.addBagText}>
            Add to Bag
          </Text>
        </Pressable>

        <Pressable
          style={styles.buyNowButton}
          onPress={handleBuyNow}
        >
          <Text style={styles.buyNowText}>
            ⚡ Buy Now
          </Text>
        </Pressable>

        <Pressable
          style={styles.whatsappButton}
          onPress={handleWhatsApp}
        >
          <Text style={styles.whatsappText}>
            💬
          </Text>
        </Pressable>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  /* MAIN */

  container: {
    flex: 1,
    backgroundColor: '#FBF5ED',
  },

  /* HEADER */

  header: {
    height: 108,
    paddingTop: 45,
    paddingHorizontal: 16,
    backgroundColor: '#7A3E22',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      'rgba(255,255,255,0.13)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backIcon: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 35,
    marginTop: -4,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  headerBagIcon: {
    fontSize: 18,
  },

  /* IMAGE */

  imageContainer: {
    position: 'relative',
    backgroundColor: '#F0E5DB',
  },

  productImage: {
    width: '100%',
    height: 365,
    backgroundColor: '#F0E5DB',
  },

  handmadeBadge: {
    position: 'absolute',
    bottom: 16,
    left: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 15,
  },

  handmadeBadgeText: {
    color: '#7A3E22',
    fontSize: 11,
    fontWeight: '800',
  },

  /* CONTENT */

  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },

  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0E1D5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 11,
  },

  categoryText: {
    color: '#8A4E31',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  productName: {
    fontSize: 29,
    fontWeight: '900',
    color: '#3B2B25',
    lineHeight: 35,
  },

  artisanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  artisanDot: {
    color: '#B86D42',
    fontSize: 8,
    marginRight: 6,
  },

  artisan: {
    fontSize: 13,
    color: '#8A7D74',
  },

  /* PRICE */

  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 17,
  },

  price: {
    fontSize: 27,
    fontWeight: '900',
    color: '#7A3E22',
  },

  fairPriceBadge: {
    backgroundColor: '#E5F1E6',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 10,
  },

  fairPriceText: {
    color: '#4C7957',
    fontSize: 9,
    fontWeight: '800',
  },

  /* DIVIDER */

  divider: {
    height: 1,
    backgroundColor: '#E7D9CF',
    marginVertical: 23,
  },

  /* SECTIONS */

  section: {
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#3B2B25',
    marginBottom: 10,
    marginTop: 17,
  },

  description: {
    fontSize: 14,
    lineHeight: 23,
    color: '#71645C',
  },

  /* INFO */

  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 13,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#EDE1D8',
  },

  infoIconBox: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#F5E8DE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoIcon: {
    fontSize: 19,
  },

  infoContent: {
    marginLeft: 11,
  },

  infoLabel: {
    fontSize: 10,
    color: '#96887E',
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  infoValue: {
    fontSize: 14,
    color: '#44352D',
    fontWeight: '700',
    marginTop: 3,
  },

  /* ARTISAN */

  artisanBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EDE1D8',
    marginTop: 3,
  },

  artisanAvatar: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: '#F1E1D5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  artisanEmoji: {
    fontSize: 29,
  },

  artisanInfo: {
    flex: 1,
    marginLeft: 12,
  },

  artisanLabel: {
    fontSize: 9,
    color: '#9A8A80',
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  artisanName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#3B2B25',
    marginTop: 3,
  },

  artisanLocation: {
    fontSize: 11,
    color: '#897970',
    marginTop: 3,
  },

  artisanArrow: {
    color: '#9A8172',
    fontSize: 26,
  },

  /* SUPPORT */

  supportCard: {
    flexDirection: 'row',
    backgroundColor: '#F2E5D9',
    borderRadius: 17,
    padding: 14,
    marginTop: 17,
    alignItems: 'center',
  },

  supportEmoji: {
    fontSize: 25,
    marginRight: 11,
  },

  supportContent: {
    flex: 1,
  },

  supportTitle: {
    color: '#68402C',
    fontSize: 12,
    fontWeight: '900',
  },

  supportText: {
    color: '#8A6E5D',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  /* BOTTOM BAR */

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,

    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 25,

    backgroundColor: '#FFFFFF',

    borderTopWidth: 1,
    borderTopColor: '#E7DCD4',

    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  addBagButton: {
    flex: 1,
    height: 51,
    borderRadius: 14,

    backgroundColor: '#F4E7DC',

    borderWidth: 1,
    borderColor: '#8B4A2B',

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  addBagIcon: {
    fontSize: 17,
    marginRight: 6,
  },

  addBagText: {
    color: '#7A3E22',
    fontSize: 14,
    fontWeight: '800',
  },

  buyNowButton: {
    flex: 1,
    height: 51,
    borderRadius: 14,

    backgroundColor: '#7A3E22',

    justifyContent: 'center',
    alignItems: 'center',
  },

  buyNowText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  whatsappButton: {
    width: 51,
    height: 51,
    borderRadius: 14,

    backgroundColor: '#E8F3E9',

    borderWidth: 1,
    borderColor: '#BBD8BE',

    justifyContent: 'center',
    alignItems: 'center',
  },

  whatsappText: {
    fontSize: 20,
  },

  /* LOADING */

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBF5ED',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#81736B',
  },

  /* ERROR */

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBF5ED',
    paddingHorizontal: 30,
  },

  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0E1D5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  errorEmoji: {
    fontSize: 32,
  },

  errorText: {
    fontSize: 19,
    color: '#4B3A31',
    fontWeight: '800',
    marginBottom: 20,
  },

  errorBackButton: {
    backgroundColor: '#7A3E22',
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 12,
  },

  errorBackButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

});