import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Zap, TrendingUp, FileText, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleNavigateToAuth = () => {
    navigate('/auth');
  };

  return (
    <div className="bg-white text-gray-700 font-sans antialiased">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pocket Invoice</h1>
          <nav>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={handleNavigateToAuth}>Sign In</Button>
              <Button size="sm" className="bg-gray-800 hover:bg-gray-900 text-white whitespace-nowrap" onClick={handleNavigateToAuth}>
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gray-50 animate-fade-in-up">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Stop Chasing Paperwork. Start Growing Your Business.
            </h2>
            <p className="mt-6 text-lg text-gray-600">
              Pocket Invoice is the all-in-one tool for Ghanaian entrepreneurs. Create professional invoices, manage events, and track your business performance—all from your phone.
            </p>
            <Button size="lg" className="mt-8 bg-gray-800 hover:bg-gray-900 text-white" onClick={handleNavigateToAuth}>
              Start for Free <Zap className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <div>
            <img 
              src="/hero-image.jpg" 
              alt="Smiling business owner using Pocket Invoice on her phone" 
              className="rounded-lg shadow-2xl w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-20 animate-fade-in-up" style={{animationDelay: '200ms'}}>
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-gray-900">Tired of the Old Way of Doing Business?</h3>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">We get it. Managing a small business in Ghana comes with unique challenges. You're juggling so much, and paperwork shouldn't be one of them.</p>
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-lg text-gray-800">Unprofessional Documents</h4>
              <p className="mt-2 text-gray-600">Handwritten invoices and receipts look unprofessional and are hard to track.</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-lg text-gray-800">Disorganized Records</h4>
              <p className="mt-2 text-gray-600">Losing track of payments and sales history makes tax time a nightmare.</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-lg text-gray-800">Wasted Time</h4>
              <p className="mt-2 text-gray-600">Manually creating documents takes time away from serving your customers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features/Solutions Section */}
      <section className="py-20 bg-gray-50 animate-fade-in-up animation-delay-1800">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900">The Modern Solution for Your Business</h3>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">Pocket Invoice empowers you with the tools you need to look professional, stay organized, and save time.</p>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <FileText className="h-10 w-10 mx-auto text-gray-800" />
              <h4 className="mt-4 font-semibold text-lg text-gray-800">Professional Invoicing</h4>
              <p className="mt-2 text-gray-600">Generate clean, professional invoices and receipts in seconds. Export to PDF and send directly to clients.</p>
            </div>
            <div className="p-6">
              <Users className="h-10 w-10 mx-auto text-gray-800" />
              <h4 className="mt-4 font-semibold text-lg text-gray-800">Effortless Event Management</h4>
              <p className="mt-2 text-gray-600">Organize events and issue secure QR-coded digital passes for seamless entry management.</p>
            </div>
            <div className="p-6">
              <TrendingUp className="h-10 w-10 mx-auto text-gray-800" />
              <h4 className="mt-4 font-semibold text-lg text-gray-800">Multi-Business Dashboard</h4>
              <p className="mt-2 text-gray-600">Manage all your business profiles from one simple, powerful dashboard. Track everything with ease.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-gray-900">Ready to Transform Your Business?</h3>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Join hundreds of Ghanaian entrepreneurs who are saving time and looking more professional with Pocket Invoice.</p>
          <Button size="lg" className="mt-8 bg-gray-800 hover:bg-gray-900 text-white" onClick={handleNavigateToAuth}>
            Sign Up Now - It's Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; {new Date().getFullYear()} Pocket Invoice. All Rights Reserved.</p>
          <p className="mt-2 text-sm text-gray-400">Built with ❤️ for Ghanaian Businesses.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
