# Hades' Pomegranates (Vườn Lựu U Minh)

> *“Chào em đến chốn U Minh*  
> *Món ngon vật lạ sẵn đây đón chờ.*  
> *Sắc hồng lựu đỏ như thơ,*  
> *Nếm rồi em hỡi… chớ mơ đường về.”*

**Hades' Pomegranates** là một trải nghiệm danh bạ nhân vật tương tác mang phong vị văn học lãng mạn, lấy cảm hứng từ thần thoại Hy Lạp về Hades và nàng Persephone — nơi hạt lựu đỏ gắn kết vĩnh viễn linh hồn với chốn U Minh.

Trang web được xây dựng hoàn toàn bằng **HTML5, CSS3 hiện đại và vanilla JavaScript thuần túy** — không dùng React, không dùng trình đóng gói (bundler), không yêu cầu quy trình biên dịch (build process), và tương thích 100% khi triển khai tĩnh trên **GitHub Pages**.

---

## 🏛️ Cấu trúc thư mục (Directory Structure)

```
hades-pomegranates/
├── index.html            # Cấu trúc HTML (Vườn lựu, Hồ sơ nhân vật, Sổ Linh hồn, Modal Bổ lựu & Hoa đăng)
├── style.css             # Thiết kế thẩm mỹ Ethereal Romantic Underworld, chế độ Sáng / Tối, hoạt ảnh
├── script.js             # Logic tương tác, vật lý quả lựu, lưu trữ hoa đăng, âm thanh, bộ lọc
├── characters.json       # Cơ sở dữ liệu 30 nhân vật, liên kết Google AI Studio và truyện hậu trường
├── supabase-schema.sql   # Kịch bản SQL tạo bảng soul_lanterns & thiết lập Row Level Security (RLS)
├── README.md             # Tài liệu hướng dẫn sử dụng và triển khai toàn diện
└── assets/               # Thư mục âm thanh và tài nguyên tĩnh
    └── music.mp3         # Nhạc nền không khí U Minh (A Quiet Little Promise)
```

---

## ✨ Các tính năng & Cơ chế tương tác chính

### 1. Cây lựu U Minh & 30 Quả lựu Độc bản
- Cây lựu cổ thụ được vẽ trực tiếp bằng vector SVG với các cành uốn lượn và tán lá ngải bồ đề chuyển động nhẹ trong gió U Minh.
- **Ánh xạ xác định (Deterministic 1:1):** 30 quả lựu (`pomegranate-01` đến `pomegranate-30`) tương ứng chính xác với 30 nhân vật (`character-01` đến `character-30`), không bao giờ bị xáo trộn ngẫu nhiên.
- **Vật lý hữu cơ:** Khi nhấp vào quả lựu:
  1. Quả lựu rung lắc nhẹ trên cuống.
  2. Tách khỏi cành và rơi tự nhiên dưới tác động của trọng lực.
  3. Cảnh vườn lựu phía sau nhẹ nhàng mờ đi (`soft-dim`).
  4. Mở ra trang **Hồ sơ Linh hồn** của nhân vật tương ứng.

### 2. Hồ sơ Linh hồn & Bộ đôi hành động ("Bổ lựu" & "Thử lựu")
Mỗi hồ sơ nhân vật được trình bày trang trọng theo phong cách biên tập văn học thuần túy (không sử dụng hình ảnh):
- **Sứ mệnh** (Role), Tuổi và Câu trích dẫn / Lời tự bạch (Bio).
- **Bổ lựu (Secondary Action):** Nút văn học tinh tế với ngôi sao cổ (`✦ Bổ lựu`). Khi bấm, mở cửa sổ **Truyện Hậu Trường (Back Story Modal)** hiển thị toàn văn câu chuyện sâu sắc của nhân vật đó.
- **Thử lựu (Primary Action):** Nút kêu gọi hành động chính với đường gạch chân phát sáng như hạt lựu đỏ rực. Khi bấm, mở trực tiếp trải nghiệm tương tác với nhân vật trên **Google AI Studio** trong tab mới.

### 3. Sổ Linh hồn (Archive View)
- Bảng tra cứu danh bạ 30 linh hồn với các thẻ bài biên tập thẩm mỹ.
- **Tìm kiếm tức thì:** Tìm nhanh theo tên nhân vật, tên sứ mệnh, hoặc nội dung tiểu sử.
- **Bộ lọc Sứ mệnh:** Lọc linh hồn theo từng sứ mệnh cụ thể (Kẻ tìm ký ức, Kẻ điều khiển rối, Kẻ bảo hộ lặng thầm,...).
- Nhấp vào bất kỳ thẻ nào để mở hồ sơ chi tiết của nhân vật đó.

