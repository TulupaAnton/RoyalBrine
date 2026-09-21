import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { database } from "../../lib/productSuperbase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faCartPlus,
  faUtensils,
  faInfoCircle,
  faBan,
  faLeaf,
  faMinus,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useCartStore } from "../../store/cartStore";
import { motion, AnimatePresence } from "framer-motion";
import zaglushka from "../../assets/zaglushka.jpg";
import { toast } from "react-hot-toast";

const defaultWeightOptions = [0.5, 1, 2, 3];
const pieceOptions = [1, 2, 3, 5, 10];
const literOptions = [1, 2, 3, 5];

const defaultGramOptions = [100, 250, 500, 1000];

const MAX_PIECES = 999;

const bucketSizeOptions = [
  { value: 1, label: "1 л" },
  { value: 3, label: "3 л" },
  { value: 5, label: "5 л" },
];

/**
 * Тарифная сетка цен за кг в зависимости от выбранного веса (в кг).
 * product.priceTiers — JSON-массив вида:
 * [ { upTo: 0.5, price: 200 }, { upTo: null, price: 160 } ]
 * upTo: null (или отсутствует) означает "і більше" — последняя ступень.
 * Работает и для товаров "на вагу" (кг), и для товаров "на грами"
 * (граммы переводятся в кг перед поиском ступени: 100 г = 0.1 кг).
 */
function getTieredPrice(weightKg, tiers) {
  if (!Array.isArray(tiers) || tiers.length === 0) return null;

  const sorted = [...tiers].sort((a, b) => {
    const aVal = a.upTo == null ? Infinity : a.upTo;
    const bVal = b.upTo == null ? Infinity : b.upTo;
    return aVal - bVal;
  });

  for (const tier of sorted) {
    if (tier.upTo == null || weightKg <= tier.upTo) {
      return tier.price;
    }
  }

  return sorted[sorted.length - 1].price;
}

// Повертає відформатований текст тарифної сітки для підказки
function getTierDescription(tiers) {
  if (!Array.isArray(tiers) || tiers.length === 0) return "";

  return tiers
    .map((tier, index, arr) => {
      const price = `${tier.price} грн/кг`;
      if (tier.upTo != null) {
        return `до ${tier.upTo} кг — ${price}`;
      }
      const prevUpTo = arr[index - 1]?.upTo;
      const range = prevUpTo != null ? `від ${prevUpTo} кг` : "більше";
      return `${range} — ${price}`;
    })
    .join(" • ");
}

/**
 * Оптова сітка для штучних товарів (тушонка тощо).
 * product.pieceTiers — JSON-масив вида:
 * [ { minQty: 1, price: 200 }, { minQty: 10, price: 180 }, { minQty: 24, price: 160 } ]
 * Ціна за 1 шт діє на ВСЮ кількість (при 10 шт усі 10 йдуть по 180).
 */
function getPieceTier(qty, tiers) {
  if (!Array.isArray(tiers) || tiers.length === 0) return null;
  const sorted = [...tiers].sort((a, b) => b.minQty - a.minQty);
  return sorted.find((t) => qty >= t.minQty) ?? sorted[sorted.length - 1];
}

// "1–9 шт", "10–23 шт", "від 100 шт"
function getPieceRangeLabel(tier, index, tiers) {
  const next = tiers[index + 1];
  if (!next) return `від ${tier.minQty} шт`;
  const end = next.minQty - 1;
  return end <= tier.minQty ? `${tier.minQty} шт` : `${tier.minQty}–${end} шт`;
}

