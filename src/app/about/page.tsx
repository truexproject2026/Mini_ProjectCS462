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
    { 
      name: "Next.js", 
      icon: "fa-globe", 
      label: "Frontend Framework", 
      color: "#3b82f6",
      details: "React Framework ประสิทธิภาพสูง รองรับการทำงานแบบ Client-side Rendering เพื่อ UI ที่ลื่นไหล"
    },
    { 
      name: "FastAPI", 
      icon: "fa-terminal", 
      label: "Backend API", 
      color: "#10b981",
      details: "Python API Framework ที่มีความเร็วสูง ใช้สำหรับการประมวลผลรูปภาพและเชื่อมต่อกับ Model AI"
    },
    { 
      name: "Scikit-Learn", 
      icon: "fa-brain", 
      label: "Machine Learning", 
      color: "#f59e0b",
      details: "Library หลักในการเทรนโมเดล ExtraTrees Classifier พร้อมการทำ Data Augmentation"
    },
    { 
      name: "Cloudinary", 
      icon: "fa-cloud", 
      label: "Cloud Storage", 
      color: "#06b6d4",
      details: "ระบบจัดเก็บรูปภาพ Dataset แบบออนไลน์ เพื่อความคงทนของข้อมูลแทนการเก็บใน Server"
    }
  ];

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '60px' }}>
      <Navbar />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        
        {/* --- Hero Section --- */}
        <div style={{ 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          borderRadius: '30px',
          padding: '50px 30px',
          textAlign: 'center',
          color: 'white',
          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.2)',
          marginBottom: '30px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '200px', height: '200px', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '50%', filter: 'blur(50px)' }}></div>
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ 
              display: 'inline-block', 
              background: 'rgba(99, 102, 241, 0.15)', 
              padding: '6px 16px', 
              borderRadius: '100px', 
              fontSize: '11px', 
              fontWeight: 800, 
              color: '#818cf8',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px'
            }}>
              CS462 DATA ANALYTICS PROJECT
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: 900, marginBottom: '10px', letterSpacing: '-1px' }}>
              กลุ่ม <span style={{ 
                background: 'linear-gradient(to right, #a5b4fc, #e879f9)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent' 
              }}>RAMNOI</span>
            </h1>
          </div>
        </div>

        {/* --- Main Content --- */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', alignItems: 'start' }}>
          
          {/* Tech Stack Card - Full Details */}
          <div style={{ background: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-microchip" style={{ color: '#6366f1' }}></i>
              Tech Stack
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {technologies.map((tech, i) => (
                <div key={i} style={{ 
                  background: '#f8fafc', 
                  padding: '15px', 
                  borderRadius: '16px', 
                  border: '1px solid #f1f5f9'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <i className={`fa-solid ${tech.icon}`} style={{ fontSize: '18px', color: tech.color }}></i>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e293b' }}>{tech.name}</div>
                      <div style={{ fontSize: '9px', color: tech.color, fontWeight: 700, textTransform: 'uppercase' }}>{tech.label}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                    {tech.details}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Members Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {/* Members Card */}
            <div style={{ background: 'white', borderRadius: '24px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fa-solid fa-users" style={{ color: '#ec4899' }}></i>
                  ทีมงาน Ramnoi
                </h2>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#cbd5e1' }}>5 MEMBERS</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {teamMembers.map((member, i) => (
                  <div 
                    key={i} 
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{ 
                      padding: '12px 18px', 
                      borderRadius: '16px', 
                      background: hoveredIndex === i ? '#4f46e5' : '#f8fafc',
                      color: hoveredIndex === i ? 'white' : '#1e293b',
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      border: '1px solid',
                      borderColor: hoveredIndex === i ? '#4f46e5' : '#f1f5f9',
                      transform: hoveredIndex === i ? 'translateX(5px)' : 'translateX(0)',
                      transition: 'all 0.2s ease',
                      cursor: 'default'
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>{member.name}</span>
                    <span style={{ 
                      fontFamily: 'monospace', 
                      fontSize: '11px', 
                      opacity: hoveredIndex === i ? 0.9 : 0.4
                    }}>{member.id}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Strategy Mini Card */}
            <div style={{ 
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
              borderRadius: '24px', 
              padding: '25px', 
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <i className="fa-solid fa-bolt-lightning" style={{ position: 'absolute', right: '-10px', bottom: '-10px', fontSize: '80px', opacity: 0.1 }}></i>
              <div style={{ fontWeight: 800, fontSize: '16px', marginBottom: '8px' }}>Core Strategy</div>
              <p style={{ fontSize: '13px', opacity: 0.9, lineHeight: '1.5' }}>
                เพิ่มความแม่นยำด้วย Soft Dilation และ Data Augmentation 25 เท่า สำหรับจำแนกเลข ๓๖-๔๐
              </p>
            </div>
          </div>

        </div>

      </div>
      
      <style jsx global>{`
        body { margin: 0; padding: 0; }
        @media (max-width: 900px) {
          h1 { fontSize: 32px !important; }
          div[style*="gridTemplateColumns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
