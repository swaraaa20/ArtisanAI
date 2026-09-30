
import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';

import { supabase } from '../services/supabase';
import { CartProvider } from '../context/CartContext';
import { LanguageProvider } from '../context/LanguageContext';

export default function RootLayout() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    checkUser();
  }, [mounted]);

  const checkUser = async () => {
    const { data } =
      await supabase.auth.getSession();

    if (!data.session) {
      router.replace('/login');
    }
  };

  return (
    <LanguageProvider>
      <CartProvider>

        <Stack>

          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="login"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="signup"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="buyer"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="add-product"
            options={{
              title: 'Add Product',
              headerBackTitle: 'Back',
            }}
          />

          <Stack.Screen
            name="bag"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="checkout"
            options={{
              headerShown: false,
            }}
          />

        </Stack>

      </CartProvider>
    </LanguageProvider>
  );
}
