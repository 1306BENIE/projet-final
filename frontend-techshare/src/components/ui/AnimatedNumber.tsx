import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  formatAsCurrency?: boolean;
}

export const AnimatedNumber = ({
  value,
  formatAsCurrency = false,
}: AnimatedNumberProps) => {
  const spring = useSpring(value, {
    mass: 0.8,
    stiffness: 75,
    damping: 15,
  });

  const formatValue = (val: number) => {
    if (formatAsCurrency) {
      return `${Math.round(val).toLocaleString()} FCFA`;
    }
    return Math.round(val).toLocaleString();
  };

  const display = useTransform(spring, (latest) => formatValue(latest));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
};
