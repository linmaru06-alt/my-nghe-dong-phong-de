import React, { useState } from "react";
import { formatDateVi } from "../utils/formatters";

export function News({ articles, onSelectArticle }) {
  // Lọc chỉ lấy các bài viết có group là "tin-tuc" và đã được published
  const newsArticles = articles.filter(a => a.status === "published" && a.group === "tin-tuc");

  return (
    <div className="page-articles" style={{ padding: "40px 0 80px 0" }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span className="section-subtitle">Cập Nhật Xu Hướng</span>
          <h1 className="section-title">Tin Tức Ngành Mộc & Nội Thất</h1>
          <p style={{ maxWidth: "600px", margin: "0 auto" }}>
            Tổng hợp tự động bằng công nghệ AI các tin tức mới nhất về kiến trúc, nội thất, nghệ thuật mộc và phong thủy đời sống.
          </p>
        </div>

        {newsArticles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            Hiện chưa có tin tức nào được duyệt đăng. Vui lòng kiểm tra mục Quản trị CMS.
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "30px"
          }}>
            {newsArticles.map(article => (
              <article
                key={article.id}
                style={{
                  background: "var(--bg-surface)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  transition: "all var(--transition-normal)",
                  boxShadow: "var(--shadow-sm)"
                }}
                onClick={() => onSelectArticle(article)}
              >
                <div style={{ padding: "24px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "var(--gold-dark)",
                      textTransform: "uppercase"
                    }}>
                      {article.groupName}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {formatDateVi(article.publishedAt)}
                    </span>
                  </div>

                  <h2 style={{ fontSize: "1.2rem", lineHeight: 1.4, marginBottom: "12px", color: "var(--wood-deep)" }}>
                    {article.title}
                  </h2>

                  <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.6, flexGrow: 1, marginBottom: "20px" }}>
                    {article.excerpt}
                  </p>

                  <div style={{
                    paddingTop: "14px",
                    borderTop: "1px solid var(--border-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    color: "var(--wood-warm)"
                  }}>
                    <span>Đọc chi tiết bài viết</span>
                    <span>→</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
