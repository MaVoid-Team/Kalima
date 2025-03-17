import React from "react";
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">التواصل</h3>
            <p className="mb-2">01021554154</p>
            <p className="mb-4">01158551515</p>
            <h4 className="text-lg font-bold mb-2">تابعنا</h4>
            <div className="flex justify-center gap-4">
            <Link to="/about" className="btn btn-circle btn-sm btn-ghost">
                <Facebook className="h-5 w-5" />
            </Link>
            <Link to="/about" className="btn btn-circle btn-sm btn-ghost">
                <Instagram className="h-5 w-5" />
            </Link>
            <Link to="/about" className="btn btn-circle btn-sm btn-ghost">
                <Twitter className="h-5 w-5" />
            </Link>
            <Link to="/about" className="btn btn-circle btn-sm btn-ghost">
                <Linkedin className="h-5 w-5" />
            </Link>
            </div>
          </div>
          
          {/* Links */}
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">الروابط</h3>
            <ul className="space-y-2">
              <li><Link to='/'>الرئيسية</Link></li>
              <li><Link to='/courses'>الكورسات</Link></li>
              <li><Link to='/teachers'>المعلمين</Link></li>
              <li><Link to='/'>الخدمات</Link></li>
              <li><Link to='/'>الملفات</Link></li>
            </ul>
          </div>
          
          {/* About */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <img src="/civilco_logo.png" alt="Civilco Logo" className="h-10" />
            </div>
            <p className="text-sm mb-4">
              منصة كلمة هي منصة تعليم إلكتروني توفر
              المنصة موارد للطلاب من الصف الرابع
              الابتدائي حتى الصف الثالث الثانوي.
            </p>
            <p className="text-sm">
              منصة كلمة هي منصة تعليم إلكتروني توفر
              المنصة موارد للطلاب من الصف الرابع
              الابتدائي حتى الصف الثالث الثانوي.
            </p>
          </div>
        </div>
        
        <div className="text-center mt-8 pt-4 border-t border-base-300">
          <p className="text-sm">
            @Copyright 2025 <Link className="text-primary" to={'/'}>Kalma</Link> | Developed by <Link className="text-primary" to={'/'}>Kalma</Link> team, All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