### 4. Thắp hoa đăng cho linh hồn (Soul Lanterns System)
Tính năng cho phép người ghé thăm để lại những suy nghĩ, lời nhắn, tâm sự vô danh cho từng nhân vật cụ thể trong **Sổ Linh hồn**:
- **Nút hành động trên từng thẻ:** `✦ Thắp hoa đăng cho linh hồn` (tách biệt hoàn toàn với thao tác mở hồ sơ nhân vật).
- **Cửa sổ Hoa đăng:**
  - Hiển thị danh sách hoa đăng đã thả cho riêng nhân vật đó theo thứ tự thời gian.
  - Mỗi lời nhắn có chữ ký mặc định: `— một linh hồn vô danh`.
  - Khung nhập tin nhắn ẩn danh tối đa 1000 ký tự kèm bộ đếm thời gian thực.
- **Chỉnh sửa lời nhắn (Edit Message):**
  - Người dùng có thể nhấn `✎ Sửa` trên chính ngọn hoa đăng do mình thắp.
  - Ô soạn thảo trực tiếp (inline editor) mở ra ngay trên thẻ tin nhắn.
  - Hỗ trợ lưu nhanh bằng `Ctrl + Enter` hoặc hủy bằng phím `Escape`.
  - Thẻ hoa đăng sau khi lưu sẽ hiển thị dòng chú thích tinh tế: `(đã chỉnh sửa)`.
- **Xóa lời nhắn (Delete Message):**
  - Người dùng có thể nhấn `✕ Xóa` trên hoa đăng của mình.
  - Hộp xác nhận nhẹ nhàng `Xóa hoa đăng? [Xóa] [Hủy]` hiển thị trực tiếp, không làm gián đoạn trải nghiệm bằng popup trình duyệt.
  - Khi xác nhận, hoa đăng sẽ mờ dần và tan biến (`dissolving animation`) khỏi danh sách.
- **Nhận diện quyền sở hữu ẩn danh (Device Ownership):**
  - Không cần tạo tài khoản hay đăng nhập.
  - Thiết bị thắp hoa đăng sẽ tự động nhận diện tin nhắn của mình với huy hiệu `Hoa đăng của em` và cấp quyền Sửa / Xóa độc quyền, ngăn chặn người khác can thiệp vào tâm sự riêng tư.
- **Cơ chế lưu trữ kép (Dual-Mode Storage):**
  - **Chế độ Ngoại tuyến / Trình duyệt (`localStorage`):** Hoạt động ngay lập tức mà không cần cấu hình, cho phép thử nghiệm và lưu giữ tin nhắn bền vững trên máy.
  - **Chế độ Đồng bộ Đám mây (Supabase):** Kết nối cơ sở dữ liệu Supabase để mọi người trên toàn cầu cùng thấy hoa đăng của nhau.

### 5. Nhạc nền Không khí & Ngọn nến Ngày / Đêm
- **♫ Nhã nhạc:** Nút bật/tắt nhạc nền ở góc trên bên phải. Khởi đầu ở trạng thái TẮT để tôn trọng người nghe. Khi bật, bài hát phát với âm lượng dịu êm `0.25`, lặp liên tục và không bị ngắt quãng khi chuyển đổi giữa các trang.
- **🕯️ NẾN (Chế độ Sáng / Tối):** Chuyển đổi giữa chế độ *Giấy da cổ kính ban ngày* (`Warm Ivory`) và chế độ *U Minh dạ nguyệt ban đêm* (`Nocturnal Underworld`). Cây nến sẽ thắp sáng ngọn lửa hoặc thổi tắt cùng hoạt ảnh làn khói huyền ảo.
- **Bụi vàng linh hồn (Particle Canvas):** 32 hạt bụi bào tử vàng và tàn tro hồng ngọc lơ lửng nhẹ nhàng trong không gian.

---

## 🗄️ Hướng dẫn Kết nối Cơ sở dữ liệu Supabase

Nếu bạn muốn các ngọn hoa đăng được lưu trữ trực tuyến để tất cả mọi người truy cập vào website đều nhìn thấy:

