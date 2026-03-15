import { Variants } from "framer-motion";

/* Fade + subida elegante para secciones */
export const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* Contenedor con stagger */
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

/* Animación suave para cards */
export const cardReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* Hover para botones */
export const buttonHover = {
  whileHover: {
    y: -2,
    scale: 1.02,
  },
  transition: {
    duration: 0.2,
  },
};

/* Hover para cards */
export const cardHover = {
  whileHover: {
    y: -4,
  },
  transition: {
    duration: 0.25,
  },
};