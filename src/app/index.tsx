import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
} from 'react-native';

import { router } from 'expo-router';

import { useLanguage } from '../context/LanguageContext';

export default function HomeScreen() {
  const {
    language,
    setLanguage,
    t,
  } = useLanguage();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >

      {/* =====================================
          TOP BAR
      ===================================== */}

      <View style={styles.topBar}>

        <Text style={styles.logo}>
          ArtisanAI
        </Text>

        <View style={styles.languageSwitch}>

          <Pressable
            onPress={() => setLanguage('en')}
            style={[
              styles.languageButton,
              language === 'en' &&
                styles.selectedLanguage,
            ]}
          >
            <Text
              style={[
                styles.languageText,
                language === 'en' &&
                  styles.selectedLanguageText,
              ]}
            >
              English
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setLanguage('hi')}
            style={[
              styles.languageButton,
              language === 'hi' &&
                styles.selectedLanguage,
            ]}
          >
            <Text
              style={[
                styles.languageText,
                language === 'hi' &&
                  styles.selectedLanguageText,
              ]}
            >
              हिंदी
            </Text>
          </Pressable>

        </View>

      </View>


      {/* =====================================
          WELCOME SECTION
      ===================================== */}

      <View style={styles.welcomeSection}>

        <View style={styles.welcomeBadge}>
          <Text style={styles.welcomeBadgeText}>
            🇮🇳  ARTISAN DASHBOARD
          </Text>
        </View>

        <Text style={styles.title}>
          {t.artisanTagline}
        </Text>

        <Text style={styles.subtitle}>
          {t.artisanSubtitle}
        </Text>

      </View>


      {/* =====================================
          MAIN ADD PRODUCT CARD
      ===================================== */}

      <Pressable
        style={styles.mainCard}
        onPress={() =>
          router.push('/add-product')
        }
      >

        <View style={styles.mainCardContent}>

          <View style={styles.mainIcon}>
            <Text style={styles.mainIconText}>
              ✨
            </Text>
          </View>

          <Text style={styles.mainCardSmall}>
            CREATE WITH AI
          </Text>

          <Text style={styles.mainCardTitle}>
            {t.addNewProduct}
          </Text>

          <Text style={styles.mainCardDescription}>
            Create a professional product listing
            using your photo, voice and AI.
          </Text>

          <View style={styles.startButton}>

            <Text style={styles.startButtonText}>
              Start Creating
            </Text>

            <Text style={styles.startArrow}>
              →
            </Text>

          </View>

        </View>

        <View style={styles.decorCircleOne} />
        <View style={styles.decorCircleTwo} />

      </Pressable>


      {/* =====================================
          QUICK ACTIONS
      ===================================== */}

      <Text style={styles.sectionTitle}>
        Your Craft Journey
      </Text>

      <View style={styles.quickGrid}>

        {/* MY PRODUCTS */}

        <Pressable
          style={styles.quickCard}
          onPress={() =>
            router.push('/add-product')
          }
        >

          <View
            style={[
              styles.quickIcon,
              styles.brownIcon,
            ]}
          >
            <Text style={styles.quickIconText}>
              📦
            </Text>
          </View>

          <Text style={styles.quickTitle}>
            My Products
          </Text>

          <Text style={styles.quickDescription}>
            Manage your listings
          </Text>

        </Pressable>


        {/* AI ASSISTANCE */}

        <Pressable
          style={styles.quickCard}
          onPress={() =>
            router.push('/add-product')
          }
        >

          <View
            style={[
              styles.quickIcon,
              styles.greenIcon,
            ]}
          >
            <Text style={styles.quickIconText}>
              ✨
            </Text>
          </View>

          <Text style={styles.quickTitle}>
            AI Assistance
          </Text>

          <Text style={styles.quickDescription}>
            Catalog & pricing help
          </Text>

        </Pressable>

      </View>


      {/* =====================================
          HOW IT HELPS
      ===================================== */}

      <View style={styles.helpCard}>

        <Text style={styles.helpTitle}>
          How ArtisanAI helps you
        </Text>

        <Text style={styles.helpSubtitle}>
          Turn your traditional craft into a
          professional digital business.
        </Text>


        {/* PRODUCT PHOTOS */}

        <View style={styles.helpItem}>

          <View style={styles.helpIcon}>
            <Text>📸</Text>
          </View>

          <View style={styles.helpContent}>

            <Text style={styles.helpItemTitle}>
              Better Product Photos
            </Text>

            <Text style={styles.helpItemText}>
              AI helps create clean,
              marketplace-ready images.
            </Text>

          </View>

        </View>


        {/* VOICE */}

        <View style={styles.helpItem}>

          <View style={styles.helpIcon}>
            <Text>🗣️</Text>
          </View>

          <View style={styles.helpContent}>

            <Text style={styles.helpItemTitle}>
              Speak in Your Language
            </Text>

            <Text style={styles.helpItemText}>
              Describe your craft naturally
              using your voice.
            </Text>

          </View>

        </View>


        {/* PRICING */}

        <View style={styles.helpItem}>

          <View style={styles.helpIcon}>
            <Text>💰</Text>
          </View>

          <View style={styles.helpContent}>

            <Text style={styles.helpItemTitle}>
              Fair Price Suggestions
            </Text>

            <Text style={styles.helpItemText}>
              Get AI-assisted pricing based
              on your product and materials.
            </Text>

          </View>

        </View>


        {/* MARKETPLACE */}

        <View style={styles.helpItem}>

          <View style={styles.helpIcon}>
            <Text>🛍️</Text>
          </View>

          <View style={styles.helpContent}>

            <Text style={styles.helpItemTitle}>
              Reach More Buyers
            </Text>

            <Text style={styles.helpItemText}>
              Showcase your craft in a
              digital marketplace.
            </Text>

          </View>

        </View>

      </View>


      {/* =====================================
          FOOTER
      ===================================== */}

      <Text style={styles.footer}>
        {t.artisanFeatures}
      </Text>

    </ScrollView>
  );
}


