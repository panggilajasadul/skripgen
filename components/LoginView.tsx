

import React, { useState } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import Input from './ui/Input';
import Button from './ui/Button';
import Card from './ui/Card';
import Accordion from './ui/Accordion';
import { SparklesIcon } from './icons/SparklesIcon';
import { LinkIcon } from './icons/LinkIcon';
import { QuoteIcon } from './icons/QuoteIcon';
import { motion, Variants } from 'framer-motion';

// FIX: Explicitly typed variants with 'Variants' from framer-motion
// to ensure correct type inference for transition properties like 'ease'.
const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
};

const FeatureItem: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="flex">
    <div className="flex-shrink-0">
      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
        {icon}
      </div>
    </div>
    <div className="ml-4">
      <h4 className="text-lg leading-6 font-bold text-text-primary">{title}</h4>
      <p className="mt-2 text-base text-text-secondary">{children}</p>
    </div>
  </div>
);

const TestimonialCard: React.FC<{ username: string; role: string; children: React.ReactNode }> = ({ username, role, children }) => (
    <div className="bg-card p-6 rounded-lg shadow-custom-md border border-border">
        <QuoteIcon className="h-8 w-8 text-accent mb-4" />
        <p className="text-text-secondary italic">"{children}"</p>
        <div className="mt-4">
            <p className="font-bold text-text-primary">{username}</p>
            <p className="text-sm text-text-secondary">{role}</p>
        </div>
    </div>
);

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const user = await authService.login(username, password);
      if (!user) {
        setError('Invalid username or password.');
      } else {
        onLoginSuccess(user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="bg-secondary">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-20">
        
        {/* Section 1: Hero + Login Form */}
        <motion.section 
          className="grid md:grid-cols-2 gap-12 items-center"
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          {/* Copywriting */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl tracking-tight font-extrabold text-text-primary sm:text-5xl md:text-6xl">
              <span className="block">Buntu Ide Konten?</span>
              <span className="block text-primary">Ubah Link Jadi Cuan.</span>
            </h1>
            <p className="mt-4 text-base text-text-secondary sm:text-lg md:text-xl">
              SkripGen 3.0 adalah AI Assistant untuk Kreator Affiliate TikTok & Shopee. Stop buang waktu, mulai buat konten yang terbukti menghasilkan konversi.
            </p>
          </div>
          {/* Login Form */}
          <div>
            <Card className="w-full p-8 shadow-custom-lg">
                <h2 className="text-2xl font-bold text-center mb-2">
                    <span className="text-accent">Login</span> ke Akun Anda
                </h2>
                <p className="text-center text-text-secondary mb-6">Selamat datang kembali!</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                    label="Username"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    />
                    <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    />
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <Button type="submit" className="w-full justify-center" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                    </Button>
                    <p className="text-center text-sm text-text-secondary pt-2">
                        Jika belum punya akun silahkan klik{" "}
                        <a
                            href="https://lynk.id/smokervibes"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-accent hover:text-primary underline"
                        >
                            Disini
                        </a>
                    </p>
                </form>
            </Card>
          </div>
        </motion.section>

        {/* Section 2: Features & Example */}
        <motion.section 
            className="space-y-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVariants}
        >
            <div className="lg:text-center">
                <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Fitur Unggulan</h2>
                <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-text-primary sm:text-4xl">
                    Semua yang Anda Butuhkan untuk FYP
                </p>
            </div>
            <div className="mt-10">
                <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                    <FeatureItem icon={<SparklesIcon className="w-6 h-6"/>} title="AI Script Generator">
                        Dari detail produk, jadi 3 variasi skrip video lengkap dengan formula copywriting (AIDA, PAS, dll) dan ide visual.
                    </FeatureItem>
                     <FeatureItem icon={<LinkIcon className="w-6 h-6"/>} title="Instant Link-to-Script">
                        Cukup tempel link produk, AI akan otomatis membuatkan skrip video yang siap pakai untuk hard-selling atau soft-selling.
                    </FeatureItem>
                </dl>
            </div>
             <div className="mt-12">
                 <h3 className="text-xl font-bold text-text-primary text-center">Contoh Hasil Skrip AI</h3>
                 <div className="mt-4 max-w-2xl mx-auto bg-card p-6 rounded-lg shadow-custom-md border border-border">
                     <p className="font-semibold text-text-secondary">Produk: <span className="font-normal text-text-primary">Lampu Belajar Estetik</span></p>
                     <div className="mt-4 space-y-2 text-sm">
                        <p><strong className="text-accent">Hook:</strong> Sumpah ya, pusing banget kalo meja belajar berantakan & gelap. Bikin nggak mood!</p>
                        <p><strong className="text-accent">Body:</strong> Tapi liat deh lampu belajar ini, gak cuma estetik, cahayanya bisa diatur 3 mode, gak bikin silau, dan ada phone holder-nya. Belajar jadi fokus, ngonten juga cakep!</p>
                        <p><strong className="text-accent">CTA:</strong> Barang berguna gini jangan ditunda, cek keranjang kuning sekarang!</p>
                     </div>
                 </div>
            </div>
        </motion.section>

        {/* Section 3: Testimonials */}
        <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVariants}
        >
            <h2 className="text-3xl font-extrabold tracking-tight text-text-primary text-center mb-8">
                Dipercaya oleh Ratusan Kreator
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <TestimonialCard username="@racun.ala.dinda" role="Affiliate Creator">
                    Sejak pake ScriptGen, ngonten buat affiliate jadi cepet banget. Nggak pernah lagi kehabisan ide hook, dan skripnya beneran ngalir natural. Komisi naik drastis!
                </TestimonialCard>
                <TestimonialCard username="@homedecor.id" role="Brand Owner">
                    Aplikasi ini ngebantu banget tim marketing kami. Proses bikin script buat promosi produk baru jadi lebih efisien dan hasilnya selalu on-brand berkat fitur Brand Profile.
                </TestimonialCard>
            </div>
        </motion.section>
        
        {/* Section 4: FAQ */}
        <motion.section 
            className="max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVariants}
        >
            <h2 className="text-3xl font-extrabold tracking-tight text-text-primary text-center mb-8">
                Tanya Jawab
            </h2>
            <div className="space-y-4">
                <Accordion title="Untuk siapa aplikasi ini?">
                    <p className="text-text-secondary px-4 pb-2">Dibuat khusus untuk TikTok/Shopee Affiliate, Content Creator, Social Media Manager, dan Small Business Owner yang ingin memaksimalkan promosi produk lewat video pendek.</p>
                </Accordion>
                <Accordion title="Bagaimana cara kerjanya?">
                     <p className="text-text-secondary px-4 pb-2">Anda cukup masukkan detail produk atau link, pilih gaya konten yang diinginkan, dan AI akan langsung membuatkan beberapa variasi skrip video yang siap Anda gunakan.</p>
                </Accordion>
                 <Accordion title="Apa bedanya dengan AI lain?">
                     <p className="text-text-secondary px-4 pb-2">SkripGen 3.0 dilatih khusus dengan ribuan data skrip video affiliate yang sukses. Fokus kami bukan cuma teks, tapi struktur narasi, psikologi marketing, dan hook yang terbukti efektif di platform video pendek.</p>
                </Accordion>
            </div>
        </motion.section>

      </div>
    </div>
  );
};

export default LoginView;