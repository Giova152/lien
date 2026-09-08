'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/lib/context/DashboardContext';
import { createClient } from '@/lib/supabase/client';
import { ShopProduct } from '@/types';
import { formatExternalUrl } from '@/lib/utils';
import {
  BookOpen,
  Plus,
  Trash2,
  Check,
  ExternalLink,
  Upload,
  Camera,
  Loader2,
  X,
  Sparkles,
  Lock,
} from '@/components/ui/Icons';
import { toast } from 'sonner';

export default function ShopPage() {
  const { profile, setProfile, refreshDashboard, openUpgradeModal } = useDashboard();
  const supabase = createClient();

  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [showUrlInputMap, setShowUrlInputMap] = useState<Record<string, boolean>>({});
  const [products, setProducts] = useState<ShopProduct[]>(profile?.theme?.products || []);

  const handleAddProduct = (type: 'free' | 'paid' = 'free') => {
    const newProd: ShopProduct = {
      id: Date.now().toString(),
      title: type === 'free' ? 'Guide PDF / Ressource offerte' : 'Formation ou E-book Payant',
      price: type === 'free' ? 'Gratuit' : '19 €',
      type: type,
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
          return {
            ...p,
            type: value,
            price: value === 'free' ? 'Gratuit' : p.price === 'Gratuit' ? '19 €' : p.price,
          };
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

  // Upload image file directly
  const handleUploadProductImage = async (productId: string, file: File) => {
    if (!profile) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image est trop volumineuse (maximum 5 Mo)");
      return;
    }

    try {
      setUploadingId(productId);
      const fileExt = file.name.split('.').pop() || 'webp';
      const fileName = `${profile.id}-product-${productId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('covers')
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;
      handleUpdateProduct(productId, 'image_url', publicUrl);
      toast.success('Image importée avec succès !');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erreur lors de l'importation de l'image");
    } finally {
      setUploadingId(null);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      const cleanedProducts = products.map((p) => ({
        ...p,
        url: p.url ? formatExternalUrl(p.url) : '',
      }));

      const updatedTheme = {
        ...(profile.theme || {}),
        products: cleanedProducts,
      };

      const { error } = await supabase
        .from('profiles')
        .update({ theme: updatedTheme, updated_at: new Date().toISOString() })
        .eq('id', profile.id);

      if (error) throw error;

      if (setProfile) {
        setProfile({ ...profile, theme: updatedTheme });
      }
      setProducts(cleanedProducts);

      if (profile?.is_pro) {
        toast.success('Boutique mise à jour avec succès !');
      } else {
        toast.success('Boutique sauvegardée ! Passez en PRO pour l\'activer sur votre profil public.', {
          action: {
            label: 'Passer PRO',
            onClick: () => openUpgradeModal?.(),
          },
        });
      }
      if (refreshDashboard) refreshDashboard();
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 text-neutral-900 font-sans max-w-4xl pb-16">
      {/* PRO Upgrade Warning Banner if not PRO */}
      {!profile?.is_pro && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-amber-500/30 p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 z-10">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Lock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider">Fonctionnalité PRO</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-amber-200 border border-amber-400/20 font-bold">
                  Boutique inactive en gratuit
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-1 font-medium max-w-xl leading-relaxed">
                Vendez ou offrez vos guides PDF, formations et templates en 1 clic. L'onglet <strong>Shop</strong> sera activé et visible sur votre profil dès l'activation du Plan PRO.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openUpgradeModal?.()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-neutral-950 text-xs font-black uppercase tracking-wider hover:scale-[1.02] transition shadow-md shrink-0 flex items-center justify-center gap-2 z-10"
          >
            <Sparkles className="w-3.5 h-3.5 fill-neutral-950" />
            <span>Débloquer la Boutique PRO</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2.5 text-neutral-900 tracking-tight">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <BookOpen className="w-5 h-5" />
            </div>
            Boutique & Produits Digitaux
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Importez les visuels de vos e-books, templates, formations ou fichiers et partagez vos liens de téléchargement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleAddProduct('free')}
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

      {/* Quick Add Bar */}
      <div className="bg-slate-50 border border-neutral-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-700">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Ajouts rapides :</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleAddProduct('free')}
            className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-emerald-400 hover:text-emerald-700 text-xs font-semibold text-neutral-700 flex items-center gap-1.5 transition shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>+ Produit Gratuit (Lead Magnet)</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddProduct('paid')}
            className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 hover:border-amber-400 hover:text-amber-800 text-xs font-semibold text-neutral-700 flex items-center gap-1.5 transition shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>+ Produit Payant (E-book / Vente)</span>
          </button>
        </div>
      </div>

      {/* Products List */}
      {products.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-3.5">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 mb-1">Votre boutique est vide</h3>
          <p className="text-xs text-neutral-500 max-w-md mb-5 leading-relaxed">
            Ajoutez votre premier produit digital (PDF, guide, template Notion, preset). Importez votre couverture en 1 clic pour un rendu professionnel.
          </p>
          <button
            type="button"
            onClick={() => handleAddProduct('free')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter mon premier produit</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {products.map((prod, index) => {
            const isUploading = uploadingId === prod.id;
            const showUrlInput = showUrlInputMap[prod.id] || false;

            return (
              <div
                key={prod.id}
                className="bg-white border border-neutral-200/80 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-xs hover:border-neutral-300/90 transition-all duration-200 group"
              >
                {/* Header card : épuré et moderne */}
                <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-700 shadow-2xs">
                      {index + 1}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block leading-tight">
                        {prod.title?.trim() || `Produit #${index + 1}`}
                      </span>
                      <span className="text-[11px] text-neutral-400 block mt-0.5">
                        E-book, ressource ou produit digital
                      </span>
                    </div>
                    <span
                      className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        prod.type === 'free'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                          : 'bg-amber-50 text-amber-800 border border-amber-200/80'
                      }`}
                    >
                      {prod.type === 'free' ? 'Gratuit' : 'Payant'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(prod.id)}
                    className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Supprimer ce produit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Ligne 1 : Titre & Tarif */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                  <div className="sm:col-span-8">
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Titre du produit ou de l'e-book <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={prod.title}
                      onChange={(e) => handleUpdateProduct(prod.id, 'title', e.target.value)}
                      placeholder="Ex: Guide complet : Débuter son activité en ligne"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50/50 border border-neutral-200/90 text-neutral-900 text-xs font-medium placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition shadow-2xs"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Tarif affiché
                    </label>
                    <input
                      type="text"
                      value={prod.price}
                      onChange={(e) => handleUpdateProduct(prod.id, 'price', e.target.value)}
                      placeholder="Ex: Gratuit, 19 €, 25 $"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50/50 border border-neutral-200/90 text-neutral-900 text-xs font-medium placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition shadow-2xs"
                    />
                  </div>
                </div>

                {/* Type de produit & Image de couverture IMPORT */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Type */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                      Type de produit
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateProduct(prod.id, 'type', 'free')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition border flex items-center justify-center gap-1.5 ${
                          prod.type === 'free'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs'
                            : 'bg-slate-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Gratuit / Téléchargement</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateProduct(prod.id, 'type', 'paid')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition border flex items-center justify-center gap-1.5 ${
                          prod.type === 'paid'
                            ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-2xs'
                            : 'bg-slate-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>Payant / Achat</span>
                      </button>
                    </div>
                  </div>

                  {/* IMPORT IMAGE DE COUVERTURE */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                        Image de couverture
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setShowUrlInputMap((prev) => ({ ...prev, [prod.id]: !prev[prod.id] }))
                        }
                        className="text-[10px] text-indigo-600 hover:underline font-semibold"
                      >
                        {showUrlInput ? '« Importer un fichier' : 'ou coller une URL web'}
                      </button>
                    </div>

                    {showUrlInput ? (
                      <input
                        type="url"
                        value={prod.image_url || ''}
                        onChange={(e) => handleUpdateProduct(prod.id, 'image_url', e.target.value)}
                        placeholder="https://... lien d'image"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-neutral-300 text-neutral-800 font-mono text-xs focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                      />
                    ) : prod.image_url ? (
                      <div className="flex items-center gap-3 p-2 bg-slate-50 border border-neutral-200 rounded-xl">
                        <img
                          src={prod.image_url}
                          alt={prod.title}
                          className="w-12 h-12 object-cover rounded-lg border border-neutral-200 shrink-0 bg-white"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-neutral-800 truncate">
                            Image de couverture chargée
                          </p>
                          <p className="text-[10px] text-neutral-400 truncate">
                            {prod.image_url.startsWith('data:') ? 'Fichier importé' : prod.image_url}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <label className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 cursor-pointer flex items-center gap-1 transition">
                            <Camera className="w-3.5 h-3.5" />
                            <span>Changer</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/jpg"
                              className="hidden"
                              disabled={isUploading}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadProductImage(prod.id, file);
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleUpdateProduct(prod.id, 'image_url', '')}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg transition"
                            title="Supprimer l'image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-dashed border-neutral-300 hover:border-indigo-500 bg-slate-50/70 hover:bg-indigo-50/20 text-neutral-600 hover:text-indigo-600 cursor-pointer transition group">
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                            <span className="text-xs font-semibold text-indigo-600">
                              Importation de l'image en cours...
                            </span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-neutral-400 group-hover:text-indigo-600 transition" />
                            <span className="text-xs font-bold">
                              Cliquer pour importer une image
                            </span>
                            <span className="text-[10px] text-neutral-400 hidden sm:inline">
                              (JPG, PNG, WebP)
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/jpg"
                          className="hidden"
                          disabled={isUploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadProductImage(prod.id, file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Lien de destination / Drive / Gumroad */}
                <div className="pt-0.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-neutral-700">
                      Lien de destination ou de téléchargement <span className="text-[11px] font-normal text-neutral-400">(facultatif)</span>
                    </label>
                    {prod.url && (
                      <a
                        href={formatExternalUrl(prod.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Tester le lien</span>
                      </a>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      value={prod.url || ''}
                      onChange={(e) => handleUpdateProduct(prod.id, 'url', e.target.value)}
                      placeholder="https://drive.google.com/... ou https://votre-site.com/produit"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-neutral-50/50 border border-neutral-200/90 text-neutral-900 font-mono text-xs placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition shadow-2xs"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Lien direct vers votre fichier Google Drive, Dropbox, page Gumroad ou boutique externe.
                  </p>
                </div>
              </div>
            );
          })}

          {/* Bottom Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer ma boutique'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

