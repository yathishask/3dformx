import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Lock,
  UserCheck,
  Phone,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Address } from '../types/database';
import { addressService, AddressInput } from '../services/addressService';
import { formatPrice } from '../utils/format';

export const SELECTED_ADDRESS_STORAGE_KEY = '3dformx_selected_address';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

const INDIAN_UTS = [
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export const AddressPage: React.FC = () => {
  const { user, profile, loading: authLoading, openAuthModal } = useAuth();
  const { cart, subtotal, shipping, totalPrice } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(false);

  // Add / Edit Form state
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AddressInput>({
    recipient_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    landmark: '',
    city: '',
    state: 'Karnataka',
    postal_code: '',
    is_default: false,
  });

  // Automatically prompt login modal if user is not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      openAuthModal();
    }
  }, [authLoading, user, openAuthModal]);

  // Fetch user's saved addresses from Supabase when logged in
  useEffect(() => {
    if (!user) {
      setAddresses([]);
      setSelectedAddressId(null);
      return;
    }

    let active = true;
    setLoadingAddresses(true);

    addressService.getAddresses(user.id).then((list) => {
      if (!active) return;
      setAddresses(list);
      setLoadingAddresses(false);

      if (list.length === 0) {
        // No saved addresses yet — open the "Add New Address" form automatically
        setShowForm(true);
        setFormData((prev) => ({
          ...prev,
          recipient_name: profile?.full_name || '',
          phone: profile?.phone || '',
          is_default: true,
        }));
      } else {
        // Try restoring previously chosen address or pick default / first
        try {
          const savedRaw = sessionStorage.getItem(SELECTED_ADDRESS_STORAGE_KEY);
          if (savedRaw) {
            const parsed = JSON.parse(savedRaw) as Address;
            if (list.some((a) => a.id === parsed.id)) {
              setSelectedAddressId(parsed.id);
              return;
            }
          }
        } catch {
          // ignore
        }
        const defaultAddr = list.find((a) => a.is_default) || list[0];
        setSelectedAddressId(defaultAddr.id);
      }
    });

    return () => {
      active = false;
    };
  }, [user, profile]);

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] bg-dark-950 flex items-center justify-center py-20 px-4 text-center">
        <div className="max-w-md bg-dark-900 border border-slate-800 p-8 rounded-2xl">
          <h2 className="text-2xl font-bold text-white mb-2 font-heading">
            Your Cart is Empty
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Add items to your shopping cart before selecting a delivery address.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-orange text-black font-bold text-xs uppercase tracking-wider hover:bg-brand-orange-hover transition-colors"
          >
            <ArrowLeft size={16} /> Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const handleOpenNewForm = () => {
    setEditingAddressId(null);
    setFormError(null);
    setFormData({
      recipient_name: profile?.full_name || '',
      phone: profile?.phone || '',
      address_line1: '',
      address_line2: '',
      landmark: '',
      city: '',
      state: 'Karnataka',
      postal_code: '',
      is_default: addresses.length === 0,
    });
    setShowForm(true);
  };

  const handleOpenEditForm = (addr: Address) => {
    setEditingAddressId(addr.id);
    setFormError(null);
    setFormData({
      recipient_name: addr.recipient_name,
      phone: addr.phone,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || '',
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      is_default: addr.is_default,
    });
    setShowForm(true);
  };

  const handleDeleteAddress = async (addrId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    setDeletingId(addrId);
    const ok = await addressService.deleteAddress(addrId, user.id);
    setDeletingId(null);

    if (ok) {
      const updated = addresses.filter((a) => a.id !== addrId);
      setAddresses(updated);
      if (selectedAddressId === addrId) {
        setSelectedAddressId(updated[0]?.id || null);
      }
      if (updated.length === 0) {
        handleOpenNewForm();
      }
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }

    setFormError(null);

    const cleanedPhone = formData.phone.replace(/\D/g, '');
    if (cleanedPhone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const cleanedPin = formData.postal_code.replace(/\D/g, '');
    if (cleanedPin.length !== 6) {
      setFormError('Please enter a valid 6-digit PIN code.');
      return;
    }

    setSaving(true);
    try {
      const payload: AddressInput = {
        ...formData,
        phone: cleanedPhone.slice(-10),
        postal_code: cleanedPin,
      };

      if (editingAddressId) {
        const updated = await addressService.updateAddress(
          editingAddressId,
          user.id,
          payload
        );
        if (updated) {
          const refreshed = await addressService.getAddresses(user.id);
          setAddresses(refreshed);
          setSelectedAddressId(updated.id);
          setShowForm(false);
          setEditingAddressId(null);
        }
      } else {
        const created = await addressService.createAddress(user.id, payload);
        if (created) {
          const refreshed = await addressService.getAddresses(user.id);
          setAddresses(refreshed);
          setSelectedAddressId(created.id);
          setShowForm(false);
        }
      }
    } catch (err: any) {
      setFormError(err?.message || 'Could not save address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || null;

  const handleContinueToCheckout = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (!selectedAddress) return;

    sessionStorage.setItem(
      SELECTED_ADDRESS_STORAGE_KEY,
      JSON.stringify(selectedAddress)
    );
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-dark-950 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 3-Step Checkout Progress Bar: Shopping Cart > Address > Checkout */}
        <div className="mb-10">
          <div className="flex items-center justify-center max-w-xl mx-auto text-xs sm:text-sm font-bold">
            {/* Step 1: Cart */}
            <Link
              to="/cart"
              className="flex items-center gap-2 text-emerald-400 hover:text-brand-orange transition-colors"
            >
              <span className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-xs">
                <Check size={14} />
              </span>
              <span>Shopping Cart</span>
            </Link>

            <div className="flex-1 h-0.5 bg-brand-orange/60 mx-3 sm:mx-5" />

            {/* Step 2: Address (Current) */}
            <div className="flex items-center gap-2 text-brand-orange">
              <span className="w-7 h-7 rounded-full bg-brand-orange text-black font-extrabold flex items-center justify-center text-xs shadow-lg shadow-brand-orange/30">
                2
              </span>
              <span>Delivery Address</span>
            </div>

            <div className="flex-1 h-0.5 bg-slate-800 mx-3 sm:mx-5" />

            {/* Step 3: Checkout */}
            <div className="flex items-center gap-2 text-slate-500">
              <span className="w-7 h-7 rounded-full bg-dark-900 border border-slate-800 flex items-center justify-center text-xs">
                3
              </span>
              <span>Checkout</span>
            </div>
          </div>
        </div>

        {/* Page Title */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link
              to="/cart"
              className="p-2.5 rounded-xl bg-dark-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              aria-label="Back to shopping cart"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                Select Delivery Address
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Choose a saved address, edit details, or add a new delivery location.
              </p>
            </div>
          </div>

          {user && !showForm && (
            <button
              type="button"
              onClick={handleOpenNewForm}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-orange text-black font-extrabold text-xs uppercase tracking-wider hover:bg-brand-orange-hover transition-all shadow-md"
            >
              <Plus size={15} />
              <span>Add New Address</span>
            </button>
          )}
        </div>

        {/* Not Logged In State: Require Sign In / Registration */}
        {!user ? (
          <div className="max-w-xl mx-auto bg-dark-900 border border-slate-800 rounded-3xl p-8 sm:p-10 text-center shadow-2xl my-8">
            <div className="w-16 h-16 rounded-2xl bg-brand-orange/15 border border-brand-orange/30 text-brand-orange flex items-center justify-center mx-auto mb-5">
              <Lock size={28} />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2 font-heading">
              Sign In or Register to Continue
            </h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Please sign in to your 3D FormX account (or create a new account in seconds) so we can save your delivery address and link your order.
            </p>
            <button
              type="button"
              onClick={openAuthModal}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-orange text-black font-extrabold text-xs uppercase tracking-wider hover:bg-brand-orange-hover transition-all shadow-lg shadow-brand-orange/20"
            >
              <UserCheck size={16} />
              <span>Sign In / Register Now</span>
            </button>
          </div>
        ) : (
          /* Logged In State: Address Selection & Form + Sidebar Summary */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Saved Addresses & Add/Edit Form */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Saved Addresses List */}
              {loadingAddresses ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((n) => (
                    <div
                      key={n}
                      className="h-44 rounded-2xl bg-dark-900 border border-slate-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                addresses.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`relative p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'bg-dark-850 border-brand-orange ring-2 ring-brand-orange/30 shadow-xl'
                              : 'bg-dark-900 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            {/* Top Row: Radio + Name + Default Badge */}
                            <div className="flex items-start justify-between gap-2 mb-2.5">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                    isSelected
                                      ? 'border-brand-orange bg-brand-orange text-black'
                                      : 'border-slate-600'
                                  }`}
                                >
                                  {isSelected && <Check size={12} strokeWidth={3} />}
                                </div>
                                <h3 className="text-sm font-bold text-white font-heading">
                                  {addr.recipient_name}
                                </h3>
                              </div>

                              {addr.is_default && (
                                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-orange/20 text-brand-orange border border-brand-orange/40 font-mono">
                                  Default
                                </span>
                              )}
                            </div>

                            {/* Address Lines */}
                            <div className="pl-7 text-xs text-slate-300 space-y-1 leading-relaxed">
                              <p>{addr.address_line1}</p>
                              {addr.address_line2 && <p>{addr.address_line2}</p>}
                              {addr.landmark && (
                                <p className="text-slate-400">
                                  Landmark: <span className="text-slate-200">{addr.landmark}</span>
                                </p>
                              )}
                              <p className="font-semibold text-white">
                                {addr.city}, {addr.state} -{' '}
                                <span className="font-mono">{addr.postal_code}</span>
                              </p>
                              <p className="flex items-center gap-1.5 text-slate-400 pt-1 font-mono">
                                <Phone size={12} className="text-brand-orange" />
                                <span>{addr.phone}</span>
                              </p>
                            </div>
                          </div>

                          {/* Card Actions: Edit & Delete */}
                          <div className="pl-7 pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-brand-orange">
                              {isSelected ? '✓ Selected for delivery' : 'Click to select'}
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditForm(addr);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-dark-800 hover:bg-dark-750 border border-slate-700 text-xs text-slate-200 hover:text-brand-orange transition-colors"
                              >
                                <Pencil size={12} />
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                disabled={deletingId === addr.id}
                                onClick={(e) => handleDeleteAddress(addr.id, e)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-dark-800 hover:bg-rose-500/15 border border-slate-700 hover:border-rose-500/40 text-xs text-slate-300 hover:text-rose-400 transition-colors"
                              >
                                <Trash2 size={12} />
                                <span>{deletingId === addr.id ? '...' : 'Delete'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* Add / Edit Address Form */}
              {showForm && (
                <div className="bg-dark-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-brand-orange">
                      <MapPin size={20} />
                      <h2 className="text-lg font-bold text-white font-heading">
                        {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
                      </h2>
                    </div>

                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setEditingAddressId(null);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-800"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>

                  {formError && (
                    <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-700/70 text-xs text-rose-200">
                      {formError}
                    </div>
                  )}

                  <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1.5">
                          Recipient Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.recipient_name}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              recipient_name: e.target.value,
                            }))
                          }
                          placeholder="Full Name"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-dark-850 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1.5">
                          10-Digit Mobile Number *
                        </label>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              phone: e.target.value.replace(/\D/g, '').slice(0, 10),
                            }))
                          }
                          placeholder="9876543210"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-dark-850 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange font-mono"
                        />
                      </div>
                    </div>

                    {/* 3 Address Columns: Line 1 (Mandatory), Line 2 (Optional), Landmark (Optional) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1.5">
                          Address Line 1 *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.address_line1}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              address_line1: e.target.value,
                            }))
                          }
                          placeholder="House / Flat No., Building"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-dark-850 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1.5">
                          Address Line 2{' '}
                          <span className="text-slate-500 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={formData.address_line2 || ''}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              address_line2: e.target.value,
                            }))
                          }
                          placeholder="Street, Area, Colony"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-dark-850 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1.5">
                          Landmark{' '}
                          <span className="text-slate-500 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={formData.landmark || ''}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              landmark: e.target.value,
                            }))
                          }
                          placeholder="Near Metro, Temple, etc."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-dark-850 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange"
                        />
                      </div>
                    </div>

                    {/* City, State, PIN Code */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1.5">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, city: e.target.value }))
                          }
                          placeholder="e.g. Bengaluru"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-dark-850 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1.5">
                          State *
                        </label>
                        <select
                          required
                          value={formData.state}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, state: e.target.value }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-dark-850 border border-slate-700 text-white focus:outline-none focus:border-brand-orange cursor-pointer"
                        >
                          <optgroup label="States">
                            {INDIAN_STATES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Union Territories">
                            {INDIAN_UTS.map((ut) => (
                              <option key={ut} value={ut}>
                                {ut}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1.5">
                          6-Digit PIN Code *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={formData.postal_code}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              postal_code: e.target.value.replace(/\D/g, '').slice(0, 6),
                            }))
                          }
                          placeholder="560058"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-dark-850 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange font-mono"
                        />
                      </div>
                    </div>

                    {/* Default Address Checkbox */}
                    <label className="inline-flex items-center gap-2.5 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={Boolean(formData.is_default)}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            is_default: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 rounded accent-brand-orange"
                      />
                      <span className="text-xs text-slate-300">
                        Make this my default delivery address
                      </span>
                    </label>

                    {/* Form Submit & Cancel Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-3">
                      {addresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowForm(false);
                            setEditingAddressId(null);
                          }}
                          className="px-5 py-2.5 rounded-xl bg-dark-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white"
                        >
                          Cancel
                        </button>
                      )}

                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 rounded-xl bg-brand-orange text-black font-extrabold text-xs uppercase tracking-wider hover:bg-brand-orange-hover transition-all shadow-lg disabled:opacity-50"
                      >
                        {saving
                          ? 'Saving...'
                          : editingAddressId
                          ? 'Update Address'
                          : 'Save & Select Address'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Right Column: Order Summary & Continue to Checkout */}
            <div className="lg:col-span-4 bg-dark-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl sticky top-24">
              <h3 className="text-lg font-bold text-white mb-4 font-heading">
                Delivery Summary
              </h3>

              {selectedAddress ? (
                <div className="p-4 rounded-2xl bg-dark-850 border border-brand-orange/40 mb-5 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-brand-orange font-bold mb-1">
                    <CheckCircle2 size={14} />
                    <span>Delivering To:</span>
                  </div>
                  <p className="font-bold text-white text-sm">
                    {selectedAddress.recipient_name}
                  </p>
                  <p className="text-slate-300">{selectedAddress.address_line1}</p>
                  {selectedAddress.address_line2 && (
                    <p className="text-slate-300">{selectedAddress.address_line2}</p>
                  )}
                  {selectedAddress.landmark && (
                    <p className="text-slate-400">
                      Landmark: {selectedAddress.landmark}
                    </p>
                  )}
                  <p className="text-white font-semibold">
                    {selectedAddress.city}, {selectedAddress.state} -{' '}
                    <span className="font-mono">{selectedAddress.postal_code}</span>
                  </p>
                  <p className="text-slate-400 font-mono pt-1">
                    Phone: {selectedAddress.phone}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-dark-850 border border-slate-800 mb-5 text-xs text-slate-400">
                  Please add or select a delivery address to proceed to checkout.
                </div>
              )}

              <div className="space-y-3 text-xs sm:text-sm text-slate-300 pb-4 border-b border-slate-800">
                <div className="flex justify-between">
                  <span>Items ({cart.length})</span>
                  <span className="font-mono font-semibold text-white">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Charges</span>
                  <span className="font-mono font-semibold">
                    {shipping === 0 ? (
                      <span className="text-emerald-400">FREE</span>
                    ) : (
                      <span>{formatPrice(shipping)}</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-baseline pt-4 mb-6">
                <span className="text-base font-bold text-white font-heading">
                  Total Amount
                </span>
                <span className="text-2xl font-extrabold text-brand-orange font-mono">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <button
                type="button"
                disabled={!selectedAddress}
                onClick={handleContinueToCheckout}
                className="w-full py-4 rounded-xl bg-brand-orange text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-brand-orange-hover hover:shadow-glow-orange transition-all duration-300 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Continue to Checkout</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
