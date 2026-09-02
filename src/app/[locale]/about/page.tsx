"use client";

import { Database, Heart, Code, Zap, Shield, Download } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslations } from 'next-intl';

export default function About() {
  const t = useTranslations();
  return (
    <main className="flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-background to-muted p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <h1 className="font-bold text-xl">{t('common.appName')}</h1>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex space-x-4">
            <Link href="/" className="text-sm hover:text-primary">{t('navigation.home')}</Link>
            <Link href="/about" className="text-sm font-medium text-primary">{t('navigation.about')}</Link>
            <Link href="/faq" className="text-sm hover:text-primary">{t('navigation.faq')}</Link>
            <Link href="/blog" className="text-sm hover:text-primary">{t('navigation.blog')}</Link>
          </nav>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">{t('about.title')}</h2>
          
          <div className="space-y-8">
            <section>
              <h3 className="text-xl font-semibold mb-3">{t('about.whatIs')}</h3>
              <p className="text-muted-foreground">
                {t('about.whatIsDesc')}
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4">{t('about.keyFeatures')}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Code className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium mb-1">{t('about.sqlQueryEditor')}</h4>
                    <p className="text-sm text-muted-foreground">{t('about.sqlQueryEditorDesc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Zap className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium mb-1">{t('about.interactiveTable')}</h4>
                    <p className="text-sm text-muted-foreground">{t('about.interactiveTableDesc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Shield className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium mb-1">{t('about.securePrivate')}</h4>
                    <p className="text-sm text-muted-foreground">{t('about.securePrivateDesc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Download className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium mb-1">{t('about.exportOptions')}</h4>
                    <p className="text-sm text-muted-foreground">{t('about.exportOptionsDesc')}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="border-t pt-6">
              <h3 className="text-xl font-semibold mb-3">{t('about.supportProject')}</h3>
              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Heart className="h-5 w-5" />
                  <p className="font-medium">{t('about.loveUsing')}</p>
                </div>
                <p className="text-muted-foreground">
                  {t('about.supportDesc')}
                </p>
                <div className="flex gap-4 items-center flex-wrap">
                  <Button 
                    onClick={() => window.open('https://github.com/toanpn', '_blank')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {t('about.sponsorGithub')}
                  </Button>
                  <Button 
                    onClick={() => window.open('https://buymeacoffee.com/toanphamngq', '_blank')}
                    variant="outline"
                  >
                    {t('about.buyMeCoffee')}
                  </Button>
                  <div className="flex flex-col items-center">
                    <a href="https://buymeacoffee.com/toanphamngq" target="_blank" rel="noopener noreferrer">
                      <img
                        src="/bmc_qr.png"
                        alt="Buy Me a Coffee QR code - Donate to support SQLite Editor Online"
                        className="w-28 h-28 rounded-md border mt-2"
                      />
                    </a>
                    <span className="text-xs text-muted-foreground mt-1">{t('about.scanToDonate')}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-4 px-4 text-center text-xs text-muted-foreground bg-muted/30">
        <div className="flex justify-center space-x-4 mb-2">
          <Link href="/" className="hover:text-primary">{t('navigation.home')}</Link>
          <Link href="/about" className="text-primary">{t('navigation.about')}</Link>
          <Link href="/faq" className="hover:text-primary">{t('navigation.faq')}</Link>
          <Link href="/blog" className="hover:text-primary">{t('navigation.blog')}</Link>
        </div>
        <p>{t('common.appName')} - {t('common.version')}</p>
        <p className="mt-1">
          {t('common.requestFeatures')}: <a href={`mailto:${t('common.email')}`} className="text-primary hover:underline">{t('common.email')}</a>
        </p>
      </footer>
    </main>
  );
} 