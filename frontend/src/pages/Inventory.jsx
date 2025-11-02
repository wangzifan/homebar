import { useState, useEffect } from 'react';
import { inventoryApi } from '../services';
import './Inventory.css';

const CATEGORIES = ['spirits', 'liqueurs', 'mixers', 'fruits', 'herbs', 'wine', 'whiskey'];
const UNITS = ['ml', 'oz', 'count', 'bunch', 'bottle'];

function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'spirits',
    quantity: '',
    unit: 'ml',
    expirationDate: '',
    brand: '',
    notes: '',
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryApi.getAll();
      setItems(response.data.items || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'spirits',
      quantity: '',
      unit: 'ml',
      expirationDate: '',
      brand: '',
      notes: '',
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    try {
      const dataToSubmit = {
        ...formData,
        quantity: parseFloat(formData.quantity) || 0,
      };

      if (editingItem) {
        await inventoryApi.update(editingItem.itemId, dataToSubmit);
      } else {
        await inventoryApi.create(dataToSubmit);
      }

      await fetchInventory();
      resetForm();
    } catch (err) {
      console.error('Error saving item:', err);
      alert('Failed to save item. Please try again.');
    }
  };

  const handleEditItem = (item) => {
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit,
      expirationDate: item.expirationDate || '',
      brand: item.brand || '',
      notes: item.notes || '',
    });
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await inventoryApi.delete(itemId);
      await fetchInventory();
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Failed to delete item. Please try again.');
    }
  };

  const isExpiringSoon = (expirationDate) => {
    if (!expirationDate) return false;
    const expDate = new Date(expirationDate);
    const now = new Date();
    const daysUntilExpiration = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 7 && daysUntilExpiration >= 0;
  };

  const isExpired = (expirationDate) => {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="inventory-container">
        <div className="loading">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h1>My Home Bar Inventory</h1>
        <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showAddForm && (
        <div className="add-form-container">
          <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
          <form onSubmit={handleAddItem} className="inventory-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Tanqueray Gin"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="quantity">Quantity *</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="unit">Unit *</label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  required
                >
                  {UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="brand">Brand</label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="Optional"
                />
              </div>

              <div className="form-group">
                <label htmlFor="expirationDate">Expiration Date</label>
                <input
                  type="date"
                  id="expirationDate"
                  name="expirationDate"
                  value={formData.expirationDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="2"
                placeholder="Any additional notes..."
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="inventory-list">
        {Object.keys(groupedItems).length === 0 ? (
          <div className="empty-state">
            <h2>No items in inventory</h2>
            <p>Start by adding your first item!</p>
          </div>
        ) : (
          Object.keys(groupedItems)
            .sort()
            .map((category) => (
              <div key={category} className="category-section">
                <h2 className="category-title">
                  {category.charAt(0).toUpperCase() + category.slice(1)} ({groupedItems[category].length})
                </h2>
                <div className="items-grid">
                  {groupedItems[category].map((item) => (
                    <div
                      key={item.itemId}
                      className={`inventory-item ${isExpired(item.expirationDate) ? 'expired' : ''} ${
                        isExpiringSoon(item.expirationDate) ? 'expiring-soon' : ''
                      }`}
                    >
                      <div className="item-header">
                        <h3 className="item-name">{item.name}</h3>
                        <div className="item-actions">
                          <button
                            className="btn-icon"
                            onClick={() => handleEditItem(item)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => handleDeleteItem(item.itemId)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      <div className="item-details">
                        <p className="item-quantity">
                          {item.quantity} {item.unit}
                        </p>
                        {item.brand && <p className="item-brand">{item.brand}</p>}
                        {item.expirationDate && (
                          <p
                            className={`item-expiration ${
                              isExpired(item.expirationDate)
                                ? 'expired-text'
                                : isExpiringSoon(item.expirationDate)
                                ? 'expiring-text'
                                : ''
                            }`}
                          >
                            {isExpired(item.expirationDate) ? '⚠️ Expired: ' : 'Expires: '}
                            {item.expirationDate}
                          </p>
                        )}
                        {item.notes && <p className="item-notes">{item.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

export default Inventory;
