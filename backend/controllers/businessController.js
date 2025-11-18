import db from '../config/db.js';

export const createBusiness = async (req, res) => {
  try {
    const adminId = req.user.id;
    
    console.log('Creating business for admin:', adminId);
    console.log('Request body:', req.body);
    console.log('File:', req.file);

    const { name, phone, address, description, location, opening_hours, category, price_range } = req.body;
    
    // Validasi required fields
    if (!name || !address || !location || !category || !price_range) {
      return res.status(400).json({ 
        message: 'Name, address, location, category, and price range are required' 
      });
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    // Insert business
    const [result] = await db.query(
      `INSERT INTO business (user_id, name, phone, address, description, location, opening_hours, category, price_range, image_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [adminId, name, phone, address, description, location, opening_hours, category, price_range, image_url]
    );

    console.log('Business inserted with ID:', result.insertId);

    // Get created business dengan join
    const [businessRows] = await db.query(
      `SELECT b.*, 
       (SELECT COUNT(*) FROM products p WHERE p.business_id = b.id) as product_count,
       (SELECT AVG(rating) FROM reviews WHERE business_id = b.id) as rating
       FROM business b 
       WHERE b.id = ?`,
      [result.insertId]
    );
    
    if (businessRows.length === 0) {
      return res.status(500).json({ message: 'Failed to retrieve created business' });
    }

    res.status(201).json({
      message: 'Business created successfully',
      business: businessRows[0]
    });
  } catch (error) {
    console.error('Error creating business:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateBusiness = async (req, res) => {
  try {
    const adminId = req.user.id;
    const businessId = req.params.id;

    console.log('Updating business:', businessId, 'for admin:', adminId);

    const [businessRows] = await db.query('SELECT * FROM business WHERE id = ?', [businessId]);
    if (businessRows.length === 0) {
      return res.status(404).json({ message: 'Business not found' });
    }

    if (businessRows[0].user_id !== adminId) {
      return res.status(403).json({ message: 'Not authorized to update this business' });
    }

    const { name, phone, address, description, location, opening_hours, category, price_range } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : businessRows[0].image_url;

    await db.query(
      `UPDATE business SET name=?, phone=?, address=?, description=?, location=?, opening_hours=?, category=?, price_range=?, image_url=?, updated_at=CURRENT_TIMESTAMP 
       WHERE id=?`,
      [name, phone, address, description, location, opening_hours, category, price_range, image_url, businessId]
    );

    const [updatedRows] = await db.query(
      `SELECT b.*, 
       (SELECT COUNT(*) FROM products p WHERE p.business_id = b.id) as product_count,
       (SELECT AVG(rating) FROM reviews WHERE business_id = b.id) as rating
       FROM business b 
       WHERE b.id = ?`,
      [businessId]
    );
    
    res.json({
      message: 'Business updated successfully',
      business: updatedRows[0]
    });
  } catch (error) {
    console.error('Error updating business:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getBusiness = async (req, res) => {
  try {
    const { location, category, price_range, rating, search } = req.query;
    
    let query = `
      SELECT b.*,
      (SELECT COUNT(*) FROM products p WHERE p.business_id = b.id) as product_count,
      (SELECT AVG(rating) FROM reviews WHERE business_id = b.id) as rating
      FROM business b 
      WHERE 1=1
    `;
    const params = [];

    if (location && location !== 'all') {
      query += ' AND b.location = ?';
      params.push(location);
    }

    if (category && category !== 'all') {
      query += ' AND b.category = ?';
      params.push(category);
    }

    if (price_range && price_range !== 'all') {
      query += ' AND b.price_range = ?';
      params.push(price_range);
    }

    if (rating) {
      query += ' AND (SELECT AVG(rating) FROM reviews WHERE business_id = b.id) >= ?';
      params.push(parseFloat(rating));
    }

    if (search) {
      query += ' AND (b.name LIKE ? OR b.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY b.created_at DESC';

    console.log('Business query:', query, params);

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getBusinessDetail = async (req, res) => {
  try {
    const businessId = req.params.id;
    
    const [businessRows] = await db.query(
      `SELECT b.*,
       (SELECT AVG(rating) FROM reviews WHERE business_id = b.id) as rating,
       (SELECT COUNT(*) FROM reviews WHERE business_id = b.id) as review_count
       FROM business b 
       WHERE b.id = ?`,
      [businessId]
    );
    
    if (businessRows.length === 0) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json(businessRows[0]);
  } catch (error) {
    console.error('Error fetching business detail:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getAdminBusiness = async (req, res) => {
  try {
    const adminId = req.user.id;
    
    console.log('Fetching businesses for admin:', adminId);
    console.log('User role:', req.user.role); // ✅ Tambahkan log role

     let rows;
    try {
      [rows] = await db.query(
        `SELECT b.*, 
         (SELECT COUNT(*) FROM products p WHERE p.business_id = b.id) as product_count,
         (SELECT AVG(rating) FROM reviews WHERE business_id = b.id) as rating
         FROM business b 
         WHERE b.user_id = ? 
         ORDER BY b.created_at DESC`,
        [adminId]
      );
    } catch (dbError) {
      console.error('Database query error:', dbError);
      
      // ✅ Fallback query jika ada masalah dengan subqueries
      [rows] = await db.query(
        `SELECT b.*, 0 as product_count, 0 as rating
         FROM business b 
         WHERE b.user_id = ? 
         ORDER BY b.created_at DESC`,
        [adminId]
      );
    }
    
    console.log(`Found ${rows.length} businesses for admin ${adminId}`);
    res.json(rows);
  } catch (error) {
    console.error('Error in getAdminBusiness:', error);
    res.status(500).json({ 
      message: 'Server error while fetching your business',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteBusiness = async (req, res) => {
  try {
    const adminId = req.user.id;
    const businessId = req.params.id;

    const [businessRows] = await db.query('SELECT * FROM business WHERE id = ? AND user_id = ?', [businessId, adminId]);
    if (businessRows.length === 0) {
      return res.status(404).json({ message: 'Business not found or not authorized' });
    }

    await db.query('DELETE FROM business WHERE id = ?', [businessId]);
    
    res.json({ message: 'Business deleted successfully' });
  } catch (error) {
    console.error('Error deleting business:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};