export function ProductDetail() {
  const { category, id } = useParams();
  const addToCart = useCartStore((state) => state.addToCart);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState(1);
  const [selectedPieces, setSelectedPieces] = useState(1);
  const [selectedLiters, setSelectedLiters] = useState(1);
  const [selectedGrams, setSelectedGrams] = useState(null);
  const [selectedBucketOption, setSelectedBucketOption] = useState("weight");
  const [selectedBucketSize, setSelectedBucketSize] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await database
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (error) console.error(error);
      setProduct(data);
      setLoading(false);
    };
    load();
  }, [id]);

  // ── Наличие товара зависит от выбранного способа продажи ───────────────
  const isBucketMode =
    product?.bucket === true && selectedBucketOption === "bucket";

  const inStock = isBucketMode
    ? product?.isBucketAccessible === true
    : product?.isAccessible === true;

  const productType = useMemo(() => {
    if (!product) return {};

    // Якщо задана оптова сітка pieceTiers — товар однозначно штучний,
    // незалежно від того, що написано в price / weight.
    if (Array.isArray(product.pieceTiers) && product.pieceTiers.length > 0) {
      return {
        isPieceProduct: true,
        isGramProduct: false,
        isLiquidProduct: false,
      };
    }

    const isPieceProduct =
      product.price?.includes("/шт") ||
      product.weight?.includes("шт") ||
      product.weight?.includes("порц");
    const isGramProduct =
      product.price?.includes("/100 гр") ||
      product.price?.includes("/100гр") ||
      product.weight?.includes("гр");
    const isLiquidProduct =
      product.price?.includes("/л") ||
      product.weight?.includes("л") ||
      product.weight?.includes("літр");
    return { isPieceProduct, isGramProduct, isLiquidProduct };
  }, [product]);

  // Кастомные варианты веса (кг) для конкретного товара
  const weightOptions = useMemo(() => {
    if (
      Array.isArray(product?.weightOptions) &&
      product.weightOptions.length > 0
    ) {
      return product.weightOptions;
    }
    return defaultWeightOptions;
  }, [product]);

  // Кастомные варианты грамовки для конкретного товара
  const gramOptions = useMemo(() => {
    if (Array.isArray(product?.gramOptions) && product.gramOptions.length > 0) {
      return product.gramOptions;
    }
    return defaultGramOptions;
  }, [product]);

  useEffect(() => {
    if (
      Array.isArray(product?.weightOptions) &&
      product.weightOptions.length > 0 &&
      !product.weightOptions.includes(selectedWeight)
    ) {
      setSelectedWeight(product.weightOptions[0]);
    }
  }, [product, selectedWeight]);

  useEffect(() => {
    if (productType.isGramProduct && selectedGrams == null) {
      setSelectedGrams(gramOptions[0]);
    }
  }, [productType.isGramProduct, gramOptions, selectedGrams]);

  const usesTieredPricing =
    !isBucketMode &&
    !productType.isPieceProduct &&
    !productType.isLiquidProduct &&
    Array.isArray(product?.priceTiers) &&
    product.priceTiers.length > 0;

  // ── Оптова сітка для штучних товарів ────────────────────────────────────
  const pieceTiers = useMemo(() => {
    if (!Array.isArray(product?.pieceTiers)) return [];
    return product.pieceTiers
      .map((t) => ({ minQty: Number(t?.minQty), price: Number(t?.price) }))
      .filter(
        (t) =>
          Number.isFinite(t.minQty) && t.minQty > 0 && Number.isFinite(t.price),
      )
      .sort((a, b) => a.minQty - b.minQty);
  }, [product]);

  const usesPieceTiers =
    !isBucketMode && !!productType.isPieceProduct && pieceTiers.length > 0;

  // Поточна ступінь, економія та підказки "докупи і заощадь"
  const pieceInfo = useMemo(() => {
    if (!usesPieceTiers) return null;

    const qty = selectedPieces;
    const tier = getPieceTier(qty, pieceTiers);
    const total = qty * tier.price;
    const retailPrice = pieceTiers[0].price;
    const savings = Math.max(0, Math.round(qty * retailPrice - total));

    // Наступна ступінь, на якій усе замовлення коштує стільки ж або дешевше
    const betterDeal =
      pieceTiers
        .filter((t) => t.minQty > qty)
        .map((t) => ({
          tier: t,
          extra: t.minQty - qty,
          save: Math.round(total - t.minQty * t.price),
        }))
        .find((d) => d.save >= 0) ?? null;

    // Найближча ступінь із нижчою ціною за штуку
    const nextTier =
      pieceTiers.find((t) => t.minQty > qty && t.price < tier.price) ?? null;

    return { tier, savings, betterDeal, nextTier };
  }, [usesPieceTiers, pieceTiers, selectedPieces]);

  const basePrice = useMemo(() => {
    if (!product) return 0;
    const { isPieceProduct, isGramProduct, isLiquidProduct } = productType;
    const currentGrams = selectedGrams ?? gramOptions[0];

    if (usesPieceTiers) {
      return getPieceTier(selectedPieces, pieceTiers).price;
    }

    if (usesTieredPricing) {
      const effectiveKg = isGramProduct ? currentGrams / 1000 : selectedWeight;
      const tieredPrice = getTieredPrice(effectiveKg, product.priceTiers);
      if (tieredPrice != null) return tieredPrice;
    }

    const priceSource = isBucketMode
      ? product.bucketPrice || product.price
      : product.price;

    let p = priceSource.replace(" грн", "");

    if (!isBucketMode) {
      if (isPieceProduct) p = p.replace("/шт", "");
      if (isLiquidProduct) p = p.replace("/л", "");
      if (isGramProduct) {
        p = p.replace("/100 гр", "").replace("/100гр", "");
        return parseFloat(p) * 10;
      }
    } else {
      p = p.replace("/л", "");
    }

    return parseFloat(p);
  }, [
    product,
    productType,
    isBucketMode,
    usesTieredPricing,
    usesPieceTiers,
    pieceTiers,
    selectedPieces,
    selectedWeight,
    selectedGrams,
    gramOptions,
  ]);

  const { calculatedPrice, displayAmount } = useMemo(() => {
    if (!product) return { calculatedPrice: "0 грн", displayAmount: "" };
    const { isPieceProduct, isGramProduct, isLiquidProduct } = productType;
    const isBucketProduct = product.bucket === true;
    let price = 0;
    let amount = "";
    const grams = selectedGrams ?? gramOptions[0];

    if (isBucketProduct && selectedBucketOption === "bucket") {
      price = (basePrice * selectedBucketSize).toFixed(2);
      amount = `${selectedBucketSize} л (відро)`;
    } else if (isPieceProduct) {
      price = (basePrice * selectedPieces).toFixed(2);
      amount = `${selectedPieces} шт`;
    } else if (isLiquidProduct) {
      price = (basePrice * selectedLiters).toFixed(2);
      amount = `${selectedLiters} л`;
    } else if (isGramProduct) {
      price = (basePrice * (grams / 1000)).toFixed(2);
      amount = grams >= 1000 ? `${grams / 1000} кг` : `${grams} гр`;
    } else {
      price = (basePrice * selectedWeight).toFixed(2);
      amount = `${selectedWeight} кг`;
    }

    return {
      calculatedPrice: `${Math.round(price)} грн`,
      displayAmount: amount,
    };
  }, [
    product,
    productType,
    basePrice,
    selectedWeight,
    selectedPieces,
    selectedLiters,
    selectedGrams,
    gramOptions,
    selectedBucketOption,
    selectedBucketSize,
  ]);

  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart(
      {
        ...product,
        price: calculatedPrice,
        weight: displayAmount,
        packing: isBucketMode ? "bucket" : "weight",
      },
      category,
    );
    toast.success(`${product.name} додано!`, {
      icon: "🌿",
      style: {
        borderRadius: "20px",
        background: "#1a1a1a",
        color: "#fff",
        padding: "16px 20px",
        fontWeight: "bold",
        fontSize: "15px",
      },
    });
  };

  const images = useMemo(
    () => (product?.images?.length > 0 ? product.images : [zaglushka]),
    [product],
  );
  const getImageUrl = useCallback((img) => {
    if (!img || img === zaglushka) return zaglushka;
    return new URL(`../../assets/products/${img}`, import.meta.url).href;
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-[3px] border-orange-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Завантаження
          </span>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen bg-[#F7F4EF] flex flex-col items-center justify-center gap-4">
        <p className="text-sm font-bold text-gray-400">Товар не знайдено</p>
        <Link
          to={`/catalog/${category}`}
          className="text-xs font-black uppercase tracking-widest text-orange-600"
        >
          Назад до списку
        </Link>
      </div>
    );

  // Ціна під назвою товару
  const headerPrice = isBucketMode
    ? product.bucketPrice || product.price
    : usesPieceTiers
      ? `від ${Math.min(...pieceTiers.map((t) => t.price))} грн/шт`
      : usesTieredPricing
        ? `від ${Math.min(...product.priceTiers.map((t) => t.price))} грн/кг`
        : product.price;

  const SelectorsBlock = () => (
    <div className="space-y-6">
      {productType.isGramProduct && (
        <SectionBlock label="Скільки грамів?">
          {usesTieredPricing && (
            <p className="text-[11px] font-semibold text-gray-400 mb-2">
              Ціна за кг при {selectedGrams ?? gramOptions[0]} г:{" "}
              <span className="text-gray-700">{Math.round(basePrice)} грн</span>
            </p>
          )}
          <div className="grid grid-cols-4 gap-2">
            {gramOptions.map((g) => (
              <OptionButton
                key={g}
                label={g >= 1000 ? `${g / 1000}кг` : `${g}г`}
                active={(selectedGrams ?? gramOptions[0]) === g}
                onClick={() => setSelectedGrams(g)}
                accent="dark"
              />
            ))}
          </div>
        </SectionBlock>
      )}

      {usesPieceTiers && pieceInfo && (
        <PieceTiersSelector
          tiers={pieceTiers}
          qty={selectedPieces}
          onChange={setSelectedPieces}
          info={pieceInfo}
        />
      )}

      {product.bucket && (
        <SectionBlock label="Як запакувати?">
          <div className="flex gap-1.5 p-1.5 bg-gray-100 rounded-2xl mb-3">
            {["weight", "bucket"].map((type) => {
              const optionInStock =
                type === "bucket"
                  ? product.isBucketAccessible === true
                  : product.isAccessible === true;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedBucketOption(type)}
                  className={`relative flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    selectedBucketOption === type
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-400"
                  }`}
                >
                  {type === "weight" ? "⚖️ На вагу" : "🧺 У відрі"}
                  {!optionInStock && (
                    <span className="ml-1.5 text-[9px] text-red-400 normal-case tracking-normal font-bold">
                      нема
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-[11px] font-semibold text-gray-400 mb-3">
            {selectedBucketOption === "bucket"
              ? "Ціна за літр у відрі: "
              : "Ціна за кг на вагу: "}
            <span className="text-gray-700">
              {isBucketMode
                ? product.bucketPrice || product.price
                : product.price}
            </span>
          </p>

          <div className="grid grid-cols-3 gap-2">
            {(selectedBucketOption === "weight"
              ? weightOptions
              : bucketSizeOptions
            ).map((opt) => {
              const val = typeof opt === "object" ? opt.value : opt;
              const label = typeof opt === "object" ? opt.label : `${opt} кг`;
              const isActive =
                (selectedBucketOption === "weight"
                  ? selectedWeight
                  : selectedBucketSize) === val;
              return (
                <OptionButton
                  key={val}
                  label={label}
                  active={isActive}
                  accent="orange"
                  onClick={() =>
                    selectedBucketOption === "weight"
                      ? setSelectedWeight(val)
                      : setSelectedBucketSize(val)
                  }
                />
              );
            })}
          </div>
        </SectionBlock>
      )}

      {!product.bucket && !productType.isGramProduct && !usesPieceTiers && (
        <SectionBlock label="Оберіть об'єм:">
          {usesTieredPricing && (
            <p className="text-[11px] font-semibold text-gray-400 mb-2">
              Ціна за кг при {selectedWeight} кг:{" "}
              <span className="text-gray-700">{Math.round(basePrice)} грн</span>
            </p>
          )}

          <div className="grid grid-cols-4 gap-2">
            {(productType.isPieceProduct
              ? pieceOptions
              : productType.isLiquidProduct
                ? literOptions
                : weightOptions
            ).map((v) => {
              const isActive =
                (productType.isPieceProduct
                  ? selectedPieces
                  : productType.isLiquidProduct
                    ? selectedLiters
                    : selectedWeight) === v;
              return (
                <OptionButton
                  key={v}
                  label={`${v} ${
                    productType.isPieceProduct
                      ? "шт"
                      : productType.isLiquidProduct
                        ? "л"
                        : "кг"
                  }`}
                  active={isActive}
                  accent="dark"
                  onClick={() => {
                    if (productType.isPieceProduct) setSelectedPieces(v);
                    else if (productType.isLiquidProduct) setSelectedLiters(v);
                    else setSelectedWeight(v);
                  }}
                />
              );
            })}
          </div>
        </SectionBlock>
      )}
    </div>
  );

  const CTABlock = ({ compact = false } = {}) => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-0.5">
            Підсумок
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={calculatedPrice}
              initial={{ y: -6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 6, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={`block font-black leading-none ${
                compact ? "text-3xl" : "text-[2rem]"
              } ${!inStock ? "text-gray-300" : "text-gray-900"}`}
            >
              {calculatedPrice}
            </motion.span>
          </AnimatePresence>
          <span className="text-[12px] font-semibold text-orange-500 mt-0.5 block">
            {displayAmount}
          </span>
          {pieceInfo?.savings > 0 && (
            <span className="text-[12px] font-bold text-emerald-600 mt-0.5 block">
              Економія {pieceInfo.savings} грн
            </span>
          )}
        </div>
      </div>

      <button
        disabled={!inStock}
        onClick={handleAddToCart}
        className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.15em] text-[13px] transition-all active:scale-[0.97] ${
          !inStock
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gray-900 text-white hover:bg-orange-600"
        }`}
        style={inStock ? { boxShadow: "0 8px 24px rgba(249,115,22,0.22)" } : {}}
      >
        <FontAwesomeIcon
          icon={!inStock ? faBan : faCartPlus}
          className={!inStock ? "text-red-300" : "text-orange-400"}
        />
        {!inStock ? "Немає в наявності" : "Додати до замовлення"}
      </button>

      {!inStock && (
        <p className="text-center text-[11px] text-gray-400 font-medium mt-2.5 leading-snug">
          {isBucketMode
            ? 'Немає в наявності у відрі. Спробуйте варіант "на вагу".'
            : "Товар тимчасово відсутній. Ви можете переглянути склад та ціни."}
        </p>
      )}
    </div>
  );

  // ВАЖЛИВО: SelectorsBlock/CTABlock викликаються як функції, а не як <Компонент />.
  // Вони оголошені всередині ProductDetail, тому як компоненти перестворювалися б
  // на кожен рендер, і поле вводу кількості втрачало б фокус після кожної цифри.
  return (
    <div className="min-h-screen bg-[#F7F4EF] font-sans">
      {/* DESKTOP */}
      <div className="hidden md:block">
        <header className="border-b border-gray-200 bg-[#F7F4EF]/90 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-8 py-4 flex items-center gap-3">
            <Link
              to={`/catalog/${category}`}
              className="flex items-center gap-2.5 text-gray-500 hover:text-gray-900 transition-colors group"
            >
              <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-gray-200 group-hover:border-gray-400 transition-colors">
                <FontAwesomeIcon icon={faChevronLeft} size="xs" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest">
                Назад до списку
              </span>
            </Link>
            <span className="text-gray-300 select-none">·</span>
            <span className="text-xs font-bold text-gray-400 truncate max-w-xs">
              {product.name}
            </span>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="grid grid-cols-2 gap-16 items-start">
            <div className="sticky top-24">
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={getImageUrl(images[currentImageIndex])}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute inset-0 w-full h-full object-cover ${
                      !inStock ? "grayscale opacity-70" : ""
                    }`}
                  />
                </AnimatePresence>

                {!inStock && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
                    <div className="bg-black/65 backdrop-blur-sm text-white px-5 py-2.5 rounded-full flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faBan}
                        className="text-red-400 text-xs"
                      />
                      <span className="text-[11px] font-black uppercase tracking-widest">
                        Немає в наявності
                      </span>
                    </div>
                  </div>
                )}

                {images.length > 1 && (
                  <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-10">
                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          (prev) => (prev - 1 + images.length) % images.length,
                        )
                      }
                      className="w-10 h-10 rounded-full bg-white/90 border border-gray-100 shadow flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <FontAwesomeIcon
                        icon={faChevronLeft}
                        size="sm"
                        className="text-gray-700"
                      />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          (prev) => (prev + 1) % images.length,
                        )
                      }
                      className="w-10 h-10 rounded-full bg-white/90 border border-gray-100 shadow flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        size="sm"
                        className="text-gray-700"
                      />
                    </button>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 mt-3">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all ${
                        i === currentImageIndex
                          ? "border-gray-900"
                          : "border-transparent opacity-55 hover:opacity-85"
                      }`}
                    >
                      <img
                        src={getImageUrl(img)}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-4xl font-black text-gray-900 leading-tight">
                  {product.name}
                </h1>
                {inStock ? (
                  <span className="flex-shrink-0 mt-1.5 flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wide">
                    <FontAwesomeIcon icon={faLeaf} className="text-[10px]" />{" "}
                    Свіжий
                  </span>
                ) : (
                  <span className="flex-shrink-0 mt-1.5 flex items-center gap-1.5 bg-red-50 text-red-400 border border-red-100 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wide">
                    <FontAwesomeIcon icon={faBan} className="text-[10px]" />{" "}
                    Відсутній
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 font-medium mb-2">
                {headerPrice}
              </p>

              {usesTieredPricing && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50/80 border border-orange-100/60 px-3 py-1.5 rounded-xl mb-6 w-fit">
                  <span>💡</span>
                  <span>{getTierDescription(product.priceTiers)}</span>
                </div>
              )}

              <div className="h-px bg-gray-200 mb-8" />

              {SelectorsBlock()}

              {product.compound && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mt-6">
                  <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-amber-600 mb-2">
                    <FontAwesomeIcon icon={faUtensils} /> Склад
                  </h4>
                  <p className="text-gray-700 text-sm font-medium leading-relaxed">
                    {product.compound}
                  </p>
                </div>
              )}

              {product.description && (
                <div className="flex gap-3 mt-5">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="text-orange-300 mt-0.5 flex-shrink-0"
                  />
                  <p className="text-gray-400 text-sm leading-relaxed italic">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="h-px bg-gray-200 my-8" />

              {CTABlock({ compact: true })}
            </motion.div>
          </div>
        </div>
      </div>

      {/* MOBILE */}
      <div className="md:hidden">
        <div
          className="relative w-full"
          style={{ height: "58vmax", maxHeight: "65vh", minHeight: 280 }}
        >
          <div
            className="absolute top-0 left-0 right-0 z-20 flex items-center px-4 pt-12 pb-4"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 100%)",
            }}
          >
            <Link
              to={`/catalog/${category}`}
              className="w-11 h-11 flex items-center justify-center rounded-2xl backdrop-blur-md bg-white/20 border border-white/30 text-white active:scale-90 transition-transform"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </Link>
            <span className="ml-3 text-white/80 font-bold text-[11px] uppercase tracking-[0.2em]">
              До списку
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={getImageUrl(images[currentImageIndex])}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`absolute inset-0 w-full h-full object-cover ${
                !inStock ? "grayscale" : ""
              }`}
            />
          </AnimatePresence>

          {!inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <div className="bg-black/70 backdrop-blur-sm text-white px-5 py-2.5 rounded-full flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faBan}
                  className="text-red-400 text-xs"
                />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  Немає в наявності
                </span>
              </div>
            </div>
          )}

          {images.length > 1 && (
            <>
              <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between z-10">
                <button
                  onClick={() =>
                    setCurrentImageIndex(
                      (prev) => (prev - 1 + images.length) % images.length,
                    )
                  }
                  className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white"
                >
                  <FontAwesomeIcon icon={faChevronLeft} size="sm" />
                </button>
                <button
                  onClick={() =>
                    setCurrentImageIndex((prev) => (prev + 1) % images.length)
                  }
                  className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white"
                >
                  <FontAwesomeIcon icon={faChevronRight} size="sm" />
                </button>
              </div>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`rounded-full transition-all ${
                      i === currentImageIndex
                        ? "w-5 h-1.5 bg-white"
                        : "w-1.5 h-1.5 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          <div
            className="absolute bottom-0 left-0 right-0 h-16 z-10"
            style={{
              background: "linear-gradient(to bottom, transparent, #F7F4EF)",
            }}
          />
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            damping: 24,
            stiffness: 200,
            delay: 0.1,
          }}
          className="relative z-10 -mt-6 bg-[#F7F4EF] rounded-t-[2.5rem] px-5 pb-48"
        >
          <div className="pt-7 pb-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-[1.85rem] font-black text-gray-900 leading-tight flex-1">
                {product.name}
              </h1>
              {inStock && (
                <span className="flex-shrink-0 mt-1 flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wide">
                  <FontAwesomeIcon icon={faLeaf} className="text-[10px]" />{" "}
                  Свіжий
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 font-medium mb-2">
              {headerPrice}
            </p>

            {usesTieredPricing && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50/80 border border-orange-100/60 px-3 py-1.5 rounded-xl w-fit">
                <span>💡</span>
                <span>{getTierDescription(product.priceTiers)}</span>
              </div>
            )}
          </div>

          <div className="h-px bg-gray-200 mb-6" />

          {SelectorsBlock()}

          {product.compound && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mt-6">
              <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-amber-600 mb-2">
                <FontAwesomeIcon icon={faUtensils} /> Склад
              </h4>
              <p className="text-gray-700 text-[15px] font-medium leading-relaxed">
                {product.compound}
              </p>
            </div>
          )}

          {product.description && (
            <div className="flex gap-3 mt-5">
              <FontAwesomeIcon
                icon={faInfoCircle}
                className="text-orange-300 mt-0.5 flex-shrink-0"
              />
              <p className="text-gray-400 text-[15px] leading-relaxed italic">
                {product.description}
              </p>
            </div>
          )}
        </motion.div>

        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="h-5 bg-gradient-to-t from-[#F7F4EF] to-transparent" />
          <div className="bg-[#F7F4EF] px-4 pb-8 pt-1">
            <div className="bg-white rounded-[2rem] shadow-[0_-4px_30px_rgba(0,0,0,0.08)] border border-gray-100 px-4 pt-4 pb-4">
              {CTABlock()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ─── */

function SectionBlock({ label, children }) {
  return (
    <div>
      <label className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400 block mb-3">
        {label}
      </label>
      {children}
    </div>
  );
}

function OptionButton({ label, active, onClick, accent = "dark" }) {
  const activeClass =
    accent === "orange"
      ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200"
      : "bg-gray-900 border-gray-900 text-white shadow-lg shadow-gray-200";

  return (
    <button
      onClick={onClick}
      className={`py-3.5 rounded-2xl text-sm font-black border-2 transition-all active:scale-95 hover:scale-[1.02] ${
        active
          ? activeClass
          : "bg-white border-gray-100 text-gray-500 hover:border-gray-300"
      }`}
    >
      {label}
    </button>
  );
}

/**
 * Степпер (− / число / +) з ручним введенням.
 * Тримає власний текстовий "чернетковий" стан, щоб можна було стерти
 * цифри повністю і ввести нове число, а на blur значення нормалізується.
 */
function QuantityStepper({ value, onChange, min = 1, max = MAX_PIECES }) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const clamp = (n) => Math.min(max, Math.max(min, n));

  const handleInput = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 3);
    setDraft(digits);
    const n = parseInt(digits, 10);
    if (!Number.isNaN(n) && n >= min) onChange(clamp(n));
  };

  const handleBlur = () => {
    const n = parseInt(draft, 10);
    const next = Number.isNaN(n) ? min : clamp(n);
    onChange(next);
    setDraft(String(next));
  };

  const stepBtn =
    "w-12 h-12 flex items-center justify-center rounded-2xl bg-white border-2 border-gray-100 text-gray-700 transition-all active:scale-90 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Менше"
        disabled={value <= min}
        onClick={() => onChange(clamp(value - 1))}
        className={stepBtn}
      >
        <FontAwesomeIcon icon={faMinus} size="sm" />
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label="Кількість штук"
        value={draft}
        onChange={handleInput}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        className="w-20 h-12 text-center text-lg font-black text-gray-900 rounded-2xl bg-white border-2 border-gray-100 outline-none focus:border-gray-900 transition-colors"
      />
      <button
        type="button"
        aria-label="Більше"
        disabled={value >= max}
        onClick={() => onChange(clamp(value + 1))}
        className={stepBtn}
      >
        <FontAwesomeIcon icon={faPlus} size="sm" />
      </button>
    </div>
  );
}

