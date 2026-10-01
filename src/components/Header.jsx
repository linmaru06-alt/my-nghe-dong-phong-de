import React, { useState } from "react";
import { siteConfig } from "../config/site-config";

export function Header({ currentRoute, onNavigate, searchQuery, onSearchChange }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { key: "home", label: "Trang chủ" },
    { key: "products", label: "Sản phẩm" },
    { key: "about", label: "Giới thiệu" },
    { key: "articles", label: "Kiến thức đồ gỗ" },
    { key: "news", label: "Tin tức" },
    { key: "contact", label: "Liên hệ" },
    { key: "admin", label: "Quản trị CMS" }
  ];

  const handleNavClick = (key) => {
    onNavigate(key);
    setMobileMenuOpen(false);
  };

  return (
    <header className="site-header">
      {/* Topbar */}
      <div className="header-topbar">
        <div className="container topbar-content">
          <div className="topbar-badge">
            <span>✨ Tinh hoa gỗ quý truyền thống — Cam kết 100% gỗ tự nhiên</span>
          </div>
          <div className="topbar-contact">
            <span>Tư vấn Hotline: <strong>{siteConfig.hotlineFormatted}</strong></span>
            <a href={siteConfig.zaloUrl} target="_blank" rel="noreferrer">Zalo tư vấn</a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container header-main">
        {/* Brand Logo */}
        <a href="#home" className="brand-logo" onClick={(e) => { e.preventDefault(); handleNavClick("home"); }}>
          <div className="logo-symbol">ĐP</div>
          <div className="logo-text">
            <span className="logo-title">{siteConfig.name}</span>
            <span className="logo-subtitle">Đồ Gỗ Mỹ Nghệ Phong Thủy</span>
          </div>
        </a>

        {/* Navigation Links */}
        <nav className={`site-nav ${mobileMenuOpen ? "open" : ""}`}>
          {navItems.map((item) => (
            <a
              key={item.key}
              href={`#${item.key}`}
              className={`nav-link ${currentRoute === item.key ? "active" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item.key);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Header Search & Hotline */}
        <div className="header-actions">
          <div className="header-search">
            <span className="header-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm sản phẩm, mã SKU..."
              value={searchQuery || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => {
                if (currentRoute !== "products") onNavigate("products");
              }}
            />
          </div>

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}
