"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import styles from '../../styles/Space.module.css';
import withAuth from '../../components/withAuth'; // Import the HOC

function SpaceServicesPage() { // Changed to a named function, not default export
  const { isAuthenticated } = useAuth(); // This can be removed if withAuth handles all auth logic display
  const [activeService, setActiveService] = useState(0);
  const [questionnaireStep, setQuestionnaireStep] = useState(0);
  const [answers, setAnswers] = useState({
    experience: '',
    budget: '',
    timeline: '',
    healthStatus: '',
    purpose: ''
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  // Service data for the bottom row buttons
  const spaceServices = [
    {
      id: 'sunshade',
      name: 'Space Sunshade Construction',
      icon: '🛡️',
      url: '/space/sunshade'
    },
    {
      id: 'elevator',
      name: 'Space Elevator',
      icon: '🚡',
      url: '/space/elevator'
    },
    {
      id: 'mining',
      name: 'Space Astroid Mining',
      icon: '⛏️',
      url: '/space/mining'
    },
    {
      id: 'training',
      name: 'Space Flight Training',
      icon: '🧑‍🚀',
      url: '/space/training'
    },
    {
      id: 'burial',
      name: 'Space Burial',
      icon: '✨',
      url: '/space/burial'
    },
    {
      id: 'travel',
      name: 'Space Flight Travel',
      icon: '🚀',
      url: '/space/travel'
    },
    {
      id: 'orbit',
      name: 'Low Earth Orbit Flight',
      icon: '🛰️',
      url: '/space/orbit'
    },
    {
      id: 'balloon',
      name: 'Balloon Liftoff',
      icon: '🎈',
      url: '/space/balloon'
    }
  ];

  // Questionnaire steps
  const questionnaireSteps = [
    {
      question: "What is your experience level with space or aviation?",
      options: [
        "No experience",
        "Aviation enthusiast",
        "Licensed pilot",
        "Professional aviation career",
        "Previous space training"
      ],
      field: "experience"
    },
    {
      question: "What is your approximate budget for space services?",
      options: [
        "Under $50,000",
        "$50,000 - $250,000",
        "$250,000 - $1 million",
        "$1 million - $5 million",
        "Over $5 million"
      ],
      field: "budget"
    },
    {
      question: "What is your preferred timeline for participation?",
      options: [
        "Within 6 months",
        "6-12 months",
        "1-2 years",
        "2-5 years",
        "More than 5 years"
      ],
      field: "timeline"
    },
    {
      question: "How would you describe your current health status?",
      options: [
        "Excellent - No limitations",
        "Good - Minor limitations",
        "Average - Some limitations",
        "Below average - Significant limitations",
        "Prefer not to say"
      ],
      field: "healthStatus"
    },
    {
      question: "What is your primary purpose for space services?",
      options: [
        "Personal experience",
        "Professional development",
        "Research opportunity",
        "Memorial service",
        "Other"
      ],
      field: "purpose"
    }
  ];

  const handleQuestionnaireNext = () => {
    if (questionnaireStep < questionnaireSteps.length - 1) {
      setQuestionnaireStep(prev => prev + 1);
    } else {
      // Submit questionnaire - would typically send data to server
      alert("Thank you for completing our questionnaire. A space consultant will contact you soon.");
      setQuestionnaireStep(0);
    }
  };

  const handleAnswerSelect = (field: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    // Optional: Start video when page loads
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Autoplay prevented. User must interact first.");
      });
    }
  }, []);

  return (
    <div className={styles.container}>
      {/* Row 1: Video Display with blank cells */}
      <section className={styles.videoRow}>
        <div className={styles.blankCell}></div>
        <div className={styles.videoCell}>
          <div className={styles.videoWrapper}>
            <video 
              ref={videoRef} 
              className={styles.video}
              controls
              playsInline
              loop
              muted
              poster="/images/space_video_poster.jpg"
            >
              <source src="/videos/space_experience.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className={styles.videoOverlay}>
              <h1>Y8 Space Services</h1>
              <p>Unlock the universe with our premium space experiences</p>
            </div>
          </div>
        </div>
        <div className={styles.blankCell}></div>
      </section>

      {/* Row 2: Qualifying Questionnaire */}
      <section className={styles.questionnaireRow}>
        <motion.div 
          className={styles.questionnaireContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h2>Space Services Qualification</h2>
          <p className={styles.questionnaireIntro}>
            Complete this brief questionnaire to help us tailor our space services to your needs and preferences.
          </p>

          <div className={styles.questionnaireCard}>
            {questionnaireStep < questionnaireSteps.length ? (
              <>
                <div className={styles.questionProgress}>
                  <div 
                    className={styles.progressBar} 
                    style={{ width: `${(questionnaireStep / (questionnaireSteps.length - 1)) * 100}%` }}
                  ></div>
                </div>
                <h3>{questionnaireSteps[questionnaireStep].question}</h3>
                <div className={styles.optionsGrid}>
                  {questionnaireSteps[questionnaireStep].options.map((option, idx) => (
                    <button 
                      key={idx}
                      className={`${styles.optionButton} ${answers[questionnaireSteps[questionnaireStep].field as keyof typeof answers] === option ? styles.optionSelected : ''}`}
                      onClick={() => handleAnswerSelect(questionnaireSteps[questionnaireStep].field, option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <button 
                  className={styles.nextButton}
                  onClick={handleQuestionnaireNext}
                  disabled={!answers[questionnaireSteps[questionnaireStep].field as keyof typeof answers]}
                >
                  {questionnaireStep === questionnaireSteps.length - 1 ? 'Submit' : 'Next'}
                </button>
              </>
            ) : (
              <div className={styles.thankYouMessage}>
                <h3>Thank You!</h3>
                <p>A space consultant will contact you shortly to discuss your options.</p>
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Row 3: Service Buttons */}
      <section className={styles.serviceButtonsRow}>
        <h2>Explore Our Space Services</h2>
        <div className={styles.servicesGrid}>
          {spaceServices.map((service) => (
            <Link href={service.url} key={service.id} className={styles.serviceButton}>
              <div className={styles.serviceIcon}>{service.icon}</div>
              <span>{service.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default withAuth(SpaceServicesPage); // Wrap the component with the HOC