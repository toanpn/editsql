"use client";

import { Database, Heart, Code, Zap, Shield, Download } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function About() {
  return (
    <main className="flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-background to-muted p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <h1 className="font-bold text-xl">SqlEditor</h1>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex space-x-4">
            <Link href="/" className="text-sm hover:text-primary">Home</Link>
            <Link href="/about" className="text-sm font-medium text-primary">About</Link>
            <Link href="/faq" className="text-sm hover:text-primary">FAQ</Link>
            <Link href="/blog" className="text-sm hover:text-primary">Blog</Link>
          </nav>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">About SQLite Editor Online</h2>
          
          <div className="space-y-8">
            <section>
              <h3 className="text-xl font-semibold mb-3">What is SQLite Editor Online?</h3>
              <p className="text-muted-foreground">
                SQLite Editor Online is a powerful, web-based SQLite database editor that allows you to manage and interact with your SQLite databases directly in your browser. 
                No installation required - simply upload your SQLite database file and start editing. Perfect for developers, database administrators, and anyone who needs to work with SQLite databases.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-4">Key Features</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Code className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium mb-1">SQL Query Editor</h4>
                    <p className="text-sm text-muted-foreground">Execute custom SQL queries with syntax highlighting and error checking</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Zap className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium mb-1">Interactive Table View</h4>
                    <p className="text-sm text-muted-foreground">View and edit table data with sorting, filtering, and pagination</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Shield className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium mb-1">Secure & Private</h4>
                    <p className="text-sm text-muted-foreground">Your data stays in your browser - no server storage</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Download className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-medium mb-1">Export Options</h4>
                    <p className="text-sm text-muted-foreground">Export your data in various formats including CSV and JSON</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="border-t pt-6">
              <h3 className="text-xl font-semibold mb-3">Support the Project</h3>
              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Heart className="h-5 w-5" />
                  <p className="font-medium">Love using SQLite Editor Online?</p>
                </div>
                <p className="text-muted-foreground">
                  If you find SQLite Editor Online helpful and would like to support its development, consider making a donation. 
                  Your support helps maintain and improve the project, ensuring it remains free and accessible to everyone.
                </p>
                <div className="flex gap-4 items-center flex-wrap">
                  <Button 
                    onClick={() => window.open('https://github.com/toanpn', '_blank')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Sponsor on GitHub
                  </Button>
                  <Button 
                    onClick={() => window.open('https://buymeacoffee.com/toanphamngq', '_blank')}
                    variant="outline"
                  >
                    Buy me a coffee
                  </Button>
                  <div className="flex flex-col items-center">
                    <a href="https://buymeacoffee.com/toanphamngq" target="_blank" rel="noopener noreferrer">
                      <img
                        src="/bmc_qr.png"
                        alt="Buy Me a Coffee QR code - Donate to support SQLite Editor Online"
                        className="w-28 h-28 rounded-md border mt-2"
                      />
                    </a>
                    <span className="text-xs text-muted-foreground mt-1">Scan to donate via Buy Me a Coffee</span>
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
          <Link href="/" className="hover:text-primary">Home</Link>
          <Link href="/about" className="text-primary">About</Link>
          <Link href="/faq" className="hover:text-primary">FAQ</Link>
          <Link href="/blog" className="hover:text-primary">Blog</Link>
        </div>
        <p>SQLite Editor Online - Version 0.0.1</p>
      </footer>
    </main>
  );
} 