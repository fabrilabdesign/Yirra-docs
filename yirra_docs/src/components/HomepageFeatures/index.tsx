import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  image: string;
  description: ReactNode;
  isAnimated?: boolean;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Modular Design',
    image: '/img/drone/Modular_rail.PNG',
    description: (
      <>
        Hot-swappable battery rails eliminate straps and velcro. Swap batteries in seconds 
        with repeatable center of gravity every time. No tools required.
      </>
    ),
  },
  {
    title: '3D Printable Platform',
    image: '/img/drone/Downloadthisdrone.png',
    description: (
      <>
        Complete STL files for all structural components. Print on your own equipment 
        or order pre-printed frames. Fully serviceable and upgradeable design.
      </>
    ),
  },
  {
    title: 'Professional Video',
    image: '/img/drone/go_pro_mount.png',
    description: (
      <>
        DJI O4 Pro compatible for cinema-quality HD video transmission. 
        Camera isolation system eliminates jello for smooth, professional footage.
      </>
    ),
  },
  {
    title: 'Advanced Engineering',
    image: '/img/drone/Carbon_reinforcement.png',
    description: (
      <>
        Carbon fiber reinforced tubular arms provide superior strength-to-weight ratio. 
        Refined aerodynamic shell reduces drag and vibration.
      </>
    ),
  },
];

function Feature({title, image, description, isAnimated}: FeatureItem) {
  return (
    <div className={clsx('col col--6', styles.featureCard)}>
      <div className={styles.featureContent}>
        <div className="text--center">
          <img 
            src={image} 
            alt={title}
            className={clsx(styles.featureImage, isAnimated && styles.animated)} 
          />
        </div>
        <div className="text--center padding-horiz--md">
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.featuresHeader}>
          <Heading as="h2">Why Choose Replicant GEN 1?</Heading>
          <p>A revolutionary 3D-printable long-range FPV platform designed for builders and professionals</p>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
