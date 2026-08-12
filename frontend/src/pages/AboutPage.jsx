import { Linkedin, Github } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Navbar from '../components/ui/Navbar'
import Footer from '../components/ui/Footer'
import Slip from '../components/ui/Slip'
import profile1 from '../assets/profile1.jpeg'
import profile2 from '../assets/profile2.jpg'
import profile3 from '../assets/profile3.jpeg'
import profile4 from '../assets/profile4.jpeg'

const teamMembers = [
  { id: 1, name: 'Harikishan Alva B', linkedin: 'https://www.linkedin.com/in/harikishan-alva-b-2163a5293/', github: 'https://github.com/HARIKISHAN-ALVA-B', image: profile1 },
  { id: 2, name: 'Samith S Palan', linkedin: 'https://www.linkedin.com/in/samith-s-palan-695868291', github: 'https://github.com/samithspalan', image: profile2 },
  { id: 3, name: 'Akshay', linkedin: 'https://www.linkedin.com/in/akshay-kumar-738245293', github: 'https://github.com/akshay123kumar-coder', image: profile3 },
  { id: 4, name: 'Nishit S K', linkedin: 'https://www.linkedin.com/in/nishit-s-k-441141293', github: 'https://github.com/NishitSK', image: profile4 },
]

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="ledger-scope min-h-screen bg-paper">
      <Navbar />

      <section className="ledger-rule bg-maroon text-paper">
        <div className="mx-auto max-w-6xl px-8 py-14 sm:pl-16">
          <p className="font-ledger text-xs uppercase tracking-[0.2em] text-brass-light">
            {t('about.eyebrow')}
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.05] sm:text-5xl">
            {t('about.title')}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-paper/80">
            {t('about.subtitle')}
          </p>
        </div>
      </section>

      <section className="ledger-rule bg-paper">
        <div className="mx-auto max-w-6xl px-8 py-14 sm:pl-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <Slip key={member.id} className="flex flex-col overflow-hidden">
                <div className="h-48 w-full overflow-hidden bg-paper-dim">
                  <img
                    src={member.image}
                    alt={member.name}
                    width="300"
                    height="192"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover grayscale transition-[filter] duration-300 hover:grayscale-0"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <p className="font-ledger text-[10px] uppercase tracking-[0.16em] text-ink/45">
                      {t('about.signatory', { number: String(member.id).padStart(2, '0') })}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-semibold leading-tight">
                      {member.name}
                    </h3>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on LinkedIn`}
                      className="flex h-8 w-8 items-center justify-center rounded-sm border border-ink/15 text-ink/60 transition-colors hover:border-maroon hover:text-maroon"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on GitHub`}
                      className="flex h-8 w-8 items-center justify-center rounded-sm border border-ink/15 text-ink/60 transition-colors hover:border-maroon hover:text-maroon"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </Slip>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
