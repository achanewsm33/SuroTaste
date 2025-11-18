import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { businessAPI } from '/src/utils/api';


const BusinessForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    description: '',
    location: '',
    opening_hours: '',
    category: 'Warung',
    price_range: 'Sedang'
  });
  
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const locations = ['Surabaya Barat', 'Surabaya Timur', 'Surabaya Pusat', 'Surabaya Utara', 'Surabaya Selatan'];
  const categories = ['Warung', 'Restoran', 'Street Food', 'Kedai', 'Rumah Makan'];
  const priceRanges = ['Murah', 'Sedang', 'Mahal'];

  useEffect(() => {
    if (isEdit) {
      fetchBusinessData();
    }
  }, [id]);

  const fetchBusinessData = async () => {
    try {
      const data = await businessAPI.getDetail(id);
      
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        address: data.address || '',
        description: data.description || '',
        location: data.location || '',
        opening_hours: data.opening_hours || '',
        category: data.category || 'Warung',
        price_range: data.price_range || 'Sedang'
      });

      if (data.image_url) {
        setImagePreview(`http://localhost:5000${data.image_url}`);
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
      alert('Error loading business data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    return formData.name && formData.address && formData.location && formData.category && formData.price_range;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      if (image) {
        formDataToSend.append('image', image);
      }

      let result;
      if (isEdit) {
        result = await businessAPI.update(id, formDataToSend);
      } else {
        result = await businessAPI.create(formDataToSend);
      }

      if (isEdit) {
        alert('Business updated successfully!');
        navigate('/waroeng');
      } else {
        alert('Business created successfully! Now you can add products.');
        navigate('/waroeng/product/new', { 
          state: { businessId: result.business.id } 
        });
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Error submitting form');
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
              {isEdit ? 'Edit Business' : 'Add Your Business'}
            </h1>
            <p className="text-gray-600">
              {isEdit ? 'Update your business information' : 'Register your food business to start adding products'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter business name"
              />
            </div>

            {/* Phone and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <select
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Location</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                required
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter complete address"
              />
            </div>

            {/* Category and Price Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
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
                  Price Range <span className="text-red-500">*</span>
                </label>
                <select
                  name="price_range"
                  required
                  value={formData.price_range}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {priceRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Opening Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opening Hours
              </label>
              <input
                type="text"
                name="opening_hours"
                value={formData.opening_hours}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 08:00 - 22:00"
              />
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
                placeholder="Describe your business..."
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Image
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
                {loading ? 'Saving...' : (isEdit ? 'Update Business' : 'Next → Add Products')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BusinessForm;