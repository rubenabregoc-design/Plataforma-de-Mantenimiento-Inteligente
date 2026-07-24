import React from 'react';
import { Globe, Instagram, Youtube, Linkedin, Twitter, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MantechProLogo from './Logo';

export default function Footer() {
  const { t, i18n } = useTranslation();

  const sections = [
    {
      title: 'Compañía',
      links: ['Quiénes somos', 'Lo que ofrecemos', 'Sala de prensa', 'Blog', 'Oportunidades laborales']
    },
    {
      title: 'Servicios',
      links: ['Flotas B2B', 'Soporte Residencial', 'Mantenimiento Industrial', 'SOS Hogar 24/7', 'Marketplace']
    },
    {
      title: 'Ciudadanía global',
      links: ['Seguridad Mantech ID', 'Sostenibilidad', 'Ecosistema Panamá']
    },
    {
      title: 'Recursos',
      links: ['Centro de Ayuda', 'Guías Técnicas', 'ROI Dashboard', 'Bóveda de Garantías']
    }
  ];

  return (
    <footer className="bg-black text-white pt-24 pb-12 px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-20">

        {/* TOP: News Section */}
        <section className="space-y-12">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">Sigue las noticias sobre las últimas novedades</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#5d3cfe]" />
                <h3 className="text-xl font-bold">Sala de prensa</h3>
              </div>
              <p className="text-[#c8c4d9] text-sm leading-relaxed opacity-70">
                Recibe anuncios sobre asociaciones, actualizaciones de la app, iniciativas y más cerca de ti y en todo el mundo.
              </p>
              <a href="#" className="inline-block border-b border-white/20 pb-1 text-sm font-bold hover:border-white transition-all">Ingresa a la sala de prensa</a>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-[#5d3cfe]" />
                <h3 className="text-xl font-bold">Blog</h3>
              </div>
              <p className="text-[#c8c4d9] text-sm leading-relaxed opacity-70">
                Encuentra nuevas soluciones para optimizar tus activos, conoce los productos de MantechPro y nuestras alianzas técnicas.
              </p>
              <a href="#" className="inline-block border-b border-white/20 pb-1 text-sm font-bold hover:border-white transition-all">Lee nuestras publicaciones</a>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Linkedin className="w-5 h-5 text-[#5d3cfe]" />
                <h3 className="text-xl font-bold">Relaciones con inversionistas</h3>
              </div>
              <p className="text-[#c8c4d9] text-sm leading-relaxed opacity-70">
                Descarga reportes financieros, consulta planes de expansión y conoce nuestras iniciativas de responsabilidad corporativa.
              </p>
              <a href="#" className="inline-block border-b border-white/20 pb-1 text-sm font-bold hover:border-white transition-all">Obtén más información</a>
            </div>
          </div>
        </section>

        {/* MIDDLE: Main Navigation */}
        <div className="space-y-12">
          <MantechProLogo size="md" className="mb-12" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {sections.map((section, idx) => (
              <div key={idx} className="space-y-6">
                <h4 className="font-black text-lg uppercase tracking-wider text-white">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <a href="#" className="text-[#c8c4d9] hover:text-white text-sm transition-colors opacity-70 hover:opacity-100">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM: Social & Stores */}
        <div className="pt-12 border-t border-white/10 space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-8">
              <div className="flex gap-6">
                <Linkedin className="w-5 h-5 cursor-pointer hover:text-[#5d3cfe] transition-all" />
                <Youtube className="w-5 h-5 cursor-pointer hover:text-[#5d3cfe] transition-all" />
                <Instagram className="w-5 h-5 cursor-pointer hover:text-[#5d3cfe] transition-all" />
                <Twitter className="w-5 h-5 cursor-pointer hover:text-[#5d3cfe] transition-all" />
              </div>
              <div className="hidden md:flex items-center gap-6 text-sm font-bold ml-8">
                <div className="flex items-center gap-2 cursor-pointer hover:text-[#5d3cfe]">
                  <Globe className="w-4 h-4" />
                  <span>{i18n.language.toUpperCase()} (Panamá)</span>
                </div>
                <div className="flex items-center gap-2 cursor-pointer hover:text-[#5d3cfe]">
                  <MapPin className="w-4 h-4" />
                  <span>Ciudad de Panamá, PA</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <a href="#" className="hover:opacity-80 transition-opacity">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="h-10" />
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" className="h-10" />
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] text-[#474556] font-black uppercase tracking-widest">
              © 2026 MantechPro Panama Industries S.A.
            </p>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-[#474556]">
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Accesibilidad</a>
              <a href="#" className="hover:text-white transition-colors">Términos</a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
