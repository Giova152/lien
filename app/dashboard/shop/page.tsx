'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/lib/context/DashboardContext';
import { createClient } from '@/lib/supabase/client';
import { ShopProduct } from '@/types';
import {
  BookOpen,
  Plus,
  Trash2,
  Check,
  ExternalLink,
} from '@/components/ui/Icons';
import { toast } from 'sonner';

export default function ShopPage() {
  const { profile, setProfile, refreshDashboard } = useDashboard();
  const supabase = createClient();

  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<ShopProduct[]>(profile?.theme?.products || []);

  const handleAddProduct = () => {
    const newProd: ShopProduct = {
      id: Date.now().toString(),
      title: 'Mon E-book ou Guide PDF',
      price: 'Gratuit',
      type: 'free',
      url: '',
      image_url: '',
    };
    const updated = [newProd, ...products];
    setProducts(updated);
    if (setProfile && profile) {
      setProfile({
        ...profile,
        theme: { ...profile.theme, products: updated },
      });
    }
  };

  const handleUpdateProduct = (id: string, field: keyof ShopProduct, value: any) => {
    const updated = products.map((p) => {
      if (p.id === id) {
        if (field === 'type') {
          return { ...p, type: value, price: value === 'free' ? 'Gratuit' : p.price === 'Gratuit' ? '15 €' : p.price };
        }
        return { ...p, [field]: value };
      }
      return p;
    });
    setProducts(updated);
    if (setProfile && profile) {
      setProfile({
        ...profile,
        theme: { ...profile.theme, products: updated },
      });
    }
  };

  const handleDeleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    if (setProfile && profile) {
      setProfile({
        ...profile,
        theme: { ...profile.theme, products: updated },
      });
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      const updatedTheme = {
        ...(profile.theme || {}),
        products,
      };

      const { error } = await supabase
        .from('profiles')
        .update({ theme: updatedTheme })
        .eq('id', profile.id);

      if (error) throw error;

      if (setProfile) {
        setProfile({ ...profile, theme: updatedTheme });
      }

      toast.success('Boutique mise à jour avec succès !');
      if (refreshDashboard) refreshDashboard();
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 text-neutral-900 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-neutral-900">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Boutique & Produits Digitaux
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Vendez ou offrez vos e-books, presets, templates, formations ou fichiers téléchargeables
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddProduct}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un produit</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </div>
      </div>

      {/* Products List */}
      {products.length === 0 ? (
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900 mb-1">Votre boutique est vide</h3>
          <p className="text-xs text-neutral-500 max-w-sm mb-4 leading-relaxed">
            Ajoutez votre premier produit téléchargeable (PDF, template Notion, e-book) payant ou offert en lead magnet.
          </p>
          <button
            type="button"
            onClick={handleAddProduct}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter mon premier produit</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {products.map((prod, index) => (
            <div
              key={prod.id}
              className="bg-white border border-neutral-200/80 rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:border-neutral-300 transition"
            >
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
                  <span className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] text-neutral-700">
                    {index + 1}
                  </span>
                  <span>Produit Digital</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(prod.id)}
                  className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Supprimer ce produit"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Titre du produit ou de l'e-book *
                  </label>
                  <input
                    type="text"
                    required
                    value={prod.title}
                    onChange={(e) => handleUpdateProduct(prod.id, 'title', e.target.value)}
                    placeholder="Ex: Guide complet : Débuter son activité"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Tarif affiché
                  </label>
                  <input
                    type="text"
                    value={prod.price}
                    onChange={(e) => handleUpdateProduct(prod.id, 'price', e.target.value)}
                    placeholder="Ex: Gratuit, 19 €, 25 $"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-900 text-xs font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Type de produit
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateProduct(prod.id, 'type', 'free')}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition border ${
                        prod.type === 'free'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs'
                          : 'bg-slate-50 border-neutral-200 text-neutral-600'
                      }`}
                    >
                      Gratuit / Téléchargement
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateProduct(prod.id, 'type', 'paid')}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition border ${
                        prod.type === 'paid'
                          ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-2xs'
                          : 'bg-slate-50 border-neutral-200 text-neutral-600'
                      }`}
                    >
                      Payant / Achat
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Image de couverture (URL)
                  </label>
                  <input
                    type="url"
                    value={prod.image_url || ''}
                    onChange={(e) => handleUpdateProduct(prod.id, 'image_url', e.target.value)}
                    placeholder="https://images.unsplash.com/... ou lien de l'image"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-700 font-mono text-xs focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Lien de destination / Page de vente / Lien Gumroad / Drive (facultatif)
                </label>
                <div className="relative flex items-center">
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="url"
                    value={prod.url || ''}
                    onChange={(e) => handleUpdateProduct(prod.id, 'url', e.target.value)}
                    placeholder="https://votre-boutique.com/mon-produit ou https://drive.google.com/..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-300 text-indigo-700 font-mono text-xs focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Bottom Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer ma boutique'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
