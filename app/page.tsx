import Link from "next/link"

export default function HomePage() {
  return (
    <>
      <main className="max-w-max-width mx-auto">
        {/* Hero Section */}
        <section className="px-margin-desktop py-stack-xl flex flex-col md:flex-row items-center gap-gutter min-h-[600px]">
          <div className="flex-1 space-y-stack-lg">
            <div className="inline-flex items-center px-stack-md py-stack-xs bg-secondary-container text-on-secondary-container rounded-full">
              <span className="material-symbols-outlined text-[16px] mr-2" data-icon="verified">verified</span>
              <span className="font-label-sm text-label-sm">ISO 27001 CERTIFIED CARE</span>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-background">Clinical Precision, Trustworthy Care.</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              CareMate redefines patient management through high-performance digital hygiene. Experience a seamless intersection of medical expertise and administrative efficiency.
            </p>
            <div className="flex gap-stack-md pt-stack-md">
              <button className="px-stack-lg h-[40px] bg-primary text-on-primary font-label-md text-label-md rounded-lg flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all">
                Book Appointment
                <span className="material-symbols-outlined text-[18px]" data-icon="calendar_today">calendar_today</span>
              </button>
              <button className="px-stack-lg h-[40px] border border-outline text-primary font-label-md text-label-md rounded-lg hover:bg-surface-container transition-all">
                View Specialties
              </button>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="absolute -z-10 inset-0 bg-primary-fixed opacity-20 blur-3xl rounded-full"></div>
            <div className="rounded-xl overflow-hidden border border-outline-variant shadow-sm bg-white p-2">
              <img alt="Medical facility" className="rounded-lg w-full h-auto max-h-[550px] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrH_bdgqmj_hJFSF298P-eK6cxcECNNP9OyqHOJfAdwsTwV1SrzqpSUyMXIAg2db_irvgMfbYOQssxf2KnuqJLlZWr9Cxq-jNZIoUNQPg-pj29N_8WQj9n_pgDGvP1qRJJv9XkuWozqtjrG0VbqebXhcOF35LkYFUns4iHkqoFU7RkVd_rzIoSrT6tdUitmmpydiZvTk_pHLfU84WJlhW5X44lKqywQWBl6qgfvPNW7UtfB0mSXe8jqBJIjZWyrVyELCwYL51nhFjd"/>
            </div>
            {/* Floating Info Card */}
            <div className="absolute -bottom-6 -left-6 bg-surface-container-lowest border border-outline-variant p-stack-md rounded-xl shadow-lg flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined" data-icon="medical_services">medical_services</span>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Active Patients</p>
                <p className="font-headline-sm text-headline-sm font-bold text-primary">12.4k+</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* New Core Values Section */}
        <section className="px-margin-desktop py-stack-lg bg-surface">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <div className="flex items-center gap-stack-md p-stack-md bg-surface-container-low rounded-xl border border-outline-variant">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">event_available</span>
              </div>
              <div>
                <h4 className="font-label-md font-bold text-on-surface">Hassle-free Booking</h4>
                <p className="text-label-sm text-on-surface-variant">Instant appointment scheduling</p>
              </div>
            </div>
            <div className="flex items-center gap-stack-md p-stack-md bg-surface-container-low rounded-xl border border-outline-variant">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <div>
                <h4 className="font-label-md font-bold text-on-surface">Certified &amp; Vetted</h4>
                <p className="text-label-sm text-on-surface-variant">World-class medical professionals</p>
              </div>
            </div>
            <div className="flex items-center gap-stack-md p-stack-md bg-surface-container-low rounded-xl border border-outline-variant">
              <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined">lock</span>
              </div>
              <div>
                <h4 className="font-label-md font-bold text-on-surface">Secure Health Records</h4>
                <p className="text-label-sm text-on-surface-variant">Encrypted digital patient data</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* AI Assistant Section */}
        <section className="px-margin-desktop py-stack-xl bg-primary-container/10">
          <div className="bg-white rounded-3xl border border-primary/20 shadow-xl overflow-hidden flex flex-col lg:flex-row">
            <div className="flex-1 p-stack-xl lg:p-16 space-y-stack-lg">
              <div className="inline-flex items-center px-4 py-1 bg-primary text-on-primary rounded-full mb-4">
                <span className="material-symbols-outlined text-[16px] mr-2">smart_toy</span>
                <span className="font-label-sm">MEET CAREMATE AI</span>
              </div>
              <h2 className="font-headline-lg text-display-lg text-on-background leading-tight">Your Health Intelligence Companion</h2>
              <p className="font-body-lg text-on-surface-variant">Experience a new standard of proactive care. Our AI Assistant works 24/7 to provide instant clinical insights and streamline your journey.</p>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary mt-1">analytics</span>
                  <div>
                    <h4 className="font-label-md font-bold">Symptom Prediction</h4>
                    <p className="text-on-surface-variant">Identifies potential conditions based on your reported symptoms with high accuracy.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary mt-1">person_search</span>
                  <div>
                    <h4 className="font-label-md font-bold">Specialist Matching</h4>
                    <p className="text-on-surface-variant">Smartly suggests the most appropriate specialist for your specific health needs.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary mt-1">chat</span>
                  <div>
                    <h4 className="font-label-md font-bold">In-Chat Booking</h4>
                    <p className="text-on-surface-variant">Book your recommended appointment directly within the conversation without leaving the app.</p>
                  </div>
                </li>
              </ul>
              <div className="pt-stack-md">
                <button className="px-stack-xl py-4 bg-primary text-on-primary font-bold rounded-xl flex items-center gap-3 hover:shadow-lg transition-all">
                  Try AI Assistant
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
            <div className="flex-1 bg-surface-container relative min-h-[400px] flex items-center justify-center p-stack-xl">
              {/* Mock Chat Interface */}
              <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-outline-variant overflow-hidden flex flex-col h-[450px]">
                <div className="bg-primary p-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-sm">smart_toy</span>
                  </div>
                  <span className="text-white font-label-md">CareMate Assistant</span>
                </div>
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  <div className="flex gap-2">
                    <div className="bg-surface-container-low p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl text-label-md max-w-[80%]">
                      Hello! Please describe your symptoms.
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-primary text-on-primary p-3 rounded-tl-xl rounded-bl-xl rounded-br-xl text-label-md max-w-[80%]">
                      I&apos;ve been feeling short of breath and have chest tightness.
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="bg-surface-container-low p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl text-label-md max-w-[80%] space-y-2">
                      <p>Based on your symptoms, I suggest a consultation with a Cardiologist.</p>
                      <div className="bg-white border border-outline-variant p-2 rounded-lg mt-2">
                        <p className="font-bold text-xs">Dr. Sarah Jenkins</p>
                        <p className="text-[10px]">Cardiology Specialist</p>
                        <button className="mt-2 w-full py-1 bg-primary text-on-primary text-[10px] rounded">Book Appointment</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-outline-variant bg-surface-container-lowest">
                  <div className="bg-surface-container-low rounded-full px-4 py-2 text-label-sm text-outline flex justify-between items-center">
                    Type a message...
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Specialized Services Section */}
        <section className="px-margin-desktop py-stack-xl">
          <div className="mb-stack-xl text-center">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Integrated Specialized Services</h2>
            <p className="text-on-surface-variant mt-stack-sm max-w-2xl mx-auto">Providing a holistic approach to health with industry-leading diagnostic precision and compassionate patient management.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-lg h-auto">
            <div className="md:col-span-2 bg-white border border-outline-variant rounded-xl p-stack-lg flex flex-col justify-between group hover:border-primary transition-colors min-h-[300px]">
              <div>
                <div className="w-12 h-12 bg-error-container text-error rounded-lg flex items-center justify-center mb-stack-md">
                  <span className="material-symbols-outlined" data-icon="cardiology">cardiology</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface">Cardiology</h3>
                <p className="text-on-surface-variant mt-2 max-w-md">Advanced cardiovascular diagnostics and interventional procedures utilizing real-time monitoring and AI-assisted analysis.</p>
              </div>
              <div className="mt-stack-md flex items-center justify-between">
                <span className="font-label-md text-label-md text-primary cursor-pointer hover:underline">Learn more about heart health</span>
                <div className="w-24 h-12 flex gap-1 items-end">
                  <div className="w-full bg-primary-fixed-dim h-[40%]"></div>
                  <div className="w-full bg-primary-fixed-dim h-[70%]"></div>
                  <div className="w-full bg-primary h-[50%]"></div>
                  <div className="w-full bg-primary-fixed-dim h-[90%]"></div>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-highest border border-outline-variant rounded-xl p-stack-lg flex flex-col hover:border-primary transition-colors">
              <div className="w-12 h-12 bg-on-primary-container text-primary-container rounded-lg flex items-center justify-center mb-stack-md">
                <span className="material-symbols-outlined" data-icon="monitoring">monitoring</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Advanced Diagnostics</h3>
              <p className="text-on-surface-variant mt-2">Real-time tracking of patient vitals and facility resource allocation for optimized diagnostic throughput and accuracy.</p>
              <div className="mt-auto pt-stack-md space-y-2">
                <div className="px-3 py-1 bg-white rounded border border-outline-variant text-label-sm text-center">Active Monitoring</div>
                <div className="px-3 py-1 bg-white rounded border border-outline-variant text-label-sm text-center">Resource Logic</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="px-margin-desktop py-stack-xl border-y border-outline-variant">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
            <div className="text-center space-y-2">
              <p className="font-display-lg text-[40px] font-extrabold text-primary">15k+</p>
              <p className="font-label-md text-label-md text-on-surface-variant">Successful Surgeries</p>
            </div>
            <div className="text-center space-y-2">
              <p className="font-display-lg text-[40px] font-extrabold text-primary">98%</p>
              <p className="font-label-md text-label-md text-on-surface-variant">Patient Satisfaction</p>
            </div>
            <div className="text-center space-y-2">
              <p className="font-display-lg text-[40px] font-extrabold text-primary">250+</p>
              <p className="font-label-md text-label-md text-on-surface-variant">Specialist Doctors</p>
            </div>
            <div className="text-center space-y-2">
              <p className="font-display-lg text-[40px] font-extrabold text-primary">24/7</p>
              <p className="font-label-md text-label-md text-on-surface-variant">Critical Care Support</p>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="px-margin-desktop py-stack-xl mb-stack-xl">
          <div className="relative bg-inverse-surface text-inverse-on-surface rounded-xl overflow-hidden p-stack-xl flex flex-col md:flex-row items-center justify-between gap-gutter">
            <div className="relative z-10 max-w-xl">
              <h2 className="font-display-lg text-[36px] font-bold">Ready to prioritize your health?</h2>
              <p className="text-surface-variant mt-4 font-body-lg">Schedule your consultation with our world-class medical team today. Instant confirmation and professional digital onboarding included.</p>
            </div>
            <div className="relative z-10 flex flex-col gap-stack-md w-full md:w-auto">
              <Link href="/auth/login">
                <button className="px-stack-xl w-full py-4 bg-primary-fixed text-on-primary-fixed font-bold rounded-lg hover:scale-[1.02] transition-transform">Book Now</button>
              </Link>
              <Link href="/auth/register-doctor">
                <button className="px-stack-xl w-full py-4 border border-outline-variant text-inverse-on-surface font-bold rounded-lg hover:bg-white/10 transition-colors">Register as Doctor</button>
              </Link>
            </div>
            {/* Abstract Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary opacity-5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-stack-xl px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-gutter bg-surface-container-highest border-t border-outline-variant">
        <div className="flex flex-col items-center md:items-start gap-stack-sm">
          <span className="font-headline-sm text-headline-sm font-bold text-on-surface">CareMate</span>
          <p className="font-body-md text-body-md text-on-surface-variant text-center md:text-left">© 2024 CareMate Health Systems. Professional Grade Patient Management.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-stack-xl">
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all" href="#">Services</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all" href="#">Privacy Policy</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all" href="#">Contact Support</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-all" href="#">Terms of Use</a>
        </div>
        <div className="flex gap-stack-md">
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">language</span>
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">share</span>
        </div>
      </footer>
    </>
  )
}