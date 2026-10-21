import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Address } from '../types/database';

export interface AddressInput {
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  is_default?: boolean;
}

export const addressService = {
  /**
   * Fetch all saved addresses for the logged-in user from Supabase `addresses` table
   */
  async getAddresses(userId: string): Promise<Address[]> {
    if (!isSupabaseConfigured || !userId) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.error('Error fetching addresses:', error);
        return [];
      }

      return data as Address[];
    } catch (err) {
      console.error('Unexpected error fetching addresses:', err);
      return [];
    }
  },

  /**
   * Create a new address in Supabase `addresses` table
   */
  async createAddress(userId: string, input: AddressInput): Promise<Address | null> {
    if (!isSupabaseConfigured || !userId) {
      return null;
    }

    try {
      // If this address is set as default, unset previous default addresses for this user
      if (input.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: userId,
          recipient_name: input.recipient_name.trim(),
          phone: input.phone.trim(),
          address_line1: input.address_line1.trim(),
          address_line2: input.address_line2?.trim() || null,
          landmark: input.landmark?.trim() || null,
          city: input.city.trim(),
          state: input.state,
          postal_code: input.postal_code.trim(),
          country: input.country || 'India',
          is_default: Boolean(input.is_default),
        })
        .select('*')
        .single();

      if (error || !data) {
        console.error('Error creating address:', error);
        throw new Error(error?.message || 'Failed to save address');
      }

      return data as Address;
    } catch (err) {
      console.error('Unexpected error creating address:', err);
      throw err;
    }
  },

  /**
   * Update an existing address in Supabase `addresses` table
   */
  async updateAddress(
    addressId: string,
    userId: string,
    input: AddressInput
  ): Promise<Address | null> {
    if (!isSupabaseConfigured || !userId || !addressId) {
      return null;
    }

    try {
      if (input.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { data, error } = await supabase
        .from('addresses')
        .update({
          recipient_name: input.recipient_name.trim(),
          phone: input.phone.trim(),
          address_line1: input.address_line1.trim(),
          address_line2: input.address_line2?.trim() || null,
          landmark: input.landmark?.trim() || null,
          city: input.city.trim(),
          state: input.state,
          postal_code: input.postal_code.trim(),
          country: input.country || 'India',
          is_default: Boolean(input.is_default),
        })
        .eq('id', addressId)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (error || !data) {
        console.error('Error updating address:', error);
        throw new Error(error?.message || 'Failed to update address');
      }

      return data as Address;
    } catch (err) {
      console.error('Unexpected error updating address:', err);
      throw err;
    }
  },

  /**
   * Delete an address from Supabase `addresses` table
   */
  async deleteAddress(addressId: string, userId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !userId || !addressId) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting address:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Unexpected error deleting address:', err);
      return false;
    }
  },
};