const styles = StyleSheet.create({

  /* =====================================
     SCREEN
  ===================================== */

  screen: {
    flex: 1,
    backgroundColor: '#FBF5ED',
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 40,
  },


  /* =====================================
     TOP BAR
  ===================================== */

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 45,
  },

  logo: {
    fontSize: 24,
    fontWeight: '900',
    color: '#7A3E22',
    letterSpacing: -0.8,
  },


  /* =====================================
     LANGUAGE SWITCH
  ===================================== */

  languageSwitch: {
    flexDirection: 'row',
    backgroundColor: '#F0E3D8',
    borderRadius: 22,
    padding: 4,
  },

  languageButton: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 17,
  },

  selectedLanguage: {
    backgroundColor: '#7A3E22',
  },

  languageText: {
    fontSize: 11,
    color: '#806F64',
    fontWeight: '700',
  },

  selectedLanguageText: {
    color: '#FFFFFF',
  },


  /* =====================================
     WELCOME
  ===================================== */

  welcomeSection: {
    marginBottom: 27,
  },

  welcomeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0E1D5',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 13,
  },

  welcomeBadgeText: {
    color: '#8A4E31',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  title: {
    fontSize: 39,
    fontWeight: '900',
    color: '#382A23',
    lineHeight: 46,
    letterSpacing: -1,
    marginBottom: 13,
  },

  subtitle: {
    fontSize: 15,
    color: '#786B63',
    lineHeight: 23,
    maxWidth: 350,
  },


  /* =====================================
     MAIN AI CARD
  ===================================== */

  mainCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#7A3E22',
    borderRadius: 25,
    minHeight: 255,
    padding: 21,
    marginBottom: 30,

    shadowColor: '#7A3E22',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.20,
    shadowRadius: 14,
    elevation: 6,
  },

  mainCardContent: {
    zIndex: 2,
  },

  mainIcon: {
    width: 53,
    height: 53,
    borderRadius: 17,
    backgroundColor:
      'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  mainIconText: {
    fontSize: 25,
  },

  mainCardSmall: {
    color: '#E9CDBB',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 6,
  },

  mainCardTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 9,
  },

  mainCardDescription: {
    color: '#F2DED1',
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 285,
  },

  startButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    paddingVertical: 11,
    paddingHorizontal: 15,
    marginTop: 19,
  },

  startButtonText: {
    color: '#7A3E22',
    fontSize: 12,
    fontWeight: '900',
  },

  startArrow: {
    color: '#7A3E22',
    fontSize: 18,
    marginLeft: 9,
    marginTop: -1,
  },

  decorCircleOne: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor:
      'rgba(255,255,255,0.06)',
    right: -70,
    top: -50,
  },

  decorCircleTwo: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor:
      'rgba(255,255,255,0.05)',
    right: 20,
    bottom: -55,
  },


  /* =====================================
     QUICK ACTIONS
  ===================================== */

  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#3B2B25',
    marginBottom: 14,
  },

  quickGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },

  quickCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: '#EADDD3',
    minHeight: 145,

    shadowColor: '#7A3E22',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 7,
    elevation: 2,
  },

  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 13,
  },

  brownIcon: {
    backgroundColor: '#F1E1D5',
  },

  greenIcon: {
    backgroundColor: '#E5F0E5',
  },

  quickIconText: {
    fontSize: 20,
  },

  quickTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#44352D',
    marginBottom: 5,
  },

  quickDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: '#8A7B71',
  },


  /* =====================================
     HELP CARD
  ===================================== */

  helpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EADDD3',
    marginBottom: 22,
  },

  helpTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#3B2B25',
  },

  helpSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: '#8A7B71',
    marginTop: 5,
    marginBottom: 17,
  },

  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  helpIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#F6ECE4',
    justifyContent: 'center',
    alignItems: 'center',
  },

  helpContent: {
    flex: 1,
    marginLeft: 11,
  },

  helpItemTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#4A392F',
  },

  helpItemText: {
    fontSize: 10,
    color: '#8A7B71',
    lineHeight: 15,
    marginTop: 2,
  },


  /* =====================================
     FOOTER
  ===================================== */

  footer: {
    textAlign: 'center',
    color: '#97877C',
    fontSize: 11,
    lineHeight: 18,
    paddingHorizontal: 20,
    marginTop: 2,
  },

});