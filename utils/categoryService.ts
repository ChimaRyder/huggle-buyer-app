import axios from 'axios';

export interface CategoryData {
  [key: string]: string[];
}

export interface CategoryService {
  getAllCategories(): Promise<CategoryData>;
  getSubcategoriesForCategory(category: string): Promise<string[]>;
}

class CategoryServiceImpl implements CategoryService {
  private baseUrl = 'https://huggle-backend-jh2l.onrender.com/api/products';

  async getAllCategories(): Promise<CategoryData> {
    try {
      const response = await axios.get(`${this.baseUrl}/categories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  async getSubcategoriesForCategory(category: string): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/categories/${category}/subcategories`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subcategories for ${category}:`, error);
      throw new Error(`Failed to fetch subcategories for ${category}`);
    }
  }
}

// Export singleton instance
export const categoryService = new CategoryServiceImpl();

// Export types for use in components
export type { CategoryData }; 