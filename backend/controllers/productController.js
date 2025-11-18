import db from '../config/db.js';

export const createProduct = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { business_id, name, price, description, category, taste } = req.body;

    if (!business_id || !name || !price || !category) {
      return res.status(400).json({ message: 'Business ID, name, price, and category are required' });
    }

    // Verify the business belongs to the admin
    const [businessRows] = await db.query('SELECT * FROM business WHERE id = ? AND user_id = ?', [business_id, adminId]);
    if (!businessRows.length) {
      return res.status(403).json({ message: 'Not authorized to add products to this business' });
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    // Parse taste dari string JSON atau array
    let parsedTaste = [];
    if (taste) {
      if (typeof taste === 'string') {
        parsedTaste = JSON.parse(taste);
      } else if (Array.isArray(taste)) {
        parsedTaste = taste;
      }
    }

    const [result] = await db.query(
      `INSERT INTO products (business_id, name, price, description, category, taste, image_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [business_id, name, parseFloat(price), description, category, JSON.stringify(parsedTaste), image_url]
    );

    const [rows] = await db.query(
      `SELECT p.*, b.name as business_name, b.location as business_location 
       FROM products p 
       JOIN business b ON p.business_id = b.id 
       WHERE p.id = ?`,
      [result.insertId]
    );
    
    res.status(201).json({
      message: 'Product created successfully',
      product: rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const adminId = req.user.id;
    const productId = req.params.id;

    const [productRows] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (!productRows.length) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify the business belongs to the admin
    const [businessRows] = await db.query(
      'SELECT * FROM business WHERE id = ? AND user_id = ?', 
      [productRows[0].business_id, adminId]
    );
    
    if (!businessRows.length) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const { name, price, description, category, taste } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : productRows[0].image_url;
    
    // Parse taste
    let parsedTaste = productRows[0].taste;
    if (taste) {
      try {
        if (typeof taste === 'string') {
          parsedTaste = JSON.parse(taste);
        } else if (Array.isArray(taste)) {
          parsedTaste = taste;
        }
      } catch (parseError) {
        console.error('Error parsing taste:', parseError);
        return res.status(400).json({ message: 'Invalid taste format' });
      }
    }

    await db.query(
      `UPDATE products SET name=?, price=?, description=?, category=?, taste=?, image_url=?, updated_at=CURRENT_TIMESTAMP 
       WHERE id=?`,
      [name, parseFloat(price), description, category, JSON.stringify(parsedTaste), image_url, productId]
    );

    const [updatedRows] = await db.query(
      `SELECT p.*, b.name as business_name, b.location as business_location 
       FROM products p 
       JOIN business b ON p.business_id = b.id 
       WHERE p.id = ?`,
      [productId]
    );
    
    res.json({
      message: 'Product updated successfully',
      product: updatedRows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { business_id, category, min_price, max_price, search, location, taste } = req.query;
    
    let query = `
      SELECT p.*, b.name as business_name, b.location as business_location, 
      (SELECT AVG(rating) FROM reviews WHERE business_id = b.id) as business_rating
      FROM products p 
      JOIN business b ON p.business_id = b.id 
      WHERE p.is_available = TRUE
    `;
    const params = [];

    if (business_id) {
      query += ' AND p.business_id = ?';
      params.push(business_id);
    }

    if (category && category !== 'all') {
      query += ' AND p.category = ?';
      params.push(category);
    }

    if (min_price) {
      query += ' AND p.price >= ?';
      params.push(parseFloat(min_price));
    }

    if (max_price) {
      query += ' AND p.price <= ?';
      params.push(parseFloat(max_price));
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ? OR b.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (location && location !== 'all') {
      query += ' AND b.location = ?';
      params.push(location);
    }

    // Filter by taste
    if (taste) {
      const tasteArray = Array.isArray(taste) ? taste : [taste];
      tasteArray.forEach(tasteItem => {
        query += ' AND JSON_SEARCH(p.taste, "one", ?) IS NOT NULL';
        params.push(tasteItem);
      });
    }

    query += ' ORDER BY p.created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProductsByBusiness = async (req, res) => {
  try {
    const businessId = req.params.businessId;
    
    const [rows] = await db.query(
      `SELECT p.*, b.name as business_name 
       FROM products p 
       JOIN business b ON p.business_id = b.id 
       WHERE p.business_id = ? AND p.is_available = TRUE 
       ORDER BY p.created_at DESC`,
      [businessId]
    );
    
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAdminProducts = async (req, res) => {
  try {
    const adminId = req.user.id;
    
    const [rows] = await db.query(
      `SELECT p.*, b.name as business_name 
       FROM products p 
       JOIN business b ON p.business_id = b.id 
       WHERE b.user_id = ? 
       ORDER BY p.created_at DESC`,
      [adminId]
    );
    
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const adminId = req.user.id;
    const productId = req.params.id;

    const [productRows] = await db.query(
      'SELECT p.* FROM products p JOIN business b ON p.business_id = b.id WHERE p.id = ? AND b.user_id = ?',
      [productId, adminId]
    );

    if (!productRows.length) {
      return res.status(404).json({ message: 'Product not found or not authorized' });
    }

    await db.query('DELETE FROM products WHERE id = ?', [productId]);
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};