import React, { useEffect } from "react";
import { useProductStore } from "../stores/useProductStore";
import { useParams } from "react-router-dom";


const CategoryPage = () => {
  const { fetchProductsByCategory, products } = useProductStore();

  const { category } = useParams();

  useEffect(() => {
    fetchProductsByCategory(category);
  }, [fetchProductsByCategory, category]);

  console.log("products:", products);

  return <div>Category</div>;
};

export default CategoryPage;
