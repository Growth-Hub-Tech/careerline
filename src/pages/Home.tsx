import { Hero } from '../components/Hero';
import { Thesis } from '../components/Thesis';
import { EntryPoints } from '../components/EntryPoints';
import { CareerDiscovery } from '../components/CareerDiscovery';
import { TestEngine } from '../components/TestEngine';
import { Diagnostic } from '../components/Diagnostic';
import { Workforce } from '../components/Workforce';
import { CandidateValidation } from '../components/CandidateValidation';
import { SkillCredential } from '../components/SkillCredential';
import { Calibration } from '../components/Calibration';
import { Ecosystem } from '../components/Ecosystem';
import { Integrity } from '../components/Integrity';
import { FAQ } from '../components/FAQ';
import { CallToAction } from '../components/CallToAction';

// Footer stays in MainLayout, so it is not rendered here.
export const Home = () => (
  <>
    <Hero />
    <Thesis />
    <EntryPoints />
    <CareerDiscovery />
    <TestEngine />
    <Diagnostic />
    <Workforce />
    <CandidateValidation />
    <SkillCredential />
    <Calibration />
    <Ecosystem />
    <Integrity />
    <FAQ />
    <CallToAction />
  </>
);

export default Home;
