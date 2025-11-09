import { useState, useEffect } from 'react';
import { inventoryApi } from '../services';
import { useAuth } from '../contexts/AuthContext';
import './Inventory.css';

const CATEGORIES = ['spirits', 'liqueurs', 'mixers', 'fruits', 'herbs', 'wine', 'whiskey', 'beer', 'sake'];

function Inventory() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingToCategory, setAddingToCategory] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'spirits',
    brand: '',
  });

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
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
      brand: '',
    });
    setEditingItemId(null);
    setShowAddForm(false);
    setAddingToCategory(null);
  };

  const handleOpenAddForm = (category) => {
    setFormData({
      name: '',
      category: category,
      brand: '',
    });
    setAddingToCategory(category);
    setShowAddForm(true);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    try {
      await inventoryApi.create(formData);
      await fetchInventory();
      resetForm();
    } catch (err) {
      console.error('Error saving item:', err);
      alert('Failed to save item. Please try again.');
    }
  };

  const handleStartEdit = (item) => {
    setEditingItemId(item.itemId);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
  };

  const handleSaveEdit = async (itemId, updatedData) => {
    try {
      await inventoryApi.update(itemId, updatedData);
      await fetchInventory();
      setEditingItemId(null);
    } catch (err) {
      console.error('Error updating item:', err);
      alert('Failed to update item. Please try again.');
    }
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
      {error && <div className="error-message">{error}</div>}

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
                <div className="category-header-row">
                  <h2 className="category-title">
                    {category.charAt(0).toUpperCase() + category.slice(1)} ({groupedItems[category].length})
                  </h2>
                  {isAuthenticated && (
                    <button
                      className="btn-add-small"
                      onClick={() => handleOpenAddForm(category)}
                    >
                      + Add Item
                    </button>
                  )}
                </div>

                {showAddForm && addingToCategory === category && (
                  <div className="add-form-container">
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

                      <div className="form-actions">
                        <button type="submit" className="btn-primary">
                          Add Item
                        </button>
                        <button type="button" className="btn-secondary" onClick={resetForm}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="items-grid">
                  {[...groupedItems[category]]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((item) => (
                      <InventoryItemCard
                        key={item.itemId}
                        item={item}
                        isEditing={editingItemId === item.itemId}
                        isAuthenticated={isAuthenticated}
                        onStartEdit={() => handleStartEdit(item)}
                        onCancelEdit={handleCancelEdit}
                        onSave={handleSaveEdit}
                        onDelete={handleDeleteItem}
                      />
                    ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

// Inline editable inventory item card
function InventoryItemCard({ item, isEditing, isAuthenticated, onStartEdit, onCancelEdit, onSave, onDelete }) {
  const [editData, setEditData] = useState({
    name: item.name,
    category: item.category,
    brand: item.brand || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(item.itemId, editData);
  };

  if (isEditing) {
    return (
      <div className="inventory-item editing">
        <div className="inline-edit-row">
          <input
            type="text"
            name="name"
            value={editData.name}
            onChange={handleChange}
            placeholder="Name"
            className="edit-input"
          />
          <input
            type="text"
            name="brand"
            value={editData.brand}
            onChange={handleChange}
            placeholder="Brand"
            className="edit-input"
          />
          <select name="category" value={editData.category} onChange={handleChange} className="edit-select">
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <div className="inline-edit-actions">
            <button className="btn-icon" onClick={handleSave} title="Save">✅</button>
            <button className="btn-icon" onClick={onCancelEdit} title="Cancel">❌</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-item">
      <div className="item-row">
        <span className="item-name">{item.name}</span>
        <span className="item-brand">{item.brand || '—'}</span>
        {isAuthenticated && (
          <div className="item-actions">
            <button className="btn-icon" onClick={onStartEdit} title="Edit">✏️</button>
            <button className="btn-icon" onClick={() => onDelete(item.itemId)} title="Delete">🗑️</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Inventory;
