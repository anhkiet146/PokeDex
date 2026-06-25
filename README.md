# Pokéđex - Premium Web Database

Một ứng dụng Pokéđex cao cấp, mượt mà và trực quan được xây dựng bằng HTML5, CSS3 (Vanilla) và JavaScript hiện đại. Ứng dụng tích hợp trực tiếp dữ liệu từ [PokéAPI](https://pokeapi.co/) và được tối ưu hóa hiển thị trên mọi thiết bị.

![Pokéđex Preview](https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png)

## ✨ Tính năng nổi bật

- **Giao diện Glassmorphism cao cấp:** Thiết kế tối giản, hiện đại với hiệu ứng làm mờ kính và các dải màu phát sáng tương ứng với hệ của từng Pokémon.
- **Tải dữ liệu tức thì (Local Caching):** Tự động lưu cache thông tin 151 Pokémon thế hệ đầu tiên vào `localStorage` giúp giảm thời gian tải trong các lần truy cập tiếp theo xuống còn 0ms.
- **Tìm kiếm & Bộ lọc nâng cao:**
  - Tìm kiếm tức thì theo Tên hoặc ID.
  - Lọc theo Hệ (Hỏa, Thủy, Thảo, v.v.) được dịch sang tiếng Việt.
  - Sắp xếp linh hoạt: Theo ID (Tăng/Giảm dần) hoặc Tên (A-Z, Z-A).
- **Thông tin chi tiết (Interactive Modal):** Xem đầy đủ chỉ số cơ bản (HP, ATK, DEF, v.v.), cân nặng, chiều cao, kỹ năng, phần mô tả tiếng Anh và đặc biệt là sơ đồ tiến hóa (Evolution Chain) có thể nhấn chọn trực tiếp.
- **Responsive Web Design:** Tương thích hoàn hảo với thiết bị di động, máy tính bảng và màn hình lớn.

---

## 🚀 Hướng dẫn chạy thử local

Do ứng dụng được viết bằng các công nghệ web cơ bản không cần build:
1. Bạn chỉ cần click đúp vào file [index.html](file:///c:/Users/Admin/OneDrive/Pictures/Pokedex/index.html) để mở trực tiếp trong bất kỳ trình duyệt nào (Chrome, Edge, Firefox, Brave, ...).
2. Hoặc sử dụng extension **Live Server** trên VS Code để chạy với server local ảo.

---

## 🌐 Hướng dẫn kết nối với GitHub & Public Web (GitHub Pages)

Để kết nối thư mục này với GitHub và xuất bản ứng dụng của bạn lên mạng miễn phí thông qua **GitHub Pages**, vui lòng thực hiện các bước sau:

### Bước 1: Tạo Repository trên GitHub
1. Truy cập vào tài khoản [GitHub](https://github.com/) của bạn.
2. Nhấp vào nút **New** (hoặc dấu cộng `+` ở góc trên cùng bên phải -> **New repository**).
3. Đặt tên repository là `Pokedex` (hoặc tên tùy thích).
4. Chọn chế độ **Public** (bắt buộc để có thể public web miễn phí).
5. **QUAN TRỌNG:** Không tích vào bất kỳ mục nào như *Add a README file*, *Add .gitignore*, hoặc *Choose a license* (vì chúng ta đã có sẵn các file này rồi).
6. Nhấp vào nút **Create repository**.

### Bước 2: Liên kết thư mục local này với GitHub và Push
Mở terminal tại thư mục dự án và chạy các lệnh sau:

```bash
# 1. Thêm tất cả các file đã tạo vào Git
git add .

# 2. Tạo commit đầu tiên
git commit -m "Initial commit: Premium Pokedex Web App"

# 3. Tạo nhánh chính tên là main
git branch -M main

# 4. Liên kết tới kho lưu trữ GitHub của bạn
# (Lưu ý: Thay thế <YOUR-USERNAME> và <YOUR-REPO-NAME> bằng thông tin của bạn)
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git

# 5. Đẩy code lên GitHub
git push -u origin main
```

> [!NOTE]
> Khi bạn chạy lệnh `git push`, Windows sẽ hiển thị một cửa sổ pop-up từ **Git Credential Manager**. Bạn chỉ cần chọn **"Sign in with your browser"** (Đăng nhập bằng trình duyệt) để xác thực tài khoản GitHub một cách nhanh chóng và an toàn.

### Bước 3: Public Web lên internet bằng GitHub Pages
Sau khi đẩy code thành công:
1. Trên giao diện Repository của bạn trên GitHub, truy cập vào tab **Settings** (Cài đặt) ở thanh menu ngang.
2. Ở thanh menu bên trái, tìm và chọn mục **Pages**.
3. Tại phần **Build and deployment** -> **Branch**, chọn nhánh **`main`** và thư mục **`/ (root)`**.
4. Nhấn **Save**.
5. Đợi khoảng 1-2 phút, GitHub sẽ tải lại trang và cung cấp một đường link công khai dạng:
   `https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/`
6. Bất kỳ ai cũng có thể truy cập vào link này để trải nghiệm ứng dụng Pokedex của bạn!
