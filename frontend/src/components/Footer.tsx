import React from 'react';

export default function Footer() {
  return (
    <footer style={{ background: '#111', color: '#fff', padding: 0, marginTop: 48, fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif' }}>
      <div style={{ background: '#e74c3c', color: '#fff', padding: '16px 0 8px 0', textAlign: 'right', fontSize: 16 }}>
        <span style={{ marginRight: 16 }}>Follow us:</span>
        <span style={{ marginRight: 8 }}><i className="fab fa-facebook-f" /></span>
        <span style={{ marginRight: 8 }}><i className="fab fa-twitter" /></span>
        <span style={{ marginRight: 8 }}><i className="fab fa-linkedin-in" /></span>
        <span style={{ marginRight: 8 }}><i className="fab fa-youtube" /></span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 0 32px 0', maxWidth: 1400, margin: '0 auto' }}>
        {/* Logo and Contact */}
        <div style={{ flex: 1.2, minWidth: 260, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/logo2.png" alt="Belgium Campus Logo" style={{ height: 150, marginBottom: 18, marginTop: 8 }} />
        </div>
        {/* Contact Us */}
        <div style={{ flex: 2, minWidth: 260, color: '#fff', fontSize: 16, paddingLeft: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 4, letterSpacing: 0.5, borderBottom: '2px solid #e74c3c', paddingBottom: 4, width: 'fit-content' }}>Contact Us</div>
          <div style={{ fontWeight: 600, marginTop: 12 }}>Belgium Campus</div>
          <div>138 Berg Ave, Heatherdale AH, Akasia, 0182<br />Tshwane Campus</div>
          <div style={{ marginTop: 8 }}>45A Long St, Kempton Park Cbd, Kempton Park, 1619<br />Ekurhuleni Campus</div>
          <div style={{ marginTop: 8 }}>6 Commercial Rd, Sydenham, Port Elizabeth, 6001<br />Nelson Mandela Bay Campus</div>
          <div style={{ marginTop: 12 }}>
            <span style={{ textDecoration: 'underline' }}>Telephone:</span> 010 593 5368<br />
            <span style={{ textDecoration: 'underline' }}>Email:</span> info@belgiumcampus.ac.za
          </div>
        </div>
        {/* Important Links */}
        <div style={{ flex: 1.5, minWidth: 200, color: '#fff', fontSize: 16, paddingLeft: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 4, letterSpacing: 0.5, borderBottom: '2px solid #e74c3c', paddingBottom: 4, width: 'fit-content' }}>Important Links</div>
          <ul style={{ listStyle: 'disc', paddingLeft: 18, margin: 0, marginTop: 12 }}>
            <li style={{ marginBottom: 4 }}>Important Documentation</li>
            <li style={{ marginBottom: 4 }}>Campuses</li>
            <li style={{ marginBottom: 4 }}>Study at BC</li>
            <li style={{ marginBottom: 4 }}>Innovations</li>
            <li style={{ marginBottom: 4 }}>Bothale Village</li>
            <li style={{ marginBottom: 4 }}>Articles</li>
          </ul>
        </div>
        {/* About Us */}
        <div style={{ flex: 2, minWidth: 260, color: '#fff', fontSize: 16, paddingLeft: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 4, letterSpacing: 0.5, borderBottom: '2px solid #e74c3c', paddingBottom: 4, width: 'fit-content' }}>About Us</div>
          <div style={{ marginBottom: 16, marginTop: 12, lineHeight: 1.6 }}>
            Belgium Campus is a pioneering ITversity in South Africa that helps to raise the bar through its graduates in the ICT industry.
          </div>
          <div style={{ fontWeight: 700, marginTop: 8 }}>
            <a href="#" style={{ color: '#ffe082', textDecoration: 'none', fontWeight: 700, fontSize: 16 }}>Read More <span style={{ color: '#ffe082', fontSize: 18, verticalAlign: 'middle' }}>●</span></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
