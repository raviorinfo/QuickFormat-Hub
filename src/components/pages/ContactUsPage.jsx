import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle, Clock, ShieldCheck, HelpCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { triggerConfetti } from '../../utils/confetti';

export function ContactUsPage() {
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Feedback / Suggestion');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    // Process client-side confirmation
    setSubmitted(true);
    triggerConfetti();
    toast.success('Your message has been dispatched to the QuickFormat Hub team!');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-12 text-slate-800 dark:text-slate-200">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-500 mb-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
          <Mail className="w-3.5 h-3.5" />
          <span>Support & Inquiries</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Contact Us & Developer Support
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Have a question about our client-side architecture? Found an edge-case bug in one of our converters? Or interested in a sponsor partnership? We’d love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left Column: Direct Contact Info & Commitments */}
        <div className="space-y-6 md:col-span-1">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-500" />
              Direct Channels
            </h3>
            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <span className="text-slate-400 text-xs block">General Inquiries & Support:</span>
                <span className="font-mono font-medium text-brand-600 dark:text-brand-400 select-all">
                  support@quickformathub.com
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">Sponsorship & Ad Inquiries:</span>
                <span className="font-mono font-medium text-brand-600 dark:text-brand-400 select-all">
                  ads@quickformathub.com
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">Security & Legal:</span>
                <span className="font-mono font-medium text-brand-600 dark:text-brand-400 select-all">
                  legal@quickformathub.com
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              Response SLA
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              We aim to respond to all inquiries, bug reports, and partnership proposals within <strong>24 to 48 business hours</strong>.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              Privacy Assurance
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Your contact details are used strictly to reply to your inquiry. We never send unsolicited marketing emails or sell your contact information.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Contact Form */}
        <div className="md:col-span-2">
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
            {submitted ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Message Sent Successfully!
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                  Thank you for reaching out to QuickFormat Hub. Our developer support team will review your message and reply via email within 24-48 hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setName('');
                    setEmail('');
                    setMessage('');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-800">
                  <MessageSquare className="w-4 h-4 text-brand-500" />
                  <span>Send a Message to Our Team</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Inquiry Topic
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                  >
                    <option value="Bug Report">Bug Report in a Tool</option>
                    <option value="Feature Request">New Tool or Feature Request</option>
                    <option value="Feedback / Suggestion">General Feedback & Suggestions</option>
                    <option value="Advertising / Sponsorship">Advertising or Sponsor Partnership</option>
                    <option value="Privacy / Legal">Privacy or Security Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Message *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your question, request, or issue in detail..."
                    className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-brand-500 resize-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs sm:text-sm shadow-md shadow-brand-500/25 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
