import { Outfit } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { getSession } from '@/lib/auth';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata = {
  title: 'Pokedex - Premium Pokemon Database',
  description: 'Khám phá và tìm kiếm thông tin về các loài Pokemon với giao diện đẹp mắt, hiện đại và lưu dữ liệu vào MongoDB.',
};

export default async function RootLayout({ children }) {
  const trainer = await getSession();

  return (
    <html lang="vi" className={`${outfit.variable}`}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>
        <nav className="navbar">
          <div className="nav-container">
            <Link href="/" className="nav-logo">
              <div className="nav-pokeball"></div>
              <h1>Poké<span>dex</span></h1>
            </Link>
            
            <div className="nav-links">
              <Link href="/" className="nav-link">
                <i className="fa-solid fa-house"></i> Trang chủ
              </Link>
              
              {trainer ? (
                <>
                  <Link href="/trainer" className="nav-link">
                    <i className="fa-solid fa-shield-halved"></i> Nhà huấn luyện
                  </Link>
                  <Link href="/trainer" className="nav-user" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <img src={trainer.avatar} alt={trainer.displayName} className="nav-avatar" />
                    <span className="nav-username">{trainer.displayName}</span>
                  </Link>
                </>
              ) : (
                <Link href="/login" className="btn-login">
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        </nav>
        
        {children}
      </body>
    </html>
  );
}