/**
 * Блок вибору кількості для штучних товарів з оптовою сіткою:
 * степпер, швидкі кнопки по порогах, підказка "докупи і заощадь"
 * і таблиця ступенів з підсвіткою поточної.
 */
function PieceTiersSelector({ tiers, qty, onChange, info }) {
  const { tier, betterDeal, nextTier } = info;

  return (
    <SectionBlock label="Скільки штук?">
      <div className="flex items-center justify-between gap-3 mb-3">
        <QuantityStepper value={qty} onChange={onChange} />
        <div className="text-right leading-tight">
          <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">
            Ціна за шт
          </span>
          <span className="block text-xl font-black text-gray-900">
            {tier.price} грн
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {tiers.map((t) => (
          <OptionButton
            key={t.minQty}
            label={`${t.minQty} шт`}
            active={qty === t.minQty}
            accent="dark"
            onClick={() => onChange(t.minQty)}
          />
        ))}
      </div>

      {betterDeal ? (
        <button
          type="button"
          onClick={() => onChange(betterDeal.tier.minQty)}
          className="w-full text-left flex items-start gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2.5 rounded-xl mb-3 active:scale-[0.99] transition-transform"
        >
          <span>🔥</span>
          <span>
            Візьміть {betterDeal.tier.minQty} шт (ще {betterDeal.extra}) —{" "}
            {betterDeal.save > 0
              ? `це дешевше на ${betterDeal.save} грн`
              : "за ту саму ціну"}
            . <span className="underline">Обрати</span>
          </span>
        </button>
      ) : nextTier ? (
        <button
          type="button"
          onClick={() => onChange(nextTier.minQty)}
          className="w-full text-left flex items-start gap-2 text-xs font-bold text-orange-600 bg-orange-50/80 border border-orange-100/60 px-3 py-2.5 rounded-xl mb-3 active:scale-[0.99] transition-transform"
        >
          <span>💡</span>
          <span>
            Ще {nextTier.minQty - qty} шт — і ціна впаде до {nextTier.price}{" "}
            грн/шт
          </span>
        </button>
      ) : (
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2.5 rounded-xl mb-3">
          <span>✅</span>
          <span>Діє найнижча ціна</span>
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
        {tiers.map((t, i) => {
          const active = t.minQty === tier.minQty;
          return (
            <button
              key={t.minQty}
              type="button"
              onClick={() => onChange(t.minQty)}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                i > 0 ? "border-t border-gray-100" : ""
              } ${
                active
                  ? "bg-orange-50 text-orange-700 font-black"
                  : "text-gray-500 font-semibold hover:bg-gray-50"
              }`}
            >
              <span>{getPieceRangeLabel(t, i, tiers)}</span>
              <span>{t.price} грн/шт</span>
            </button>
          );
        })}
      </div>
    </SectionBlock>
  );
}
