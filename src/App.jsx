import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { FloatingContact } from "./components/FloatingContact";

import { Home } from "./_pages/Home";
import { Catalog } from "./_pages/Catalog";
import { ProductDetail } from "./_pages/ProductDetail";
import { About } from "./_pages/About";
import { Articles } from "./_pages/Articles";
import { News } from "./_pages/News";
import { ArticleDetail } from "./_pages/ArticleDetail";
import { Contact } from "./_pages/Contact";
import { Admin } from "./_pages/Admin";

import { storage } from "./data/storage-adapter";
import { updateMetaTags } from "./utils/seo";

export function App() {
  // Navigation Route
  const [currentRoute, setCurrentRoute] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Storage Data
  const [products, setProducts] = useState(() => storage.getProducts({ includeDrafts: false }));
  const [articles, setArticles] = useState(() => storage.getArticles({ includeDrafts: false }));

  // Refresh data khi Admin thay đổi trạng thái hoặc thêm sửa
  const handleDataChange = () => {
    setProducts(storage.getProducts({ includeDrafts: false }));
    setArticles(storage.getArticles({ includeDrafts: false }));
  };

  // Điều hướng
  const navigateTo = (route) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Xem chi tiết danh mục từ trang chủ hoặc footer
  const handleNavigateCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    navigateTo("products");
  };

  // Xem chi tiết sản phẩm
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setCurrentRoute("product-detail");
  };

  // Xem chi tiết bài viết
  const handleSelectArticle = (article) => {
    setSelectedArticle(article);
    setCurrentRoute("article-detail");
  };

  // Cập nhật SEO động theo trang
  useEffect(() => {
    switch (currentRoute) {
      case "home":
        updateMetaTags({
          title: "Mỹ Nghệ Đông Phong — Đồ Gỗ Quý Mỹ Nghệ & Quà Tặng Phong Thủy",
          description: "Chuyên chế tác mộc thủ công từ gỗ quý: Tử Đàn, Sưa, Nu Bách Xanh, Huyết Long, Mun Sừng, Hoàng Đàn. Cam kết 100% gỗ thật, tư vấn Zalo & Hotline."
        });
        break;
      case "products":
        updateMetaTags({
          title: "Danh Mục Tác Phẩm Gỗ Quý",
          description: "20 tác phẩm gỗ tuyển chọn: vòng tay, bút ký, bi lăn tay dưỡng sinh, gối gỗ, tẩu thuốc, đũa gỗ và đệm ô tô."
        });
        break;
      case "product-detail":
        if (selectedProduct) {
          updateMetaTags({
            title: `${selectedProduct.name} (Mã: ${selectedProduct.sku})`,
            description: selectedProduct.shortDesc
          });
        }
        break;
      case "about":
        updateMetaTags({
          title: "Giới Thiệu Thương Hiệu Mỹ Nghệ Đông Phong",
          description: "Khám phá câu chuyện nghề mộc truyền thống, đam mê các dòng gỗ quý tự nhiên và tôn chỉ gìn giữ vẻ đẹp thuần mộc."
        });
        break;
      case "articles":
        updateMetaTags({
          title: "Kiến Thức & Cẩm Nang Đồ Gỗ Mỹ Nghệ",
          description: "Tổng hợp kiến thức nhận biết nu gỗ, kinh nghiệm chọn kích thước hạt vòng tay phong thủy và hướng dẫn bảo quản đồ gỗ mộc."
        });
        break;
      case "article-detail":
        if (selectedArticle) {
          updateMetaTags({
            title: selectedArticle.title,
            description: selectedArticle.excerpt
          });
        }
        break;
      case "contact":
        updateMetaTags({
          title: "Liên Hệ & Tư Vấn Đồ Gỗ",
          description: "Liên hệ Hotline hoặc Zalo Mỹ Nghệ Đông Phong để được tư vấn kích thước và nhận video xem vân gỗ thật."
        });
        break;
      case "admin":
        updateMetaTags({
          title: "Quản Trị Hệ Thống CMS",
          description: "Bảng điều khiển quản lý sản phẩm và bài viết Mỹ Nghệ Đông Phong."
        });
        break;
      default:
        break;
    }
  }, [currentRoute, selectedProduct, selectedArticle]);

  return (
    <div className="site-wrapper" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Header
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (currentRoute !== "products") navigateTo("products");
        }}
      />

      {/* Main Content View */}
      <main style={{ flexGrow: 1 }}>
        {currentRoute === "home" && (
          <Home
            products={products}
            articles={articles}
            onNavigateCategory={handleNavigateCategory}
            onSelectProduct={handleSelectProduct}
            onNavigateArticle={handleSelectArticle}
            onNavigate={navigateTo}
          />
        )}

        {currentRoute === "products" && (
          <Catalog
            products={products}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onSelectProduct={handleSelectProduct}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {currentRoute === "product-detail" && selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            allProducts={products}
            onSelectProduct={handleSelectProduct}
            onBackToCatalog={() => navigateTo("products")}
          />
        )}

        {currentRoute === "about" && (
          <About onNavigate={navigateTo} />
        )}

        {currentRoute === "articles" && (
          <Articles
            articles={articles}
            onSelectArticle={handleSelectArticle}
          />
        )}

        {currentRoute === "news" && (
          <News
            articles={articles}
            onSelectArticle={handleSelectArticle}
          />
        )}

        {currentRoute === "article-detail" && selectedArticle && (
          <ArticleDetail
            article={selectedArticle}
            allProducts={products}
            onBack={() => navigateTo("articles")}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentRoute === "contact" && (
          <Contact />
        )}

        {currentRoute === "admin" && (
          <Admin onDataChange={handleDataChange} />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigateCategory={handleNavigateCategory}
        onNavigate={navigateTo}
      />

      {/* Floating Zalo + Hotline consultation buttons */}
      <FloatingContact
        currentProduct={currentRoute === "product-detail" ? selectedProduct : null}
      />
    </div>
  );
}

export default App;