1. Đăng ký tài khoản miễn phí tại [supabase.com](https://supabase.com) và tạo một dự án mới.
2. Vào mục **SQL Editor** trong bảng điều khiển Supabase.
3. Dán toàn bộ nội dung của tệp [`supabase-schema.sql`](file:///d:/Kh%C3%A1nh%20Qu%E1%BB%B3nh/hades-pomegranates/supabase-schema.sql) và nhấn **Run**. Kịch bản sẽ:
   - Tạo bảng `soul_lanterns` với các cột: `id`, `character_id`, `message`, `created_at`, `updated_at`.
   - Tạo các chỉ mục tối ưu hóa tốc độ truy vấn.
   - Kích hoạt **Row Level Security (RLS)** với đầy đủ chính sách `SELECT`, `INSERT`, `UPDATE`, `DELETE` ẩn danh an toàn.
4. Vào **Project Settings ➔ API**, sao chép **Project URL** và khóa công khai **anon public key**.
5. Mở tệp [`script.js`](file:///d:/Kh%C3%A1nh%20Qu%E1%BB%B3nh/hades-pomegranates/script.js) (dòng 29), cập nhật cấu hình:
   ```javascript
   const SUPABASE_CONFIG = {
     url: 'https://YOUR_PROJECT_ID.supabase.co',
     anonKey: 'YOUR_SUPABASE_ANON_PUBLIC_KEY',
   };
   ```
*(Lưu ý: Tuyệt đối không dùng `service_role` key trên client).*

---

## 🚀 Hướng dẫn Triển khai lên GitHub Pages

### Bước 1: Khởi tạo Git và Đẩy mã nguồn lên GitHub
Mở terminal (PowerShell hoặc Bash) tại thư mục dự án:

```powershell
# Chuyển vào thư mục dự án
cd "d:\Khánh Quỳnh\hades-pomegranates"

# Khởi tạo git và thêm các tệp
git init
git add .
git commit -m "Hoàn thiện Hades' Pomegranates: Vườn lựu, Bổ lựu, Thử lựu, và Hoa đăng linh hồn"

# Đặt nhánh chính là main
git branch -M main

# Liên kết với kho lưu trữ GitHub của bạn
git remote add origin https://github.com/TÊN_NGƯỜI_DÙNG/TÊN_REPO.git

# Đẩy mã nguồn lên
git push -u origin main
```

### Bước 2: Kích hoạt GitHub Pages
1. Truy cập vào kho lưu trữ của bạn trên [GitHub](https://github.com/).
2. Nhấn vào tab **Settings** ➔ chọn mục **Pages** ở cột bên trái.
3. Trong mục **Build and deployment**:
   - **Source:** Chọn `Deploy from a branch`.
   - **Branch:** Chọn `main` và thư mục `/ (root)`.
4. Nhấn **Save**.
5. Đợi 1–2 phút, trang web của bạn sẽ xuất hiện tại:
   `https://TÊN_NGƯỜI_DÙNG.github.io/TÊN_REPO/`

---

## 📖 Cấu trúc dữ liệu nhân vật (`characters.json`)

Toàn bộ dữ liệu của 30 nhân vật được quản lý tại tệp nguồn duy nhất: [`characters.json`](file:///d:/Kh%C3%A1nh%20Qu%E1%BB%B3nh/hades-pomegranates/characters.json).

```json
[
  {
    "id": "character-01",
    "name": "Âu Dương Dục Thần",
    "age": 26,
    "role": "Kẻ tìm ký ức",
    "bio": "“Tôi nên yêu em dưới cái tên nào đây?”",
    "pomegranateId": "pomegranate-01",
    "googleAIStudioUrl": "https://aistudio.google.com/...",
    "backstory": "Toàn văn truyện hậu trường được hiển thị trọn vẹn khi nhấn Bổ lựu..."
  }
]
```

- **`id`:** Mã định danh từ `character-01` đến `character-30`.
- **`pomegranateId`:** Ánh xạ chính xác với quả lựu từ `pomegranate-01` đến `pomegranate-30`.
- **`role`:** Tên sứ mệnh của nhân vật (hiển thị trên thẻ và trong danh sách lọc).
- **`googleAIStudioUrl`:** Đường dẫn trực tiếp đến trải nghiệm Google AI Studio (kích hoạt qua nút **Thử lựu**).
- **`backstory`:** Câu chuyện cuộc đời của nhân vật (kích hoạt qua nút **Bổ lựu**).

---

## 🎨 Bảng màu Thẩm mỹ U Minh (Color Palette)

| Biểu tượng | Tên màu sắc | Mã Hex | Vai trò trong giao diện |
|:---:|:---|:---:|:---|
| 🪶 | **Warm Ivory** | `#F6EFE5` | Nền giấy da cổ kính (Light Mode) |
| 🍷 | **Pomegranate Crimson** | `#9E3040` | Sắc hạt lựu chín, nút Thử lựu, quả lựu |
| 🍇 | **Soft Burgundy** | `#672D38` | Màu tiêu đề, chữ nhấn, đường viền cuống lựu |
| ⚜️ | **Antique Gold** | `#B89B68` | Sao vàng cổ `✦`, ngọn hoa đăng, viền sáng |
| 🍃 | **Sage Green** | `#71805E` | Tán lá lựu đung đưa trong sương lạnh |
| 🌌 | **Nocturnal Underworld** | `#1A1017` | Nền màn đêm U Minh (Dark Mode) |
| 🕯️ | **Candle Flame Gold** | `#F2C94C` | Ánh sáng ngọn nến và tàn tro linh hồn |

---

## ♿ Khả năng Tiếp cận & Tương thích (Accessibility)

- **Điều hướng phím hoàn chỉnh:** Có thể dùng phím `Tab`, `Enter`, `Space` để tương tác với từng quả lựu, thẻ nhân vật, nút Bổ lựu, Thử lựu và mở cửa sổ Hoa đăng.
- **Phím tắt Escape:** Đóng cửa sổ Hoa đăng hoặc Bổ lựu mà không làm thoát khỏi trang hiện tại. Nhấn `Escape` lần thứ hai để quay về Vườn lựu.
- **Trực quan hóa trạng thái Focus:** Chỉ báo viền nổi bật cho người dùng điều hướng bằng bàn phím.
- **Hỗ trợ `prefers-reduced-motion`:** Tự động tiết giảm hoặc tắt các hoạt ảnh rung lắc, rơi tự do và hạt bụi nếu người dùng cài đặt giảm chuyển động trên hệ điều hành.
