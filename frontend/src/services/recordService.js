import { api } from "src/boot/axios";

/**
 * Service for record sheets and transactions
 */
export const recordService = {
  /**
   * Get all record sheets for the user
   * @returns {Promise} - API response with record sheets
   */
  async getRecordSheets() {
    const response = await api.get("/record-sheets");
    return response.data;
  },

  /**
   * Create a new record sheet
   * @param {string} name - Record sheet name
   * @param {string} description - Record sheet description
   * @returns {Promise} - API response with the created record sheet
   */
  async createRecordSheet(name, description = "") {
    const response = await api.post("/record-sheets", { name, description });
    return response.data;
  },

  /**
   * Update a record sheet
   * @param {string} id - Record sheet ID
   * @param {string} name - Record sheet name
   * @param {string} description - Record sheet description
   * @returns {Promise} - API response with the updated record sheet
   */
  async updateRecordSheet(id, name, description = "") {
    const response = await api.put(`/record-sheets/${id}`, {
      name,
      description,
    });
    return response.data;
  },

  /**
   * Delete a record sheet
   * @param {string} id - Record sheet ID
   * @returns {Promise} - API response
   */
  async deleteRecordSheet(id) {
    const response = await api.delete(`/record-sheets/${id}`);
    return response.data;
  },

  /**
   * Get all transactions for a record sheet
   * @param {string} recordSheetId - Record sheet ID
   * @returns {Promise} - API response with transactions
   */
  async getTransactions(recordSheetId) {
    const response = await api.get(
      `/transactions/record-sheet/${recordSheetId}`
    );
    return response.data;
  },

  /**
   * Create a new transaction
   * @param {Object} transaction - Transaction object
   * @returns {Promise} - API response with the created transaction
   */
  async createTransaction(transaction) {
    const response = await api.post("/transactions", transaction);
    return response.data;
  },

  /**
   * Update a transaction
   * @param {string} id - Transaction ID
   * @param {Object} transaction - Transaction object
   * @returns {Promise} - API response with the updated transaction
   */
  async updateTransaction(id, transaction) {
    const response = await api.put(`/transactions/${id}`, transaction);
    return response.data;
  },

  /**
   * Delete a transaction
   * @param {string} id - Transaction ID
   * @returns {Promise} - API response
   */
  async deleteTransaction(id) {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  /**
   * Get all categories
   * @returns {Promise} - API response with categories
   */
  async getCategories() {
    const response = await api.get("/categories");
    return response.data;
  },

  /**
   * Create a new category
   * @param {string} label - Category label
   * @returns {Promise} - API response with the created category
   */
  async createCategory(label) {
    const response = await api.post("/categories", { label });
    return response.data;
  },

  /**
   * Update a category
   * @param {string} id - Category ID
   * @param {string} label - Category label
   * @returns {Promise} - API response with the updated category
   */
  async updateCategory(id, label) {
    const response = await api.put(`/categories/${id}`, { label });
    return response.data;
  },

  /**
   * Delete a category
   * @param {string} id - Category ID
   * @returns {Promise} - API response
   */
  async deleteCategory(id) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};
