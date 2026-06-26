'use client'

import { motion } from 'framer-motion'

// Page transition variants
export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export const pageTransition = {
  type: 'tween',
  duration: 0.4,
  ease: 'easeInOut'
}

// Staggered list animation
export const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
}

// Card hover animation
export const cardVariants = {
  rest: { scale: 1, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
  hover: {
    scale: 1.02,
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  }
}

// Fade in animation
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
}

// Slide up animation
export const slideUpVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20
    }
  }
}

// Scale in animation (for modals)
export const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 25
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.2
    }
  }
}

// Button click animation
export const buttonTapVariants = {
  tap: { scale: 0.95 }
}

// Shimmer loading animation
export const shimmerVariants = {
  initial: { x: '-100%' },
  animate: {
    x: '100%',
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear'
    }
  }
}

// Export motion components
export const MotionPage = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageVariants}
    transition={pageTransition}
    className={className}
  >
    {children}
  </motion.div>
)

export const MotionList = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    variants={listVariants}
    initial="hidden"
    animate="visible"
    className={className}
  >
    {children}
  </motion.div>
)

export const MotionListItem = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    variants={listItemVariants}
    className={className}
  >
    {children}
  </motion.div>
)

export const MotionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    variants={cardVariants}
    initial="rest"
    whileHover="hover"
    className={className}
  >
    {children}
  </motion.div>
)

export const MotionFadeIn = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={fadeInVariants}
    transition={{ duration: 0.5 }}
    className={className}
  >
    {children}
  </motion.div>
)

export const MotionSlideUp = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={slideUpVariants}
    transition={{ delay }}
    className={className}
  >
    {children}
  </motion.div>
)

export const MotionScaleIn = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    exit="exit"
    variants={scaleInVariants}
    className={className}
  >
    {children}
  </motion.div>
)