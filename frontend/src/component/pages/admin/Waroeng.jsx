import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Waroeng = () => {
  const navigate = useNavigate();
  const [business, setBusiness] = useState([]);
  const [stats, setStats] = useState({ totalBusiness: 0, totalProducts: 0, activeBusiness: 0, popularBusiness: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedBusiness, setExpandedBusiness] = useState(null);
  const [products, setProducts] = useState({});
  const [authMissing, setAuthMissing] = useState(false);

  useEffect(() => {
    fetchBusiness();
  }, []);

  const fetchBusiness = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token in localStorage, skipping fetchBusiness');
        setBusiness([]);
        setAuthMissing(true); // tampilkan pesan di UI
        return;
      }

      const baseUrl = process.env.VITE_API_BASE || 'http://localhost:5000/api';
      const url = `${baseUrl}/business/my-business`;
      console.log("Calling:", url);

      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });


        let data;
        try {
          data = await res.json();
        } catch {
          data = { raw: await res.text() };
        }

      if (!res.ok) {
        const msg = (data && data.message) || data.raw || res.statusText || `HTTP ${res.status}`;
        console.error('Error from API:', msg);
        return
      }
        console.log('Fetch business:', data);

        setBusiness([]);
        // jika token invalid/expired, redirect ke login
        if (res.status === 401) {
          setAuthMissing(true);
          // optionally navigate to login: navigate('/login');
        }
          return;
        }catch (err) {
          console.err("Network error:", err)
        }

      
      const data = await res.json();
      console.log('Fetch business:', data);
      const safeData = Array.isArray(data) ? data : [];
      setBusiness(safeData);

      // update stats
      const totalProducts = safeData.reduce((sum, b) => sum + (Number(b.product_count) || 0), 0);
      const activeBusiness = safeData.filter(b => Number(b.product_count) > 0).length;
      const popularBusiness = safeData.filter(b => Number(b.rating) >= 4.0).length;
      setStats({ totalBusiness: safeData.length, totalProducts, activeBusiness, popularBusiness });
    } catch (err) {
      console.error('Network or parsing error:', err);
      setBusiness([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBusinessClick = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      // jika belum login, arahkan ke halaman login
      navigate('/login');
      return;
    }
    navigate('/waroeng/business/new');
  };


  const fetchProductsByBusiness = async (businessId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/business/${businessId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setProducts(prev => ({
        ...prev,
        [businessId]: data
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleToggleExpand = async (businessId) => {
    if (expandedBusiness === businessId) {
      setExpandedBusiness(null);
    } else {
      setExpandedBusiness(businessId);
      if (!products[businessId]) {
        await fetchProductsByBusiness(businessId);
      }
    }
  };

  const handleDeleteProduct = async (productId, businessId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Refresh products list
        await fetchProductsByBusiness(businessId);
        alert('Product deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const getStatusBadge = (productCount, rating) => {
    if (productCount === 0) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">No Products</span>;
    }
    if (rating >= 4.0) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Popular</span>;
    }
    return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Active</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Waroeng Dashboard</h1>
              <p className="text-gray-600">Manage your food businesses and products</p>
            </div>
            <div className="flex space-x-3">
              <button onClick={handleAddBusinessClick} 
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center">

                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Business
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Businesses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBusiness}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Businesses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeBusiness}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Popular Business</p>
                <p className="text-2xl font-bold text-gray-900">{stats.popularBusiness}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Table Header */}
          <div className="px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Business Management</h2>
                <p className="text-sm text-gray-600">Manage all your food businesses and their products</p>
              </div>
              <div className="flex space-x-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Range</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {business.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="text-gray-400 mb-3">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No Business Found</h3>
                      <p className="text-gray-500 mb-4">Start by registering your first food business</p>
                      <button onClick={handleAddBusinessClick} 
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center">

                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Register First Business
                      </button>
                    </td>
                  </tr>
                ) : (
                  business.map((business) => (
                    <React.Fragment key={business.id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        {/* Business Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex shrink-0 h-12 w-12">
                              {business.image_url ? (
                                <img 
                                  className="h-12 w-12 rounded-lg object-cover" 
                                  src={`http://localhost:5000${business.image_url}`} 
                                  alt={business.name}
                                />
                              ) : (
                                <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <span className="text-gray-500 text-xs">No Image</span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{business.name}</div>
                              <div className="text-sm text-gray-500">{business.phone}</div>
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{business.location}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{business.address}</div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            {business.category}
                          </span>
                        </td>

                        {/* Products Count */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                            {business.product_count || 0}
                          </span>
                        </td>

                        {/* Rating */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {business.rating ? (
                            <div className="flex items-center">
                              <span className="text-yellow-500 mr-1">⭐</span>
                              <span>{parseFloat(business.rating).toFixed(1)}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">No ratings</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(business.product_count, business.rating)}
                        </td>

                        {/* Price Range */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`font-semibold ${
                            business.price_range === 'Murah' ? 'text-green-600' :
                            business.price_range === 'Sedang' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {business.price_range}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              to={`/waroeng/business/${business.id}/edit`}
                              className="text-yellow-600 hover:text-yellow-900 bg-yellow-50 hover:bg-yellow-100 px-3 py-1 rounded text-sm transition-colors"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleToggleExpand(business.id)}
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded text-sm transition-colors"
                            >
                              {expandedBusiness === business.id ? 'Hide' : 'View Detail'}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Products Section */}
                      {expandedBusiness === business.id && (
                        <tr>
                          <td colSpan="8" className="px-6 py-4 bg-gray-50">
                            <div className="bg-white rounded-lg border p-6">
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Products at {business.name}</h3>
                                <Link
                                  to="/waroeng/product/new"
                                  state={{ businessId: business.id }}
                                  className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600 transition-colors flex items-center"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  Add Product
                                </Link>
                              </div>

                              {products[business.id] && products[business.id].length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="w-full">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Taste</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {products[business.id].map(product => (
                                        <tr key={product.id} className="border-b hover:bg-gray-50">
                                          <td className="px-4 py-3">
                                            <div className="flex items-center">
                                              {product.image_url ? (
                                                <img 
                                                  src={`http://localhost:5000${product.image_url}`} 
                                                  alt={product.name}
                                                  className="w-10 h-10 rounded-lg object-cover mr-3"
                                                />
                                              ) : (
                                                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                                                  <span className="text-gray-500 text-xs">No Image</span>
                                                </div>
                                              )}
                                              <div>
                                                <div className="font-medium text-gray-900">{product.name}</div>
                                                <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                                              </div>
                                            </div>
                                          </td>
                                          <td className="px-4 py-3">
                                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                              {product.category}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                              {product.taste && Array.isArray(product.taste) && product.taste.map(taste => (
                                                <span key={taste} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                                  {taste}
                                                </span>
                                              ))}
                                            </div>
                                          </td>
                                          <td className="px-4 py-3 font-semibold text-blue-600">
                                            Rp {product.price.toLocaleString()}
                                          </td>
                                          <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-1 rounded ${
                                              product.is_available 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                              {product.is_available ? 'Available' : 'Unavailable'}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3">
                                            <div className="flex space-x-2">
                                              <Link
                                                to={`/waroeng/product/${product.id}/edit`}
                                                className="text-yellow-600 hover:text-yellow-800 text-sm"
                                              >
                                                Edit
                                              </Link>
                                              <button
                                                onClick={() => handleDeleteProduct(product.id, business.id)}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                              >
                                                Delete
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                  <div className="text-gray-400 mb-3">
                                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                  <h4 className="text-lg font-semibold text-gray-600 mb-2">No Products Yet</h4>
                                  <p className="text-gray-500 mb-4">Add your first product to this business</p>
                                  <Link
                                    to="/waroeng/product/new"
                                    state={{ businessId: business.id }}
                                    className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600 transition-colors inline-flex items-center"
                                  >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add First Product
                                  </Link>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Stats */}
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Total business: <span className="font-semibold">{stats.totalBusiness}</span> • 
                Current active: <span className="font-semibold text-green-600">{stats.activeBusiness}</span>
              </div>
              <div className="text-sm text-gray-600">
                Products total: <span className="font-semibold">{stats.totalProducts}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Waroeng;