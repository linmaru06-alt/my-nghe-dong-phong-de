"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  Check,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Building2,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Loader2,
  ShoppingBag,
  Globe,
} from "lucide-react";
import { useSettingsStore } from "@/lib/useSettings";
import { toast } from "@/components/ui/Toast";

export default function AdminSettingsPage() {
  const { settings, loadSettings, updateSettings } = useSettingsStore();

  const [formData, setFormData] = useState({
    siteName: "",
    phone: "",
    zaloLink: "",
    facebookLink: "",
    shopeeLink: "",
    address: "",
    businessHours: "",
    email: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form Đổi Mật Khẩu
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (settings) {
      setFormData({
        siteName: settings.brand?.name || settings.siteName || "",
        phone: settings.brand?.phone || settings.hotline || "",
        zaloLink: settings.brand?.zaloLink || settings.zaloLink || "",
        facebookLink:
          settings.brand?.facebook ||
          settings.facebook ||
          settings.socialLinks?.facebook ||
          "",
        shopeeLink:
          settings.brand?.shopeeLink ||
          settings.shopeeLink ||
          settings.socialLinks?.shopee ||
          "",
        address: settings.brand?.address || settings.address || "",
        businessHours: settings.brand?.businessHours || settings.workingHours || "",
        email: settings.email || "",
      });
    }
  }, [settings]);

  const handleSubmitSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const success = await updateSettings(formData);
      if (success) {
        setSaved(true);
        toast.success(
          "Đã lưu cài đặt thành công!",
          "Thông tin hotline, Zalo và liên hệ đã được đồng bộ vào data/settings.json."
        );
        setTimeout(() => setSaved(false), 2500);
      } else {
        throw new Error("Không thể ghi file cài đặt vào máy chủ");
      }
    } catch (err: any) {
      toast.error("Lỗi khi lưu cài đặt", err.message || "Vui lòng thử lại sau.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Mật khẩu mới và mật khẩu xác nhận không khớp nhau.");
      toast.error("Lỗi đổi mật khẩu", "Mật khẩu xác nhận không khớp.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có tối thiểu 6 ký tự.");
      toast.error("Lỗi đổi mật khẩu", "Mật khẩu mới quá ngắn.");
      return;
    }

    setIsChangingPassword(true);

    try {
      const res = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không thể đổi mật khẩu.");
      }

      toast.success(
        "Đổi mật khẩu thành công!",
        "Mật khẩu tài khoản quản trị viên mới đã được lưu an toàn."
      );
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setPasswordError(err.message);
      toast.error("Đổi mật khẩu thất bại", err.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl pb-12">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary">
          Cài Đặt Hệ Thống Và Liên Hệ
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Cập nhật thông tin hotline, đường dẫn Zalo tư vấn, địa chỉ xưởng và bảo mật tài khoản.
        </p>
      </div>

      {/* 1. Form Cài Đặt Hệ Thống & Liên Hệ */}
      <form onSubmit={handleSubmitSettings} className="space-y-6">
        <div className="bg-surface p-6 md:p-8 rounded-card border border-border shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <Building2 className="w-5 h-5 text-accent-gold" />
            <h2 className="font-serif text-base font-bold text-primary">
              Thông Tin Doanh Nghiệp Và Hotline Tư Vấn
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text uppercase tracking-wider block mb-1.5">
                Tên thương hiệu *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.siteName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, siteName: e.target.value }))
                  }
                  className="w-full bg-bg border border-border rounded-btn px-3.5 py-2 text-sm text-text focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text uppercase tracking-wider block mb-1.5">
                Hotline điện thoại tư vấn *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="096 8888 972"
                  className="w-full font-mono bg-bg border border-border rounded-btn px-3.5 py-2 text-sm text-text focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text uppercase tracking-wider block mb-1.5">
                Đường dẫn Zalo OA / Zalo cá nhân *
              </label>
              <div className="relative">
                <MessageCircle className="w-4 h-4 text-text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={formData.zaloLink}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, zaloLink: e.target.value }))
                  }
                  placeholder="https://zalo.me/0968888972"
                  className="w-full bg-bg border border-border rounded-btn px-3.5 py-2 text-sm text-text focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text uppercase tracking-wider block mb-1.5">
                Email liên hệ
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="lienhe@mynghedongphong.vn"
                  className="w-full bg-bg border border-border rounded-btn px-3.5 py-2 text-sm text-text focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text uppercase tracking-wider block mb-1.5">
                Đường dẫn Facebook (Fanpage / Trang cá nhân)
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={formData.facebookLink}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, facebookLink: e.target.value }))
                  }
                  placeholder="https://www.facebook.com/phong.nk.12"
                  className="w-full bg-bg border border-border rounded-btn px-3.5 py-2 text-sm text-text focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text uppercase tracking-wider block mb-1.5">
                Đường dẫn Gian hàng Shopee
              </label>
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={formData.shopeeLink}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, shopeeLink: e.target.value }))
                  }
                  placeholder="https://vn.shp.ee/JdnPvA3B"
                  className="w-full bg-bg border border-border rounded-btn px-3.5 py-2 text-sm text-text focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text uppercase tracking-wider block mb-1.5">
              Địa chỉ xưởng mộc truyền thống *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                className="w-full bg-bg border border-border rounded-btn px-3.5 py-2 text-sm text-text focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text uppercase tracking-wider block mb-1.5">
              Giờ làm việc xưởng gỗ
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={formData.businessHours}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, businessHours: e.target.value }))
                }
                placeholder="08:00 - 21:00 (Hàng ngày, kể cả T7 và CN)"
                className="w-full bg-bg border border-border rounded-btn px-3.5 py-2 text-sm text-text focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-btn text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang lưu vào máy chủ...</span>
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4 text-accent-gold" />
                <span>Đã lưu thành công!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu thay đổi cài đặt</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* 2. Form Bảo Mật & Đổi Mật Khẩu Quản Trị Viên */}
      <div className="bg-surface p-6 md:p-8 rounded-card border border-border shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-accent-gold" />
            <div>
              <h2 className="font-serif text-base font-bold text-primary">
                Bảo Mật Tài Khoản Và Đổi Mật Khẩu Quản Trị
              </h2>
              <p className="text-[11px] text-text-muted mt-0.5">
                Tài khoản mặc định: <span className="font-mono font-semibold text-text">admin@dongphong.vn</span>
              </p>
            </div>
          </div>
        </div>

        {passwordError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-text uppercase tracking-wider block mb-1.5">
                Mật khẩu hiện tại *
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
                placeholder="Nhập mật khẩu cũ..."
                className="w-full bg-bg border border-border rounded-btn px-3.5 py-2 text-sm text-text focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text uppercase tracking-wider block mb-1.5">
                Mật khẩu mới *
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                placeholder="Ít nhất 6 ký tự..."
                className="w-full bg-bg border border-border rounded-btn px-3.5 py-2 text-sm text-text focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text uppercase tracking-wider block mb-1.5">
                Xác nhận mật khẩu mới *
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                placeholder="Gõ lại mật khẩu mới..."
                className="w-full bg-bg border border-border rounded-btn px-3.5 py-2 text-sm text-text focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}</span>
            </button>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="inline-flex items-center gap-2 bg-accent-gold hover:bg-[#b08d48] text-[#1F1610] px-5 py-2 rounded-btn text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang cập nhật...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Cập nhật mật khẩu mới</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
