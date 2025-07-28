import { useState, useEffect, RefObject } from 'react';

const useIntersectionObserver = (
  ref: RefObject<Element>,
  options: IntersectionObserverInit
): boolean => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const current = ref.current;
    if (!current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.unobserve(current); // 进入视口后停止观察
        }
      },
      options
    );

    observer.observe(current);

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [ref, options]);

  return isIntersecting;
};

export default useIntersectionObserver;