import fs from "fs";
import path from "path";

const PILLARS_FILE = path.join(process.cwd(), "data", "content-pillars.json");
const data = JSON.parse(fs.readFileSync(PILLARS_FILE, "utf-8"));

const newTitles = [
  // 0 - 11: Mệnh Kim
  "Người Mệnh Kim Đeo Vòng Gỗ Gì Tốt Nhất? Sự Thật 'Kim Khắc Mộc' & Bí Quyết Chọn Đúng Danh Mộc",
  "Vòng Gỗ Hoàng Đàn Có Tác Dụng Gì Cho Người Mệnh Kim? Sự Thật Về Lớp Tuyết Tự Nhiên & Giá Trị Hộ Mệnh",
  "Tuổi Nhâm Thân 1992 & Quý Dậu 1993 Đeo Vòng Gỗ Gì? Bí Quyết Khai Mở Vận Khí Cho Kiếm Phong Kim",
  "Tuổi Canh Tuất 1970 & Tân Hợi 1971 Hợp Vòng Gỗ Nào? Bí Quyết Chọn Linh Mộc Dưỡng Phúc Tuổi Trung Niên",
  "Tuổi Canh Thìn 2000 & Tân Tỵ 2001 Đeo Vòng Phong Thủy Nào? Bí Quyết Thu Hút May Mắn Khi Khởi Nghiệp",
  "Người Mệnh Kim Hợp Gỗ Màu Gì? Sự Thật Về Sắc Vàng Ánh Kim & Bảng Tra Màu Tương Sinh",
  "Doanh Nhân Mệnh Kim Nên Dùng Bút Ký Gỗ Gì? Sự Thật Về Bút Hoàng Đàn Tuyết Ký Hợp Đồng Tiền Tỷ",
  "Bi Lăn Tay Nu Bách Xanh Có Tác Dụng Gì Cho Người Mệnh Kim? Liệu Pháp Dưỡng Khớp & Nạp Dương Khí",
  "Người Mệnh Kim Có Đeo Được Vòng Gỗ Đen Hay Đỏ Không? Giải Mã Hiểu Lầm Xung Khắc Thủy - Hỏa",
  "Gối Gỗ Bách Xanh Có Thực Sự Giúp Người Mệnh Kim Ngủ Ngon? Sự Thật Về Hương Thảo Mộc Trừ Tà",
  "Bác Tài Mệnh Kim Nên Chọn Đệm Lót Ghế Ô Tô Bằng Gỗ Gì? Bí Quyết Vững Tâm Bình An Vạn Dặm",
  "3 Sai Lầm Tai Hại Khi Chọn Vòng Gỗ Khiến Người Mệnh Kim Tiêu Hao Tài Lộc: Bạn Có Mắc Phải?",

  // 12 - 23: Mệnh Mộc
  "Người Mệnh Mộc Đeo Vòng Gỗ Gì Vượng Tài Phát Lộc? Lời Khuyên Chuẩn Xác Từ Thợ Mộc Lâu Năm",
  "Vì Sao Người Mệnh Mộc Sinh Ra Là Để Đeo Đồ Gỗ? Bí Mật Năng Lượng Tương Hợp Trời Ban",
  "Vòng Bách Xanh Mộc Châu Vân Chớp Có Tác Dụng Gì? Sự Thật Về Chuỗi Vòng Trấn Mệnh Của Người Mệnh Mộc",
  "Tuổi Mậu Thìn 1988 & Kỷ Tỵ 1989 Đeo Vòng Gì? Bí Quyết Kích Hoạt Vận May Cho Đại Lâm Mộc",
  "Tuổi Nhâm Ngọ 2002 & Quý Mùi 2003 Đeo Vòng Gỗ Gì Hợp Mệnh? Mẹo Thu Hút Cơ Hội Trong Sự Nghiệp",
  "Tuổi Canh Thân 1980 & Tân Dậu 1981 Nên Đeo Gỗ Gì? Vì Sao Tử Đàn Lại Bồi Đắp Uy Quyền Cho Thạch Lựu Mộc?",
  "Bút Ký Gỗ Mun Sừng Đen Có Hợp Mệnh Mộc Không? Bí Mật Năng Lượng Thủy Sinh Mộc Chiêu Cảm Quý Nhân",
  "Trầm Hương Tự Nhiên Có Tác Dụng Gì Cho Người Mệnh Mộc? Bí Quyết Xua Tan Áp Lực & Tĩnh Tâm",
  "Người Mệnh Mộc Có Được Đeo Vòng Gỗ Màu Đỏ (Sưa Đỏ, Huyết Long) Không? Sự Thật Mộc Sinh Hỏa",
  "Gối Hạt Gỗ Bách Xanh Thơm Có Thực Sự Tốt Cho Người Mệnh Mộc Lớn Tuổi? Công Dụng Dưỡng Sinh An Giấc",
  "Bi Lăn Tay Tử Đàn Ấn Độ Có Tác Dụng Gì? Bí Quyết Dưỡng Tâm Luyện Trí Cho Người Mệnh Mộc Làm Não Bộ",
  "Làm Sao Phân Biệt Vòng Bách Xanh Thật Và Giả Ngâm Tinh Dầu Hóa Chất? Cảnh Báo Cho Người Mệnh Mộc",

  // 24 - 35: Mệnh Thủy
  "Người Mệnh Thủy Đeo Vòng Gỗ Gì Đón Tài Hút Lộc? Bí Quyết Chọn Đúng Danh Mộc Không Bị Khắc",
  "Vòng Gỗ Mun Sừng Khánh Hòa Có Tác Dụng Gì? Vì Sao Là Bảo Vật Bất Ly Thân Của Người Mệnh Thủy?",
  "Tử Đàn Tiểu Diệp Có Hợp Người Mệnh Thủy Không? Sự Thật Về Ánh Sao Kim Sa Trợ Khí",
  "Tuổi Nhâm Tuất 1982 & Quý Hợi 1983 Đeo Vòng Gỗ Gì? Bí Quyết Chọn Linh Mộc Cho Đại Hải Thủy Thăng Tiến",
  "Tuổi Bính Tý 1996 & Đinh Sửu 1997 Hợp Vòng Gỗ Nào? Cách Chọn Chuỗi Hạt Giải Tỏa Bế Tắc, Đón Quý Nhân",
  "Tuổi Giáp Dần 1974 & Ất Mão 1975 Đeo Vòng Gỗ Gì Hợp Tuổi? Bí Quyết Dưỡng Tâm An Nhiên & Giữ Vững Gia Đạo",
  "Trầm Hương Chìm Nước Có Tác Dụng Gì Cho Người Mệnh Thủy? Sự Thật Về Năng Lượng Tàng Thủy Chiêu Tài",
  "Doanh Nhân Mệnh Thủy Nên Chọn Bút Ký Gỗ Mun Sừng Hay Tử Đàn? So Sánh Uy Quyền & Phong Thủy",
  "Bi Lăn Tay Gỗ Mun Sừng Đen Có Thực Sự Tốt Cho Tim Mạch & Huyết Áp Người Mệnh Thủy?",
  "Người Mệnh Thủy Có Đeo Được Vòng Gỗ Sưa Đỏ Hay Trắc Đỏ Không? Sự Thật Về Xung Khắc Thủy - Hỏa",
  "Người Mệnh Thủy Có Phải Kiêng Tuyệt Đối Gỗ Màu Vàng Nâu Đất Không? Giải Mã Thổ Khắc Thủy",
  "Cách Lau Chuỗi Hạt Mun Sừng Cho Người Mệnh Thủy Để Càng Đeo Càng Lên Nước Bóng Gương Tự Nhiên",

  // 36 - 47: Mệnh Hỏa
  "Người Mệnh Hỏa Đeo Vòng Gỗ Gì Để Hạ Hỏa, Giữ Tâm Tĩnh & Thu Hút Vượng Khí?",
  "Vòng Gỗ Sưa Đỏ Có Tác Dụng Gì Cho Người Mệnh Hỏa? Sự Thật Về Danh Xưng 'Vua Của Các Loại Vòng Phong Thủy'",
  "Gỗ Nu Huyết Long Thấu Quang Đỏ Rực Có Tác Dụng Gì? Sự Thật Về Năng Lượng Dương Khí Trừ Tà",
  "Tuổi Bính Dần 1986 & Đinh Mão 1987 Đeo Vòng Gỗ Gì? Bí Quyết Chọn Chuỗi Hạt Dưỡng Tài Cho Lư Trung Hỏa",
  "Tuổi Giáp Tuất 1994 & Ất Hợi 1995 Đeo Vòng Phong Thủy Gì? Cách Khai Sáng Công Danh Cho Sơn Đầu Hỏa",
  "Tuổi Mậu Ngọ 1978 & Kỷ Mùi 1979 Hợp Vòng Gỗ Nào? Bí Quyết Chọn Sưa Già Gân Đen Giữ Chặt Tài Lộc",
  "Bút Ký Gỗ Nu Huyết Long Vân Lửa Có Hợp Mệnh Hỏa Không? Phụ Kiện Uy Quyền Dành Cho Lãnh Đạo",
  "Mệnh Hỏa Đeo Vòng Bách Xanh Mộc Châu Có Tốt Không? Đỉnh Cao Năng Lượng Mộc Sinh Hỏa Trợ Mệnh",
  "Người Mệnh Hỏa Có Được Đeo Vòng Gỗ Mun Sừng Đen Không? Cách Hóa Giải Tương Khắc Thủy - Hỏa",
  "Bi Lăn Tay Gỗ Trắc Có Tác Dụng Gì Cho Người Mệnh Hỏa? Bài Tập Cân Bằng Hỏa Khí & Giảm Nóng Giận",
  "Chủ Xe Mệnh Hỏa Có Nên Dùng Đệm Ghế Ô Tô Bằng Hạt Gỗ Trắc Không? Bí Quyết Bình An Vạn Dặm",
  "Làm Sao Phân Biệt Gỗ Huyết Long Thật Thấu Quang Đỏ Và Gỗ Tẩm Hóa Chất Nhuộm Màu Lừa Đảo?",

  // 48 - 59: Mệnh Thổ
  "Người Mệnh Thổ Đeo Vòng Gỗ Gì Vượng Tài Sinh Lộc? Lời Khuyên Chuẩn Phong Thủy Từ Nghệ Nhân",
  "Người Mệnh Thổ Có Đeo Được Vòng Gỗ Không? Sự Thật Về 'Mộc Khắc Thổ' Khiến Hàng Triệu Người Hiểu Sai",
  "Vì Sao Người Mệnh Thổ Đeo Gỗ Tử Đàn Và Sưa Đỏ Lại Cực Kỳ Giàu Có & May Mắn? Sự Thật Hỏa Sinh Thổ",
  "Tuổi Canh Ngọ 1990 & Tân Mùi 1991 Đeo Vòng Gì? Bí Quyết Chọn Linh Mộc Vững Chắc Cho Lộ Bàng Thổ",
  "Tuổi Mậu Dần 1998 & Kỷ Mão 1999 Hợp Vòng Gỗ Gì? Cách Chọn Chuỗi Hạt Bứt Phá Công Danh Cho Thành Đầu Thổ",
  "Tuổi Bính Thìn 1976 & Đinh Tỵ 1977 Đeo Vòng Gỗ Nào? Bí Quyết Bồi Đắp Phúc Đức Cho Sa Trung Thổ",
  "Bút Ký Gỗ Trắc Đỏ Đen Có Hợp Mệnh Thổ Không? Vật Phẩm Trợ Lực Uy Tín & Chốt Deal Bách Phát Bách Trúng",
  "Gỗ Hóa Thạch Tự Nhiên Có Tác Dụng Gì? Vì Sao Là Bảo Vật Đất Trời Dành Riêng Cho Người Mệnh Thổ?",
  "Người Mệnh Thổ Có Nên Đeo Vòng Bách Xanh Chớp Xanh Không? Lời Khuyên Thực Tế Tránh Hao Tổn Khí",
  "Bi Lăn Tay Gỗ Trắc Cổ Thụ Có Tác Dụng Gì? Bài Tập Dưỡng Khớp & Tích Tụ Thổ Khí Bình Ổn Thần Trí",
  "Doanh Nhân & Bác Tài Mệnh Thổ Có Nên Lót Đệm Hạt Gỗ Trắc Không? Điểm Tựa Vững Vàng Tài Lộc",
  "Cách Dưỡng Chuỗi Vòng Tử Đàn Cho Người Mệnh Thổ Để Càng Đeo Càng Lên Men Bóng Gương & Vượng Khí"
];

const targetMatrix = data.matrix.find(m => m.category === "huong-dan-lua-chon");
if (!targetMatrix || targetMatrix.topics.length !== newTitles.length) {
  console.error("Lỗi: Số lượng topics không khớp!", targetMatrix?.topics?.length, newTitles.length);
  process.exit(1);
}

targetMatrix.topics.forEach((t, i) => {
  t.title = newTitles[i];
});

fs.writeFileSync(PILLARS_FILE, JSON.stringify(data, null, 2), "utf-8");
console.log(`✅ Đã cập nhật thành công toàn bộ ${newTitles.length} tiêu đề content pillar trực diện theo chuẩn Search Intent!`);
