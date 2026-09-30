import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';

import { File } from 'expo-file-system';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
} from 'expo-audio';

import API from '../services/api';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';

export default function AddProductScreen() {

  // ==================================================
  // STATES
  // ==================================================

  const { language, setLanguage, t } = useLanguage();

  const [image, setImage] =
    useState<string | null>(null);

  const [originalImage, setOriginalImage] =
    useState<string | null>(null);

  const [isRecording, setIsRecording] =
    useState(false);

  const [audioUri, setAudioUri] =
    useState<string | null>(null);

  const [loadingMessage, setLoadingMessage] =
    useState('');

  const [catalog, setCatalog] =
    useState<any>(null);

  const [showCatalog, setShowCatalog] =
    useState(false);

  const [materialCost, setMaterialCost] =
    useState('');

  const [priceData, setPriceData] =
    useState<any>(null);

  const [sellingPrice, setSellingPrice] =
    useState('');

  const [publishing, setPublishing] =
    useState(false);

  const audioRecorder = useAudioRecorder(
    RecordingPresets.HIGH_QUALITY
  );

  // ==================================================
  // IMAGE: GALLERY
  // ==================================================

  const pickImage = async () => {

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
      });

    if (!result.canceled) {

      const selectedImage =
        result.assets[0].uri;

      setOriginalImage(selectedImage);
      setImage(selectedImage);
      setPriceData(null);
      setSellingPrice('');
    }
  };

  // ==================================================
  // IMAGE: CAMERA
  // ==================================================

  const takePhoto = async () => {

    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {

      alert(
        'Camera permission is required.'
      );

      return;
    }

    const result =
      await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

    if (!result.canceled) {

      const selectedImage =
        result.assets[0].uri;

      setOriginalImage(selectedImage);
      setImage(selectedImage);
      setPriceData(null);
      setSellingPrice('');
    }
  };

  // ==================================================
  // IMAGE: AI ENHANCEMENT
  // ==================================================

  const enhanceImage = async () => {

    console.log(
      '🔥 ENHANCE BUTTON PRESSED'
    );

    if (!image) {

      Alert.alert(
        'No image',
        'Please select or take a product photo first.'
      );

      return;
    }

    try {

      setLoadingMessage(
        'Enhancing image...'
      );

      console.log(
        'IMAGE URI:',
        image
      );

      const file =
        new File(image);

      const base64Image =
        await file.base64();

      console.log(
        'BASE64 CREATED:',
        base64Image.length
      );

      const response =
        await fetch(
          'http://192.168.0.182:8001/enhance-image',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              image: base64Image,
            }),
          }
        );

      console.log(
        'SERVER STATUS:',
        response.status
      );

      const responseText =
        await response.text();

      console.log(
        'SERVER RESPONSE:',
        responseText.substring(0, 200)
      );

      if (!response.ok) {

        throw new Error(
          `Server error ${response.status}: ${responseText}`
        );
      }

      const data =
        JSON.parse(responseText);

      if (data.error) {

        throw new Error(
          data.error
        );
      }

      if (!data.image) {

        throw new Error(
          'Server did not return an enhanced image.'
        );
      }

      setImage(
        `data:image/jpeg;base64,${data.image}`
      );

      setLoadingMessage('');

      Alert.alert(
        'Success',
        'AI background removed successfully!'
      );

    } catch (error: any) {

      console.log(
        'IMAGE ENHANCEMENT ERROR:',
        error
      );

      setLoadingMessage('');

      Alert.alert(
        'Image Error',
        error?.message ||
        'Could not process image.'
      );
    }
  };

  // ==================================================
  // VOICE: START
  // ==================================================

  const startRecording = async () => {

    const permission =
      await AudioModule.requestRecordingPermissionsAsync();

    if (!permission.granted) {

      alert(
        'Microphone permission is required.'
      );

      return;
    }

    try {

      await audioRecorder.prepareToRecordAsync();

      audioRecorder.record();

      setIsRecording(true);

      console.log(
        'Recording started'
      );

    } catch (error) {

      console.log(
        'Recording error:',
        error
      );

      alert(
        'Could not start recording.'
      );
    }
  };

  // ==================================================
  // VOICE: STOP
  // ==================================================

  const stopRecording = async () => {

    if (!isRecording) {

      return;
    }

    try {

      await audioRecorder.stop();

      setIsRecording(false);

      const uri =
        audioRecorder.uri;

      if (uri) {

        setAudioUri(uri);

        console.log(
          'Audio saved at:',
          uri
        );
      }

      alert(
        'Recording saved!'
      );

    } catch (error) {

      console.log(
        'Stop recording error:',
        error
      );

      setIsRecording(false);
    }
  };

  // ==================================================
  // AI PRICING
  // ==================================================

  const getSuggestedPrice = async (
    catalogData: any
  ) => {

    console.log(
      '🔥 PRICE FUNCTION CALLED'
    );

    if (!originalImage) {

      throw new Error(
        'Product image is missing.'
      );
    }

    if (!materialCost) {

      throw new Error(
        'Please enter the material cost.'
      );
    }

    try {

      const formData =
        new FormData();

      formData.append(
        'description',
        catalogData.description || ''
      );

      formData.append(
        'materialCost',
        materialCost
      );

      formData.append(
        'category',
        catalogData.category || ''
      );

      formData.append(
        'material',
        catalogData.material || ''
      );

      const imageFile =
        new File(originalImage);

      formData.append(
        'image',
        imageFile as any
      );

      const response =
        await fetch(
          'http://192.168.0.182:3000/suggest-price',
          {
            method: 'POST',
            body: formData,
          }
        );

      const responseText =
        await response.text();

      if (!response.ok) {

        throw new Error(
          `Pricing server error ${response.status}: ${responseText}`
        );
      }

      const data =
        JSON.parse(responseText);

      setPriceData(data);

      return data;

    } catch (error: any) {

      console.log(
        'PRICE GENERATION ERROR:',
        error
      );

      throw error;
    }
  };

  // ==================================================
  // TRANSCRIBE + GENERATE CATALOG
  // ==================================================

  const transcribeAudio = async () => {

    if (!image) {

      Alert.alert(
        'No image',
        'Please add a product image first.'
      );

      return;
    }

    if (!audioUri) {

      Alert.alert(
        'No recording',
        'Please record your product description first.'
      );

      return;
    }

    if (!materialCost) {

      Alert.alert(
        'Material Cost Required',
        'Please enter the material cost.'
      );

      return;
    }

    try {

      setLoadingMessage(
        'Generating catalog...'
      );

      const formData =
        new FormData();

      formData.append(
        'file',
        {
          uri: audioUri,
          name: 'product-description.m4a',
          type: 'audio/m4a',
        } as any
      );

      const transcriptionResponse =
        await API.post(
          '/transcribe',
          formData,
          {
            headers: {
              'Content-Type':
                'multipart/form-data',
            },
          }
        );

      if (
        transcriptionResponse.data.error
      ) {

        throw new Error(
          transcriptionResponse.data.error
        );
      }

      const transcribedText =
        transcriptionResponse.data.text;

      const catalogResponse =
        await API.post(
          '/generate-catalog',
          {
            text: transcribedText,
          }
        );

      if (
        catalogResponse.data.error
      ) {

        throw new Error(
          catalogResponse.data.error
        );
      }

      let catalogData =
        catalogResponse.data.catalog;

      catalogData =
        catalogData
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();

      const parsedCatalog =
        JSON.parse(catalogData);

      setCatalog(parsedCatalog);
      setShowCatalog(true);

      const generatedPrice =
        await getSuggestedPrice(
          parsedCatalog
        );

      console.log(
        'Generated price:',
        generatedPrice
      );

      setLoadingMessage('');

    } catch (error: any) {

      console.log(
        'CATALOG / PRICE GENERATION ERROR:',
        error
      );

      setLoadingMessage('');

      Alert.alert(
        'Generation Error',
        error?.response?.data?.error ||
        error?.message ||
        'Something went wrong.'
      );
    }
  };

  // ==================================================
  // PUBLISH PRODUCT
  // ==================================================

  const publishProduct = async () => {

    if (!catalog) {

      Alert.alert(
        'Missing catalog',
        'Please generate the product catalog first.'
      );

      return;
    }

    if (!sellingPrice) {

      Alert.alert(
        'Selling price required',
        'Please enter the final selling price.'
      );

      return;
    }

    const finalPrice =
      Number(sellingPrice);

    if (
      isNaN(finalPrice) ||
      finalPrice <= 0
    ) {

      Alert.alert(
        'Invalid price',
        'Please enter a valid selling price.'
      );

      return;
    }

    if (!originalImage) {

      Alert.alert(
        'Missing image',
        'Please add a product image first.'
      );

      return;
    }

    try {

      setPublishing(true);

      const {
        data: {
          user
        },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (
        userError ||
        !user
      ) {

        Alert.alert(
          'Login required',
          'Please log in again before publishing.'
        );

        return;
      }

      let aiMinPrice = null;
      let aiMaxPrice = null;

      if (
        priceData &&
        typeof priceData === 'object'
      ) {

        aiMinPrice =
          priceData.minPrice ??
          priceData.min_price ??
          priceData.minimumPrice ??
          null;

        aiMaxPrice =
          priceData.maxPrice ??
          priceData.max_price ??
          priceData.maximumPrice ??
          null;
      }

      const {
        error
      } =
        await supabase
          .from('products')
          .insert({
            artisan_id:
              user.id,

            product_name:
              catalog.product_name,

            description_en:
              catalog.description,

            description_hi:
              catalog.hindi_description,

            description_mr:
              null,

            category:
              catalog.category,

            material:
              catalog.material,

            image_url:
              image,

            ai_min_price:
              aiMinPrice,

            ai_max_price:
              aiMaxPrice,

            selling_price:
              finalPrice,
          });

      if (error) {

        Alert.alert(
          'Publish failed',
          error.message
        );

        return;
      }

      Alert.alert(
        '🎉 Product Published!',
        'Your product is now available in the marketplace.'
      );

    } catch (error: any) {

      Alert.alert(
        'Error',
        error?.message ||
        'Could not publish the product.'
      );

    } finally {

      setPublishing(false);
    }
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <View style={styles.container}>

      {/* LANGUAGE SWITCH */}

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* ==========================================
            HEADER
        ========================================== */}

        <View style={styles.header}>

          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>
              ✨
            </Text>
          </View>

          <Text style={styles.title}>
            {t.addYourProduct}
          </Text>

          <Text style={styles.subtitle}>
            {t.createProfessionalListing}
          </Text>

        </View>

        {/* ==========================================
            STEP INDICATOR
        ========================================== */}

        <View style={styles.progressCard}>

          <View style={styles.progressStepActive}>
            <Text style={styles.progressNumber}>
              1
            </Text>
          </View>

          <View style={styles.progressLine} />

          <View
            style={[
              styles.progressStep,
              showCatalog &&
                styles.progressStepActive,
            ]}
          >
            <Text
              style={[
                styles.progressNumber,
                !showCatalog &&
                  styles.progressNumberInactive,
              ]}
            >
              2
            </Text>
          </View>

          <View style={styles.progressLine} />

          <View
            style={[
              styles.progressStep,
              showCatalog &&
                styles.progressStepActive,
            ]}
          >
            <Text
              style={[
                styles.progressNumber,
                !showCatalog &&
                  styles.progressNumberInactive,
              ]}
            >
              3
            </Text>
          </View>

          <View style={styles.progressLabels}>

            <Text style={styles.progressLabel}>
              Photo
            </Text>

            <Text style={styles.progressLabel}>
              AI Catalog
            </Text>

            <Text style={styles.progressLabel}>
              Publish
            </Text>

          </View>

        </View>

        {/* ==========================================
            PHOTO STUDIO
        ========================================== */}

        <View style={styles.sectionHeader}>

          <View>
            <Text style={styles.sectionTitle}>
              📸 Product Photo
            </Text>

            <Text style={styles.sectionSubtitle}>
              Create a clean, professional product image
            </Text>
          </View>

          <View style={styles.requiredBadge}>
            <Text style={styles.requiredText}>
              Required
            </Text>
          </View>

        </View>

        <View style={styles.photoStudio}>

          {image ? (

            <View style={styles.imagePreviewWrapper}>

              <Image
                source={{ uri: image }}
                style={styles.productImage}
              />

              <View style={styles.enhancedBadge}>
                <Text style={styles.enhancedBadgeText}>
                  ✨ AI Studio Ready
                </Text>
              </View>

            </View>

          ) : (

            <View style={styles.emptyPhotoArea}>

              <View style={styles.cameraCircle}>
                <Text style={styles.cameraIcon}>
                  📷
                </Text>
              </View>

              <Text style={styles.imageTitle}>
                {t.addProductPhoto}
              </Text>

              <Text style={styles.imageSubtitle}>
                {t.photoInstruction}
              </Text>

            </View>

          )}

          <View style={styles.photoActions}>

            <Pressable
              style={styles.primaryPhotoButton}
              onPress={takePhoto}
            >

              <Text style={styles.primaryPhotoIcon}>
                📷
              </Text>

              <Text style={styles.primaryPhotoText}>
                {t.takePhoto}
              </Text>

            </Pressable>

            <Pressable
              style={styles.secondaryPhotoButton}
              onPress={pickImage}
            >

              <Text style={styles.secondaryPhotoIcon}>
                🖼️
              </Text>

              <Text style={styles.secondaryPhotoText}>
                {t.chooseFromGallery}
              </Text>

            </Pressable>

          </View>

          {image && (

            <Pressable
              style={[
                styles.enhanceButton,
                loadingMessage !== '' &&
                  styles.disabledButton,
              ]}
              onPress={enhanceImage}
              disabled={loadingMessage !== ''}
            >

              <Text style={styles.enhanceIcon}>
                ✨
              </Text>

              <View style={styles.enhanceTextContainer}>

                <Text style={styles.enhanceTitle}>
                  {t.createStudioPhoto}
                </Text>

                <Text style={styles.enhanceSubtitle}>
                  Remove background & improve presentation
                </Text>

              </View>

              <Text style={styles.arrow}>
                →
              </Text>

            </Pressable>

          )}

        </View>

        {/* ==========================================
            VOICE LISTING
        ========================================== */}

        <View style={styles.sectionHeader}>

          <View>
            <Text style={styles.sectionTitle}>
              🎙️ Tell Us About Your Craft
            </Text>

            <Text style={styles.sectionSubtitle}>
              Speak naturally — AI will create the listing
            </Text>
          </View>

        </View>

        <View style={styles.voiceCard}>

          <View style={styles.voiceTop}>

            <View style={styles.voiceIconCircle}>
              <Text style={styles.voiceIcon}>
                🎤
              </Text>
            </View>

            <View style={styles.voiceText}>

              <Text style={styles.voiceTitle}>
                {t.tellAboutProduct}
              </Text>

              <Text style={styles.voiceSubtitle}>
                {t.speakRegionalLanguage}
              </Text>

            </View>

          </View>

          <View style={styles.voiceDivider} />

          <View style={styles.voiceBottom}>

            <View>

              <Text style={styles.voiceHintTitle}>
                {isRecording
                  ? '🔴 Recording in progress'
                  : audioUri
                  ? '✓ Recording saved'
                  : 'Tap the microphone to start'}
              </Text>

              <Text style={styles.voiceHint}>
                You can describe the material,
                design, story and making process.
              </Text>

            </View>

            <Pressable
              style={[
                styles.bigMicButton,
                isRecording &&
                  styles.bigMicRecording,
              ]}
              onPress={
                isRecording
                  ? stopRecording
                  : startRecording
              }
            >

              <Text style={styles.bigMicText}>
                {isRecording
                  ? '⏹'
                  : '🎙️'}
              </Text>

            </Pressable>

          </View>

        </View>

        {/* ==========================================
            MATERIAL COST
        ========================================== */}

        <View style={styles.sectionHeader}>

          <View>
            <Text style={styles.sectionTitle}>
              💰 Material Cost
            </Text>

            <Text style={styles.sectionSubtitle}>
              Helps AI suggest a fair selling price
            </Text>
          </View>

        </View>

        <View style={styles.costCard}>

          <Text style={styles.inputLabel}>
            {t.materialCostLabel}
          </Text>

          <Text style={styles.costSubtitle}>
            {t.materialCostInstruction}
          </Text>

          <View style={styles.costInputWrapper}>

            <Text style={styles.costRupee}>
              ₹
            </Text>

            <TextInput
              style={styles.costInput}
              placeholder={
                t.materialCostPlaceholder
              }
              placeholderTextColor="#A89484"
              keyboardType="numeric"
              value={materialCost}
              onChangeText={
                setMaterialCost
              }
            />

          </View>

        </View>

        {/* ==========================================
            AI GENERATED CATALOG
        ========================================== */}

        {showCatalog && catalog && (

          <View>

            <View style={styles.sectionHeader}>

              <View>
                <Text style={styles.sectionTitle}>
                  ✨ AI Generated Catalog
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Review everything before publishing
                </Text>
              </View>

              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>
                  AI
                </Text>
              </View>

            </View>

            <View style={styles.catalogCard}>

              <View style={styles.catalogTop}>

                <View style={styles.catalogIcon}>
                  <Text>
                    ✨
                  </Text>
                </View>

                <View style={{ flex: 1 }}>

                  <Text style={styles.catalogHeading}>
                    {t.aiCatalog}
                  </Text>

                  <Text style={styles.editHint}>
                    {t.reviewEdit}
                  </Text>

                </View>

              </View>

              {/* PRODUCT NAME */}

              <Text style={styles.label}>
                {t.productNameLabel}
              </Text>

              <TextInput
                style={styles.editInput}
                value={catalog.product_name || ''}
                onChangeText={(text) =>
                  setCatalog({
                    ...catalog,
                    product_name: text,
                  })
                }
                placeholder="Product name"
                placeholderTextColor="#A89484"
              />

              {/* CATEGORY */}

              <Text style={styles.label}>
                {t.categoryLabel}
              </Text>

              <TextInput
                style={styles.editInput}
                value={catalog.category || ''}
                onChangeText={(text) =>
                  setCatalog({
                    ...catalog,
                    category: text,
                  })
                }
                placeholder="Category"
                placeholderTextColor="#A89484"
              />

              {/* MATERIAL */}

              <Text style={styles.label}>
                {t.materialLabel}
              </Text>

              <TextInput
                style={styles.editInput}
                value={catalog.material || ''}
                onChangeText={(text) =>
                  setCatalog({
                    ...catalog,
                    material: text,
                  })
                }
                placeholder="Material"
                placeholderTextColor="#A89484"
              />

              {/* ENGLISH DESCRIPTION */}

              <Text style={styles.label}>
                {t.englishDescriptionLabel}
              </Text>

              <TextInput
                style={[
                  styles.editInput,
                  styles.descriptionInput,
                ]}
                value={catalog.description || ''}
                onChangeText={(text) =>
                  setCatalog({
                    ...catalog,
                    description: text,
                  })
                }
                placeholder="Product description"
                placeholderTextColor="#A89484"
                multiline
                textAlignVertical="top"
              />

              {/* HINDI DESCRIPTION */}

              <Text style={styles.label}>
                {t.hindiDescriptionLabel}
              </Text>

              <TextInput
                style={[
                  styles.editInput,
                  styles.descriptionInput,
                ]}
                value={
                  catalog.hindi_description || ''
                }
                onChangeText={(text) =>
                  setCatalog({
                    ...catalog,
                    hindi_description: text,
                  })
                }
                placeholder="Hindi description"
                placeholderTextColor="#A89484"
                multiline
                textAlignVertical="top"
              />

              {/* TAGS */}

              <Text style={styles.label}>
                {t.tagsLabel}
              </Text>

              <View style={styles.tagsContainer}>

                {catalog.tags?.map(
                  (
                    tag: string,
                    index: number
                  ) => (

                    <View
                      key={index}
                      style={styles.tag}
                    >

                      <Text style={styles.tagText}>
                        #{tag}
                      </Text>

                    </View>

                  )
                )}

              </View>

              {/* AI PRICE */}

              {priceData && (

                <View style={styles.priceCard}>

                  <View style={styles.priceHeaderRow}>

                    <View style={styles.priceIconCircle}>
                      <Text>
                        ₹
                      </Text>
                    </View>

                    <View>

                      <Text style={styles.priceHeading}>
                        AI Suggested Price
                      </Text>

                      <Text style={styles.priceSmallText}>
                        Based on your product details
                      </Text>

                    </View>

                  </View>

                  <Text style={styles.priceResult}>
                    {typeof priceData === 'object'
                      ? JSON.stringify(
                          priceData,
                          null,
                          2
                        )
                      : priceData}
                  </Text>

                </View>

              )}

              {/* FINAL PRICE */}

              <View style={styles.finalPriceBox}>

                <Text style={styles.finalPriceHeading}>
                  🏷️ Your Selling Price
                </Text>

                <Text style={styles.finalPriceSubtitle}>
                  AI suggests. You decide the final price.
                </Text>

                <View style={styles.priceInputContainer}>

                  <Text style={styles.rupee}>
                    ₹
                  </Text>

                  <TextInput
                    style={styles.priceInput}
                    placeholder="Enter final price"
                    placeholderTextColor="#A89484"
                    keyboardType="numeric"
                    value={sellingPrice}
                    onChangeText={
                      setSellingPrice
                    }
                  />

                </View>

              </View>

              {/* PUBLISH */}

              <Pressable
                style={[
                  styles.publishButton,
                  publishing &&
                    styles.publishButtonDisabled,
                ]}
                onPress={publishProduct}
                disabled={publishing}
              >

                <Text style={styles.publishButtonText}>

                  {publishing
                    ? 'Publishing...'
                    : '🚀 Publish Product'}

                </Text>

              </Pressable>

            </View>

          </View>

        )}

      </ScrollView>

      {/* ==========================================
          BOTTOM ACTION
      ========================================== */}

      {!showCatalog && (

        <View style={styles.bottomBar}>

          <Pressable
            style={[
              styles.continueButton,
              loadingMessage !== '' &&
                styles.disabledButton,
            ]}
            onPress={transcribeAudio}
            disabled={loadingMessage !== ''}
          >

            <View>

              <Text style={styles.continueSmallText}>
                Next step
              </Text>

              <Text style={styles.continueText}>
                {t.generateCatalogPrice}
              </Text>

            </View>

            <Text style={styles.continueArrow}>
              →
            </Text>

          </Pressable>

        </View>

      )}

      {showCatalog && (

        <View style={styles.bottomBar}>

          <Pressable
            style={[
              styles.regenerateButton,
              loadingMessage !== '' &&
                styles.disabledButton,
            ]}
            onPress={transcribeAudio}
            disabled={loadingMessage !== ''}
          >

            <Text style={styles.regenerateText}>
              ✨ {t.regenerateCatalogPrice}
            </Text>

          </Pressable>

        </View>

      )}

      {/* ==========================================
          LOADING POPUP
      ========================================== */}

      {loadingMessage !== '' && (

        <View style={styles.loadingOverlay}>

          <View style={styles.loadingCard}>

            <View style={styles.loadingCircle}>

              <Text style={styles.loadingEmoji}>
                {loadingMessage ===
                'Enhancing image...'
                  ? '✨'
                  : '🤖'}
              </Text>

            </View>

            <Text style={styles.loadingTitle}>
              {loadingMessage}
            </Text>

            <Text style={styles.loadingSubtitle}>
              AI is working on your product...
            </Text>

            <View style={styles.loadingDots}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>

          </View>

        </View>

      )}

    </View>
  );
}


// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FBF5ED',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 145,
  },

  // ==================================================
  // HEADER
  // ==================================================

  header: {
    marginBottom: 22,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F0D8C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  headerIconText: {
    fontSize: 24,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#3D2115',
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 14,
    color: '#806B5D',
    marginTop: 7,
    lineHeight: 21,
  },

  // ==================================================
  // LANGUAGE
  // ==================================================

  languageSwitch: {
    position: 'absolute',
    top: 18,
    right: 20,
    flexDirection: 'row',
    backgroundColor: '#F0E2D6',
    borderRadius: 22,
    padding: 4,
    zIndex: 10,
  },

  languageButton: {
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 18,
  },

  selectedLanguage: {
    backgroundColor: '#7A3E22',
  },

  languageText: {
    fontSize: 11,
    color: '#745E51',
    fontWeight: '700',
  },

  selectedLanguageText: {
    color: '#FFFFFF',
  },

  // ==================================================
  // PROGRESS
  // ==================================================

  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#E9DCD0',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },

  progressStep: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EFE7E0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressStepActive: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#7A3E22',
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressNumber: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  progressNumberInactive: {
    color: '#9D8C80',
  },

  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E6DAD0',
    marginHorizontal: 8,
  },

  progressLabels: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: -20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  progressLabel: {
    fontSize: 9,
    color: '#8B7668',
    fontWeight: '600',
  },

  // ==================================================
  // SECTION HEADERS
  // ==================================================

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 11,
    marginTop: 7,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#3D2115',
  },

  sectionSubtitle: {
    fontSize: 11,
    color: '#8A7668',
    marginTop: 3,
    maxWidth: 285,
  },

  requiredBadge: {
    backgroundColor: '#F3E1D3',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },

  requiredText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8A4528',
  },

  aiBadge: {
    backgroundColor: '#7A3E22',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
  },

  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  // ==================================================
  // PHOTO STUDIO
  // ==================================================

  photoStudio: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    marginBottom: 27,
    borderWidth: 1,
    borderColor: '#E9DCD0',
    shadowColor: '#6D4632',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  emptyPhotoArea: {
    height: 225,
    borderRadius: 17,
    backgroundColor: '#F8EFE7',
    borderWidth: 1.5,
    borderColor: '#E6D2C2',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  cameraCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EBD3C1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  cameraIcon: {
    fontSize: 31,
  },

  imageTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#4A2A1B',
  },

  imageSubtitle: {
    fontSize: 11,
    color: '#917D70',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 230,
    lineHeight: 17,
  },

  imagePreviewWrapper: {
    position: 'relative',
    marginBottom: 13,
  },

  productImage: {
    width: '100%',
    height: 245,
    borderRadius: 17,
    resizeMode: 'cover',
    backgroundColor: '#F3EAE3',
  },

  enhancedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(61,33,21,0.88)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
  },

  enhancedBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // ==================================================
  // PHOTO ACTIONS
  // ==================================================

  photoActions: {
    flexDirection: 'row',
    gap: 10,
  },

  primaryPhotoButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#7A3E22',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  primaryPhotoIcon: {
    fontSize: 17,
    marginRight: 8,
  },

  primaryPhotoText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  secondaryPhotoButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F7EEE7',
    borderWidth: 1,
    borderColor: '#DFCABC',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  secondaryPhotoIcon: {
    fontSize: 16,
    marginRight: 7,
  },

  secondaryPhotoText: {
    color: '#6D422C',
    fontSize: 12,
    fontWeight: '800',
  },

  // ==================================================
  // ENHANCE
  // ==================================================

  enhanceButton: {
    marginTop: 11,
    backgroundColor: '#F2E5DA',
    borderRadius: 15,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  enhanceIcon: {
    fontSize: 23,
    marginRight: 12,
  },

  enhanceTextContainer: {
    flex: 1,
  },

  enhanceTitle: {
    color: '#5A301F',
    fontSize: 13,
    fontWeight: '800',
  },

  enhanceSubtitle: {
    color: '#8C7465',
    fontSize: 10,
    marginTop: 3,
  },

  arrow: {
    fontSize: 21,
    color: '#7A3E22',
    fontWeight: '700',
  },

  // ==================================================
  // VOICE
  // ==================================================

  voiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 17,
    marginBottom: 27,
    borderWidth: 1,
    borderColor: '#E9DCD0',
  },

  voiceTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  voiceIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F2E2D6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  voiceIcon: {
    fontSize: 24,
  },

  voiceText: {
    flex: 1,
    marginLeft: 13,
  },

  voiceTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#4A2A1B',
  },

  voiceSubtitle: {
    fontSize: 11,
    color: '#8B7769',
    marginTop: 4,
    lineHeight: 16,
  },

  voiceDivider: {
    height: 1,
    backgroundColor: '#EFE5DD',
    marginVertical: 16,
  },

  voiceBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  voiceHintTitle: {
    fontSize: 12,
    color: '#5C3A29',
    fontWeight: '700',
  },

  voiceHint: {
    fontSize: 10,
    color: '#958175',
    lineHeight: 15,
    maxWidth: 230,
    marginTop: 4,
  },

  bigMicButton: {
    width: 57,
    height: 57,
    borderRadius: 29,
    backgroundColor: '#7A3E22',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },

  bigMicRecording: {
    backgroundColor: '#A64035',
  },

  bigMicText: {
    color: '#FFFFFF',
    fontSize: 22,
  },

  // ==================================================
  // COST
  // ==================================================

  costCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 18,
    marginBottom: 27,
    borderWidth: 1,
    borderColor: '#E9DCD0',
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4A2A1B',
    marginBottom: 5,
  },

  costSubtitle: {
    fontSize: 11,
    color: '#8D786B',
    lineHeight: 17,
    marginBottom: 13,
  },

  costInputWrapper: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FAF5F0',
    borderWidth: 1,
    borderColor: '#E1D1C4',
    flexDirection: 'row',
    alignItems: 'center',
  },

  costRupee: {
    fontSize: 18,
    fontWeight: '800',
    color: '#7A3E22',
    marginLeft: 15,
  },

  costInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#422719',
  },

  // ==================================================
  // CATALOG
  // ==================================================

  catalogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 27,
    borderWidth: 1,
    borderColor: '#E5D5C9',
  },

  catalogTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  catalogIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#F2E0D3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  catalogHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#402418',
  },

  editHint: {
    fontSize: 10,
    color: '#907B6D',
    marginTop: 3,
    lineHeight: 15,
  },

  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7A3E22',
    marginTop: 15,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  editInput: {
    borderWidth: 1,
    borderColor: '#DFD0C4',
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 14,
    color: '#402719',
    backgroundColor: '#FCF9F6',
  },

  descriptionInput: {
    minHeight: 120,
    lineHeight: 21,
  },

  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 3,
  },

  tag: {
    backgroundColor: '#F2E1D5',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 7,
    marginBottom: 7,
  },

  tagText: {
    color: '#7A3E22',
    fontSize: 11,
    fontWeight: '700',
  },

  // ==================================================
  // PRICE
  // ==================================================

  priceCard: {
    backgroundColor: '#F7EEE7',
    borderRadius: 17,
    padding: 16,
    marginTop: 22,
    borderWidth: 1,
    borderColor: '#E5CFBF',
  },

  priceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  priceIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E5C9B5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  priceHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#4A291A',
  },

  priceSmallText: {
    fontSize: 9,
    color: '#8E796B',
    marginTop: 3,
  },

  priceResult: {
    fontSize: 13,
    color: '#604536',
    lineHeight: 20,
    marginTop: 13,
  },

  // ==================================================
  // FINAL PRICE
  // ==================================================

  finalPriceBox: {
    backgroundColor: '#FFF9F4',
    borderRadius: 17,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#E7D5C8',
  },

  finalPriceHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#482719',
  },

  finalPriceSubtitle: {
    fontSize: 10,
    color: '#8C7769',
    marginTop: 5,
    marginBottom: 12,
  },

  priceInputContainer: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCC9BA',
    borderRadius: 13,
  },

  rupee: {
    fontSize: 19,
    fontWeight: '800',
    color: '#7A3E22',
    marginLeft: 15,
  },

  priceInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#402719',
  },

  // ==================================================
  // PUBLISH
  // ==================================================

  publishButton: {
    backgroundColor: '#2E6B3E',
    paddingVertical: 17,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 19,
  },

  publishButtonDisabled: {
    opacity: 0.6,
  },

  publishButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  // ==================================================
  // BOTTOM BAR
  // ==================================================

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FBF5ED',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 22,
    borderTopWidth: 1,
    borderTopColor: '#E5D8CC',
  },

  continueButton: {
    backgroundColor: '#7A3E22',
    minHeight: 62,
    borderRadius: 17,
    paddingHorizontal: 19,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  continueSmallText: {
    color: '#E9CDBB',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },

  continueText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  continueArrow: {
    color: '#FFFFFF',
    fontSize: 27,
  },

  regenerateButton: {
    backgroundColor: '#7A3E22',
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: 'center',
  },

  regenerateText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // ==================================================
  // LOADING
  // ==================================================

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(46, 28, 19, 0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },

  loadingCard: {
    width: '78%',
    backgroundColor: '#FFF9F3',
    borderRadius: 25,
    padding: 28,
    alignItems: 'center',
    elevation: 10,
  },

  loadingCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F0DCCC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  loadingEmoji: {
    fontSize: 34,
  },

  loadingTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#3D2115',
    textAlign: 'center',
  },

  loadingSubtitle: {
    fontSize: 12,
    color: '#897367',
    textAlign: 'center',
    marginTop: 7,
  },

  loadingDots: {
    flexDirection: 'row',
    marginTop: 17,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#7A3E22',
    marginHorizontal: 3,
  },

  disabledButton: {
    opacity: 0.55,
  },

});