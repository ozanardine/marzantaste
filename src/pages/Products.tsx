import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';
import { Search, Filter, ShoppingBag, X, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  promotional_price: number | null;
  promotion_end_date: string | null;
  image_url: string;
  category: string;
  tags: string[];
}

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<{ [key: string]: ProductImage[] }>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;

      // Armazenar produtos primeiro
      const productsList = data || [];
      setProducts(productsList);
      
      // Buscar todas as imagens principais para cada produto  
      await Promise.all(productsList.map(async (product) => {
        await fetchProductImages(product.id);
      }));

      const uniqueCategories = [...new Set(productsList.map(product => product.category) || [])];
      setCategories(uniqueCategories);

      const uniqueTags = [...new Set(productsList.flatMap(product => product.tags || []) || [])];
      setAllTags(uniqueTags);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast.error('Falha ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductImages = async (productId: string) => {
    try {
      // Garantir que usamos .order('display_order') para manter a ordem definida no painel admin
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Validação extra para garantir que a ordem está correta
      // Usamos o display_order para ordenar, mesmo que já venha ordenado do banco
      const sortedImages = data ? [...data].sort((a, b) => a.display_order - b.display_order) : [];
      
      // Verificar se a imagem principal no produto corresponde à primeira imagem da galeria
      if (sortedImages.length > 0) {
        // Verificar se a primeira imagem na ordem é diferente da imagem principal atual
        const product = products.find(p => p.id === productId);
        if (product && product.image_url !== sortedImages[0].image_url) {
          console.log(`Atualizando imagem principal do produto ${productId} para corresponder à galeria`);
          
          // Atualizar o produto na memória
          setProducts(prev => prev.map(p => 
            p.id === productId ? {...p, image_url: sortedImages[0].image_url} : p
          ));
        }
      }
      
      console.log(`Carregadas ${sortedImages.length} imagens para o produto ${productId}`);
      
      // Atualizar o estado com as imagens ordenadas
      setProductImages(prev => ({
        ...prev,
        [productId]: sortedImages
      }));
    } catch (error) {
      console.error('Erro ao buscar imagens do produto:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesTag = !selectedTag || (product.tags && product.tags.includes(selectedTag));
    return matchesSearch && matchesCategory && matchesTag;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const isPromotionValid = (product: Product) => {
    if (!product.promotional_price || !product.promotion_end_date) return false;
    return new Date(product.promotion_end_date) > new Date();
  };

  const calculateDiscount = (product: Product) => {
    if (!isPromotionValid(product) || !product.promotional_price) return 0;
    return Math.round(((product.price - product.promotional_price) / product.price) * 100);
  };

  const getProductPrice = (product: Product, large = false) => {
    if (isPromotionValid(product)) {
      const discount = calculateDiscount(product);
      return (
        <div className={`flex flex-col ${large ? 'items-end' : ''}`}>
          <div className="flex items-center gap-2">
            <span className={`text-error line-through ${large ? 'text-lg' : 'text-sm'}`}>
              {formatPrice(product.price)}
            </span>
            <span className="bg-success/10 text-success text-xs px-2 py-1 rounded-full font-medium">
              -{discount}%
            </span>
          </div>
          <span className={`text-success font-bold ${large ? 'text-2xl' : ''}`}>
            {formatPrice(product.promotional_price!)}
          </span>
        </div>
      );
    }
    return (
      <span className={`font-medium ${large ? 'text-2xl' : ''}`}>
        {formatPrice(product.price)}
      </span>
    );
  };

  const handlePrevImage = () => {
    if (!selectedProduct) return;
    const images = productImages[selectedProduct.id] || [];
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!selectedProduct) return;
    const images = productImages[selectedProduct.id] || [];
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-[calc(100vh-64px)] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-primary mb-4">
            Nossos Produtos
          </h1>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-primary/40" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>
            
            <div className="w-full md:w-64">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-primary/40" />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input pl-10 w-full appearance-none"
                >
                  <option value="all">Todas as Categorias</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {allTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTag === tag
                      ? 'bg-primary text-cream'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  <Tag className="h-4 w-4 mr-1" />
                  {tag}
                </button>
              ))}
            </div>
          )}
        </header>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product);
                  setCurrentImageIndex(0);
                }}
                className="card hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                <div className="aspect-square overflow-hidden rounded-t-xl relative">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                  {isPromotionValid(product) && (
                    <div className="absolute top-2 right-2 bg-success text-white px-3 py-1 rounded-full text-sm font-medium">
                      -{calculateDiscount(product)}% OFF
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-heading text-lg font-semibold text-primary mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-primary/70 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      {getProductPrice(product)}
                    </div>
                    <span className="badge-primary">
                      {product.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-primary/10 p-4 rounded-full mx-auto w-16 h-16 flex items-center justify-center mb-4">
              <ShoppingBag className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-primary mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-primary/70">
              Tente ajustar seus filtros de busca
            </p>
          </div>
        )}
      </div>

      {/* Modal do Produto */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-10 bg-white/80 rounded-full p-1 hover:bg-white transition-colors"
              >
                <X className="h-6 w-6 text-primary" />
              </button>
              
              <div className="aspect-video relative overflow-hidden">
                {/* Imagem Principal */}
                <img
                  src={
                    productImages[selectedProduct.id]?.[currentImageIndex]?.image_url ||
                    selectedProduct.image_url
                  }
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />

                {/* Setas de Navegação */}
                {productImages[selectedProduct.id]?.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6 text-primary" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition-colors"
                    >
                      <ChevronRight className="h-6 w-6 text-primary" />
                    </button>
                  </>
                )}

                {isPromotionValid(selectedProduct) && (
                  <div className="absolute top-4 left-4 bg-success text-white px-4 py-2 rounded-full font-medium">
                    -{calculateDiscount(selectedProduct)}% OFF
                  </div>
                )}
              </div>

              {/* Miniaturas de Navegação */}
              {productImages[selectedProduct.id]?.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {productImages[selectedProduct.id].map((image, index) => (
                    <button
                      key={image.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        currentImageIndex === index
                          ? 'border-primary'
                          : 'border-transparent hover:border-primary/50'
                      }`}
                    >
                      <img
                        src={image.image_url}
                        alt={`${selectedProduct.name} - Imagem ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="font-heading text-2xl font-bold text-primary mb-3">
                    {selectedProduct.name}
                  </h2>
                  {selectedProduct.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedProduct.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                        >
                          <Tag className="h-4 w-4 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="badge-primary text-sm">
                    {selectedProduct.category}
                  </span>
                </div>
                <div className="text-right ml-6">
                  {getProductPrice(selectedProduct, true)}
                  {isPromotionValid(selectedProduct) && (
                    <p className="text-sm text-success mt-2">
                      Promoção válida até{' '}
                      {new Date(selectedProduct.promotion_end_date!).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="prose prose-brown max-w-none">
                <p className="text-primary/80 whitespace-pre-line">
                  {selectedProduct.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;