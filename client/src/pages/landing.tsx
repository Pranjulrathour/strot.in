import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowRight,
  Briefcase,
  GraduationCap,
  Users,
  Percent,
  Building2,
  Handshake,
  Megaphone,
  ShieldCheck,
  Lock,
  Menu,
  X,
} from "lucide-react";

const heroImage = "/hero.png";
const logoImage = "/logo.png";
const balImage = "/bal.png";
const buddhiImage = "/buddhi.png";
const vidyaImage = "/vidya.png";
const communityHeadDashboardImage = "/dashboard-community-head.png";
const businessDashboardImage = "/dashboard-business.png";
const userDashboardImage = "/dashboard-user.png";

// STROT Logo SVG Component
const StrotLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M50 10 A40 40 0 1 1 50 90" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round"/>
    <path d="M50 25 A25 25 0 1 1 50 75" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.5"/>
    <rect x="48" y="10" width="8" height="80" fill="currentColor" rx="4"/>
  </svg>
);

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white antialiased font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto bg-black border border-white/10 rounded-full px-6 py-3 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-3">
            <img src={logoImage} alt="STROT" className="w-8 h-8" />
            <span className="tracking-wider">STROT</span>
          </Link>
          
          <div className="hidden lg:flex gap-8 items-center">
            <a href="#modules" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Modules</a>
            <a href="#donor" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Donor</a>
            <a href="#business" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Business</a>
            <a href="#community-head" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Community Head</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-medium text-white hover:text-white hover:bg-white/5">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button className="px-5 py-2.5 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-all">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 bg-black border border-white/10 rounded-2xl p-4">
            <div className="flex flex-col gap-3">
              <a href="#modules" className="text-sm font-medium p-2 hover:bg-white/5 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Modules</a>
              <a href="#donor" className="text-sm font-medium p-2 hover:bg-white/5 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Donor</a>
              <a href="#business" className="text-sm font-medium p-2 hover:bg-white/5 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Business</a>
              <a href="#community-head" className="text-sm font-medium p-2 hover:bg-white/5 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Community Head</a>
              <Link href="/login" className="text-sm font-medium p-2 hover:bg-white/5 rounded-lg">Login</Link>
              <Link href="/register" className="text-sm font-medium p-3 bg-white text-black rounded-lg text-center mt-2">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 md:pt-40 pb-12 md:pb-16 px-6 overflow-hidden bg-black">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.02] text-white">
            Breaking the Cycle of Generational Poverty
          </h1>

          <div className="mt-5 flex items-center justify-center gap-4 text-white/80 text-lg md:text-xl font-semibold">
            <span>Survive</span>
            <span className="px-6 py-2 rounded-full border border-white/15 bg-black text-white text-sm md:text-base font-bold uppercase tracking-wide">
              BAL • BUDDHI • VIDYA
            </span>
            <span>Evolve</span>
          </div>

          <p className="mt-6 text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Not just food. Not just jobs. A system for long-term transformation.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button className="px-8 py-4 h-auto bg-white text-black rounded-full text-base font-semibold hover:bg-white/90 transition-all">
                Join the Step Forward
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#modules" className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-full text-base font-medium hover:border-white/35 transition-all text-center">
              Partner With STROT
            </a>
          </div>

          <div className="mt-10 w-full flex justify-center">
            <img
              src={heroImage}
              alt="STROT community"
              className="block w-full max-w-5xl h-auto"
              loading="eager"
            />
          </div>
        </div>
      </header>

      {/* Modules Section */}
      <section id="modules" className="py-20 md:py-28 px-6 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">The Three Modules</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-white">BAL. BUDDHI. VIDYA.</h2>
            <p className="text-lg text-white/70 leading-relaxed">
              A simple structure: support survival, enable earnings, and build long-term growth.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* BAL Card */}
            <div className="group cursor-pointer">
              <div className="relative rounded-[44px] overflow-hidden h-[400px] md:h-[520px] bg-black border border-white/10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={balImage}
                    alt="BAL"
                    className="w-full h-full object-cover opacity-100"
                    loading="lazy"
                  />
                </div>
                <div className="absolute top-6 right-4 transform rotate-90 origin-top-right font-extrabold text-6xl md:text-7xl text-white/15 tracking-wider">
                  BAL
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between gap-6">
                <div>
                  <div className="text-2xl font-bold tracking-tight text-white">BAL</div>
                  <div className="text-base text-white/60">Basic Necessities</div>
                </div>
                <span className="w-14 h-14 rounded-full bg-strot-black text-white shadow-sm group-hover:bg-strot-black/90 transition-colors flex items-center justify-center">
                  BAL
                </span>
              </div>
            </div>

            {/* BUDDHI Card */}
            <div className="group cursor-pointer">
              <div className="relative rounded-[44px] overflow-hidden h-[400px] md:h-[520px] bg-black border border-white/10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={buddhiImage}
                    alt="BUDDHI"
                    className="w-full h-full object-cover opacity-100"
                    loading="lazy"
                  />
                </div>
                <div className="absolute top-6 right-4 transform rotate-90 origin-top-right font-extrabold text-6xl md:text-7xl text-white/15 tracking-wider">
                  BUDDHI
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between gap-6">
                <div>
                  <div className="text-2xl font-bold tracking-tight text-white">BUDDHI</div>
                  <div className="text-base text-white/60">Employment Engine</div>
                </div>
                <span className="w-14 h-14 rounded-full bg-strot-black text-white shadow-sm group-hover:bg-strot-black/90 transition-colors flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </span>
              </div>
            </div>

            {/* VIDYA Card */}
            <div className="group cursor-pointer">
              <div className="relative rounded-[44px] overflow-hidden h-[400px] md:h-[520px] bg-black border border-white/10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={vidyaImage}
                    alt="VIDYA"
                    className="w-full h-full object-cover opacity-100"
                    loading="lazy"
                  />
                </div>
                <div className="absolute top-6 right-4 transform rotate-90 origin-top-right font-extrabold text-6xl md:text-7xl text-white/15 tracking-wider">
                  VIDYA
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between gap-6">
                <div>
                  <div className="text-2xl font-bold tracking-tight text-white">VIDYA</div>
                  <div className="text-base text-white/60">Education & Upskilling</div>
                </div>
                <span className="w-14 h-14 rounded-full bg-strot-black text-white shadow-sm group-hover:bg-strot-black/90 transition-colors flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </span>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-14 bg-black rounded-3xl border border-white/10 px-6 py-10 md:px-12">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl md:text-5xl font-bold tracking-tight text-white">500+</div>
                <div className="mt-2 text-sm md:text-base text-white/60 font-medium">Donations</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold tracking-tight text-white">120+</div>
                <div className="mt-2 text-sm md:text-base text-white/60 font-medium">Jobs Matched</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold tracking-tight text-white">45</div>
                <div className="mt-2 text-sm md:text-base text-white/60 font-medium">Workshops</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donor Showcase */}
      <section id="donor" className="py-20 md:py-28 px-6 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-black rounded-3xl border border-white/10 px-6 py-10 md:px-12 md:py-14 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <p className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Donor Dashboard</p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-white">Track every donation — end to end</h2>
                <p className="text-lg text-white/70 leading-relaxed mb-8">
                  A single view to list items, monitor pickup and delivery status, and keep an auditable history of impact.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-black rounded-2xl border border-white/10">
                    <div className="text-sm font-semibold text-white">Status tracking</div>
                    <div className="text-sm text-white/70 mt-1">Pending, in progress, delivered.</div>
                  </div>
                  <div className="p-5 bg-black rounded-2xl border border-white/10">
                    <div className="text-sm font-semibold text-white">Recent donations</div>
                    <div className="text-sm text-white/70 mt-1">Clear history with proof-of-delivery.</div>
                  </div>
                </div>
                <div className="mt-8">
                  <Link href="/register">
                    <Button className="px-6 py-3 h-auto bg-white text-black rounded-full text-sm font-semibold hover:bg-white/90">
                      Start Donating <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="bg-black rounded-3xl border border-white/10 overflow-hidden">
                <div className="p-4">
                  <img
                    src={userDashboardImage}
                    alt="User dashboard"
                    className="w-full h-auto rounded-2xl border border-white/10"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Showcase */}
      <section id="business" className="py-20 md:py-28 px-6 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-black rounded-3xl border border-white/10 px-6 py-10 md:px-12 md:py-14 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="bg-black rounded-3xl border border-white/10 overflow-hidden lg:order-1">
                <div className="p-4">
                  <img
                    src={businessDashboardImage}
                    alt="Business dashboard"
                    className="w-full h-auto rounded-2xl border border-white/10"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="lg:order-2">
                <p className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Business Portal</p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-white">Hire faster with verified matches</h2>
                <p className="text-lg text-white/70 leading-relaxed mb-8">
                  Post jobs, review worker matches, and track openings from one dashboard — with a clear hiring process guided by Community Heads.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-black rounded-2xl border border-white/10">
                    <div className="text-sm font-semibold text-white">Jobs & positions</div>
                    <div className="text-sm text-white/70 mt-1">Total jobs, open roles, filled positions.</div>
                  </div>
                  <div className="p-5 bg-black rounded-2xl border border-white/10">
                    <div className="text-sm font-semibold text-white">Worker matches</div>
                    <div className="text-sm text-white/70 mt-1">Review profiles and confirm hires.</div>
                  </div>
                </div>
                <div className="mt-8">
                  <Link href="/register">
                    <Button className="px-6 py-3 h-auto bg-white text-black rounded-full text-sm font-semibold hover:bg-white/90">
                      Post a Job <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Head Showcase */}
      <section id="community-head" className="py-20 md:py-28 px-6 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-black rounded-3xl border border-white/10 px-6 py-10 md:px-12 md:py-14 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <p className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Community Head Dashboard</p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-white">Operate the system on the ground</h2>
                <p className="text-lg text-white/70 leading-relaxed mb-8">
                  Manage donations, allocate jobs, track available workers, and schedule workshops — with clear actions and accountability.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-black rounded-2xl border border-white/10">
                    <div className="text-sm font-semibold text-white">Allocation controls</div>
                    <div className="text-sm text-white/70 mt-1">Add workers and allocate jobs.</div>
                  </div>
                  <div className="p-5 bg-black rounded-2xl border border-white/10">
                    <div className="text-sm font-semibold text-white">Operational visibility</div>
                    <div className="text-sm text-white/70 mt-1">Pending donations, open jobs, workshops.</div>
                  </div>
                </div>
                <div className="mt-8">
                  <Link href="/register">
                    <Button className="px-6 py-3 h-auto bg-white text-black rounded-full text-sm font-semibold hover:bg-white/90">
                      Become a Community Head <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="bg-black rounded-3xl border border-white/10 overflow-hidden">
                <div className="p-4">
                  <img
                    src={communityHeadDashboardImage}
                    alt="Community Head dashboard"
                    className="w-full h-auto rounded-2xl border border-white/10"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Model Section */}
      <section className="py-20 md:py-28 px-6 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-white">Ethical. Sustainable. Scalable.</h2>
            <p className="text-lg text-white/70 leading-relaxed">
              Revenue supports operations and scale while keeping incentives aligned with outcomes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-8 bg-black rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6">
                <Percent className="w-6 h-6 text-white/70" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Employment commissions</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                A small commission on successful placements through BUDDHI.
              </p>
            </div>

            <div className="p-8 bg-black rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6">
                <Building2 className="w-6 h-6 text-white/70" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Business subscriptions</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Paid access for businesses to verified talent pools and workflow tools.
              </p>
            </div>

            <div className="p-8 bg-black rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6">
                <Handshake className="w-6 h-6 text-white/70" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Brand partnerships</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Partnerships aligned with the mission and community needs.
              </p>
            </div>

            <div className="p-8 bg-black rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6">
                <Megaphone className="w-6 h-6 text-white/70" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Ads</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Limited, relevant promotions with quality and safety controls.
              </p>
            </div>

            <div className="p-8 bg-black rounded-2xl border border-white/10 lg:col-span-2">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-white/70" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-white">CSR (non-profit only)</h3>
                  <p className="text-white/70 text-sm leading-relaxed mb-4">
                    CSR funds support VIDYA programs with transparent tracking. Allocation remains strictly non-profit.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black rounded-full text-xs font-medium text-white/70 border border-white/10">
                    <Lock className="w-3 h-3" />
                    Non-profit allocation only
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 px-6 bg-black text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Build the Step Forward With Us
            </h2>
            <p className="text-lg text-white/60 leading-relaxed">
              Join us in building infrastructure that transforms lives — as a partner, investor, or supporter.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/register">
              <Button className="px-10 py-4 h-auto bg-white text-strot-black rounded-full text-base font-semibold hover:bg-white/90 transition-all">
                Become a Partner
              </Button>
            </Link>
            <a href="#modules" className="px-10 py-4 bg-transparent border-2 border-white/30 text-white rounded-full text-base font-medium hover:border-white/50 transition-all text-center">
              Support the Mission
            </a>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 md:py-20 px-6 bg-black">
        <div className="max-w-5xl mx-auto">
          <div className="bg-black rounded-3xl border border-white/10 px-8 py-12 md:px-16 md:py-16 text-center">
            <p className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight leading-snug text-white">
              "STROT brings clarity and accountability to impact — it feels like infrastructure, not a campaign."
            </p>
            <p className="mt-6 text-base md:text-lg text-white/60 font-medium">— A partner</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="STROT" className="w-7 h-7" />
              <span className="text-white font-bold tracking-wider">STROT</span>
              <span className="text-white/30 text-sm ml-2">© 2025</span>
            </div>
            
            <p className="text-white/40 text-sm">A Step Forward.</p>
            
            <div className="flex gap-6">
              <Link href="/login" className="text-white/40 hover:text-white transition-colors text-sm">Login</Link>
              <Link href="/register" className="text-white/40 hover:text-white transition-colors text-sm">Register</Link>
              <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Privacy</a>
              <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
