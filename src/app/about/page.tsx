"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function AboutPage() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const teamMembers = [
    { name: "นาย ชินวัตร อ่วมแก้ว", id: "1660701283" },
    { name: "นาย เดชาธร หุ้มไธสง", id: "1660702463" },
    { name: "นางสาวศรีรัตน์ อินทลัย", id: "1660705185" },
    { name: "นางสาวนิชาภา ศรีแจ่มใส", id: "1660706050" },
    { name: "นางสาวบุญพิทักษ์ โรจนประภาวสุ", id: "1660707538" }
  ];

  const technologies = [
    { name: "Next.js", icon: "fa-globe", label: "Frontend", color: "#3b82f6" },
    { name: "FastAPI", icon: "fa-terminal", label: "Backend", color: "#10b981" },
    { name: "Scikit-Learn", icon: "fa-brain", label: "AI Model", color: "#f59e0b" },
    { name: "Cloudinary", icon: "fa-cloud", label: "Storage", color: "#06b6d4" }
  ];

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '80px' }}>
      <Navbar />
      
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* --- Hero Section --- */}
        <div className="about-hero" style={{ 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          borderRadius: '40px',
          padding: '80px 40px',
          textAlign: 'center',
          color: 'white',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          marginBottom: '40px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative Circles */}
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
          <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '50%', filter: 'blur(50px)' }}></div>

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ 
              display: 'inline-block', 
              background: 'rgba(99, 102, 241, 0.15)', 
              padding: '8px 20px', 
              borderRadius: '100px', 
              fontSize: '13px', 
              fontWeight: 800, 
              color: '#818cf8',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              marginBottom: '24px',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              CS462 DATA ANALYTICS PROJECT
            </div>
            <h1 style={{ fontSize: '60px', fontWeight: 900, marginBottom: '20px', letterSpacing: '-1px' }}>
              กลุ่ม <span style={{ 
                background: 'linear-gradient(to right, #a5b4fc, #e879f9)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent' 
              }}>RAMNOI</span>
            </h1>
            <p style={{ fontSize: '18px', color: '#94a3b8', maxWidth: '700px', margin: '0 auto', lineHeight: '1.7' }}>
              ยกระดับการจำแนกตัวเลขไทยด้วยเทคโนโลยี <span style={{ color: 'white', fontWeight: 600 }}>ExtraTrees Classifier</span> 
              ที่ผ่านการปรับจูนมาเป็นพิเศษเพื่อรองรับความหลากหลายของลายมือ
            </p>
          </div>
        </div>

        {/* --- Main Content --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          
          {/* Tech Stack Card */}
          <div style={{ background: 'white', borderRadius: '32px', padding: '40px', boxShadow: '0 4px 25px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <i className="fa-solid fa-microchip" style={{ color: '#6366f1' }}></i>
              Tech Stack
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {technologies.map((tech, i) => (
                <div key={i} style={{ 
                  background: '#f8fafc', 
                  padding: '20px', 
                  borderRadius: '24px', 
                  textAlign: 'center',
                  border: '1px solid #f1f5f9',
                  transition: '0.3s'
                }}>
                  <i className={`fa-solid ${tech.icon}`} style={{ fontSize: '24px', color: tech.color, marginBottom: '10px', display: 'block' }}></i>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e293b' }}>{tech.name}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', marginTop: '4px' }}>{tech.label}</div>
                </div>
              ))}
            </div>
            
            <div style={{ 
              marginTop: '30px', 
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
              borderRadius: '24px', 
              padding: '25px', 
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <i className="fa-solid fa-bolt-lightning" style={{ position: 'absolute', right: '-10px', bottom: '-10px', fontSize: '80px', opacity: 0.1 }}></i>
              <div style={{ fontWeight: 800, fontSize: '18px', marginBottom: '8px' }}>Core Strategy</div>
              <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.5' }}>
                Soft Dilation & 25x Augmentation สำหรับเลข ๓๖-๔๐
              </p>
            </div>
          </div>

          {/* Members Card */}
          <div style={{ background: 'white', borderRadius: '32px', padding: '40px', boxShadow: '0 4px 25px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '15px' }}>
                <i className="fa-solid fa-users" style={{ color: '#ec4899' }}></i>
                ทีมงาน Ramnoi
              </h2>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#cbd5e1', letterSpacing: '1px' }}>5 MEMBERS</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {teamMembers.map((member, i) => (
                <div 
                  key={i} 
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ 
                    padding: '18px 24px', 
                    borderRadius: '20px', 
                    background: hoveredIndex === i ? '#4f46e5' : '#f8fafc',
                    color: hoveredIndex === i ? 'white' : '#1e293b',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    border: '1px solid',
                    borderColor: hoveredIndex === i ? '#4f46e5' : '#f1f5f9',
                    transform: hoveredIndex === i ? 'translateX(10px)' : 'translateX(0)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'default'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.6, textTransform: 'uppercase', marginBottom: '2px' }}>Developer</span>
                    <span style={{ fontWeight: 700, fontSize: '16px' }}>{member.name}</span>
                  </div>
                  <span style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '13px', 
                    opacity: hoveredIndex === i ? 0.8 : 0.4,
                    background: hoveredIndex === i ? 'rgba(255,255,255,0.1)' : 'transparent',
                    padding: '4px 10px',
                    borderRadius: '8px'
                  }}>
                    {member.id}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ 
              marginTop: '30px', 
              padding: '20px', 
              background: '#1e293b', 
              borderRadius: '24px', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '15px',
              border: '1px solid #334155'
            }}>
              <div style={{ width: '45px', height: '45px', background: '#4f46e5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                <i className="fa-solid fa-bullseye"></i>
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px' }}>Project Goal</div>
                <div style={{ fontSize: '15px', fontWeight: 600 }}>Classification: ๓๖, ๓๗, ๓๘, ๓๙, ๔๐</div>
              </div>
            </div>
          </div>

        </div>

        <div style={{ textAlign: 'center', marginTop: '60px', color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>
          <div style={{ marginBottom: '10px' }}>
            <i className="fa-solid fa-graduation-cap" style={{ marginRight: '8px' }}></i>
            Bangkok University • Faculty of Information Technology
          </div>
          <div>&copy; 2026 RAMNOI GROUP. ALL RIGHTS RESERVED.</div>
        </div>
      </div>
      
      {/* Global CSS for some effects that can't be easily done inline */}
      <style jsx global>{`
        body { margin: 0; padding: 0; }
        @media (max-width: 768px) {
          h1 { fontSize: 40px !important; }
          .about-hero { padding: 40px 20px !important; }
        }
      `}</style>
    </main>
  );
}
