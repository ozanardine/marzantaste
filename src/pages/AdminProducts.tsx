import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';
import { PlusCircle, Pencil, Trash2, X, Search, Tag, Upload, Loader2, GripHorizontal, Image as ImageIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import logger from '../lib/logger';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  promotional_price: number | null;
  promotion_end_date: string | null;
  image_url: string;
  category: string;
  active: boolean;
  tags: string[];
}

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

const IMGUR_CLIENT_ID = import.meta.env.VITE_IMGUR_CLIENT_ID;

const AdminProducts: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    promotional_price: '',
    promotion_end_date: '',
    image_url: '',
    category: '',
    active: true,
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [draggingImageIndex, setDraggingImageIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 100,
    onDrop: handleImageDrop
  });

  useEffect(() => {
    if (user && isAdmin) {
      fetchProducts();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (editingProduct) {
      fetchProductImages(editingProduct.id);
    }
  }, [editingProduct]);

  const fetchProductImages = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('display_order');

      if (error) throw error;
      setProductImages(data || []);
    } catch (error) {
      logger.error('Erro ao buscar imagens do produto', error);
      toast.error('Falha ao carregar imagens do produto');
    }
  };

  async function handleImageDrop(acceptedFiles: File[]) {
    setUploadingImage(true);

    try {
      const uploadedImages = await Promise.all(
        acceptedFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('image', file);

          const response = await fetch('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: {
              'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`
            },
            body: formData
          });

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.data.error);
          }

          return data.data.link;
        })
      );

      if (editingProduct) {
        // Adicionar novas imagens ao produto existente
        const { error } = await supabase
          .from('product_images')
          .insert(
            uploadedImages.map((url, index) => ({
              product_id: editingProduct.id,
              image_url: url,
              display_order: productImages.length + index
            }))
          );

        if (error) throw error;
        await fetchProductImages(editingProduct.id);
      } else {
        // Definir a primeira imagem como a imagem principal do produto
        setFormData(prev => ({
          ...prev,
          image_url: uploadedImages[0]
        }));
        
        // Armazenar as imagens restantes para serem adicionadas após a criação do produto
        setProductImages(
          uploadedImages.map((url, index) => ({
            id: `temp-${index}`,
            product_id: 'temp',
            image_url: url,
            display_order: index,
            created_at: new Date().toISOString()
          }))
        );
      }

      toast.success('Imagens enviadas com sucesso!');
    } catch (error) {
      logger.error('Erro ao enviar imagens para o produto', error, true);
      toast.error('Falha ao enviar imagens');
      setUploadingImage(false);
    }
  }

  const handleImageReorder = async (dragIndex: number, dropIndex: number) => {
    if (dragIndex === dropIndex) return;

    const newImages = [...productImages];
    const [draggedImage] = newImages.splice(dragIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);

    // Atualizar a ordem de exibição
    const updatedImages = newImages.map((image, index) => ({
      ...image,
      display_order: index
    }));

    setProductImages(updatedImages);

    if (editingProduct) {
      try {
        // Usar uma abordagem de atualização sequencial para evitar conflitos de chave única
        // Primeiro, atribuir valores temporários negativos para evitar conflitos
        for (let i = 0; i < updatedImages.length; i++) {
          await supabase
            .from('product_images')
            .update({ display_order: -1000 - i })
            .eq('id', updatedImages[i].id);
        }
        
        // Depois, atribuir os valores finais
        for (let i = 0; i < updatedImages.length; i++) {
          await supabase
            .from('product_images')
            .update({ display_order: i })
            .eq('id', updatedImages[i].id);
        }
        
        // Atualizar a imagem principal do produto
        if (updatedImages.length > 0) {
          const { error: mainImageError } = await supabase
            .from('products')
            .update({ image_url: updatedImages[0].image_url })
            .eq('id', editingProduct.id);
            
          if (mainImageError) throw mainImageError;
          
          // Atualizar também no formData atual
          setFormData({
            ...formData,
            image_url: updatedImages[0].image_url
          });
        }
        
        toast.success('Ordem das imagens atualizada');
      } catch (error) {
        logger.error('Erro ao atualizar ordem das imagens', error);
        toast.error('Falha ao atualizar ordem das imagens');
        // Reverter para a ordem anterior
        await fetchProductImages(editingProduct.id);
      }
    }
  };

  const handleImageDelete = async (imageId: string, index: number) => {
    if (!confirm('Tem certeza que deseja excluir esta imagem?')) return;

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('product_images')
          .delete()
          .eq('id', imageId);

        if (error) throw error;
        
        // Buscar as imagens atualizadas
        await fetchProductImages(editingProduct.id);
        
        // Se removemos a imagem principal (index 0), precisamos atualizar a imagem principal do produto
        if (index === 0) {
          // Verificar se ainda existem imagens
          if (productImages.length > 1) {
            // Há outras imagens, usamos a nova primeira imagem como principal
            const { error: updateError } = await supabase
              .from('products')
              .update({ 
                image_url: productImages
                  .filter(img => img.id !== imageId)[0].image_url 
              })
              .eq('id', editingProduct.id);
            
            if (updateError) throw updateError;
            
            // Atualizar o formData também
            setFormData({
              ...formData,
              image_url: productImages.filter(img => img.id !== imageId)[0].image_url
            });
          }
        }
      } else {
        // Para novos produtos que ainda não foram salvos
        const newImages = [...productImages];
        newImages.splice(index, 1);
        setProductImages(newImages.map((img, idx) => ({ ...img, display_order: idx })));
        
        // Se removemos a imagem principal, atualizar formData
        if (index === 0 && newImages.length > 0) {
          setFormData({
            ...formData,
            image_url: newImages[0].image_url
          });
        }
      }

      toast.success('Imagem excluída com sucesso');
    } catch (error) {
      logger.error(`Erro ao excluir imagem ${imageId} do produto ${editingProduct?.id}`, error);
      toast.error('Falha ao excluir imagem');
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      setProducts(data || []);

      // Agora vamos buscar as imagens principais para todos os produtos
      await Promise.all((data || []).map(async (product) => {
        try {
          const { data: imageData, error: imageError } = await supabase
            .from('product_images')
            .select('*')
            .eq('product_id', product.id)
            .order('display_order')
            .limit(1);

          if (imageError) throw imageError;
          
          // Se encontrou uma imagem na galeria, atualiza a imagem principal do produto
          if (imageData && imageData.length > 0) {
            const { error: updateError } = await supabase
              .from('products')
              .update({ image_url: imageData[0].image_url })
              .eq('id', product.id);
              
            if (updateError) throw updateError;
          }
        } catch (imgError) {
          logger.error(`Erro ao atualizar imagem principal do produto ${product.id}`, imgError);
        }
      }));
    } catch (error) {
      logger.error('Erro ao buscar produtos do catálogo', error);
      toast.error('Falha ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.image_url || !formData.category) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        promotional_price: formData.promotional_price ? parseFloat(formData.promotional_price) : null,
        promotion_end_date: formData.promotion_end_date || null
      };

      if (editingProduct) {
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (updateError) throw updateError;
      } else {
        const { data: newProduct, error: insertError } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();

        if (insertError) throw insertError;

        // Inserir imagens adicionais
        if (productImages.length > 0) {
          const { error: imagesError } = await supabase
            .from('product_images')
            .insert(
              productImages.map((image, index) => ({
                product_id: newProduct.id,
                image_url: image.image_url,
                display_order: index
              }))
            );

          if (imagesError) throw imagesError;
        }
      }

      toast.success(editingProduct ? 'Produto atualizado com sucesso' : 'Produto adicionado com sucesso');
      fetchProducts();
      handleCloseModal();
    } catch (error) {
      logger.error('Erro ao salvar produto', error, true);
      toast.error('Falha ao salvar produto');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      promotional_price: product.promotional_price?.toString() || '',
      promotion_end_date: product.promotion_end_date || '',
      image_url: product.image_url,
      category: product.category,
      active: product.active,
      tags: product.tags || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Produto excluído com sucesso');
      fetchProducts();
    } catch (error) {
      logger.error(`Erro ao excluir produto ${id}`, error);
      toast.error('Falha ao excluir produto');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      promotional_price: '',
      promotion_end_date: '',
      image_url: '',
      category: '',
      active: true,
      tags: []
    });
    setNewTag('');
    setProductImages([]);
  };

  const handleAddTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-heading font-bold text-primary mb-4">
            Acesso Negado
          </h1>
          <p className="text-primary/70">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-[calc(100vh-64px)] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-primary">
              Gerenciar Produtos
            </h1>
            <p className="text-primary/70 mt-2">
              Adicione, edite e gerencie seu catálogo de produtos
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Adicionar Produto
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-primary/40" />
              </div>
              <input
                type="text"
                placeholder="Pesquisar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">
                    Produto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">
                    Preço
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">
                    Preço Promo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary/70 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={product.image_url}
                            alt={product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-primary">
                            {product.name}
                          </div>
                          <div className="text-sm text-primary/60">
                            {product.tags?.map(tag => (
                              <span key={tag} className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-full mr-1">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge-primary">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-primary">
                        {formatPrice(product.price)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.promotional_price ? (
                        <span className="text-sm font-medium text-success">
                          {formatPrice(product.promotional_price)}
                        </span>
                      ) : (
                        <span className="text-sm text-primary/40">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${product.active ? 'badge-success' : 'badge-warning'}`}>
                        {product.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-primary hover:text-caramel transition-colors"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-error hover:text-error/70 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Produto */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-heading font-semibold text-primary">
                {editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-primary/60 hover:text-primary transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="label">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="label">
                  Descrição
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input min-h-[100px]"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price" className="label">
                    Preço Regular (R$) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="label">
                    Categoria *
                  </label>
                  <input
                    type="text"
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="promotional_price" className="label">
                    Preço Promocional (R$)
                  </label>
                  <input
                    type="number"
                    id="promotional_price"
                    value={formData.promotional_price}
                    onChange={(e) => setFormData({ ...formData, promotional_price: e.target.value })}
                    className="input"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label htmlFor="promotion_end_date" className="label">
                    Data de Término da Promoção
                  </label>
                  <input
                    type="datetime-local"
                    id="promotion_end_date"
                    value={formData.promotion_end_date}
                    onChange={(e) => setFormData({ ...formData, promotion_end_date: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="label">Imagens do Produto *</label>
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors
                    ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}
                  `}
                >
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <p className="text-primary">Solte as imagens aqui...</p>
                  ) : (
                    <div>
                      <p className="text-primary/70 mb-2">Arraste imagens aqui ou clique para selecionar</p>
                      <p className="text-xs text-primary/50">Formatos aceitos: JPG, PNG (máx. 5MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;