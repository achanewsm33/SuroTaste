import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    business_id: location.state?.businessId || '',
    name: '',
    price: '',
    description: '',
    category: 'Makan Siang',
    taste: []
  });
  
  const [business, setBusiness] = useState([]);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const categories = ['Aneka Nasi', 'Aneka Soto', 'Aneka Rawon'];
  const tasteOptions = ['Manis', 'Asin', 'Pedas', 'Gurih', 'Asam'];

  useEffect(() => {
    fetchAdminBusiness();
    if (isEdit) {
      fetchProductData();
    }
  }, [id]);

  const fetchAdminBusiness = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/business/admin', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setBusiness(data);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }
  };

  const fetchProductData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      setFormData({
        business_id: data.business_id || '',
        name: data.name || '',
        price: data.price || '',
        description: data.description || '',
        category: data.category || 'Makan Siang',
        taste: data.taste || []
      });

      if (data.image_url) {
        setImagePreview(`http://localhost:5000${data.image_url}`);
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
      alert('Error loading product data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTasteChange = (taste) => {
    setFormData(prev => ({
      ...prev,
      taste: prev.taste.includes(taste)
        ? prev.taste.filter(t => t !== taste)
        : [...prev.taste, taste]
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const isFormValid = () => {
    return formData.business_id && formData.name && formData.price && formData.category;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'taste') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (image) {
        formDataToSend.append('image', image);
      }

      const url = isEdit 
        ? `http://localhost:5000/api/products/${id}`
        : 'http://localhost:5000/api/products';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const result = await response.json();

      if (response.ok) {
        alert(isEdit ? 'Product updated successfully!' : 'Product created successfully!');
        navigate('/waroeng');
      } else {
        alert(result.message || 'Error submitting form');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md border">
          <div className="px-6 py-4 border-b">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Product' : 'ADD YOUR PRODUCT'}
            </h1>
            <p className="text-gray-600">
              {isEdit ? 'Update your product information' : 'Add new product to your business'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Business Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business <span className="text-red-500">*</span>
              </label>
              <select
                name="business_id"
                required
                value={formData.business_id}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={location.state?.businessId} // Disable if businessId passed from state
              >
                <option value="">Select Business</option>
                {business.map(business => (
                  <option key={business.id} value={business.id}>
                    {business.name} - {business.location}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name Product <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product name"
              />
            </div>

            {/* Category and Taste */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taste
                </label>
                <div className="flex flex-wrap gap-2">
                  {tasteOptions.map(taste => (
                    <button
                      type="button"
                      key={taste}
                      onClick={() => handleTasteChange(taste.toLowerCase())}
                      className={`px-3 py-2 border rounded-lg text-sm transition-colors ${
                        formData.taste.includes(taste.toLowerCase())
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {taste}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {formData.taste.map(taste => (
                    <span key={taste} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {taste}
                      <button
                        type="button"
                        onClick={() => handleTasteChange(taste)}
                        className="ml-1 hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                <input
                  type="number"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter price"
                  min="0"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your product..."
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {imagePreview && (
                  <div className="w-20 h-20">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={() => navigate('/waroeng')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading || !isFormValid()}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  loading || !isFormValid()
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Submit Product')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;