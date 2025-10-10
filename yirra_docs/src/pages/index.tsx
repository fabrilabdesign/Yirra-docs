import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className={styles.heroTitle}>
          Yirra Systems Documentation
        </Heading>
        <p className={styles.heroSubtitle}>
          Welcome to the world of Replicant GEN 1 drones!
        </p>
        <p className={styles.heroDescription}>
          This is the Yirra Systems Documentation site. All of the information needed to go from zero to a working 
          Replicant GEN 1 drone can be found here.
        </p>
        <p className={styles.heroDescription}>
          If this is the first time building a Replicant GEN 1 drone (especially if this is the first 3D printer-based drone), 
          it is strongly suggested to build 100% to spec using the documentation provided here. The spec configurations have 
          been tested extensively and are well supported.
        </p>
        <div className={styles.heroImageContainer}>
          <img 
            src="/img/drone/Above_iso_hero.png" 
            alt="Replicant GEN 1 (IC-01) Drone"
            className={styles.heroImage}
          />
        </div>
      </div>
    </header>
  );
}

function YirraCommunity() {
  return (
    <section className={styles.communitySection}>
      <div className="container">
        <Heading as="h2" className={styles.communityTitle}>
          Yirra Systems
        </Heading>
        
        <ul className={styles.communityList}>
          <li>
            <Link href="https://www.instagram.com/yirrasystems" className={styles.communityLink}>
              <strong>Instagram</strong> - Follow us for the latest updates and build showcases
            </Link>
          </li>
          <li>
            <Link href="https://www.facebook.com/yirrasystems" className={styles.communityLink}>
              <strong>Facebook</strong> - Join our community for discussions and support
            </Link>
          </li>
          <li>
            <Link href="https://www.youtube.com/@yirrasystems" className={styles.communityLink}>
              <strong>YouTube</strong> - Watch build guides, flight footage, and tutorials
            </Link>
          </li>
          <li>
            <Link href="https://www.tiktok.com/@yirrasystems" className={styles.communityLink}>
              <strong>TikTok</strong> - Quick tips and build highlights
            </Link>
          </li>
          <li>
            <Link href="https://yirrasystems.com" className={styles.communityLink}>
              <strong>YirraSystems.com</strong> - If you are not purchasing a kit, the BOM and sourcing tools found here will be an important part of your build
            </Link>
          </li>
          <li>
            <Link href="https://github.com/yirra-systems" className={styles.communityLink}>
              <strong>GitHub</strong> - All Yirra designs are Open Source. The files, including CAD, STLs and Manuals are found on Github.
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Build guides, technical specifications, and developer resources for the Replicant GEN 1 (IC-01) modular drone platform. Learn how to build, tune, and fly your 3D-printable long-range FPV drone.">
      <HomepageHeader />
      <main>
        <YirraCommunity />
      </main>
    </Layout>
  );
}
