import React from 'react';
import Link from '@docusaurus/Link';

type FeatureItem = {
  title: string;
  icon: string;
  description: string;
  link: string;
  linkText: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Build Your Drone',
    icon: '🔧',
    description: 'Complete step-by-step guides for assembling the Replicant GEN 1 platform. From printing to maiden flight.',
    link: '/docs/build-guides/overview',
    linkText: 'Start Building →'
  },
  {
    title: 'Download STL Files',
    icon: '📁',
    description: 'Access all 3D-printable components, firmware, and technical specifications for your build.',
    link: '/docs/stl-files',
    linkText: 'Get Files →'
  },
  {
    title: 'Technical Specs',
    icon: '⚙️',
    description: 'Detailed specifications, performance data, and engineering documentation.',
    link: '/docs/build-guides/comprehensive-guide',
    linkText: 'View Specs →'
  },
  {
    title: 'Support & Community',
    icon: '🤝',
    description: 'Get help, share builds, and connect with other drone enthusiasts and professionals.',
    link: 'https://yirrasystems.com/contact',
    linkText: 'Get Support →'
  },
];

function Feature({title, icon, description, link, linkText}: FeatureItem) {
  return (
    <div className="featureCard">
      <div className="featureIcon">
        {icon}
      </div>
      <h3 className="featureTitle">
        {title}
      </h3>
      <p className="featureDescription">
        {description}
      </p>
      <Link to={link} className="button button--outline">
        {linkText}
      </Link>
    </div>
  );
}

export default function HomepageFeatures(): React.ReactNode {
  return (
    <section className="features">
      <div className="container">
        <div className="featuresContainer">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
