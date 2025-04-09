"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/Space.module.css';

export default function SpaceServicesPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Space Services</h1>
          <p>Premium space tourism, training, and end-of-life services</p>
        </div>
        <Image 
          src="/images/sky2.png" 
          alt="Space horizon" 
          width={1200} 
          height={300} 
          className={styles.heroImage}
        />
      </section>

      {/* Main Content */}
      <section className={styles.content}>
        <div className={styles.introduction}>
          <h2>Explore Beyond Earth</h2>
          <p>
            Space tourism is now reaching commercial viability for civilian travel. From orbital flights to space training 
            and memorial services, Y8 Consulting offers a Total Value Proposition (TVP) that encompasses various space 
            services to inspire a greater understanding of the universe.
          </p>
        </div>

        {/* Services Grid */}
        <div className={styles.servicesGrid}>
          {/* Aurora Aerospace */}
          <div className={styles.serviceCard}>
            <div className={styles.serviceHeader}>
              <h3>Aurora Aerospace</h3>
              <p>Civilian Space Training</p>
            </div>
            <div className={styles.serviceContent}>
              <Image 
                src="/images/aurora_aerospace.jpg" 
                alt="Aurora Aerospace" 
                width={400} 
                height={250} 
                className={styles.serviceImage}
              />
              <p>The world's only civilian space training center offering both flight and ground-based training.</p>
              <ul>
                <li>L-39 Flight (60-min)</li>
                <li>Zero-G Flight Experience</li>
                <li>Hypoxia Training</li>
                <li>Spacecraft/L-39 Simulator</li>
                <li>Medical Certification</li>
                <li>Complete Training Package</li>
              </ul>
              <Link href="#contact" className={styles.learnMore}>
                Learn More
              </Link>
            </div>
          </div>

          {/* Virgin Galactic */}
          <div className={styles.serviceCard}>
            <div className={styles.serviceHeader}>
              <h3>Virgin Galactic</h3>
              <p>Suborbital Space Travel</p>
            </div>
            <div className={styles.serviceContent}>
              <Image 
                src="/images/spaceship_one.jpg" 
                alt="Spaceship One" 
                width={400} 
                height={250} 
                className={styles.serviceImage}
              />
              <p>
                Experience suborbital space flight with Virgin Galactic. You'll accelerate to 3x the speed of sound, 
                enjoy moments of weightlessness, and see Earth from a perspective few humans have witnessed.
              </p>
              <p className={styles.highlight}>Become a certified astronaut.</p>
              <Link href="#contact" className={styles.learnMore}>
                Book Consultation
              </Link>
            </div>
          </div>

          {/* Celestis */}
          <div className={styles.serviceCard}>
            <div className={styles.serviceHeader}>
              <h3>Celestis Memorial Spaceflights</h3>
              <p>Space Burial Services</p>
            </div>
            <div className={styles.serviceContent}>
              <Image 
                src="/images/headstone_burial.png" 
                alt="Celestis Space Burial" 
                width={400} 
                height={250} 
                className={styles.serviceImage}
              />
              <p>
                Celestis is the pioneer and global leader in memorial spaceflights, having performed over 500 space 
                burials since 1997.
              </p>
              <p>
                At Y8 Consulting, we help you create a lasting legacy that will inspire your lineage for generations 
                to come.
              </p>
              <div className={styles.spaceStationLink}>
                <Link href="https://www.ustream.tv/channel/17074538" target="_blank" rel="noopener noreferrer">
                  Watch the Space Station LIVE →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className={styles.contactSection}>
        <h2>Ready to explore space?</h2>
        <p>Contact our space services consultants to begin your journey</p>
        <div className={styles.contactInfo}>
          <a href="mailto:contact@y8design.us" className={styles.contactButton}>
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
}